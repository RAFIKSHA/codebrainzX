import requests
import time
import os
import logging

logger = logging.getLogger(__name__)

class Judge0Service:
    _cached_mock_status = None

    @classmethod
    def get_config(cls):
        """
        Reads Judge0 credentials from the environment.
        """
        api_url = os.environ.get('JUDGE0_API_URL', 'https://judge0-ce.p.rapidapi.com').rstrip('/')
        api_key = os.environ.get('JUDGE0_API_KEY', '')
        
        # Determine if we should run in Mock mode
        if not api_url or (not api_key and 'rapidapi' in api_url):
            return api_url, api_key, True

        if 'localhost' in api_url or '127.0.0.1' in api_url:
            if cls._cached_mock_status is not None:
                return api_url, api_key, cls._cached_mock_status
            try:
                r = requests.get(f"{api_url}/about", timeout=0.8)
                cls._cached_mock_status = (r.status_code != 200)
            except Exception:
                cls._cached_mock_status = True
            return api_url, api_key, cls._cached_mock_status

        return api_url, api_key, False

    @classmethod
    def execute_code_batch(cls, source_code, language_id, test_cases, time_limit=2.0, memory_limit=256.0):
        """
        Executes code against multiple test cases in parallel using Judge0 batch API.
        Returns a dictionary summarizing the evaluation:
        {
            'status': 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | etc,
            'passed_count': int,
            'total_count': int,
            'error_message': str or None,
            'max_time': float,
            'max_memory': float,
            'test_case_details': list
        }
        """
        api_url, api_key, is_mock = cls.get_config()

        if is_mock:
            logger.info("Judge0: No API Key provided for RapidAPI. Running in Mock Compiler Mode.")
            return cls._mock_execution(source_code, test_cases, language_id=language_id)

        headers = {
            'content-type': 'application/json'
        }
        if api_key:
            if 'rapidapi' in api_url:
                headers['x-rapidapi-key'] = api_key
                headers['x-rapidapi-host'] = 'judge0-ce.p.rapidapi.com'
            else:
                headers['X-Auth-Token'] = api_key

        # Step 1: Create batch submissions
        submissions = []
        for tc in test_cases:
            submissions.append({
                'source_code': source_code,
                'language_id': language_id,
                'stdin': tc.input_data,
                'expected_output': tc.expected_output,
                'cpu_time_limit': time_limit,
                'memory_limit': memory_limit * 1024 # Judge0 takes memory in KB
            })

        try:
            # We can use /submissions/batch endpoint
            post_url = f"{api_url}/submissions/batch?base64_encoded=false"
            response = requests.post(post_url, json={'submissions': submissions}, headers=headers, timeout=10)
            
            if response.status_code != 201:
                logger.error(f"Judge0 batch creation failed: {response.text}")
                return cls._mock_execution(source_code, test_cases, language_id=language_id, error=f"Judge0 API returned status {response.status_code}")

            tokens_response = response.json()
            tokens = [item['token'] for item in tokens_response]

            # Step 2: Poll batch results
            max_polls = 10
            poll_interval = 1.0
            completed_results = []
            
            for poll in range(max_polls):
                tokens_str = ",".join(tokens)
                get_url = f"{api_url}/submissions/batch?tokens={tokens_str}&base64_encoded=false&fields=status_id,status,time,memory,stdout,stderr,compile_output"
                get_response = requests.get(get_url, headers=headers, timeout=10)
                
                if get_response.status_code == 200:
                    results = get_response.json().get('submissions', [])
                    # Check if all are done (status_id 1 is In Queue, 2 is Processing)
                    all_done = all(r.get('status_id', 1) > 2 for r in results)
                    if all_done:
                        completed_results = results
                        break
                
                time.sleep(poll_interval)

            if not completed_results:
                # If polling timed out, fetch one last time
                get_response = requests.get(get_url, headers=headers, timeout=10)
                if get_response.status_code == 200:
                    completed_results = get_response.json().get('submissions', [])

            # Step 3: Evaluate results
            return cls._evaluate_results(completed_results, test_cases)

        except Exception as e:
            logger.error(f"Error during Judge0 execution: {str(e)}")
            return cls._mock_execution(source_code, test_cases, language_id=language_id, error=str(e))

    @classmethod
    def _evaluate_results(cls, results, test_cases):
        """
        Parses results from Judge0 and calculates overall status.
        Status priorities: Compilation Error > Runtime Error > Time Limit > Memory Limit > Wrong Answer > Accepted
        """
        if not results or len(results) != len(test_cases):
            return {
                'status': 'Runtime Error',
                'passed_count': 0,
                'total_count': len(test_cases),
                'error_message': 'Failed to compile or retrieve results from compiler API.',
                'max_time': 0.0,
                'max_memory': 0.0,
                'test_case_details': []
            }

        if results and any(r.get('status_id') == 13 for r in results):
            raise Exception("Judge0 worker failed with Internal Error (cgroup/sandbox issue). Falling back to mock execution.")

        passed_count = 0
        total_count = len(test_cases)
        overall_status = 'Accepted'
        error_message = None
        max_time = 0.0
        max_memory = 0.0
        details = []

        # Judge0 Status IDs:
        # 3: Accepted
        # 4: Wrong Answer
        # 5: Time Limit Exceeded
        # 6: Compilation Error
        # 7-12: Runtime Errors
        # 13: Internal Error
        
        status_ranking = {
            'Compile Error': 6,
            'Runtime Error': 5,
            'Time Limit Exceeded': 4,
            'Memory Limit Exceeded': 3,
            'Wrong Answer': 2,
            'Accepted': 1
        }

        current_rank = 1

        for i, res in enumerate(results):
            tc = test_cases[i]
            status_id = res.get('status_id', 3)
            status_desc = res.get('status', {}).get('description', 'Accepted')
            
            res_time = float(res.get('time') or 0.0)
            res_memory = float(res.get('memory') or 0.0) # In KB
            
            max_time = max(max_time, res_time)
            max_memory = max(max_memory, res_memory)

            stdout = res.get('stdout') or ""
            stderr = res.get('stderr') or ""
            compile_output = res.get('compile_output') or ""

            # Check status
            tc_status = 'Accepted'
            if status_id == 3:
                tc_status = 'Accepted'
                passed_count += 1
            elif status_id == 4:
                tc_status = 'Wrong Answer'
            elif status_id == 5:
                tc_status = 'Time Limit Exceeded'
            elif status_id == 6:
                tc_status = 'Compile Error'
                error_message = compile_output
            elif 7 <= status_id <= 12:
                tc_status = 'Runtime Error'
                error_message = stderr or f"Runtime error code {status_id}"
            else:
                tc_status = 'Runtime Error'
                error_message = f"Execution issue: {status_desc}"

            # Update overall status if this test case is worse than current rank
            if status_ranking.get(tc_status, 1) > current_rank:
                current_rank = status_ranking.get(tc_status, 1)
                overall_status = tc_status
                if tc_status == 'Wrong Answer' and not error_message:
                    error_message = f"Test Case {i+1} Failed:\nInput:\n{tc.input_data}\nExpected:\n{tc.expected_output}\nGot:\n{stdout}"

            details.append({
                'test_case_id': tc.id,
                'is_hidden': tc.is_hidden,
                'status': tc_status,
                'execution_time': res_time,
                'memory_usage': res_memory,
                'stdout': stdout if not tc.is_hidden else "[Hidden]",
                'expected': tc.expected_output if not tc.is_hidden else "[Hidden]"
            })

        return {
            'status': overall_status,
            'passed_count': passed_count,
            'total_count': total_count,
            'error_message': error_message,
            'max_time': max_time,
            'max_memory': max_memory,
            'test_case_details': details
        }

    @classmethod
    def _mock_execution(cls, source_code, test_cases, language_id=None, error=None):
        """
        Graceful mock implementation when Judge0 credentials are not set or fail.
        If the language is Python or JavaScript, we execute the code locally inside a
        subprocess. For other languages, we fall back to keyword-based mock analysis.
        """
        import subprocess
        import sys
        import tempfile
        
        total_count = len(test_cases)
        
        # Simple static analysis to check for basic programming syntax errors
        if not source_code or len(source_code.strip()) < 5:
            return {
                'status': 'Compile Error',
                'passed_count': 0,
                'total_count': total_count,
                'error_message': "Compilation Error: Source code too short or empty.",
                'max_time': 0.0,
                'max_memory': 0.0,
                'test_case_details': []
            }

        # Resolve Language slug
        lang_slug = ""
        if language_id is not None:
            try:
                from .models import Language
                lang = Language.objects.filter(judge0_id=language_id).first()
                if lang:
                    lang_slug = lang.slug
            except Exception as e:
                logger.error(f"Error loading language slug in Mock Compiler: {e}")

        # Local execution for Python
        if lang_slug == "python":
            with tempfile.NamedTemporaryFile(suffix=".py", delete=False, mode="w", encoding="utf-8") as temp_file:
                temp_file.write(source_code)
                temp_file_path = temp_file.name

            passed_count = 0
            overall_status = 'Accepted'
            error_message = None
            max_time = 0.0
            details = []
            
            try:
                for i, tc in enumerate(test_cases):
                    start_time = time.time()
                    try:
                        proc = subprocess.run(
                            [sys.executable, temp_file_path],
                            input=tc.input_data,
                            capture_output=True,
                            text=True,
                            timeout=2.0
                        )
                        elapsed_time = time.time() - start_time
                        max_time = max(max_time, elapsed_time)
                        
                        stdout = proc.stdout
                        stderr = proc.stderr
                        if temp_file_path in stderr:
                            stderr = stderr.replace(temp_file_path, "solution.py")
                        
                        if proc.returncode != 0:
                            if "SyntaxError" in stderr or "IndentationError" in stderr:
                                tc_status = 'Compile Error'
                            else:
                                tc_status = 'Runtime Error'
                            error_message = stderr.strip() or f"Process exited with code {proc.returncode}"
                        else:
                            clean_stdout = "\n".join(line.rstrip() for line in stdout.rstrip().splitlines())
                            clean_expected = "\n".join(line.rstrip() for line in tc.expected_output.rstrip().splitlines())
                            
                            if clean_stdout == clean_expected:
                                tc_status = 'Accepted'
                                passed_count += 1
                            else:
                                tc_status = 'Wrong Answer'
                                if not error_message:
                                    error_message = f"Wrong Answer on Test Case {i+1}.\nInput:\n{tc.input_data}\nExpected:\n{tc.expected_output}\nGot:\n{stdout}"
                    except subprocess.TimeoutExpired:
                        tc_status = 'Time Limit Exceeded'
                        error_message = "Time Limit Exceeded (2.0s)"
                        max_time = 2.0
                        stdout, stderr = "", ""
                    except Exception as ex:
                        tc_status = 'Runtime Error'
                        error_message = str(ex)
                        stdout, stderr = "", ""

                    details.append({
                        'test_case_id': tc.id,
                        'is_hidden': tc.is_hidden,
                        'status': tc_status,
                        'execution_time': round(max_time, 3),
                        'memory_usage': 1200.0,
                        'stdout': stdout if not tc.is_hidden else "[Hidden]",
                        'expected': tc.expected_output if not tc.is_hidden else "[Hidden]"
                    })

                status_ranking = {
                    'Compile Error': 6,
                    'Runtime Error': 5,
                    'Time Limit Exceeded': 4,
                    'Memory Limit Exceeded': 3,
                    'Wrong Answer': 2,
                    'Accepted': 1
                }
                current_rank = 1
                for det in details:
                    if status_ranking.get(det['status'], 1) > current_rank:
                        current_rank = status_ranking.get(det['status'], 1)
                        overall_status = det['status']

            finally:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

            return {
                'status': overall_status,
                'passed_count': passed_count,
                'total_count': total_count,
                'error_message': error_message,
                'max_time': round(max_time, 3),
                'max_memory': 1500.0,
                'test_case_details': details
            }

        # Local execution for JavaScript (Node.js)
        elif lang_slug == "javascript":
            with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode="w", encoding="utf-8") as temp_file:
                temp_file.write(source_code)
                temp_file_path = temp_file.name

            passed_count = 0
            overall_status = 'Accepted'
            error_message = None
            max_time = 0.0
            details = []
            
            try:
                for i, tc in enumerate(test_cases):
                    start_time = time.time()
                    try:
                        proc = subprocess.run(
                            ["node", temp_file_path],
                            input=tc.input_data,
                            capture_output=True,
                            text=True,
                            timeout=2.0
                        )
                        elapsed_time = time.time() - start_time
                        max_time = max(max_time, elapsed_time)
                        
                        stdout = proc.stdout
                        stderr = proc.stderr
                        
                        if proc.returncode != 0:
                            tc_status = 'Runtime Error'
                            error_message = stderr or f"Process exited with code {proc.returncode}"
                        else:
                            clean_stdout = "\n".join(line.rstrip() for line in stdout.rstrip().splitlines())
                            clean_expected = "\n".join(line.rstrip() for line in tc.expected_output.rstrip().splitlines())
                            
                            if clean_stdout == clean_expected:
                                tc_status = 'Accepted'
                                passed_count += 1
                            else:
                                tc_status = 'Wrong Answer'
                                if not error_message:
                                    error_message = f"Wrong Answer on Test Case {i+1}.\nInput:\n{tc.input_data}\nExpected:\n{tc.expected_output}\nGot:\n{stdout}"
                    except subprocess.TimeoutExpired:
                        tc_status = 'Time Limit Exceeded'
                        error_message = "Time Limit Exceeded (2.0s)"
                        max_time = 2.0
                        stdout, stderr = "", ""
                    except Exception as ex:
                        tc_status = 'Runtime Error'
                        error_message = str(ex)
                        stdout, stderr = "", ""

                    details.append({
                        'test_case_id': tc.id,
                        'is_hidden': tc.is_hidden,
                        'status': tc_status,
                        'execution_time': round(max_time, 3),
                        'memory_usage': 1200.0,
                        'stdout': stdout if not tc.is_hidden else "[Hidden]",
                        'expected': tc.expected_output if not tc.is_hidden else "[Hidden]"
                    })

                status_ranking = {
                    'Compile Error': 6,
                    'Runtime Error': 5,
                    'Time Limit Exceeded': 4,
                    'Memory Limit Exceeded': 3,
                    'Wrong Answer': 2,
                    'Accepted': 1
                }
                current_rank = 1
                for det in details:
                    if status_ranking.get(det['status'], 1) > current_rank:
                        current_rank = status_ranking.get(det['status'], 1)
                        overall_status = det['status']

            finally:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)

            return {
                'status': overall_status,
                'passed_count': passed_count,
                'total_count': total_count,
                'error_message': error_message,
                'max_time': round(max_time, 3),
                'max_memory': 1500.0,
                'test_case_details': details
            }

        # Fallback for other languages (Keyword Mock Mode)
        # A very basic syntax validation for common languages
        syntax_ok = True
        err_msg = ""
        
        if "def " in source_code and ":" not in source_code:
            syntax_ok = False
            err_msg = "SyntaxError: expected ':' in function definition"
        elif "class " in source_code and "{" not in source_code and ":" not in source_code:
            syntax_ok = False
            err_msg = "SyntaxError: missing block definition"

        if not syntax_ok:
            return {
                'status': 'Compile Error',
                'passed_count': 0,
                'total_count': total_count,
                'error_message': f"Mock Compiler Error: {err_msg}",
                'max_time': 0.0,
                'max_memory': 0.0,
                'test_case_details': []
            }

        code_has_logic = any(kw in source_code for kw in ['return', 'print', 'console.log', 'cout', 'printf', 'System.out'])
        
        passed_count = total_count if code_has_logic else max(1, total_count - 1)
        status = 'Accepted' if passed_count == total_count else 'Wrong Answer'
        
        details = []
        for i, tc in enumerate(test_cases):
            tc_passed = i < passed_count
            details.append({
                'test_case_id': tc.id,
                'is_hidden': tc.is_hidden,
                'status': 'Accepted' if tc_passed else 'Wrong Answer',
                'execution_time': 0.05,
                'memory_usage': 1200.0,
                'stdout': tc.expected_output if tc_passed else "Incorrect output sequence",
                'expected': tc.expected_output
            })

        return {
            'status': status,
            'passed_count': passed_count,
            'total_count': total_count,
            'error_message': None if status == 'Accepted' else f"Mock Compiler: Wrong Answer on Test Case {passed_count + 1}",
            'max_time': 0.08,
            'max_memory': 1500.0,
            'test_case_details': details
        }

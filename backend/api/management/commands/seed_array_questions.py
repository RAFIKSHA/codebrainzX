import json
from django.core.management.base import BaseCommand
from api.models import Topic, QuestionLevel, Question, TestCase

class Command(BaseCommand):
    help = 'Seeds the 10 production-ready Array DSA roadmap coding questions with protected driver architecture'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting Array DSA Roadmap questions seeding...'))

        topic, _ = Topic.objects.get_or_create(
            name='Arrays',
            defaults={
                'slug': 'arrays',
                'description': '1D/2D arrays, prefix sums, subarrays, traversal, and manipulation.',
                'order': 6
            }
        )

        basic_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='basic')
        easy_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='easy')

        # 10 Production-Ready Array Questions
        questions_data = [
            # 01
            {
                "order": 1,
                "title": "Find the Largest Element",
                "slug": "find-the-largest-element",
                "level": basic_level,
                "statement": "Given an integer array `arr` of size `n`, find and return the largest element in the array.\n\nComplete the `solve(arr)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the largest element in the array.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "examples": [
                    {
                        "input": "5\n1 4 2 9 5",
                        "output": "9",
                        "explanation": "The maximum value in [1, 4, 2, 9, 5] is 9."
                    },
                    {
                        "input": "6\n-10 -20 -5 -30 -15 -8",
                        "output": "-5",
                        "explanation": "The maximum value among all negative numbers is -5."
                    }
                ],
                "notes": "Iterate through the array while maintaining a variable tracking the maximum value found so far.",
                "tags": "Arrays, Traversal, Basic, Beginner",
                "companies": "Amazon, Microsoft, TCS, Infosys",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "int solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static int solve(int[] arr) {\n    // Write your code here\n    return 0;\n}\n",
                    "c": "int solve(int arr[], int n) {\n    // Write your code here\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    cout << solve(arr) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        System.out.println(solve(arr));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    printf(\"%d\\n\", solve(arr, n));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "5\n1 4 2 9 5", "expected_output": "9", "is_hidden": False, "weight": 1},
                    {"input_data": "6\n-10 -20 -5 -30 -15 -8", "expected_output": "-5", "is_hidden": False, "weight": 1},
                    {"input_data": "1\n42", "expected_output": "42", "is_hidden": True, "weight": 1},
                    {"input_data": "4\n7 7 7 7", "expected_output": "7", "is_hidden": True, "weight": 1},
                    {"input_data": "5\n100 200 50 80 150", "expected_output": "200", "is_hidden": True, "weight": 1}
                ]
            },

            # 02
            {
                "order": 2,
                "title": "Find the Smallest Element",
                "slug": "find-the-smallest-element",
                "level": basic_level,
                "statement": "Given an integer array `arr` of size `n`, find and return the smallest element in the array.\n\nComplete the `solve(arr)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the smallest element in the array.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "examples": [
                    {
                        "input": "5\n7 2 8 1 5",
                        "output": "1",
                        "explanation": "The minimum value in [7, 2, 8, 1, 5] is 1."
                    },
                    {
                        "input": "4\n-3 -10 5 -2",
                        "output": "-10",
                        "explanation": "The minimum value among the elements is -10."
                    }
                ],
                "notes": "Initialize min_val to arr[0] and iterate through the list.",
                "tags": "Arrays, Traversal, Basic, Beginner",
                "companies": "Cognizant, Wipro, TCS",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "int solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static int solve(int[] arr) {\n    // Write your code here\n    return 0;\n}\n",
                    "c": "int solve(int arr[], int n) {\n    // Write your code here\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    cout << solve(arr) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        System.out.println(solve(arr));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    printf(\"%d\\n\", solve(arr, n));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "5\n7 2 8 1 5", "expected_output": "1", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n-3 -10 5 -2", "expected_output": "-10", "is_hidden": False, "weight": 1},
                    {"input_data": "1\n-999", "expected_output": "-999", "is_hidden": True, "weight": 1},
                    {"input_data": "5\n15 15 15 15 15", "expected_output": "15", "is_hidden": True, "weight": 1},
                    {"input_data": "6\n10 50 4 20 8 3", "expected_output": "3", "is_hidden": True, "weight": 1}
                ]
            },

            # 03
            {
                "order": 3,
                "title": "Calculate Sum of Array Elements",
                "slug": "calculate-sum-of-array-elements",
                "level": basic_level,
                "statement": "Given an integer array `arr` of size `n`, compute and return the sum of all elements in the array.\n\nComplete the `solve(arr)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the total sum of all elements.",
                "constraints": "1 <= n <= 10^5\n-10^6 <= arr[i] <= 10^6",
                "examples": [
                    {
                        "input": "4\n1 2 3 4",
                        "output": "10",
                        "explanation": "1 + 2 + 3 + 4 = 10."
                    },
                    {
                        "input": "5\n10 -5 20 -10 5",
                        "output": "20",
                        "explanation": "10 - 5 + 20 - 10 + 5 = 20."
                    }
                ],
                "notes": "Maintain an accumulator sum variable initialized to 0.",
                "tags": "Arrays, Math, Basic, Beginner",
                "companies": "Infosys, Accenture, Capgemini",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "long long solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static long solve(int[] arr) {\n    // Write your code here\n    return 0;\n}\n",
                    "c": "long long solve(int arr[], int n) {\n    // Write your code here\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    cout << solve(arr) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        System.out.println(solve(arr));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    printf(\"%lld\\n\", solve(arr, n));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "4\n1 2 3 4", "expected_output": "10", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n10 -5 20 -10 5", "expected_output": "20", "is_hidden": False, "weight": 1},
                    {"input_data": "1\n100", "expected_output": "100", "is_hidden": True, "weight": 1},
                    {"input_data": "4\n-10 -20 -30 -40", "expected_output": "-100", "is_hidden": True, "weight": 1},
                    {"input_data": "6\n0 0 0 0 0 0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # 04
            {
                "order": 4,
                "title": "Count Even Numbers",
                "slug": "count-even-numbers",
                "level": basic_level,
                "statement": "Given an integer array `arr` of size `n`, count and return the total number of even numbers in the array.\n\nComplete the `solve(arr)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the count of even numbers.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "examples": [
                    {
                        "input": "5\n1 2 3 4 6",
                        "output": "3",
                        "explanation": "The even numbers are 2, 4, 6 (count = 3)."
                    },
                    {
                        "input": "4\n1 3 5 7",
                        "output": "0",
                        "explanation": "There are no even numbers in this array."
                    }
                ],
                "notes": "An integer x is even if x % 2 == 0.",
                "tags": "Arrays, Counting, Basic",
                "companies": "TCS, Wipro, HCL",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "int solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static int solve(int[] arr) {\n    // Write your code here\n    return 0;\n}\n",
                    "c": "int solve(int arr[], int n) {\n    // Write your code here\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    cout << solve(arr) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        System.out.println(solve(arr));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    printf(\"%d\\n\", solve(arr, n));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "5\n1 2 3 4 6", "expected_output": "3", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n1 3 5 7", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n-2 -4 0 5 7", "expected_output": "3", "is_hidden": True, "weight": 1},
                    {"input_data": "4\n2 4 6 8", "expected_output": "4", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n0", "expected_output": "1", "is_hidden": True, "weight": 1}
                ]
            },

            # 05
            {
                "order": 5,
                "title": "Count Odd Numbers",
                "slug": "count-odd-numbers",
                "level": basic_level,
                "statement": "Given an integer array `arr` of size `n`, count and return the total number of odd numbers in the array.\n\nComplete the `solve(arr)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the count of odd numbers.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "examples": [
                    {
                        "input": "5\n1 2 3 4 5",
                        "output": "3",
                        "explanation": "The odd numbers are 1, 3, 5 (count = 3)."
                    },
                    {
                        "input": "4\n2 4 6 8",
                        "output": "0",
                        "explanation": "There are no odd numbers in this array."
                    }
                ],
                "notes": "An integer x is odd if x % 2 != 0.",
                "tags": "Arrays, Counting, Basic",
                "companies": "TCS, Mindtree, Tech Mahindra",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "int solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static int solve(int[] arr) {\n    // Write your code here\n    return 0;\n}\n",
                    "c": "int solve(int arr[], int n) {\n    // Write your code here\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    cout << solve(arr) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        System.out.println(solve(arr));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    printf(\"%d\\n\", solve(arr, n));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "5\n1 2 3 4 5", "expected_output": "3", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n2 4 6 8", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n-1 -3 2 4 -5", "expected_output": "3", "is_hidden": True, "weight": 1},
                    {"input_data": "4\n11 23 35 47", "expected_output": "4", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n1", "expected_output": "1", "is_hidden": True, "weight": 1}
                ]
            },

            # 06
            {
                "order": 6,
                "title": "Reverse an Array",
                "slug": "reverse-an-array",
                "level": easy_level,
                "statement": "Given an integer array `arr` of size `n`, return the reversed array.\n\nThe `solve(arr)` function must return a list containing the reversed elements.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the reversed array elements separated by a space.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "examples": [
                    {
                        "input": "4\n1 2 3 4",
                        "output": "4 3 2 1",
                        "explanation": "Reversing [1, 2, 3, 4] yields [4, 3, 2, 1]."
                    },
                    {
                        "input": "5\n10 20 30 40 50",
                        "output": "50 40 30 20 10",
                        "explanation": "Reversing [10, 20, 30, 40, 50] yields [50, 40, 30, 20, 10]."
                    }
                ],
                "notes": "In Python, you can return `arr[::-1]` or reverse in-place and return arr.",
                "tags": "Arrays, Two Pointers, Easy",
                "companies": "Google, Amazon, Adobe, Microsoft",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "vector<int> solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static int[] solve(int[] arr) {\n    // Write your code here\n    return arr;\n}\n",
                    "c": "void solve(int arr[], int n) {\n    // Write your code here\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(*result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result.join(' '));\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    vector<int> res = solve(arr);\n    for (size_t i = 0; i < res.size(); i++) {\n        cout << res[i] << (i + 1 < res.size() ? \" \" : \"\");\n    }\n    cout << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int[] res = solve(arr);\n        for (int i = 0; i < res.length; i++) {\n            System.out.print(res[i] + (i + 1 < res.length ? \" \" : \"\"));\n        }\n        System.out.println();\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    solve(arr, n);\n    for (int i = 0; i < n; i++) {\n        printf(\"%d%s\", arr[i], (i + 1 < n ? \" \" : \"\"));\n    }\n    printf(\"\\n\");\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "4\n1 2 3 4", "expected_output": "4 3 2 1", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n10 20 30 40 50", "expected_output": "50 40 30 20 10", "is_hidden": False, "weight": 1},
                    {"input_data": "1\n99", "expected_output": "99", "is_hidden": True, "weight": 1},
                    {"input_data": "3\n-5 0 5", "expected_output": "5 0 -5", "is_hidden": True, "weight": 1},
                    {"input_data": "6\n1 1 2 2 3 3", "expected_output": "3 3 2 2 1 1", "is_hidden": True, "weight": 1}
                ]
            },

            # 07
            {
                "order": 7,
                "title": "Search an Element",
                "slug": "search-an-element",
                "level": easy_level,
                "statement": "Given an integer array `arr` of size `n` and a `target` integer, return `\"YES\"` if the target element exists in `arr`, otherwise return `\"NO\"`.\n\nComplete the `solve(arr, target)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.\nLine 3: An integer `target` to search for.",
                "output_format": "The driver prints YES or NO.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i], target <= 10^9",
                "examples": [
                    {
                        "input": "5\n10 20 30 40 50\n30",
                        "output": "YES",
                        "explanation": "30 is present at index 2."
                    },
                    {
                        "input": "5\n10 20 30 40 50\n99",
                        "output": "NO",
                        "explanation": "99 is not present in the array."
                    }
                ],
                "notes": "Return the exact string 'YES' or 'NO' from solve().",
                "tags": "Arrays, Linear Search, Searching, Easy",
                "companies": "Amazon, Cisco, Oracle, Infosys",
                "starter_code": {
                    "python": "def solve(arr, target):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr, target) {\n    // Write your code here\n}\n",
                    "cpp": "string solve(vector<int>& arr, int target) {\n    // Write your code here\n}\n",
                    "java": "public static String solve(int[] arr, int target) {\n    // Write your code here\n    return \"NO\";\n}\n",
                    "c": "const char* solve(int arr[], int n, int target) {\n    // Write your code here\n    return \"NO\";\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n    target = int(input())\n\n    result = solve(arr, target)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 3) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const target = parseInt(input[n + 1], 10);\n    const result = solve(arr, target);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    int target;\n    cin >> target;\n    cout << solve(arr, target) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        System.out.println(solve(arr, target));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    int target;\n    scanf(\"%d\", &target);\n    printf(\"%s\\n\", solve(arr, n, target));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "5\n10 20 30 40 50\n30", "expected_output": "YES", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n10 20 30 40 50\n99", "expected_output": "NO", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n-5 -10 15 20\n-10", "expected_output": "YES", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n7\n7", "expected_output": "YES", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n7\n8", "expected_output": "NO", "is_hidden": True, "weight": 1},
                    {"input_data": "5\n1 2 3 4 5\n1", "expected_output": "YES", "is_hidden": True, "weight": 1},
                    {"input_data": "5\n1 2 3 4 5\n5", "expected_output": "YES", "is_hidden": True, "weight": 1}
                ]
            },

            # 08
            {
                "order": 8,
                "title": "Count Occurrences of an Element",
                "slug": "count-occurrences-of-an-element",
                "level": easy_level,
                "statement": "Given an integer array `arr` of size `n` and a `target` integer, return the frequency (count of occurrences) of `target` in the array.\n\nComplete the `solve(arr, target)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.\nLine 3: An integer `target` to count.",
                "output_format": "The driver prints the number of occurrences of target.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i], target <= 10^9",
                "examples": [
                    {
                        "input": "6\n1 2 2 3 2 4\n2",
                        "output": "3",
                        "explanation": "The element 2 appears 3 times in [1, 2, 2, 3, 2, 4]."
                    },
                    {
                        "input": "4\n1 2 3 4\n9",
                        "output": "0",
                        "explanation": "9 does not appear in the array, so count is 0."
                    }
                ],
                "notes": "Count each occurrence of x == target.",
                "tags": "Arrays, Frequency, Counting, Easy",
                "companies": "Morgan Stanley, TCS, Infosys",
                "starter_code": {
                    "python": "def solve(arr, target):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr, target) {\n    // Write your code here\n}\n",
                    "cpp": "int solve(vector<int>& arr, int target) {\n    // Write your code here\n}\n",
                    "java": "public static int solve(int[] arr, int target) {\n    // Write your code here\n    return 0;\n}\n",
                    "c": "int solve(int arr[], int n, int target) {\n    // Write your code here\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n    target = int(input())\n\n    result = solve(arr, target)\n\n    print(result)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 3) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const target = parseInt(input[n + 1], 10);\n    const result = solve(arr, target);\n    console.log(result);\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    int target;\n    cin >> target;\n    cout << solve(arr, target) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int target = sc.nextInt();\n        System.out.println(solve(arr, target));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    int target;\n    scanf(\"%d\", &target);\n    printf(\"%d\\n\", solve(arr, n, target));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "6\n1 2 2 3 2 4\n2", "expected_output": "3", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n1 2 3 4\n9", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n5 5 5 5 5\n5", "expected_output": "5", "is_hidden": True, "weight": 1},
                    {"input_data": "4\n-1 -2 -1 -3\n-1", "expected_output": "2", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n42\n42", "expected_output": "1", "is_hidden": True, "weight": 1}
                ]
            },

            # 09
            {
                "order": 9,
                "title": "Find the Average of Array Elements",
                "slug": "find-the-average-of-array-elements",
                "level": easy_level,
                "statement": "Given an integer array `arr` of size `n`, calculate and return the average of all elements in the array.\n\nComplete the `solve(arr)` function.",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints the average formatted to 2 decimal places.",
                "constraints": "1 <= n <= 10^5\n-10^6 <= arr[i] <= 10^6",
                "examples": [
                    {
                        "input": "4\n10 20 30 40",
                        "output": "25.00",
                        "explanation": "(10 + 20 + 30 + 40) / 4 = 100 / 4 = 25.00"
                    },
                    {
                        "input": "3\n1 2 4",
                        "output": "2.33",
                        "explanation": "(1 + 2 + 4) / 3 = 7 / 3 = 2.3333... -> 2.33"
                    }
                ],
                "notes": "Return the numeric float value from solve(). The driver formats it with `f'{result:.2f}'`.",
                "tags": "Arrays, Math, Precision, Easy",
                "companies": "Wipro, Cognizant, TCS",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "double solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static double solve(int[] arr) {\n    // Write your code here\n    return 0.0;\n}\n",
                    "c": "double solve(int arr[], int n) {\n    // Write your code here\n    return 0.0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    print(f\"{result:.2f}\")\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    console.log(result.toFixed(2));\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    cout << fixed << setprecision(2) << solve(arr) << endl;\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        System.out.printf(\"%.2f\\n\", solve(arr));\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    printf(\"%.2f\\n\", solve(arr, n));\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "4\n10 20 30 40", "expected_output": "25.00", "is_hidden": False, "weight": 1},
                    {"input_data": "3\n1 2 4", "expected_output": "2.33", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n1 2 3 4 5", "expected_output": "3.00", "is_hidden": True, "weight": 1},
                    {"input_data": "2\n-10 -20", "expected_output": "-15.00", "is_hidden": True, "weight": 1},
                    {"input_data": "3\n-5 0 5", "expected_output": "0.00", "is_hidden": True, "weight": 1}
                ]
            },

            # 10
            {
                "order": 10,
                "title": "Print Positive Elements",
                "slug": "print-positive-elements",
                "level": easy_level,
                "statement": "Given an integer array `arr` of size `n`, return a list containing all strictly positive elements (`> 0`) from `arr` in their original order.\n\nIf no positive elements exist, return an empty list or falsy value (the driver will print `-1`).",
                "input_format": "Line 1: An integer `n` representing the number of elements.\nLine 2: `n` space-separated integers representing the array elements.",
                "output_format": "The driver prints space-separated positive elements, or -1 if none exist.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "examples": [
                    {
                        "input": "5\n-1 2 -3 4 5",
                        "output": "2 4 5",
                        "explanation": "The positive numbers (> 0) in the array are 2, 4, 5."
                    },
                    {
                        "input": "3\n-1 -2 -3",
                        "output": "-1",
                        "explanation": "There are no positive numbers, so the driver outputs -1."
                    }
                ],
                "notes": "Filter elements where x > 0.",
                "tags": "Arrays, Filtering, Easy",
                "companies": "Amazon, Paytm, TCS",
                "starter_code": {
                    "python": "def solve(arr):\n    # Write your code here\n    pass\n",
                    "javascript": "function solve(arr) {\n    // Write your code here\n}\n",
                    "cpp": "vector<int> solve(vector<int>& arr) {\n    // Write your code here\n}\n",
                    "java": "public static int[] solve(int[] arr) {\n    // Write your code here\n    return new int[0];\n}\n",
                    "c": "int solve(int arr[], int n, int out[]) {\n    // Write your code here, store in out, return count\n    return 0;\n}\n"
                },
                "driver_code": {
                    "python": "def main():\n    n = int(input())\n    arr = list(map(int, input().split()))\n\n    result = solve(arr)\n\n    if result:\n        print(*result)\n    else:\n        print(-1)\n\n\nif __name__ == \"__main__\":\n    main()",
                    "javascript": "const fs = require('fs');\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n    if (!input || input.length < 2) return;\n    const n = parseInt(input[0], 10);\n    const arr = input.slice(1, n + 1).map(Number);\n    const result = solve(arr);\n    if (result && result.length > 0) {\n        console.log(result.join(' '));\n    } else {\n        console.log(-1);\n    }\n}\nmain();",
                    "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    vector<int> res = solve(arr);\n    if (!res.empty()) {\n        for (size_t i = 0; i < res.size(); i++) {\n            cout << res[i] << (i + 1 < res.size() ? \" \" : \"\");\n        }\n        cout << endl;\n    } else {\n        cout << -1 << endl;\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n        int[] res = solve(arr);\n        if (res != null && res.length > 0) {\n            for (int i = 0; i < res.length; i++) {\n                System.out.print(res[i] + (i + 1 < res.length ? \" \" : \"\"));\n            }\n            System.out.println();\n        } else {\n            System.out.println(-1);\n        }\n    }\n}",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int arr[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n    int out[n];\n    int count = solve(arr, n, out);\n    if (count > 0) {\n        for (int i = 0; i < count; i++) {\n            printf(\"%d%s\", out[i], (i + 1 < count ? \" \" : \"\"));\n        }\n        printf(\"\\n\");\n    } else {\n        printf(\"-1\\n\");\n    }\n    return 0;\n}"
                },
                "test_cases": [
                    {"input_data": "5\n-1 2 -3 4 5", "expected_output": "2 4 5", "is_hidden": False, "weight": 1},
                    {"input_data": "3\n-1 -2 -3", "expected_output": "-1", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n0 -5 0 -10", "expected_output": "-1", "is_hidden": True, "weight": 1},
                    {"input_data": "4\n10 20 30 40", "expected_output": "10 20 30 40", "is_hidden": True, "weight": 1},
                    {"input_data": "5\n-10 5 0 -2 8", "expected_output": "5 8", "is_hidden": True, "weight": 1}
                ]
            }
        ]

        # Seed questions
        created_count = 0
        updated_count = 0

        for q_data in questions_data:
            q_obj, created = Question.objects.update_or_create(
                slug=q_data["slug"],
                defaults={
                    "topic": topic,
                    "level": q_data["level"],
                    "title": q_data["title"],
                    "statement": q_data["statement"],
                    "input_format": q_data["input_format"],
                    "output_format": q_data["output_format"],
                    "constraints": q_data["constraints"],
                    "examples": json.dumps(q_data["examples"]),
                    "notes": q_data.get("notes", ""),
                    "tags": q_data.get("tags", ""),
                    "companies": q_data.get("companies", ""),
                    "starter_code": json.dumps(q_data["starter_code"]),
                    "driver_code": json.dumps(q_data["driver_code"]),
                    "time_limit": 2.0,
                    "memory_limit": 256.0,
                    "is_published": True,
                    "order": q_data["order"],
                }
            )

            # Recreate test cases
            q_obj.test_cases.all().delete()
            for tc in q_data["test_cases"]:
                TestCase.objects.create(
                    question=q_obj,
                    input_data=tc["input_data"],
                    expected_output=tc["expected_output"],
                    is_hidden=tc["is_hidden"],
                    weight=tc.get("weight", 1)
                )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {q_obj.title} (Order: {q_obj.order})"))
            else:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Updated: {q_obj.title} (Order: {q_obj.order})"))

        self.stdout.write(self.style.SUCCESS(
            f"\nFinished seeding Array questions. Created: {created_count}, Updated: {updated_count}."
        ))

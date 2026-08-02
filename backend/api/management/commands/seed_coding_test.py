import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import (
    Topic, QuestionLevel, Question, TestCase, CodingTest, CodingTestQuestion
)

class Command(BaseCommand):
    help = 'Seeds the database with sample Coding Tests and Questions'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding coding test assessment content...")

        # 1. Create Topics
        topic_arr, _ = Topic.objects.get_or_create(
            name='Arrays',
            defaults={'description': 'Array manipulation and search patterns', 'order': 1}
        )
        topic_str, _ = Topic.objects.get_or_create(
            name='Strings',
            defaults={'description': 'String processing and patterns parsing', 'order': 2}
        )

        # 2. Create Question Levels
        level_easy, _ = QuestionLevel.objects.get_or_create(
            topic=topic_arr,
            level='easy'
        )
        level_med, _ = QuestionLevel.objects.get_or_create(
            topic=topic_str,
            level='medium'
        )

        # 3. Create Questions
        q1_starter = {
            "python": "def solve(n, arr):\n    # Write your python code here\n    # Return sum(even) - sum(odd)\n    evens = sum(x for x in arr if x % 2 == 0)\n    odds = sum(x for x in arr if x % 2 != 0)\n    return evens - odds\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().split()\n    if lines:\n        n = int(lines[0])\n        arr = [int(x) for x in lines[1:]]\n        print(solve(n, arr))\n",
            "javascript": "function solve(n, arr) {\n    // Write your javascript code here\n    const evens = arr.filter(x => x % 2 === 0).reduce((a, b) => a + b, 0);\n    const odds = arr.filter(x => x % 2 !== 0).reduce((a, b) => a + b, 0);\n    return evens - odds;\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length > 1) {\n    const n = parseInt(input[0]);\n    const arr = input.slice(1).map(Number);\n    console.log(solve(n, arr));\n}\n"
        }

        q1, q1_created = Question.objects.get_or_create(
            title="Even Odd Difference Sum",
            defaults={
                "topic": topic_arr,
                "level": level_easy,
                "statement": "Write a program that takes an array of integers and returns the difference between the sum of even numbers and the sum of odd numbers in the array.\n\nFor example, if the array is [1, 2, 3, 4, 5], the even numbers are 2 and 4 (sum = 6), and the odd numbers are 1, 3, and 5 (sum = 9). The difference is 6 - 9 = -3.",
                "constraints": "1 <= N <= 1000\n-10^5 <= arr[i] <= 10^5",
                "input_format": "The first line contains an integer N, representing the size of the array.\nThe second line contains N space-separated integers representing the array elements.",
                "output_format": "Print a single integer representing (Even Sum - Odd Sum).",
                "starter_code": json.dumps(q1_starter),
                "time_limit": 2.0,
                "memory_limit": 256.0
            }
        )
        if q1_created:
            self.stdout.write("Created Question 1: Even Odd Difference Sum")
            # Create Test Cases for Q1
            TestCase.objects.create(question=q1, input_data="5\n1 2 3 4 5", expected_output="-3", is_hidden=False)
            TestCase.objects.create(question=q1, input_data="4\n10 20 30 40", expected_output="100", is_hidden=False)
            TestCase.objects.create(question=q1, input_data="3\n1 3 5", expected_output="-9", is_hidden=True)

        q2_starter = {
            "python": "def solve(s, p):\n    # Write your python code here\n    # Count occurrences of substring p in s (including overlaps)\n    count = 0\n    start = 0\n    while True:\n        start = s.find(p, start)\n        if start == -1:\n            break\n        count += 1\n        start += 1\n    return count\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if len(lines) >= 2:\n        print(solve(lines[0].strip(), lines[1].strip()))\n",
            "javascript": "function solve(s, p) {\n    // Write your javascript code here\n    let count = 0;\n    let pos = s.indexOf(p);\n    while (pos !== -1) {\n        count++;\n        pos = s.indexOf(p, pos + 1);\n    }\n    return count;\n}\n\nconst fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (lines.length >= 2) {\n    console.log(solve(lines[0].trim(), lines[1].trim()));\n}\n"
        }

        q2, q2_created = Question.objects.get_or_create(
            title="Substring Overlapping Count",
            defaults={
                "topic": topic_str,
                "level": level_med,
                "statement": "Given two strings, a main string S and a pattern P. Find the total number of times pattern P appears as a substring in string S (including overlapping matches).\n\nFor example, if S = 'abababa' and P = 'aba', matches appear at indices 0, 2, and 4. The total overlapping occurrences count is 3.",
                "constraints": "1 <= |S|, |P| <= 10^4\nStrings contain alphanumeric characters only.",
                "input_format": "The first line contains string S.\nThe second line contains string P.",
                "output_format": "Print a single integer representing the count of pattern occurrences.",
                "starter_code": json.dumps(q2_starter),
                "time_limit": 2.0,
                "memory_limit": 256.0
            }
        )
        if q2_created:
            self.stdout.write("Created Question 2: Substring Overlapping Count")
            # Create Test Cases for Q2
            TestCase.objects.create(question=q2, input_data="abababa\naba", expected_output="3", is_hidden=False)
            TestCase.objects.create(question=q2, input_data="hellohello\nhello", expected_output="2", is_hidden=False)
            TestCase.objects.create(question=q2, input_data="test\nfoo", expected_output="0", is_hidden=True)

        # 4. Create Coding Test Mock
        coding_test, test_created = CodingTest.objects.get_or_create(
            title="TCS NQT National Qualifier Mock 1",
            defaults={
                "description": "Simulate the actual TCS National Qualifier Test (NQT) environment. Solves two challenges under proctored, fullscreen execution conditions.",
                "test_type": "mock",
                "overall_duration": 45,
                "pass_percentage": 50.0,
                "calculator_enabled": False,
                "is_published": True
            }
        )
        if test_created:
            self.stdout.write("Created Coding Test Mock 1")
            # Add Questions to test
            CodingTestQuestion.objects.create(test=coding_test, question=q1, order=1, points=10.0)
            CodingTestQuestion.objects.create(test=coding_test, question=q2, order=2, points=10.0)

        self.stdout.write(self.style.SUCCESS("Successfully seeded coding test database records!"))

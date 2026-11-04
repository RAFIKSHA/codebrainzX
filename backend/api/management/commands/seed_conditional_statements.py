import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Topic, QuestionLevel, Question, TestCase


class Command(BaseCommand):
    help = 'Seeds 20 production-ready Python Conditional Statements coding questions for CodexPetra'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting Conditional Statements questions seeding...'))

        topic, _ = Topic.objects.get_or_create(
            slug='conditions-loops',
            defaults={
                'name': 'Conditions & Loops',
                'description': 'Master if-else statements, while/for loops, break, and nested iteration.',
                'order': 2
            }
        )

        basic_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='basic')
        easy_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='easy')
        medium_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='medium')

        questions_data = [

            # ── Q01 ─────────────────────────────────────────────────────────────────
            {
                "order": 1,
                "title": "Positive, Negative or Zero",
                "slug": "positive-negative-or-zero",
                "level": easy_level,
                "statement": (
                    "In mathematics and programming, every real number belongs to exactly one of three categories: "
                    "positive, negative, or zero.\n\n"
                    "Given an integer `n`, determine its category and print the corresponding result.\n\n"
                    "**Real-world scenario:** A bank transaction module classifies every amount as a credit "
                    "(positive), debit (negative), or a no-operation (zero). Your function plays the same role.\n\n"
                    "Complete the `solve(n)` function:\n"
                    "- Return `\"Positive\"` if `n > 0`\n"
                    "- Return `\"Negative\"` if `n < 0`\n"
                    "- Return `\"Zero\"` if `n == 0`"
                ),
                "input_format": "A single integer `n` on one line.",
                "output_format": "Print exactly one of: `Positive`, `Negative`, or `Zero`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "10", "output": "Positive",
                     "explanation": "10 is greater than 0, so the output is Positive."},
                    {"input": "-25", "output": "Negative",
                     "explanation": "-25 is less than 0, so the output is Negative."},
                    {"input": "0", "output": "Zero",
                     "explanation": "0 is neither positive nor negative, so the output is Zero."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Read integer n.\n"
                    "2. If n > 0 return Positive.\n"
                    "3. Else if n < 0 return Negative.\n"
                    "4. Else return Zero.\n\n"
                    "**Edge case:** Zero must always return `Zero`, not Positive or Negative.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Basic, Beginner, If-Else",
                "companies": "TCS, Infosys, Wipro, Cognizant",
                "official_solution": (
                    "def solve(n):\n"
                    "    if n > 0:\n"
                    "        return \"Positive\"\n"
                    "    elif n < 0:\n"
                    "        return \"Negative\"\n"
                    "    else:\n"
                    "        return \"Zero\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(n):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "10", "expected_output": "Positive", "is_hidden": False, "weight": 1},
                    {"input_data": "-25", "expected_output": "Negative", "is_hidden": False, "weight": 1},
                    {"input_data": "0", "expected_output": "Zero", "is_hidden": True, "weight": 1},
                    {"input_data": "-1000000000", "expected_output": "Negative", "is_hidden": True, "weight": 1},
                    {"input_data": "1000000000", "expected_output": "Positive", "is_hidden": True, "weight": 1},
                    {"input_data": "-1", "expected_output": "Negative", "is_hidden": True, "weight": 1},
                    {"input_data": "1", "expected_output": "Positive", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q02 ─────────────────────────────────────────────────────────────────
            {
                "order": 2,
                "title": "Even or Odd Number",
                "slug": "even-or-odd-number",
                "level": easy_level,
                "statement": (
                    "An integer is **even** if it is exactly divisible by 2, and **odd** otherwise. "
                    "This fundamental check is used in sorting, parity validation, and grid computations.\n\n"
                    "Given an integer `n`, determine whether it is even or odd.\n\n"
                    "**Real-world scenario:** A parking lot system assigns even-numbered plates to the left lane "
                    "and odd-numbered plates to the right lane.\n\n"
                    "Complete the `solve(n)` function:\n"
                    "- Return `\"Even\"` if `n % 2 == 0`\n"
                    "- Return `\"Odd\"` otherwise"
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `Even` or `Odd`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "4", "output": "Even", "explanation": "4 divided by 2 gives remainder 0, so Even."},
                    {"input": "7", "output": "Odd", "explanation": "7 divided by 2 gives remainder 1, so Odd."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Compute n % 2.\n"
                    "2. If remainder is 0, return Even. Otherwise return Odd.\n\n"
                    "**Important edge cases:**\n"
                    "- 0 is Even (0 % 2 == 0).\n"
                    "- Negative numbers: -8 % 2 == 0 → Even; -13 % 2 != 0 → Odd.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Modulus, Beginner, Even-Odd",
                "companies": "TCS, Wipro, Amazon, Infosys",
                "official_solution": (
                    "def solve(n):\n"
                    "    if n % 2 == 0:\n"
                    "        return \"Even\"\n"
                    "    else:\n"
                    "        return \"Odd\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(n):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "4", "expected_output": "Even", "is_hidden": False, "weight": 1},
                    {"input_data": "7", "expected_output": "Odd", "is_hidden": False, "weight": 1},
                    {"input_data": "0", "expected_output": "Even", "is_hidden": True, "weight": 1},
                    {"input_data": "-8", "expected_output": "Even", "is_hidden": True, "weight": 1},
                    {"input_data": "-13", "expected_output": "Odd", "is_hidden": True, "weight": 1},
                    {"input_data": "999999999", "expected_output": "Odd", "is_hidden": True, "weight": 1},
                    {"input_data": "-1000000000", "expected_output": "Even", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q03 ─────────────────────────────────────────────────────────────────
            {
                "order": 3,
                "title": "Check Voting Eligibility",
                "slug": "check-voting-eligibility",
                "level": easy_level,
                "statement": (
                    "In most democratic countries, a citizen must be at least **18 years old** to be eligible to vote. "
                    "Your task is to determine whether a person is eligible to vote based on their age.\n\n"
                    "**Real-world scenario:** An electoral registration portal validates age before allowing a citizen "
                    "to register for voting.\n\n"
                    "Complete the `solve(age)` function:\n"
                    "- Return `\"Eligible\"` if `age >= 18`\n"
                    "- Return `\"Not Eligible\"` otherwise"
                ),
                "input_format": "A single integer `age` (in years).",
                "output_format": "Print `Eligible` or `Not Eligible`.",
                "constraints": "0 <= age <= 150",
                "examples": [
                    {"input": "21", "output": "Eligible", "explanation": "21 >= 18, so Eligible to vote."},
                    {"input": "16", "output": "Not Eligible",
                     "explanation": "16 < 18, so Not Eligible to vote."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Read age.\n"
                    "2. If age >= 18, return Eligible.\n"
                    "3. Else return Not Eligible.\n\n"
                    "**Edge case:** age == 18 must return Eligible (inclusive boundary).\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Real-World, Beginner, Boundary",
                "companies": "Infosys, TCS, HCL, Capgemini",
                "official_solution": (
                    "def solve(age):\n"
                    "    if age >= 18:\n"
                    "        return \"Eligible\"\n"
                    "    else:\n"
                    "        return \"Not Eligible\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(age):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    age = int(input())\n"
                        "    print(solve(age))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    age = int(input())\n"
                        "    print(solve(age))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "21", "expected_output": "Eligible", "is_hidden": False, "weight": 1},
                    {"input_data": "16", "expected_output": "Not Eligible", "is_hidden": False, "weight": 1},
                    {"input_data": "18", "expected_output": "Eligible", "is_hidden": True, "weight": 1},
                    {"input_data": "17", "expected_output": "Not Eligible", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "Not Eligible", "is_hidden": True, "weight": 1},
                    {"input_data": "150", "expected_output": "Eligible", "is_hidden": True, "weight": 1},
                    {"input_data": "75", "expected_output": "Eligible", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q04 ─────────────────────────────────────────────────────────────────
            {
                "order": 4,
                "title": "Find the Greater of Two Numbers",
                "slug": "find-the-greater-of-two-numbers",
                "level": easy_level,
                "statement": (
                    "Given two integers `a` and `b`, find and return the greater value. "
                    "If both numbers are equal, return `\"Equal\"`.\n\n"
                    "**Real-world scenario:** A score comparison module for a competitive exam platform "
                    "finds the higher score between two candidates.\n\n"
                    "Complete the `solve(a, b)` function:\n"
                    "- Return `a` if `a > b`\n"
                    "- Return `b` if `b > a`\n"
                    "- Return `\"Equal\"` if `a == b`"
                ),
                "input_format": "Line 1: integer `a`\nLine 2: integer `b`",
                "output_format": "Print the greater number, or `Equal` if both are the same.",
                "constraints": "-10^9 <= a, b <= 10^9",
                "examples": [
                    {"input": "10\n20", "output": "20", "explanation": "20 > 10, so 20 is greater."},
                    {"input": "45\n12", "output": "45", "explanation": "45 > 12, so 45 is greater."},
                    {"input": "50\n50", "output": "Equal", "explanation": "Both are equal so output is Equal."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Read a and b.\n"
                    "2. If a > b return a.\n"
                    "3. Elif b > a return b.\n"
                    "4. Else return Equal.\n\n"
                    "**Common mistake:** Forgetting to handle the equal case, which causes an empty or wrong output.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Comparison, Beginner, Two-Variables",
                "companies": "TCS, Wipro, Microsoft, Google",
                "official_solution": (
                    "def solve(a, b):\n"
                    "    if a > b:\n"
                    "        return a\n"
                    "    elif b > a:\n"
                    "        return b\n"
                    "    else:\n"
                    "        return \"Equal\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(a, b):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    print(solve(a, b))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    print(solve(a, b))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "10\n20", "expected_output": "20", "is_hidden": False, "weight": 1},
                    {"input_data": "45\n12", "expected_output": "45", "is_hidden": False, "weight": 1},
                    {"input_data": "50\n50", "expected_output": "Equal", "is_hidden": True, "weight": 1},
                    {"input_data": "-15\n-5", "expected_output": "-5", "is_hidden": True, "weight": 1},
                    {"input_data": "-100\n-100", "expected_output": "Equal", "is_hidden": True, "weight": 1},
                    {"input_data": "-1000000000\n1000000000", "expected_output": "1000000000", "is_hidden": True, "weight": 1},
                    {"input_data": "0\n-1", "expected_output": "0", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q05 ─────────────────────────────────────────────────────────────────
            {
                "order": 5,
                "title": "Check Divisibility by 5 and 11",
                "slug": "check-divisibility-by-5-and-11",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, check whether it is **simultaneously divisible by both 5 and 11**.\n\n"
                    "**Real-world scenario:** A quality control system passes a batch only if the batch "
                    "size satisfies two independent divisibility constraints.\n\n"
                    "Complete the `solve(n)` function:\n"
                    "- Return `\"Divisible\"` if `n % 5 == 0` AND `n % 11 == 0`\n"
                    "- Return `\"Not Divisible\"` otherwise"
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `Divisible` or `Not Divisible`.",
                "constraints": "1 <= n <= 10^9",
                "examples": [
                    {"input": "55", "output": "Divisible",
                     "explanation": "55 = 5 × 11. Both conditions satisfied."},
                    {"input": "25", "output": "Not Divisible",
                     "explanation": "25 is divisible by 5 but not by 11."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Check if n % 5 == 0 AND n % 11 == 0.\n"
                    "2. Only if both are true, return Divisible.\n"
                    "3. Otherwise return Not Divisible.\n\n"
                    "**Key insight:** The LCM of 5 and 11 is 55. Numbers divisible by 55 are divisible by both.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Divisibility, Modulus, Beginner",
                "companies": "Infosys, TCS, HCL, Accenture",
                "official_solution": (
                    "def solve(n):\n"
                    "    if n % 5 == 0 and n % 11 == 0:\n"
                    "        return \"Divisible\"\n"
                    "    else:\n"
                    "        return \"Not Divisible\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(n):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "55", "expected_output": "Divisible", "is_hidden": False, "weight": 1},
                    {"input_data": "25", "expected_output": "Not Divisible", "is_hidden": False, "weight": 1},
                    {"input_data": "22", "expected_output": "Not Divisible", "is_hidden": True, "weight": 1},
                    {"input_data": "110", "expected_output": "Divisible", "is_hidden": True, "weight": 1},
                    {"input_data": "1", "expected_output": "Not Divisible", "is_hidden": True, "weight": 1},
                    {"input_data": "14", "expected_output": "Not Divisible", "is_hidden": True, "weight": 1},
                    {"input_data": "550000000", "expected_output": "Divisible", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q06 ─────────────────────────────────────────────────────────────────
            {
                "order": 6,
                "title": "Find the Largest of Three Numbers",
                "slug": "find-the-largest-of-three-numbers",
                "level": easy_level,
                "statement": (
                    "Given three integers `a`, `b`, and `c`, find and print the largest value among them. "
                    "If multiple values are equal and largest, print that value once.\n\n"
                    "**Real-world scenario:** A leaderboard system finds the highest score among three competing "
                    "players each round.\n\n"
                    "Complete the `solve(a, b, c)` function:\n"
                    "- Return the largest of the three integers."
                ),
                "input_format": "Line 1: integer `a`\nLine 2: integer `b`\nLine 3: integer `c`",
                "output_format": "Print the largest integer.",
                "constraints": "-10^9 <= a, b, c <= 10^9",
                "examples": [
                    {"input": "10\n25\n15", "output": "25", "explanation": "25 is the largest."},
                    {"input": "7\n7\n7", "output": "7", "explanation": "All equal; output is 7."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. If a >= b and a >= c, return a.\n"
                    "2. Elif b >= a and b >= c, return b.\n"
                    "3. Else return c.\n\n"
                    "**Alternative:** return max(a, b, c)\n\n"
                    "**Edge cases:** All equal, two equal (tie-break), negative values.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Three-Variables, Comparison, Beginner",
                "companies": "Amazon, Google, TCS, Infosys",
                "official_solution": (
                    "def solve(a, b, c):\n"
                    "    if a >= b and a >= c:\n"
                    "        return a\n"
                    "    elif b >= a and b >= c:\n"
                    "        return b\n"
                    "    else:\n"
                    "        return c\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(a, b, c):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    c = int(input())\n"
                        "    print(solve(a, b, c))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    c = int(input())\n"
                        "    print(solve(a, b, c))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "10\n25\n15", "expected_output": "25", "is_hidden": False, "weight": 1},
                    {"input_data": "90\n30\n50", "expected_output": "90", "is_hidden": False, "weight": 1},
                    {"input_data": "12\n40\n88", "expected_output": "88", "is_hidden": True, "weight": 1},
                    {"input_data": "7\n7\n7", "expected_output": "7", "is_hidden": True, "weight": 1},
                    {"input_data": "40\n40\n20", "expected_output": "40", "is_hidden": True, "weight": 1},
                    {"input_data": "-10\n-25\n-5", "expected_output": "-5", "is_hidden": True, "weight": 1},
                    {"input_data": "-1000000000\n0\n1000000000", "expected_output": "1000000000", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q07 ─────────────────────────────────────────────────────────────────
            {
                "order": 7,
                "title": "Grade Calculator",
                "slug": "grade-calculator",
                "level": easy_level,
                "statement": (
                    "Academic institutions use a grading system to classify student performance. "
                    "Given marks out of 100, return the appropriate grade.\n\n"
                    "**Grading rules:**\n"
                    "- marks < 0 or marks > 100 → `Invalid Marks`\n"
                    "- 90 – 100 → `Grade A`\n"
                    "- 80 – 89 → `Grade B`\n"
                    "- 70 – 79 → `Grade C`\n"
                    "- 60 – 69 → `Grade D`\n"
                    "- 0 – 59 → `Grade F`\n\n"
                    "Complete the `solve(m)` function."
                ),
                "input_format": "A single integer `m` (marks out of 100).",
                "output_format": "Print one of: `Invalid Marks`, `Grade A`, `Grade B`, `Grade C`, `Grade D`, or `Grade F`.",
                "constraints": "Input can be any integer.",
                "examples": [
                    {"input": "95", "output": "Grade A", "explanation": "95 is in 90–100 range → Grade A."},
                    {"input": "59", "output": "Grade F", "explanation": "59 < 60 → Grade F."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Validate marks (0 to 100 only).\n"
                    "2. Check from highest slab downward using elif chain.\n"
                    "3. Return the corresponding grade.\n\n"
                    "**Common mistake:** Checking lower slabs first causes incorrect results for higher marks.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Multi-Branch, Grade, Beginner",
                "companies": "Cognizant, TCS, HCL, Infosys",
                "official_solution": (
                    "def solve(m):\n"
                    "    if m < 0 or m > 100:\n"
                    "        return \"Invalid Marks\"\n"
                    "    elif m >= 90:\n"
                    "        return \"Grade A\"\n"
                    "    elif m >= 80:\n"
                    "        return \"Grade B\"\n"
                    "    elif m >= 70:\n"
                    "        return \"Grade C\"\n"
                    "    elif m >= 60:\n"
                    "        return \"Grade D\"\n"
                    "    else:\n"
                    "        return \"Grade F\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(m):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    m = int(input())\n"
                        "    print(solve(m))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    m = int(input())\n"
                        "    print(solve(m))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "95", "expected_output": "Grade A", "is_hidden": False, "weight": 1},
                    {"input_data": "82", "expected_output": "Grade B", "is_hidden": False, "weight": 1},
                    {"input_data": "70", "expected_output": "Grade C", "is_hidden": True, "weight": 1},
                    {"input_data": "59", "expected_output": "Grade F", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "Grade F", "is_hidden": True, "weight": 1},
                    {"input_data": "100", "expected_output": "Grade A", "is_hidden": True, "weight": 1},
                    {"input_data": "-5", "expected_output": "Invalid Marks", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q08 ─────────────────────────────────────────────────────────────────
            {
                "order": 8,
                "title": "Leap Year Checker",
                "slug": "leap-year-checker",
                "level": easy_level,
                "statement": (
                    "A **leap year** has 366 days and occurs when a year satisfies the following rules:\n"
                    "1. A year is a leap year if it is divisible by 4 AND not divisible by 100.\n"
                    "2. Exception: A year divisible by 400 is always a leap year.\n\n"
                    "**Summary:** year is leap if `(year % 400 == 0)` or `(year % 4 == 0 and year % 100 != 0)`.\n\n"
                    "**Real-world scenario:** A calendar application adds February 29 only on leap years.\n\n"
                    "Complete the `solve(year)` function:\n"
                    "- Return `\"Leap Year\"` or `\"Not a Leap Year\"`."
                ),
                "input_format": "A single positive integer `year`.",
                "output_format": "Print `Leap Year` or `Not a Leap Year`.",
                "constraints": "1 <= year <= 9999",
                "examples": [
                    {"input": "2024", "output": "Leap Year",
                     "explanation": "2024 % 4 == 0 and 2024 % 100 != 0 → Leap Year."},
                    {"input": "1900", "output": "Not a Leap Year",
                     "explanation": "1900 % 100 == 0 but 1900 % 400 != 0 → Not a Leap Year."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. If year % 400 == 0 → Leap Year.\n"
                    "2. Else if year % 100 == 0 → Not a Leap Year.\n"
                    "3. Else if year % 4 == 0 → Leap Year.\n"
                    "4. Else → Not a Leap Year.\n\n"
                    "**Tricky cases:** 1900 (div by 100, not 400) → NOT leap. 2000 (div by 400) → leap.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Leap Year, Nested-If, Intermediate",
                "companies": "Amazon, Microsoft, TCS, Google",
                "official_solution": (
                    "def solve(year):\n"
                    "    if (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0):\n"
                    "        return \"Leap Year\"\n"
                    "    else:\n"
                    "        return \"Not a Leap Year\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(year):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    year = int(input())\n"
                        "    print(solve(year))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    year = int(input())\n"
                        "    print(solve(year))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "2024", "expected_output": "Leap Year", "is_hidden": False, "weight": 1},
                    {"input_data": "2023", "expected_output": "Not a Leap Year", "is_hidden": False, "weight": 1},
                    {"input_data": "2000", "expected_output": "Leap Year", "is_hidden": True, "weight": 1},
                    {"input_data": "1900", "expected_output": "Not a Leap Year", "is_hidden": True, "weight": 1},
                    {"input_data": "4", "expected_output": "Leap Year", "is_hidden": True, "weight": 1},
                    {"input_data": "2100", "expected_output": "Not a Leap Year", "is_hidden": True, "weight": 1},
                    {"input_data": "2400", "expected_output": "Leap Year", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q09 ─────────────────────────────────────────────────────────────────
            {
                "order": 9,
                "title": "Electricity Bill Calculator",
                "slug": "electricity-bill-calculator",
                "level": medium_level,
                "statement": (
                    "An electricity distribution company charges consumers based on monthly unit consumption "
                    "using the following **progressive slab system**:\n\n"
                    "| Units Consumed | Rate per Unit |\n"
                    "|---|---|\n"
                    "| First 100 units | ₹5 / unit |\n"
                    "| Next 100 units (101 – 200) | ₹7 / unit |\n"
                    "| Above 200 units | ₹10 / unit |\n\n"
                    "A **fixed service charge of ₹50** is added to every bill.\n\n"
                    "If units <= 0, the bill is 0 (no charge).\n\n"
                    "Complete the `solve(units)` function to return the total bill amount as an integer."
                ),
                "input_format": "A single integer `units` (monthly consumption).",
                "output_format": "Print the total electricity bill as an integer.",
                "constraints": "0 <= units <= 10^6",
                "examples": [
                    {"input": "50", "output": "300",
                     "explanation": "50 × 5 = 250 + 50 (fixed) = 300."},
                    {"input": "150", "output": "900",
                     "explanation": "100×5 + 50×7 + 50 = 500 + 350 + 50 = 900."},
                    {"input": "250", "output": "1750",
                     "explanation": "100×5 + 100×7 + 50×10 + 50 = 500+700+500+50 = 1750."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. If units <= 0, return 0.\n"
                    "2. Add fixed charge of 50.\n"
                    "3. First slab: min(units, 100) × 5.\n"
                    "4. Second slab: max(0, min(units, 200) − 100) × 7.\n"
                    "5. Third slab: max(0, units − 200) × 10.\n"
                    "6. Return total.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Slab, Progressive, Real-World, Medium",
                "companies": "Infosys, Wipro, TCS, Accenture",
                "official_solution": (
                    "def solve(units):\n"
                    "    if units <= 0:\n"
                    "        return 0\n"
                    "    bill = 50\n"
                    "    if units <= 100:\n"
                    "        bill += units * 5\n"
                    "    elif units <= 200:\n"
                    "        bill += (100 * 5) + ((units - 100) * 7)\n"
                    "    else:\n"
                    "        bill += (100 * 5) + (100 * 7) + ((units - 200) * 10)\n"
                    "    return bill\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(units):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    units = int(input())\n"
                        "    print(solve(units))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    units = int(input())\n"
                        "    print(solve(units))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "50", "expected_output": "300", "is_hidden": False, "weight": 1},
                    {"input_data": "150", "expected_output": "900", "is_hidden": False, "weight": 1},
                    {"input_data": "250", "expected_output": "1750", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1},
                    {"input_data": "100", "expected_output": "550", "is_hidden": True, "weight": 1},
                    {"input_data": "200", "expected_output": "1250", "is_hidden": True, "weight": 1},
                    {"input_data": "1000", "expected_output": "9250", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q10 ─────────────────────────────────────────────────────────────────
            {
                "order": 10,
                "title": "Character Type Checker",
                "slug": "character-type-checker",
                "level": medium_level,
                "statement": (
                    "Classify a single character into one of four categories:\n"
                    "- `Uppercase Alphabet` – if the character is A–Z\n"
                    "- `Lowercase Alphabet` – if the character is a–z\n"
                    "- `Digit` – if the character is 0–9\n"
                    "- `Special Character` – otherwise\n\n"
                    "**Real-world scenario:** A password strength checker categorizes each character to enforce "
                    "complexity rules.\n\n"
                    "Complete the `solve(ch)` function that receives a single character string."
                ),
                "input_format": "A single character on one line.",
                "output_format": "Print one of: `Uppercase Alphabet`, `Lowercase Alphabet`, `Digit`, `Special Character`.",
                "constraints": "Input is always exactly one printable ASCII character.",
                "examples": [
                    {"input": "G", "output": "Uppercase Alphabet"},
                    {"input": "7", "output": "Digit"},
                    {"input": "@", "output": "Special Character"},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. If 'A' <= ch <= 'Z' → Uppercase Alphabet.\n"
                    "2. Elif 'a' <= ch <= 'z' → Lowercase Alphabet.\n"
                    "3. Elif '0' <= ch <= '9' → Digit.\n"
                    "4. Else → Special Character.\n\n"
                    "**Alternative:** Use ch.isupper(), ch.islower(), ch.isdigit().\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Characters, ASCII, Medium",
                "companies": "Infosys, TCS, Wipro, HCL",
                "official_solution": (
                    "def solve(ch):\n"
                    "    if 'A' <= ch <= 'Z':\n"
                    "        return \"Uppercase Alphabet\"\n"
                    "    elif 'a' <= ch <= 'z':\n"
                    "        return \"Lowercase Alphabet\"\n"
                    "    elif '0' <= ch <= '9':\n"
                    "        return \"Digit\"\n"
                    "    else:\n"
                    "        return \"Special Character\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(ch):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    ch = input()\n"
                        "    print(solve(ch))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    ch = input()\n"
                        "    print(solve(ch))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "G", "expected_output": "Uppercase Alphabet", "is_hidden": False, "weight": 1},
                    {"input_data": "m", "expected_output": "Lowercase Alphabet", "is_hidden": False, "weight": 1},
                    {"input_data": "7", "expected_output": "Digit", "is_hidden": True, "weight": 1},
                    {"input_data": "@", "expected_output": "Special Character", "is_hidden": True, "weight": 1},
                    {"input_data": "A", "expected_output": "Uppercase Alphabet", "is_hidden": True, "weight": 1},
                    {"input_data": "z", "expected_output": "Lowercase Alphabet", "is_hidden": True, "weight": 1},
                    {"input_data": "#", "expected_output": "Special Character", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q11 ─────────────────────────────────────────────────────────────────
            {
                "order": 11,
                "title": "Triangle Validity Checker",
                "slug": "triangle-validity-checker",
                "level": medium_level,
                "statement": (
                    "A valid triangle must satisfy **all three** of these conditions:\n"
                    "1. All sides must be positive (> 0).\n"
                    "2. The sum of any two sides must be strictly greater than the third side "
                    "(Triangle Inequality Theorem).\n\n"
                    "Given three side lengths `a`, `b`, `c`, determine if they form a valid triangle.\n\n"
                    "Complete the `solve(a, b, c)` function:\n"
                    "- Return `\"Valid\"` if the triangle is valid\n"
                    "- Return `\"Invalid\"` otherwise"
                ),
                "input_format": "Line 1: integer `a`\nLine 2: integer `b`\nLine 3: integer `c`",
                "output_format": "Print `Valid` or `Invalid`.",
                "constraints": "-10^6 <= a, b, c <= 10^6",
                "examples": [
                    {"input": "7\n10\n5", "output": "Valid",
                     "explanation": "7+10>5, 7+5>10, 10+5>7 → all conditions met."},
                    {"input": "1\n2\n3", "output": "Invalid",
                     "explanation": "1+2=3 (not strictly greater) → Invalid."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Check a > 0 and b > 0 and c > 0.\n"
                    "2. Check a+b > c AND a+c > b AND b+c > a.\n"
                    "3. Only if all checks pass → Valid.\n\n"
                    "**Common mistake:** Using >= instead of > in the inequality check.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Geometry, Triangle, Medium",
                "companies": "Infosys, TCS, Wipro, Accenture",
                "official_solution": (
                    "def solve(a, b, c):\n"
                    "    if a <= 0 or b <= 0 or c <= 0:\n"
                    "        return \"Invalid\"\n"
                    "    if (a + b > c) and (a + c > b) and (b + c > a):\n"
                    "        return \"Valid\"\n"
                    "    else:\n"
                    "        return \"Invalid\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(a, b, c):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    c = int(input())\n"
                        "    print(solve(a, b, c))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    c = int(input())\n"
                        "    print(solve(a, b, c))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "7\n10\n5", "expected_output": "Valid", "is_hidden": False, "weight": 1},
                    {"input_data": "1\n2\n3", "expected_output": "Invalid", "is_hidden": False, "weight": 1},
                    {"input_data": "10\n2\n5", "expected_output": "Invalid", "is_hidden": True, "weight": 1},
                    {"input_data": "0\n5\n5", "expected_output": "Invalid", "is_hidden": True, "weight": 1},
                    {"input_data": "-3\n4\n5", "expected_output": "Invalid", "is_hidden": True, "weight": 1},
                    {"input_data": "5\n5\n5", "expected_output": "Valid", "is_hidden": True, "weight": 1},
                    {"input_data": "1000\n1000\n1999", "expected_output": "Valid", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q12 ─────────────────────────────────────────────────────────────────
            {
                "order": 12,
                "title": "Triangle Type Classifier",
                "slug": "triangle-type-classifier",
                "level": medium_level,
                "statement": (
                    "A valid triangle can be classified into three types:\n"
                    "- **Equilateral Triangle**: all three sides are equal.\n"
                    "- **Isosceles Triangle**: exactly two sides are equal.\n"
                    "- **Scalene Triangle**: all three sides are different.\n\n"
                    "First validate if the triangle is valid (all sides > 0 and triangle inequality holds). "
                    "If invalid, return `\"Invalid Triangle\"`.\n\n"
                    "Complete the `solve(a, b, c)` function."
                ),
                "input_format": "Line 1: integer `a`\nLine 2: integer `b`\nLine 3: integer `c`",
                "output_format": "Print one of: `Equilateral Triangle`, `Isosceles Triangle`, `Scalene Triangle`, `Invalid Triangle`.",
                "constraints": "0 <= a, b, c <= 10^6",
                "examples": [
                    {"input": "6\n6\n6", "output": "Equilateral Triangle"},
                    {"input": "5\n5\n8", "output": "Isosceles Triangle"},
                    {"input": "4\n5\n6", "output": "Scalene Triangle"},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Validate triangle (sides > 0 and inequality theorem).\n"
                    "2. If a == b == c → Equilateral.\n"
                    "3. Elif any two sides equal → Isosceles.\n"
                    "4. Else → Scalene.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Geometry, Triangle Classification, Medium",
                "companies": "TCS, Infosys, Wipro, HCL",
                "official_solution": (
                    "def solve(a, b, c):\n"
                    "    if a <= 0 or b <= 0 or c <= 0 or (a + b <= c) or (a + c <= b) or (b + c <= a):\n"
                    "        return \"Invalid Triangle\"\n"
                    "    if a == b == c:\n"
                    "        return \"Equilateral Triangle\"\n"
                    "    elif a == b or b == c or a == c:\n"
                    "        return \"Isosceles Triangle\"\n"
                    "    else:\n"
                    "        return \"Scalene Triangle\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(a, b, c):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    c = int(input())\n"
                        "    print(solve(a, b, c))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    a = int(input())\n"
                        "    b = int(input())\n"
                        "    c = int(input())\n"
                        "    print(solve(a, b, c))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "6\n6\n6", "expected_output": "Equilateral Triangle", "is_hidden": False, "weight": 1},
                    {"input_data": "5\n5\n8", "expected_output": "Isosceles Triangle", "is_hidden": False, "weight": 1},
                    {"input_data": "4\n5\n6", "expected_output": "Scalene Triangle", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n2\n5", "expected_output": "Invalid Triangle", "is_hidden": True, "weight": 1},
                    {"input_data": "0\n0\n0", "expected_output": "Invalid Triangle", "is_hidden": True, "weight": 1},
                    {"input_data": "7\n10\n7", "expected_output": "Isosceles Triangle", "is_hidden": True, "weight": 1},
                    {"input_data": "3\n4\n5", "expected_output": "Scalene Triangle", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q13 ─────────────────────────────────────────────────────────────────
            {
                "order": 13,
                "title": "ATM Withdrawal System",
                "slug": "atm-withdrawal-system",
                "level": medium_level,
                "statement": (
                    "Design an ATM withdrawal logic with the following rules:\n\n"
                    "1. **Invalid Amount:** If `amount <= 0` or `amount` is not a multiple of 100 → print `Invalid Amount`.\n"
                    "2. **Limit Exceeded:** If `amount > 20000` (daily limit) → print `Limit Exceeded`.\n"
                    "3. **Insufficient Funds:** If `balance - amount < 500` (minimum balance must remain) → print `Insufficient Funds`.\n"
                    "4. **Success:** Deduct amount and print `Success: Remaining Balance <new_balance>`.\n\n"
                    "Complete the `solve(balance, amount)` function."
                ),
                "input_format": "Line 1: integer `balance` (account balance)\nLine 2: integer `amount` (withdrawal request)",
                "output_format": (
                    "Print one of:\n"
                    "- `Invalid Amount`\n"
                    "- `Limit Exceeded`\n"
                    "- `Insufficient Funds`\n"
                    "- `Success: Remaining Balance <new_balance>`"
                ),
                "constraints": "0 <= balance <= 10^7\n0 <= amount <= 10^7",
                "examples": [
                    {"input": "5000\n2000", "output": "Success: Remaining Balance 3000"},
                    {"input": "3000\n2700", "output": "Insufficient Funds",
                     "explanation": "3000 - 2700 = 300 < 500 minimum balance."},
                ],
                "notes": (
                    "**Algorithm:** Check rules in order: validity → daily limit → balance → success.\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Banking, Real-World, Nested, Medium",
                "companies": "Infosys, TCS, Wipro, HDFC",
                "official_solution": (
                    "def solve(balance, amount):\n"
                    "    if amount <= 0 or amount % 100 != 0:\n"
                    "        return \"Invalid Amount\"\n"
                    "    if amount > 20000:\n"
                    "        return \"Limit Exceeded\"\n"
                    "    if balance - amount < 500:\n"
                    "        return \"Insufficient Funds\"\n"
                    "    new_balance = balance - amount\n"
                    "    return f\"Success: Remaining Balance {new_balance}\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(balance, amount):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    balance = int(input())\n"
                        "    amount = int(input())\n"
                        "    print(solve(balance, amount))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    balance = int(input())\n"
                        "    amount = int(input())\n"
                        "    print(solve(balance, amount))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "5000\n2000", "expected_output": "Success: Remaining Balance 3000", "is_hidden": False, "weight": 1},
                    {"input_data": "3000\n2700", "expected_output": "Insufficient Funds", "is_hidden": False, "weight": 1},
                    {"input_data": "10000\n250", "expected_output": "Invalid Amount", "is_hidden": True, "weight": 1},
                    {"input_data": "50000\n25000", "expected_output": "Limit Exceeded", "is_hidden": True, "weight": 1},
                    {"input_data": "2500\n2000", "expected_output": "Success: Remaining Balance 500", "is_hidden": True, "weight": 1},
                    {"input_data": "10000\n-500", "expected_output": "Invalid Amount", "is_hidden": True, "weight": 1},
                    {"input_data": "20500\n20000", "expected_output": "Success: Remaining Balance 500", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q14 ─────────────────────────────────────────────────────────────────
            {
                "order": 14,
                "title": "Simple Tax Calculator",
                "slug": "simple-tax-calculator",
                "level": medium_level,
                "statement": (
                    "Calculate income tax based on the following Indian Income Tax slabs (New Regime):\n\n"
                    "| Annual Income | Tax Rate |\n|---|---|\n"
                    "| Up to ₹2,50,000 | No tax (0%) |\n"
                    "| ₹2,50,001 to ₹5,00,000 | 5% on income above ₹2,50,000 |\n"
                    "| ₹5,00,001 to ₹10,00,000 | ₹12,500 + 20% on income above ₹5,00,000 |\n"
                    "| Above ₹10,00,000 | ₹1,12,500 + 30% on income above ₹10,00,000 |\n\n"
                    "Return the **total tax as an integer** (floor value).\n\n"
                    "Complete the `solve(salary)` function."
                ),
                "input_format": "A single integer `salary` (annual income in rupees).",
                "output_format": "Print the total tax as an integer.",
                "constraints": "0 <= salary <= 10^8",
                "examples": [
                    {"input": "400000", "output": "7500",
                     "explanation": "Tax on 400000: (400000-250000)*5% = 7500."},
                    {"input": "700000", "output": "52500",
                     "explanation": "12500 + (700000-500000)*20% = 12500+40000 = 52500."},
                ],
                "notes": (
                    "**Algorithm:** Progressive tax: compute tax slab-by-slab and add.\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Tax, Slab, Real-World, Medium",
                "companies": "Infosys, Wipro, TCS, Accenture",
                "official_solution": (
                    "def solve(salary):\n"
                    "    if salary <= 250000:\n"
                    "        return 0\n"
                    "    elif salary <= 500000:\n"
                    "        return int((salary - 250000) * 0.05)\n"
                    "    elif salary <= 1000000:\n"
                    "        return int(12500 + (salary - 500000) * 0.20)\n"
                    "    else:\n"
                    "        return int(112500 + (salary - 1000000) * 0.30)\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(salary):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    salary = int(input())\n"
                        "    print(solve(salary))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    salary = int(input())\n"
                        "    print(solve(salary))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "200000", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "400000", "expected_output": "7500", "is_hidden": False, "weight": 1},
                    {"input_data": "700000", "expected_output": "52500", "is_hidden": True, "weight": 1},
                    {"input_data": "1500000", "expected_output": "262500", "is_hidden": True, "weight": 1},
                    {"input_data": "250000", "expected_output": "0", "is_hidden": True, "weight": 1},
                    {"input_data": "500000", "expected_output": "12500", "is_hidden": True, "weight": 1},
                    {"input_data": "1000000", "expected_output": "112500", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q15 ─────────────────────────────────────────────────────────────────
            {
                "order": 15,
                "title": "Discount Calculator",
                "slug": "discount-calculator",
                "level": medium_level,
                "statement": (
                    "A retail store applies discounts based on purchase amount:\n\n"
                    "| Purchase Amount | Discount |\n|---|---|\n"
                    "| <= 0 | 0 (return 0) |\n"
                    "| < ₹1,000 | No discount |\n"
                    "| ₹1,000 – ₹4,999 | 10% discount |\n"
                    "| ₹5,000 – ₹9,999 | 20% discount |\n"
                    "| >= ₹10,000 | 30% discount (max cap ₹5,000) |\n\n"
                    "Return the **final amount after discount** as an integer.\n\n"
                    "Complete the `solve(amount)` function."
                ),
                "input_format": "A single integer `amount` (purchase amount in rupees).",
                "output_format": "Print the final payable amount as an integer.",
                "constraints": "0 <= amount <= 10^7",
                "examples": [
                    {"input": "2000", "output": "1800", "explanation": "10% of 2000 = 200. 2000 - 200 = 1800."},
                    {"input": "12000", "output": "8400",
                     "explanation": "30% of 12000 = 3600. 12000 - 3600 = 8400."},
                ],
                "notes": (
                    "**Note on max cap:** For amount >= 10000, discount is min(amount × 30%, 5000).\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Discount, Retail, Slab, Medium",
                "companies": "Flipkart, Amazon, TCS, Cognizant",
                "official_solution": (
                    "def solve(amount):\n"
                    "    if amount <= 0:\n"
                    "        return 0\n"
                    "    if amount < 1000:\n"
                    "        discount = 0\n"
                    "    elif amount < 5000:\n"
                    "        discount = amount * 0.10\n"
                    "    elif amount < 10000:\n"
                    "        discount = amount * 0.20\n"
                    "    else:\n"
                    "        discount = min(5000, amount * 0.30)\n"
                    "    return int(amount - discount)\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(amount):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    amount = int(input())\n"
                        "    print(solve(amount))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    amount = int(input())\n"
                        "    print(solve(amount))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "800", "expected_output": "800", "is_hidden": False, "weight": 1},
                    {"input_data": "2000", "expected_output": "1800", "is_hidden": False, "weight": 1},
                    {"input_data": "6000", "expected_output": "4800", "is_hidden": True, "weight": 1},
                    {"input_data": "12000", "expected_output": "8400", "is_hidden": True, "weight": 1},
                    {"input_data": "25000", "expected_output": "20000", "is_hidden": True, "weight": 1},
                    {"input_data": "1000", "expected_output": "900", "is_hidden": True, "weight": 1},
                    {"input_data": "5000", "expected_output": "4000", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q16 ─────────────────────────────────────────────────────────────────
            {
                "order": 16,
                "title": "FizzBuzz",
                "slug": "fizzbuzz-conditional",
                "level": easy_level,
                "statement": (
                    "FizzBuzz is a classic programming challenge used widely in technical interviews. "
                    "Given a number `n`:\n\n"
                    "- If `n` is divisible by **both 3 and 5** → return `\"FizzBuzz\"`\n"
                    "- If `n` is divisible by **3 only** → return `\"Fizz\"`\n"
                    "- If `n` is divisible by **5 only** → return `\"Buzz\"`\n"
                    "- Otherwise → return the number as a string\n\n"
                    "**Important:** Always check divisibility by both 3 and 5 first.\n\n"
                    "Complete the `solve(n)` function."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `FizzBuzz`, `Fizz`, `Buzz`, or the number itself.",
                "constraints": "1 <= n <= 10^9",
                "examples": [
                    {"input": "15", "output": "FizzBuzz", "explanation": "15 is divisible by both 3 and 5."},
                    {"input": "9", "output": "Fizz", "explanation": "9 is divisible by 3 only."},
                    {"input": "7", "output": "7", "explanation": "7 is not divisible by 3 or 5."},
                ],
                "notes": (
                    "**Common interview mistake:** Checking 3 and 5 separately before checking both together "
                    "causes FizzBuzz to never appear.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, FizzBuzz, Interview, Classic",
                "companies": "Google, Amazon, Microsoft, Meta",
                "official_solution": (
                    "def solve(n):\n"
                    "    if n % 3 == 0 and n % 5 == 0:\n"
                    "        return \"FizzBuzz\"\n"
                    "    elif n % 3 == 0:\n"
                    "        return \"Fizz\"\n"
                    "    elif n % 5 == 0:\n"
                    "        return \"Buzz\"\n"
                    "    else:\n"
                    "        return str(n)\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(n):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    n = int(input())\n"
                        "    print(solve(n))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "15", "expected_output": "FizzBuzz", "is_hidden": False, "weight": 1},
                    {"input_data": "9", "expected_output": "Fizz", "is_hidden": False, "weight": 1},
                    {"input_data": "20", "expected_output": "Buzz", "is_hidden": True, "weight": 1},
                    {"input_data": "7", "expected_output": "7", "is_hidden": True, "weight": 1},
                    {"input_data": "1", "expected_output": "1", "is_hidden": True, "weight": 1},
                    {"input_data": "30", "expected_output": "FizzBuzz", "is_hidden": True, "weight": 1},
                    {"input_data": "999999999", "expected_output": "Fizz", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q17 ─────────────────────────────────────────────────────────────────
            {
                "order": 17,
                "title": "Valid Triangle with Angles",
                "slug": "valid-triangle-with-angles",
                "level": medium_level,
                "statement": (
                    "For a triangle to be valid based on its interior angles:\n"
                    "1. All three angles must be **positive** (> 0 degrees).\n"
                    "2. The **sum of all three angles must equal exactly 180 degrees**.\n\n"
                    "Given three angles `a1`, `a2`, `a3`, determine if they form a valid triangle.\n\n"
                    "Complete the `solve(a1, a2, a3)` function:\n"
                    "- Return `\"Valid\"` or `\"Invalid\"`"
                ),
                "input_format": "Line 1: integer `a1`\nLine 2: integer `a2`\nLine 3: integer `a3`",
                "output_format": "Print `Valid` or `Invalid`.",
                "constraints": "-360 <= a1, a2, a3 <= 360",
                "examples": [
                    {"input": "60\n60\n60", "output": "Valid", "explanation": "60+60+60=180, all > 0 → Valid."},
                    {"input": "50\n50\n50", "output": "Invalid",
                     "explanation": "50+50+50=150 ≠ 180 → Invalid."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. Check a1 > 0 and a2 > 0 and a3 > 0.\n"
                    "2. Check a1 + a2 + a3 == 180.\n"
                    "3. If both → Valid, else → Invalid.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Geometry, Angles, Medium",
                "companies": "TCS, Infosys, Wipro, HCL",
                "official_solution": (
                    "def solve(a1, a2, a3):\n"
                    "    if a1 > 0 and a2 > 0 and a3 > 0 and (a1 + a2 + a3 == 180):\n"
                    "        return \"Valid\"\n"
                    "    else:\n"
                    "        return \"Invalid\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(a1, a2, a3):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    a1 = int(input())\n"
                        "    a2 = int(input())\n"
                        "    a3 = int(input())\n"
                        "    print(solve(a1, a2, a3))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    a1 = int(input())\n"
                        "    a2 = int(input())\n"
                        "    a3 = int(input())\n"
                        "    print(solve(a1, a2, a3))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "60\n60\n60", "expected_output": "Valid", "is_hidden": False, "weight": 1},
                    {"input_data": "90\n45\n45", "expected_output": "Valid", "is_hidden": False, "weight": 1},
                    {"input_data": "50\n50\n50", "expected_output": "Invalid", "is_hidden": True, "weight": 1},
                    {"input_data": "0\n90\n90", "expected_output": "Invalid", "is_hidden": True, "weight": 1},
                    {"input_data": "-30\n110\n100", "expected_output": "Invalid", "is_hidden": True, "weight": 1},
                    {"input_data": "1\n1\n178", "expected_output": "Valid", "is_hidden": True, "weight": 1},
                    {"input_data": "120\n30\n30", "expected_output": "Valid", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q18 ─────────────────────────────────────────────────────────────────
            {
                "order": 18,
                "title": "Employee Bonus Calculator",
                "slug": "employee-bonus-calculator",
                "level": medium_level,
                "statement": (
                    "A company pays an annual bonus to employees based on their **monthly salary** and "
                    "**years of experience**:\n\n"
                    "| Condition | Bonus |\n|---|---|\n"
                    "| years < 2 | No bonus (return 0) |\n"
                    "| salary <= 0 | No bonus (return 0) |\n"
                    "| years >= 10 | 25% of annual salary |\n"
                    "| years >= 5 | 15% of annual salary |\n"
                    "| years >= 2 | 10% of annual salary |\n\n"
                    "Annual salary = monthly salary × 12. Return the bonus as an integer.\n\n"
                    "Complete the `solve(salary, years)` function."
                ),
                "input_format": "Line 1: integer `salary` (monthly in rupees)\nLine 2: integer `years` (years of experience)",
                "output_format": "Print the bonus amount as an integer.",
                "constraints": "0 <= salary <= 10^6\n0 <= years <= 50",
                "examples": [
                    {"input": "50000\n12", "output": "150000",
                     "explanation": "Annual=600000. Bonus=25% of 600000=150000."},
                    {"input": "60000\n1", "output": "0",
                     "explanation": "Less than 2 years → No bonus."},
                ],
                "notes": (
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, HR, Bonus, Real-World, Medium",
                "companies": "TCS, Infosys, Wipro, Cognizant",
                "official_solution": (
                    "def solve(salary, years):\n"
                    "    if salary <= 0 or years < 2:\n"
                    "        return 0\n"
                    "    annual_salary = salary * 12\n"
                    "    if years >= 10:\n"
                    "        return int(annual_salary * 0.25)\n"
                    "    elif years >= 5:\n"
                    "        return int(annual_salary * 0.15)\n"
                    "    else:\n"
                    "        return int(annual_salary * 0.10)\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(salary, years):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    salary = int(input())\n"
                        "    years = int(input())\n"
                        "    print(solve(salary, years))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    salary = int(input())\n"
                        "    years = int(input())\n"
                        "    print(solve(salary, years))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "50000\n12", "expected_output": "150000", "is_hidden": False, "weight": 1},
                    {"input_data": "40000\n6", "expected_output": "72000", "is_hidden": False, "weight": 1},
                    {"input_data": "30000\n3", "expected_output": "36000", "is_hidden": True, "weight": 1},
                    {"input_data": "60000\n1", "expected_output": "0", "is_hidden": True, "weight": 1},
                    {"input_data": "50000\n10", "expected_output": "150000", "is_hidden": True, "weight": 1},
                    {"input_data": "50000\n5", "expected_output": "90000", "is_hidden": True, "weight": 1},
                    {"input_data": "0\n15", "expected_output": "0", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q19 ─────────────────────────────────────────────────────────────────
            {
                "order": 19,
                "title": "Login Authentication System",
                "slug": "login-authentication-system",
                "level": medium_level,
                "statement": (
                    "Build a basic login validation system with these hardcoded credentials:\n\n"
                    "- **Username:** `admin_codex`\n"
                    "- **Password:** `Secure@2026`\n\n"
                    "**Validation rules (case-sensitive):**\n"
                    "1. If username does not match → return `\"User Not Found\"`\n"
                    "2. If username matches but password does not → return `\"Incorrect Password\"`\n"
                    "3. If both match → return `\"Login Successful\"`\n\n"
                    "Complete the `solve(username, password)` function."
                ),
                "input_format": "Line 1: string `username`\nLine 2: string `password`",
                "output_format": "Print one of: `User Not Found`, `Incorrect Password`, `Login Successful`.",
                "constraints": "Strings contain printable ASCII characters only.",
                "examples": [
                    {"input": "admin_codex\nSecure@2026", "output": "Login Successful"},
                    {"input": "admin_codex\nWrongPass", "output": "Incorrect Password"},
                    {"input": "john_doe\nSecure@2026", "output": "User Not Found"},
                ],
                "notes": (
                    "**Key point:** Both username and password comparisons are case-sensitive.\n"
                    "**Common mistake:** Checking password before username.\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Authentication, String Comparison, Medium",
                "companies": "TCS, Infosys, Wipro, HCL",
                "official_solution": (
                    "def solve(username, password):\n"
                    "    expected_user = \"admin_codex\"\n"
                    "    expected_pass = \"Secure@2026\"\n"
                    "    if username != expected_user:\n"
                    "        return \"User Not Found\"\n"
                    "    elif password != expected_pass:\n"
                    "        return \"Incorrect Password\"\n"
                    "    else:\n"
                    "        return \"Login Successful\"\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(username, password):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    username = input()\n"
                        "    password = input()\n"
                        "    print(solve(username, password))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    username = input()\n"
                        "    password = input()\n"
                        "    print(solve(username, password))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "admin_codex\nSecure@2026", "expected_output": "Login Successful", "is_hidden": False, "weight": 1},
                    {"input_data": "admin_codex\nWrongPass", "expected_output": "Incorrect Password", "is_hidden": False, "weight": 1},
                    {"input_data": "john_doe\nSecure@2026", "expected_output": "User Not Found", "is_hidden": True, "weight": 1},
                    {"input_data": "ADMIN_CODEX\nSecure@2026", "expected_output": "User Not Found", "is_hidden": True, "weight": 1},
                    {"input_data": "admin_codex\nsecure@2026", "expected_output": "Incorrect Password", "is_hidden": True, "weight": 1},
                    {"input_data": "guest\n12345", "expected_output": "User Not Found", "is_hidden": True, "weight": 1},
                    {"input_data": "admin_codex\n ", "expected_output": "Incorrect Password", "is_hidden": True, "weight": 1},
                ],
            },

            # ── Q20 ─────────────────────────────────────────────────────────────────
            {
                "order": 20,
                "title": "Income Tax Slab Calculator",
                "slug": "income-tax-slab-calculator",
                "level": medium_level,
                "statement": (
                    "Calculate total income tax using the **New Tax Regime** with a 4% Education Cess "
                    "and 10% Surcharge on incomes above ₹50 lakhs:\n\n"
                    "**Tax Slabs:**\n"
                    "| Income Range | Tax Rate |\n|---|---|\n"
                    "| Up to ₹3,00,000 | 0% |\n"
                    "| ₹3,00,001 – ₹6,00,000 | 5% |\n"
                    "| ₹6,00,001 – ₹9,00,000 | 10% |\n"
                    "| ₹9,00,001 – ₹12,00,000 | 15% |\n"
                    "| ₹12,00,001 – ₹15,00,000 | 20% |\n"
                    "| Above ₹15,00,000 | 30% |\n\n"
                    "**Special rule:** If income <= ₹7,00,000, total tax = 0 (Section 87A rebate).\n\n"
                    "**Surcharge:** 10% of base tax if income > ₹50,00,000.\n\n"
                    "**Cess:** 4% of (base tax + surcharge).\n\n"
                    "Return the total tax as an integer (rounded to nearest integer).\n\n"
                    "Complete the `solve(income)` function."
                ),
                "input_format": "A single integer `income` (annual income in rupees).",
                "output_format": "Print the total tax as an integer.",
                "constraints": "0 <= income <= 10^8",
                "examples": [
                    {"input": "500000", "output": "0", "explanation": "500000 <= 700000 → Section 87A rebate → 0 tax."},
                    {"input": "800000", "output": "36400",
                     "explanation": "Base tax=35000. Cess=35000×4%=1400. Total=36400."},
                ],
                "notes": (
                    "**Algorithm:**\n"
                    "1. If income <= 0 or income <= 700000 → return 0.\n"
                    "2. Calculate base tax slab by slab progressively.\n"
                    "3. Apply 10% surcharge if income > 5000000.\n"
                    "4. Add 4% education cess.\n"
                    "5. Return int(round(total)).\n\n"
                    "**Time Complexity:** O(1)  |  **Space Complexity:** O(1)"
                ),
                "tags": "Conditionals, Tax, Advanced, Slab, Placement",
                "companies": "Infosys, TCS, Wipro, Accenture, Deloitte",
                "official_solution": (
                    "def solve(income):\n"
                    "    if income <= 0:\n"
                    "        return 0\n"
                    "    if income <= 700000:\n"
                    "        return 0\n"
                    "    if income <= 300000:\n"
                    "        base_tax = 0.0\n"
                    "    elif income <= 600000:\n"
                    "        base_tax = (income - 300000) * 0.05\n"
                    "    elif income <= 900000:\n"
                    "        base_tax = 15000 + (income - 600000) * 0.10\n"
                    "    elif income <= 1200000:\n"
                    "        base_tax = 45000 + (income - 900000) * 0.15\n"
                    "    elif income <= 1500000:\n"
                    "        base_tax = 90000 + (income - 1200000) * 0.20\n"
                    "    else:\n"
                    "        base_tax = 150000 + (income - 1500000) * 0.30\n"
                    "    surcharge = base_tax * 0.10 if income > 5000000 else 0.0\n"
                    "    tax_before_cess = base_tax + surcharge\n"
                    "    cess = tax_before_cess * 0.04\n"
                    "    return int(round(tax_before_cess + cess))\n"
                ),
                "starter_code": {
                    "python": (
                        "def solve(income):\n"
                        "    # Write your code here\n"
                        "    pass\n"
                        "\n"
                        "if __name__ == \"__main__\":\n"
                        "    income = int(input())\n"
                        "    print(solve(income))\n"
                    )
                },
                "driver_code": {
                    "python": (
                        "if __name__ == \"__main__\":\n"
                        "    income = int(input())\n"
                        "    print(solve(income))\n"
                    )
                },
                "test_cases": [
                    {"input_data": "500000", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "700000", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "800000", "expected_output": "36400", "is_hidden": True, "weight": 1},
                    {"input_data": "1000000", "expected_output": "62400", "is_hidden": True, "weight": 1},
                    {"input_data": "1500000", "expected_output": "156000", "is_hidden": True, "weight": 1},
                    {"input_data": "6000000", "expected_output": "1716000", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1},
                ],
            },
        ]

        created_count = 0
        updated_count = 0

        for q_data in questions_data:
            level = q_data.get("level", easy_level)
            test_cases = q_data.pop("test_cases")

            question, created = Question.objects.get_or_create(
                slug=q_data["slug"],
                defaults={
                    "topic": topic,
                    "level": level,
                    "title": q_data["title"],
                    "statement": q_data["statement"],
                    "input_format": q_data["input_format"],
                    "output_format": q_data["output_format"],
                    "constraints": q_data["constraints"],
                    "examples": json.dumps(q_data["examples"]),
                    "notes": q_data.get("notes", ""),
                    "starter_code": json.dumps(q_data["starter_code"]),
                    "driver_code": json.dumps(q_data["driver_code"]),
                    "official_solution": q_data.get("official_solution", ""),
                    "tags": q_data.get("tags", ""),
                    "companies": q_data.get("companies", ""),
                    "order": q_data["order"],
                    "is_published": True,
                }
            )

            if not created:
                question.topic = topic
                question.level = level
                question.title = q_data["title"]
                question.statement = q_data["statement"]
                question.input_format = q_data["input_format"]
                question.output_format = q_data["output_format"]
                question.constraints = q_data["constraints"]
                question.examples = json.dumps(q_data["examples"])
                question.notes = q_data.get("notes", "")
                question.starter_code = json.dumps(q_data["starter_code"])
                question.driver_code = json.dumps(q_data["driver_code"])
                question.official_solution = q_data.get("official_solution", "")
                question.tags = q_data.get("tags", "")
                question.companies = q_data.get("companies", "")
                question.order = q_data["order"]
                question.is_published = True
                question.save()
                updated_count += 1
            else:
                created_count += 1

            # Sync test cases (always replace)
            question.test_cases.all().delete()
            for tc in test_cases:
                TestCase.objects.create(
                    question=question,
                    input_data=tc["input_data"],
                    expected_output=tc["expected_output"],
                    is_hidden=tc.get("is_hidden", False),
                    weight=tc.get("weight", 1),
                )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully synced 20 Conditional Statements questions! "
            f"(Created: {created_count}, Updated: {updated_count}, Total Test Cases: {20 * 7})"
        ))


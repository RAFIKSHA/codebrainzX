import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Section, Topic, QuestionLevel, Question, TestCase


class Command(BaseCommand):
    help = 'Seeds 20 production-ready Number System coding questions in 4 languages (Python, C, C++, Java) for CodexPetra'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting Number System questions seeding...'))

        # Fetch coding section
        section = Section.objects.filter(slug='coding').first()

        # Update or create Topic
        topic = Topic.objects.filter(slug__in=['number-problems', 'number-system']).first()
        if not topic:
            topic = Topic.objects.create(
                name='Number Problems',
                slug='number-problems',
                description='Practice number-based programming problems to develop strong logic-building and digit-manipulation skills, from beginner to advanced levels.',
                order=3
            )
        else:
            topic.name = 'Number Problems'
            topic.slug = 'number-problems'
            topic.description = 'Practice number-based programming problems to develop strong logic-building and digit-manipulation skills, from beginner to advanced levels.'
            topic.order = 3
            topic.save()

        easy_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='easy')
        medium_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='medium')
        hard_level, _ = QuestionLevel.objects.get_or_create(topic=topic, level='hard')

        questions_data = [
            # ── Q01: Count the Number of Digits ────────────────────────────────
            {
                "order": 1,
                "title": "Count the Number of Digits",
                "slug": "count-the-number-of-digits",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, count the total number of digits in `n`.\n\n"
                    "If `n` is negative, count the digits of its absolute value.\n"
                    "If `n` is `0`, the number of digits is `1`.\n\n"
                    "**Real-world scenario:** Validating user input lengths like telephone numbers, PINs, or account numbers "
                    "requires determining the total digit count of an integer value."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print an integer representing the total count of digits in `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "12345", "output": "5", "explanation": "The number 12345 contains 5 digits: 1, 2, 3, 4, 5."},
                    {"input": "7", "output": "1", "explanation": "7 is a single digit number, so the count is 1."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Take the absolute value of `n` to ignore negative signs.\n"
                    "2. If `n == 0`, return 1 immediately.\n"
                    "3. Initialize a counter `count = 0`.\n"
                    "4. While `n > 0`, increment `count` by 1 and divide `n` by 10 (integer division).\n"
                    "5. Return `count`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Digits, Loops, Math",
                "companies": "TCS, Infosys, Cognizant, Wipro",
                "starter_code": {
                    "python": "def count_digits(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(count_digits(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint count_digits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", count_digits(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint countDigits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << countDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int countDigits(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(countDigits(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(count_digits(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", count_digits(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << countDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(countDigits(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def count_digits(n):\n    n = abs(n)\n    if n == 0:\n        return 1\n    count = 0\n    while n > 0:\n        count += 1\n        n //= 10\n    return count",
                    "c": "int count_digits(int n) {\n    n = abs(n);\n    if (n == 0) return 1;\n    int count = 0;\n    while (n > 0) {\n        count++;\n        n /= 10;\n    }\n    return count;\n}",
                    "cpp": "int countDigits(int n) {\n    n = abs(n);\n    if (n == 0) return 1;\n    int count = 0;\n    while (n > 0) {\n        count++;\n        n /= 10;\n    }\n    return count;\n}",
                    "java": "public static int countDigits(int n) {\n    n = Math.abs(n);\n    if (n == 0) return 1;\n    int count = 0;\n    while (n > 0) {\n        count++;\n        n /= 10;\n    }\n    return count;\n}"
                }),
                "test_cases": [
                    {"input_data": "12345", "expected_output": "5", "is_hidden": False, "weight": 1},
                    {"input_data": "7", "expected_output": "1", "is_hidden": False, "weight": 1},
                    {"input_data": "100000", "expected_output": "6", "is_hidden": True, "weight": 1},
                    {"input_data": "-9876", "expected_output": "4", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "1", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q02: Find the Sum of Digits ────────────────────────────────────
            {
                "order": 2,
                "title": "Find the Sum of Digits",
                "slug": "find-the-sum-of-digits",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, compute the sum of all its digits.\n\n"
                    "If `n` is negative, compute the sum of the digits of its absolute value.\n\n"
                    "**Real-world scenario:** Checksum validation algorithms (like Luhn's algorithm for credit card numbers) "
                    "rely heavily on summing individual digits."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print an integer representing the sum of digits of `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "1234", "output": "10", "explanation": "1 + 2 + 3 + 4 = 10."},
                    {"input": "999", "output": "27", "explanation": "9 + 9 + 9 = 27."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Make `n = abs(n)`.\n"
                    "2. Initialize `total = 0`.\n"
                    "3. While `n > 0`:\n"
                    "   - Add `n % 10` to `total`.\n"
                    "   - Update `n = n // 10`.\n"
                    "4. Return `total`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Digits, Math",
                "companies": "Accenture, Capgemini, Infosys",
                "starter_code": {
                    "python": "def sum_of_digits(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(sum_of_digits(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint sum_of_digits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", sum_of_digits(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint sumOfDigits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << sumOfDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int sumOfDigits(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(sumOfDigits(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(sum_of_digits(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", sum_of_digits(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << sumOfDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(sumOfDigits(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def sum_of_digits(n):\n    n = abs(n)\n    total = 0\n    while n > 0:\n        total += n % 10\n        n //= 10\n    return total",
                    "c": "int sum_of_digits(int n) {\n    n = abs(n);\n    int total = 0;\n    while (n > 0) {\n        total += n % 10;\n        n /= 10;\n    }\n    return total;\n}",
                    "cpp": "int sumOfDigits(int n) {\n    n = abs(n);\n    int total = 0;\n    while (n > 0) {\n        total += n % 10;\n        n /= 10;\n    }\n    return total;\n}",
                    "java": "public static int sumOfDigits(int n) {\n    n = Math.abs(n);\n    int total = 0;\n    while (n > 0) {\n        total += n % 10;\n        n /= 10;\n    }\n    return total;\n}"
                }),
                "test_cases": [
                    {"input_data": "1234", "expected_output": "10", "is_hidden": False, "weight": 1},
                    {"input_data": "999", "expected_output": "27", "is_hidden": False, "weight": 1},
                    {"input_data": "5050", "expected_output": "10", "is_hidden": True, "weight": 1},
                    {"input_data": "-456", "expected_output": "15", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q03: Find the Product of Digits ────────────────────────────────
            {
                "order": 3,
                "title": "Find the Product of Digits",
                "slug": "find-the-product-of-digits",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, calculate the product of all its individual digits.\n\n"
                    "If `n == 0`, the product of its digit is `0`.\n"
                    "If `n` is negative, consider the digits of its absolute value.\n\n"
                    "**Real-world scenario:** Cryptographic hash generation and multiplicative persistence calculations "
                    "rely on repeatedly calculating the product of digits."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print an integer representing the product of digits of `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "234", "output": "24", "explanation": "2 * 3 * 4 = 24."},
                    {"input": "105", "output": "0", "explanation": "1 * 0 * 5 = 0 (since 0 is one of the digits)."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Take `n = abs(n)`.\n"
                    "2. If `n == 0`, return 0.\n"
                    "3. Initialize `prod = 1`.\n"
                    "4. While `n > 0`:\n"
                    "   - `prod *= (n % 10)`\n"
                    "   - `n //= 10`\n"
                    "5. Return `prod`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Multiplication, Digits",
                "companies": "Infosys, Wipro, HCL",
                "starter_code": {
                    "python": "def product_of_digits(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(product_of_digits(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint product_of_digits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", product_of_digits(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint productOfDigits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << productOfDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int productOfDigits(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(productOfDigits(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(product_of_digits(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", product_of_digits(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << productOfDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(productOfDigits(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def product_of_digits(n):\n    n = abs(n)\n    if n == 0:\n        return 0\n    prod = 1\n    while n > 0:\n        prod *= (n % 10)\n        n //= 10\n    return prod",
                    "c": "int product_of_digits(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    int prod = 1;\n    while (n > 0) {\n        prod *= (n % 10);\n        n /= 10;\n    }\n    return prod;\n}",
                    "cpp": "int productOfDigits(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    int prod = 1;\n    while (n > 0) {\n        prod *= (n % 10);\n        n /= 10;\n    }\n    return prod;\n}",
                    "java": "public static int productOfDigits(int n) {\n    n = Math.abs(n);\n    if (n == 0) return 0;\n    int prod = 1;\n    while (n > 0) {\n        prod *= (n % 10);\n        n /= 10;\n    }\n    return prod;\n}"
                }),
                "test_cases": [
                    {"input_data": "234", "expected_output": "24", "is_hidden": False, "weight": 1},
                    {"input_data": "105", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "98", "expected_output": "72", "is_hidden": True, "weight": 1},
                    {"input_data": "-123", "expected_output": "6", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q04: Reverse a Number ──────────────────────────────────────────
            {
                "order": 4,
                "title": "Reverse a Number",
                "slug": "reverse-a-number",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, reverse its digits and return the reversed integer.\n\n"
                    "If `n` is negative, the negative sign should be preserved (e.g. `-456` becomes `-654`).\n"
                    "Trailing zeros in positive integers become leading and naturally drop (e.g. `1200` becomes `21`).\n\n"
                    "**Real-world scenario:** Reversing numeric strings or codes is frequently used in symmetric encryption and palindrome detection."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the reversed integer value.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "12345", "output": "54321", "explanation": "Reversing 12345 gives 54321."},
                    {"input": "1200", "output": "21", "explanation": "1200 reversed is 0021 which evaluates to integer 21."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Note the sign: `sign = -1 if n < 0 else 1`.\n"
                    "2. Work with `n = abs(n)`.\n"
                    "3. Initialize `rev = 0`.\n"
                    "4. While `n > 0`:\n"
                    "   - `rev = rev * 10 + (n % 10)`\n"
                    "   - `n //= 10`\n"
                    "5. Return `sign * rev`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Reversal, Math",
                "companies": "Amazon, TCS, Tech Mahindra",
                "starter_code": {
                    "python": "def reverse_number(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(reverse_number(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint reverse_number(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", reverse_number(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint reverseNumber(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << reverseNumber(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int reverseNumber(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(reverseNumber(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(reverse_number(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", reverse_number(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << reverseNumber(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(reverseNumber(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def reverse_number(n):\n    sign = -1 if n < 0 else 1\n    n = abs(n)\n    rev = 0\n    while n > 0:\n        rev = rev * 10 + (n % 10)\n        n //= 10\n    return sign * rev",
                    "c": "int reverse_number(int n) {\n    int sign = (n < 0) ? -1 : 1;\n    n = abs(n);\n    int rev = 0;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return sign * rev;\n}",
                    "cpp": "int reverseNumber(int n) {\n    int sign = (n < 0) ? -1 : 1;\n    n = abs(n);\n    int rev = 0;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return sign * rev;\n}",
                    "java": "public static int reverseNumber(int n) {\n    int sign = (n < 0) ? -1 : 1;\n    n = Math.abs(n);\n    int rev = 0;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return sign * rev;\n}"
                }),
                "test_cases": [
                    {"input_data": "12345", "expected_output": "54321", "is_hidden": False, "weight": 1},
                    {"input_data": "1200", "expected_output": "21", "is_hidden": False, "weight": 1},
                    {"input_data": "-456", "expected_output": "-654", "is_hidden": True, "weight": 1},
                    {"input_data": "9", "expected_output": "9", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q05: Check Palindrome Number ───────────────────────────────────
            {
                "order": 5,
                "title": "Check Palindrome Number",
                "slug": "check-palindrome-number",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, determine whether it is a palindrome.\n\n"
                    "An integer is a palindrome when it reads the same forward and backward.\n"
                    "Negative numbers are not palindromes because of the minus sign (e.g. `-121` reversed is `121-`).\n\n"
                    "Print `True` if `n` is a palindrome, otherwise print `False`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `True` if `n` is a palindrome, otherwise `False`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "121", "output": "True", "explanation": "121 reads 121 from left to right and right to left."},
                    {"input": "123", "output": "False", "explanation": "123 reads 321 from right to left, which is different."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. If `n < 0`, return False.\n"
                    "2. Store `orig = n` and initialize `rev = 0`.\n"
                    "3. While `n > 0`:\n"
                    "   - `rev = rev * 10 + (n % 10)`\n"
                    "   - `n //= 10`\n"
                    "4. Return `True` if `rev == orig` else `False`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Palindrome, Math",
                "companies": "Amazon, Microsoft, TCS, Infosys",
                "starter_code": {
                    "python": "def is_palindrome(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(is_palindrome(n))",
                    "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool is_palindrome(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_palindrome(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nbool isPalindrome(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isPalindrome(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isPalindrome(int n) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isPalindrome(n) ? \"True\" : \"False\");\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(is_palindrome(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_palindrome(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << (isPalindrome(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(isPalindrome(n) ? \"True\" : \"False\");\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def is_palindrome(n):\n    if n < 0:\n        return \"False\"\n    orig = n\n    rev = 0\n    while n > 0:\n        rev = rev * 10 + (n % 10)\n        n //= 10\n    return \"True\" if rev == orig else \"False\"",
                    "c": "bool is_palindrome(int n) {\n    if (n < 0) return false;\n    int orig = n;\n    long long rev = 0;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return rev == orig;\n}",
                    "cpp": "bool isPalindrome(int n) {\n    if (n < 0) return false;\n    int orig = n;\n    long long rev = 0;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return rev == orig;\n}",
                    "java": "public static boolean isPalindrome(int n) {\n    if (n < 0) return false;\n    int orig = n;\n    long rev = 0;\n    while (n > 0) {\n        rev = rev * 10 + (n % 10);\n        n /= 10;\n    }\n    return rev == orig;\n}"
                }),
                "test_cases": [
                    {"input_data": "121", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "123", "expected_output": "False", "is_hidden": False, "weight": 1},
                    {"input_data": "1221", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "-121", "expected_output": "False", "is_hidden": True, "weight": 1},
                    {"input_data": "7", "expected_output": "True", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q06: Find the First Digit of a Number ──────────────────────────
            {
                "order": 6,
                "title": "Find the First Digit of a Number",
                "slug": "find-the-first-digit-of-a-number",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, find and return its first (most significant / leftmost) digit.\n\n"
                    "If `n` is negative, consider the absolute value of `n`.\n"
                    "If `n == 0`, the first digit is `0`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the first digit of `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "5432", "output": "5", "explanation": "The leftmost digit of 5432 is 5."},
                    {"input": "9", "output": "9", "explanation": "9 has only one digit, which is 9."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Set `n = abs(n)`.\n"
                    "2. If `n == 0`, return 0.\n"
                    "3. While `n >= 10`, repeatedly divide `n` by 10 (`n //= 10`).\n"
                    "4. Return `n`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, First Digit, Math",
                "companies": "Wipro, Capgemini, TCS",
                "starter_code": {
                    "python": "def first_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(first_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint first_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", first_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint firstDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << firstDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int firstDigit(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(firstDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(first_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", first_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << firstDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(firstDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def first_digit(n):\n    n = abs(n)\n    if n == 0:\n        return 0\n    while n >= 10:\n        n //= 10\n    return n",
                    "c": "int first_digit(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    while (n >= 10) {\n        n /= 10;\n    }\n    return n;\n}",
                    "cpp": "int firstDigit(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    while (n >= 10) {\n        n /= 10;\n    }\n    return n;\n}",
                    "java": "public static int firstDigit(int n) {\n    n = Math.abs(n);\n    if (n == 0) return 0;\n    while (n >= 10) {\n        n /= 10;\n    }\n    return n;\n}"
                }),
                "test_cases": [
                    {"input_data": "5432", "expected_output": "5", "is_hidden": False, "weight": 1},
                    {"input_data": "9", "expected_output": "9", "is_hidden": False, "weight": 1},
                    {"input_data": "-876", "expected_output": "8", "is_hidden": True, "weight": 1},
                    {"input_data": "1000", "expected_output": "1", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q07: Find the Last Digit of a Number ───────────────────────────
            {
                "order": 7,
                "title": "Find the Last Digit of a Number",
                "slug": "find-the-last-digit-of-a-number",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, find and return its last (units / rightmost) digit.\n\n"
                    "The last digit must always be a non-negative digit from `0` to `9` (e.g. for `-987`, the last digit is `7`)."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the last digit of `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "1234", "output": "4", "explanation": "The last digit of 1234 is 4."},
                    {"input": "50", "output": "0", "explanation": "The last digit of 50 is 0."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Compute `abs(n)` to handle negative inputs.\n"
                    "2. Return `abs(n) % 10`.\n\n"
                    "**Time Complexity:** O(1) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Last Digit, Modulo",
                "companies": "TCS, Infosys, Cognizant",
                "starter_code": {
                    "python": "def last_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(last_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint last_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", last_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint lastDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << lastDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int lastDigit(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(lastDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(last_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", last_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << lastDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(lastDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def last_digit(n):\n    return abs(n) % 10",
                    "c": "int last_digit(int n) {\n    return abs(n) % 10;\n}",
                    "cpp": "int lastDigit(int n) {\n    return abs(n) % 10;\n}",
                    "java": "public static int lastDigit(int n) {\n    return Math.abs(n) % 10;\n}"
                }),
                "test_cases": [
                    {"input_data": "1234", "expected_output": "4", "is_hidden": False, "weight": 1},
                    {"input_data": "50", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "-987", "expected_output": "7", "is_hidden": True, "weight": 1},
                    {"input_data": "8", "expected_output": "8", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q08: Find the Largest Digit in a Number ────────────────────────
            {
                "order": 8,
                "title": "Find the Largest Digit in a Number",
                "slug": "find-the-largest-digit-in-a-number",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, find and return the largest digit present in `n`.\n\n"
                    "If `n` is negative, consider the digits of its absolute value.\n"
                    "If `n == 0`, the largest digit is `0`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the maximum digit in `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "48291", "output": "9", "explanation": "The digits are 4, 8, 2, 9, 1. The largest is 9."},
                    {"input": "1111", "output": "1", "explanation": "All digits are 1, so the largest digit is 1."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Set `n = abs(n)`.\n"
                    "2. If `n == 0`, return 0.\n"
                    "3. Initialize `max_d = 0`.\n"
                    "4. While `n > 0`:\n"
                    "   - `d = n % 10`\n"
                    "   - If `d > max_d`, update `max_d = d`.\n"
                    "   - `n //= 10`\n"
                    "5. Return `max_d`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Maximum, Digits",
                "companies": "Cognizant, TCS, Accenture",
                "starter_code": {
                    "python": "def largest_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(largest_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint largest_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", largest_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint largestDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << largestDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int largestDigit(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(largestDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(largest_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", largest_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << largestDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(largestDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def largest_digit(n):\n    n = abs(n)\n    if n == 0:\n        return 0\n    max_d = 0\n    while n > 0:\n        d = n % 10\n        if d > max_d:\n            max_d = d\n        n //= 10\n    return max_d",
                    "c": "int largest_digit(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    int max_d = 0;\n    while (n > 0) {\n        int d = n % 10;\n        if (d > max_d) max_d = d;\n        n /= 10;\n    }\n    return max_d;\n}",
                    "cpp": "int largestDigit(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    int max_d = 0;\n    while (n > 0) {\n        int d = n % 10;\n        if (d > max_d) max_d = d;\n        n /= 10;\n    }\n    return max_d;\n}",
                    "java": "public static int largestDigit(int n) {\n    n = Math.abs(n);\n    if (n == 0) return 0;\n    int max_d = 0;\n    while (n > 0) {\n        int d = n % 10;\n        if (d > max_d) max_d = d;\n        n /= 10;\n    }\n    return max_d;\n}"
                }),
                "test_cases": [
                    {"input_data": "48291", "expected_output": "9", "is_hidden": False, "weight": 1},
                    {"input_data": "1111", "expected_output": "1", "is_hidden": False, "weight": 1},
                    {"input_data": "-573", "expected_output": "7", "is_hidden": True, "weight": 1},
                    {"input_data": "300", "expected_output": "3", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q09: Find the Smallest Digit in a Number ───────────────────────
            {
                "order": 9,
                "title": "Find the Smallest Digit in a Number",
                "slug": "find-the-smallest-digit-in-a-number",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, find and return the smallest digit present in `n`.\n\n"
                    "If `n` is negative, consider the digits of its absolute value.\n"
                    "If `n == 0`, the smallest digit is `0`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the minimum digit in `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "5832", "output": "2", "explanation": "The digits are 5, 8, 3, 2. The smallest is 2."},
                    {"input": "904", "output": "0", "explanation": "The digits are 9, 0, 4. The smallest is 0."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Set `n = abs(n)`.\n"
                    "2. If `n == 0`, return 0.\n"
                    "3. Initialize `min_d = 9`.\n"
                    "4. While `n > 0`:\n"
                    "   - `d = n % 10`\n"
                    "   - If `d < min_d`, update `min_d = d`.\n"
                    "   - `n //= 10`\n"
                    "5. Return `min_d`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Minimum, Digits",
                "companies": "Infosys, Wipro, TCS",
                "starter_code": {
                    "python": "def smallest_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(smallest_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint smallest_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", smallest_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint smallestDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << smallestDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int smallestDigit(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(smallestDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(smallest_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", smallest_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << smallestDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(smallestDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def smallest_digit(n):\n    n = abs(n)\n    if n == 0:\n        return 0\n    min_d = 9\n    while n > 0:\n        d = n % 10\n        if d < min_d:\n            min_d = d\n        n //= 10\n    return min_d",
                    "c": "int smallest_digit(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    int min_d = 9;\n    while (n > 0) {\n        int d = n % 10;\n        if (d < min_d) min_d = d;\n        n /= 10;\n    }\n    return min_d;\n}",
                    "cpp": "int smallestDigit(int n) {\n    n = abs(n);\n    if (n == 0) return 0;\n    int min_d = 9;\n    while (n > 0) {\n        int d = n % 10;\n        if (d < min_d) min_d = d;\n        n /= 10;\n    }\n    return min_d;\n}",
                    "java": "public static int smallestDigit(int n) {\n    n = Math.abs(n);\n    if (n == 0) return 0;\n    int min_d = 9;\n    while (n > 0) {\n        int d = n % 10;\n        if (d < min_d) min_d = d;\n        n /= 10;\n    }\n    return min_d;\n}"
                }),
                "test_cases": [
                    {"input_data": "5832", "expected_output": "2", "is_hidden": False, "weight": 1},
                    {"input_data": "904", "expected_output": "0", "is_hidden": False, "weight": 1},
                    {"input_data": "-765", "expected_output": "5", "is_hidden": True, "weight": 1},
                    {"input_data": "888", "expected_output": "8", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q10: Count Even and Odd Digits ─────────────────────────────────
            {
                "order": 10,
                "title": "Count Even and Odd Digits",
                "slug": "count-even-and-odd-digits",
                "level": easy_level,
                "statement": (
                    "Given an integer `n`, count the number of even digits and odd digits in `n`.\n\n"
                    "Note:\n"
                    "- The digit `0` is considered even.\n"
                    "- If `n` is negative, consider the absolute value.\n"
                    "- Print the count of even digits and odd digits separated by a single space."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print two space-separated integers: `even_count odd_count`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "12345", "output": "2 3", "explanation": "Even digits: 2, 4 (count = 2). Odd digits: 1, 3, 5 (count = 3)."},
                    {"input": "2468", "output": "4 0", "explanation": "All 4 digits are even, 0 odd digits."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Make `n = abs(n)`.\n"
                    "2. If `n == 0`, return '1 0' (0 is an even digit).\n"
                    "3. Initialize `evens = 0, odds = 0`.\n"
                    "4. While `n > 0`:\n"
                    "   - `d = n % 10`\n"
                    "   - If `d % 2 == 0` increment `evens`, else increment `odds`.\n"
                    "   - `n //= 10`\n"
                    "5. Return `f'{evens} {odds}'`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Parity, Even Odd, Digits",
                "companies": "TCS, Infosys, Tech Mahindra",
                "starter_code": {
                    "python": "def count_even_odd_digits(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(count_even_odd_digits(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nvoid count_even_odd_digits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        count_even_odd_digits(n);\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\n#include <string>\nusing namespace std;\n\nstring countEvenOddDigits(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << countEvenOddDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static String countEvenOddDigits(int n) {\n        // Write your code here\n        return \"\";\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(countEvenOddDigits(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(count_even_odd_digits(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        count_even_odd_digits(n);\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << countEvenOddDigits(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(countEvenOddDigits(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def count_even_odd_digits(n):\n    n = abs(n)\n    if n == 0:\n        return \"1 0\"\n    evens = 0\n    odds = 0\n    while n > 0:\n        d = n % 10\n        if d % 2 == 0:\n            evens += 1\n        else:\n            odds += 1\n        n //= 10\n    return f\"{evens} {odds}\"",
                    "c": "void count_even_odd_digits(int n) {\n    n = abs(n);\n    if (n == 0) {\n        printf(\"1 0\\n\");\n        return;\n    }\n    int evens = 0, odds = 0;\n    while (n > 0) {\n        int d = n % 10;\n        if (d % 2 == 0) evens++;\n        else odds++;\n        n /= 10;\n    }\n    printf(\"%d %d\\n\", evens, odds);\n}",
                    "cpp": "string countEvenOddDigits(int n) {\n    n = abs(n);\n    if (n == 0) return \"1 0\";\n    int evens = 0, odds = 0;\n    while (n > 0) {\n        int d = n % 10;\n        if (d % 2 == 0) evens++;\n        else odds++;\n        n /= 10;\n    }\n    return to_string(evens) + \" \" + to_string(odds);\n}",
                    "java": "public static String countEvenOddDigits(int n) {\n    n = Math.abs(n);\n    if (n == 0) return \"1 0\";\n    int evens = 0, odds = 0;\n    while (n > 0) {\n        int d = n % 10;\n        if (d % 2 == 0) evens++;\n        else odds++;\n        n /= 10;\n    }\n    return evens + \" \" + odds;\n}"
                }),
                "test_cases": [
                    {"input_data": "12345", "expected_output": "2 3", "is_hidden": False, "weight": 1},
                    {"input_data": "2468", "expected_output": "4 0", "is_hidden": False, "weight": 1},
                    {"input_data": "13579", "expected_output": "0 5", "is_hidden": True, "weight": 1},
                    {"input_data": "-102", "expected_output": "2 1", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "1 0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q11: Count Frequency of a Given Digit ──────────────────────────
            {
                "order": 11,
                "title": "Count Frequency of a Given Digit",
                "slug": "count-frequency-of-a-given-digit",
                "level": medium_level,
                "statement": (
                    "Given two integers `n` and `d`, count how many times digit `d` occurs in `n`.\n\n"
                    "Consider the absolute value of `n`. Digit `d` is guaranteed to be between `0` and `9`.\n\n"
                    "**Real-world scenario:** Frequency analysis of digits is a fundamental tool in Benford's Law audits "
                    "for fraud detection."
                ),
                "input_format": "Two integers `n` and `d` (can be on separate lines or space-separated).",
                "output_format": "Print an integer representing the frequency of digit `d` in `n`.",
                "constraints": "-10^9 <= n <= 10^9, 0 <= d <= 9",
                "examples": [
                    {"input": "122342\n2", "output": "3", "explanation": "Digit 2 appears 3 times in 122342."},
                    {"input": "9999\n9", "output": "4", "explanation": "Digit 9 appears 4 times in 9999."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Make `n = abs(n)`.\n"
                    "2. If `n == 0`, return 1 if `d == 0` else 0.\n"
                    "3. Initialize `count = 0`.\n"
                    "4. While `n > 0`:\n"
                    "   - If `n % 10 == d`, increment `count`.\n"
                    "   - `n //= 10`\n"
                    "5. Return `count`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Frequency, Digits",
                "companies": "HCL, TCS, Infosys",
                "starter_code": {
                    "python": "def count_digit_frequency(n, d):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().split()\n    if len(lines) >= 2:\n        n = int(lines[0])\n        d = int(lines[1])\n        print(count_digit_frequency(n, d))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint count_digit_frequency(int n, int d) {\n    // Write your code here\n}\n\nint main() {\n    int n, d;\n    if (scanf(\"%d %d\", &n, &d) == 2) {\n        printf(\"%d\\n\", count_digit_frequency(n, d));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint countDigitFrequency(int n, int d) {\n    // Write your code here\n}\n\nint main() {\n    int n, d;\n    if (cin >> n >> d) {\n        cout << countDigitFrequency(n, d) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int countDigitFrequency(int n, int d) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int d = sc.nextInt();\n            System.out.println(countDigitFrequency(n, d));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    import sys\n    lines = sys.stdin.read().split()\n    if len(lines) >= 2:\n        n = int(lines[0])\n        d = int(lines[1])\n        print(count_digit_frequency(n, d))",
                    "c": "int main() {\n    int n, d;\n    if (scanf(\"%d %d\", &n, &d) == 2) {\n        printf(\"%d\\n\", count_digit_frequency(n, d));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n, d;\n    if (cin >> n >> d) {\n        cout << countDigitFrequency(n, d) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        int d = sc.nextInt();\n        System.out.println(countDigitFrequency(n, d));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def count_digit_frequency(n, d):\n    n = abs(n)\n    if n == 0:\n        return 1 if d == 0 else 0\n    cnt = 0\n    while n > 0:\n        if n % 10 == d:\n            cnt += 1\n        n //= 10\n    return cnt",
                    "c": "int count_digit_frequency(int n, int d) {\n    n = abs(n);\n    if (n == 0) return (d == 0) ? 1 : 0;\n    int cnt = 0;\n    while (n > 0) {\n        if (n % 10 == d) cnt++;\n        n /= 10;\n    }\n    return cnt;\n}",
                    "cpp": "int countDigitFrequency(int n, int d) {\n    n = abs(n);\n    if (n == 0) return (d == 0) ? 1 : 0;\n    int cnt = 0;\n    while (n > 0) {\n        if (n % 10 == d) cnt++;\n        n /= 10;\n    }\n    return cnt;\n}",
                    "java": "public static int countDigitFrequency(int n, int d) {\n    n = Math.abs(n);\n    if (n == 0) return (d == 0) ? 1 : 0;\n    int cnt = 0;\n    while (n > 0) {\n        if (n % 10 == d) cnt++;\n        n /= 10;\n    }\n    return cnt;\n}"
                }),
                "test_cases": [
                    {"input_data": "122342\n2", "expected_output": "3", "is_hidden": False, "weight": 1},
                    {"input_data": "9999\n9", "expected_output": "4", "is_hidden": False, "weight": 1},
                    {"input_data": "12345\n6", "expected_output": "0", "is_hidden": True, "weight": 1},
                    {"input_data": "-50505\n5", "expected_output": "3", "is_hidden": True, "weight": 1},
                    {"input_data": "0\n0", "expected_output": "1", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q12: Remove the Last Digit of a Number ─────────────────────────
            {
                "order": 12,
                "title": "Remove the Last Digit of a Number",
                "slug": "remove-the-last-digit-of-a-number",
                "level": medium_level,
                "statement": (
                    "Given an integer `n`, remove its last digit and return the resulting integer.\n\n"
                    "If `n` has only one digit (e.g. `7` or `-3` or `0`), removing the last digit results in `0`.\n"
                    "For negative numbers with more than one digit, preserve the negative sign (e.g. `-987` becomes `-98`)."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the integer obtained after removing the last digit.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "1234", "output": "123", "explanation": "Removing the last digit 4 leaves 123."},
                    {"input": "50", "output": "5", "explanation": "Removing the last digit 0 leaves 5."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Record `sign = -1 if n < 0 else 1`.\n"
                    "2. `n = abs(n)`.\n"
                    "3. If `n < 10`, return `0`.\n"
                    "4. Return `sign * (n // 10)`.\n\n"
                    "**Time Complexity:** O(1) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Truncate, Digits",
                "companies": "Cognizant, Capgemini",
                "starter_code": {
                    "python": "def remove_last_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(remove_last_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint remove_last_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", remove_last_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint removeLastDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << removeLastDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int removeLastDigit(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(removeLastDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(remove_last_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", remove_last_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << removeLastDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(removeLastDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def remove_last_digit(n):\n    sign = -1 if n < 0 else 1\n    n = abs(n)\n    if n < 10:\n        return 0\n    return sign * (n // 10)",
                    "c": "int remove_last_digit(int n) {\n    int sign = (n < 0) ? -1 : 1;\n    n = abs(n);\n    if (n < 10) return 0;\n    return sign * (n / 10);\n}",
                    "cpp": "int removeLastDigit(int n) {\n    int sign = (n < 0) ? -1 : 1;\n    n = abs(n);\n    if (n < 10) return 0;\n    return sign * (n / 10);\n}",
                    "java": "public static int removeLastDigit(int n) {\n    int sign = (n < 0) ? -1 : 1;\n    n = Math.abs(n);\n    if (n < 10) return 0;\n    return sign * (n / 10);\n}"
                }),
                "test_cases": [
                    {"input_data": "1234", "expected_output": "123", "is_hidden": False, "weight": 1},
                    {"input_data": "50", "expected_output": "5", "is_hidden": False, "weight": 1},
                    {"input_data": "-987", "expected_output": "-98", "is_hidden": True, "weight": 1},
                    {"input_data": "7", "expected_output": "0", "is_hidden": True, "weight": 1},
                    {"input_data": "-3", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q13: Check Armstrong Number ────────────────────────────────────
            {
                "order": 13,
                "title": "Check Armstrong Number",
                "slug": "check-armstrong-number",
                "level": medium_level,
                "statement": (
                    "An Armstrong number (also known as a narcissistic number) of `k` digits is an integer such that "
                    "the sum of its digits, each raised to the power of `k`, equals the number itself.\n\n"
                    "Negative integers cannot be Armstrong numbers.\n"
                    "Print `True` if `n` is an Armstrong number, otherwise `False`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `True` if `n` is an Armstrong number, otherwise `False`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "153", "output": "True", "explanation": "153 has 3 digits: 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153."},
                    {"input": "123", "output": "False", "explanation": "123 has 3 digits: 1^3 + 2^3 + 3^3 = 1 + 8 + 27 = 36 != 123."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. If `n < 0`, return False.\n"
                    "2. If `n == 0`, return True (0^1 = 0).\n"
                    "3. Count total digits `k` of `n`.\n"
                    "4. Initialize `total = 0, temp = n`.\n"
                    "5. While `temp > 0`:\n"
                    "   - `d = temp % 10`\n"
                    "   - `total += d^k`\n"
                    "   - `temp //= 10`\n"
                    "6. Return `True` if `total == n` else `False`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Armstrong, Math",
                "companies": "TCS, Infosys, Amazon, Wipro",
                "starter_code": {
                    "python": "def is_armstrong(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(is_armstrong(n))",
                    "c": "#include <stdio.h>\n#include <stdbool.h>\n#include <math.h>\n\nbool is_armstrong(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_armstrong(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cmath>\nusing namespace std;\n\nbool isArmstrong(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isArmstrong(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isArmstrong(int n) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isArmstrong(n) ? \"True\" : \"False\");\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(is_armstrong(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_armstrong(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << (isArmstrong(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(isArmstrong(n) ? \"True\" : \"False\");\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def is_armstrong(n):\n    if n < 0:\n        return \"False\"\n    if n == 0:\n        return \"True\"\n    k = len(str(n))\n    total = sum(int(d)**k for d in str(n))\n    return \"True\" if total == n else \"False\"",
                    "c": "bool is_armstrong(int n) {\n    if (n < 0) return false;\n    if (n == 0) return true;\n    int temp = n, k = 0;\n    while (temp > 0) { k++; temp /= 10; }\n    temp = n;\n    long long total = 0;\n    while (temp > 0) {\n        int d = temp % 10;\n        long long p = 1;\n        for (int i = 0; i < k; i++) p *= d;\n        total += p;\n        temp /= 10;\n    }\n    return total == n;\n}",
                    "cpp": "bool isArmstrong(int n) {\n    if (n < 0) return false;\n    if (n == 0) return true;\n    int temp = n, k = 0;\n    while (temp > 0) { k++; temp /= 10; }\n    temp = n;\n    long long total = 0;\n    while (temp > 0) {\n        int d = temp % 10;\n        long long p = 1;\n        for (int i = 0; i < k; i++) p *= d;\n        total += p;\n        temp /= 10;\n    }\n    return total == n;\n}",
                    "java": "public static boolean isArmstrong(int n) {\n    if (n < 0) return false;\n    if (n == 0) return true;\n    int temp = n, k = 0;\n    while (temp > 0) { k++; temp /= 10; }\n    temp = n;\n    long total = 0;\n    while (temp > 0) {\n        int d = temp % 10;\n        long p = 1;\n        for (int i = 0; i < k; i++) p *= d;\n        total += p;\n        temp /= 10;\n    }\n    return total == n;\n}"
                }),
                "test_cases": [
                    {"input_data": "153", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "123", "expected_output": "False", "is_hidden": False, "weight": 1},
                    {"input_data": "1634", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "371", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "True", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q14: Find the Sum of First and Last Digit ──────────────────────
            {
                "order": 14,
                "title": "Find the Sum of First and Last Digit",
                "slug": "find-the-sum-of-first-and-last-digit",
                "level": medium_level,
                "statement": (
                    "Given an integer `n`, compute the sum of its first (leftmost) and last (rightmost) digit.\n\n"
                    "Consider the absolute value of `n`.\n"
                    "For a single-digit number, the first and last digit are identical (e.g. for `7`, `first = 7, last = 7`, sum is `14`; for `0`, `0 + 0 = 0`)."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print an integer representing the sum of the first and last digit.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "1234", "output": "5", "explanation": "First digit is 1, last digit is 4. Sum = 1 + 4 = 5."},
                    {"input": "905", "output": "14", "explanation": "First digit is 9, last digit is 5. Sum = 9 + 5 = 14."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Make `n = abs(n)`.\n"
                    "2. The last digit is `last_d = n % 10`.\n"
                    "3. While `n >= 10`, `n //= 10`.\n"
                    "4. The first digit is `first_d = n`.\n"
                    "5. Return `first_d + last_d`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, First Digit, Last Digit",
                "companies": "Cognizant, TCS, Accenture",
                "starter_code": {
                    "python": "def sum_first_last_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(sum_first_last_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint sum_first_last_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", sum_first_last_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint sumFirstLastDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << sumFirstLastDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int sumFirstLastDigit(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(sumFirstLastDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(sum_first_last_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", sum_first_last_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << sumFirstLastDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(sumFirstLastDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def sum_first_last_digit(n):\n    n = abs(n)\n    last_d = n % 10\n    while n >= 10:\n        n //= 10\n    first_d = n\n    return first_d + last_d",
                    "c": "int sum_first_last_digit(int n) {\n    n = abs(n);\n    int last_d = n % 10;\n    while (n >= 10) n /= 10;\n    int first_d = n;\n    return first_d + last_d;\n}",
                    "cpp": "int sumFirstLastDigit(int n) {\n    n = abs(n);\n    int last_d = n % 10;\n    while (n >= 10) n /= 10;\n    int first_d = n;\n    return first_d + last_d;\n}",
                    "java": "public static int sumFirstLastDigit(int n) {\n    n = Math.abs(n);\n    int last_d = n % 10;\n    while (n >= 10) n /= 10;\n    int first_d = n;\n    return first_d + last_d;\n}"
                }),
                "test_cases": [
                    {"input_data": "1234", "expected_output": "5", "is_hidden": False, "weight": 1},
                    {"input_data": "905", "expected_output": "14", "is_hidden": False, "weight": 1},
                    {"input_data": "-812", "expected_output": "10", "is_hidden": True, "weight": 1},
                    {"input_data": "7", "expected_output": "14", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q15: Check Strong Number ───────────────────────────────────────
            {
                "order": 15,
                "title": "Check Strong Number",
                "slug": "check-strong-number",
                "level": medium_level,
                "statement": (
                    "A Strong number (also known as a Krishnamurthy number) is a positive integer whose sum of the "
                    "factorials of its digits is equal to the number itself.\n\n"
                    "For example, `145` is a strong number because `1! + 4! + 5! = 1 + 24 + 120 = 145`.\n"
                    "For `n <= 0`, return `False`.\n\n"
                    "Print `True` if `n` is a strong number, otherwise `False`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `True` if `n` is a strong number, otherwise `False`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "145", "output": "True", "explanation": "1! + 4! + 5! = 1 + 24 + 120 = 145."},
                    {"input": "123", "output": "False", "explanation": "1! + 2! + 3! = 1 + 2 + 6 = 9 != 123."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. If `n <= 0`, return False.\n"
                    "2. Precompute or compute factorial for digits 0 through 9 (note: `0! = 1`).\n"
                    "3. Store `temp = n, total = 0`.\n"
                    "4. While `temp > 0`:\n"
                    "   - `d = temp % 10`\n"
                    "   - `total += factorial(d)`\n"
                    "   - `temp //= 10`\n"
                    "5. Return `True` if `total == n` else `False`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Strong Number, Factorial",
                "companies": "Infosys, Wipro, TCS",
                "starter_code": {
                    "python": "def is_strong_number(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(is_strong_number(n))",
                    "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool is_strong_number(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_strong_number(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nbool isStrongNumber(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isStrongNumber(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isStrongNumber(int n) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isStrongNumber(n) ? \"True\" : \"False\");\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(is_strong_number(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_strong_number(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << (isStrongNumber(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(isStrongNumber(n) ? \"True\" : \"False\");\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def is_strong_number(n):\n    if n <= 0:\n        return \"False\"\n    fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880]\n    total = sum(fact[int(d)] for d in str(n))\n    return \"True\" if total == n else \"False\"",
                    "c": "bool is_strong_number(int n) {\n    if (n <= 0) return false;\n    int fact[10] = {1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880};\n    int temp = n;\n    long long total = 0;\n    while (temp > 0) {\n        total += fact[temp % 10];\n        temp /= 10;\n    }\n    return total == n;\n}",
                    "cpp": "bool isStrongNumber(int n) {\n    if (n <= 0) return false;\n    int fact[10] = {1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880};\n    int temp = n;\n    long long total = 0;\n    while (temp > 0) {\n        total += fact[temp % 10];\n        temp /= 10;\n    }\n    return total == n;\n}",
                    "java": "public static boolean isStrongNumber(int n) {\n    if (n <= 0) return false;\n    int[] fact = {1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880};\n    int temp = n;\n    long total = 0;\n    while (temp > 0) {\n        total += fact[temp % 10];\n        temp /= 10;\n    }\n    return total == n;\n}"
                }),
                "test_cases": [
                    {"input_data": "145", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "123", "expected_output": "False", "is_hidden": False, "weight": 1},
                    {"input_data": "1", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "2", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "40585", "expected_output": "True", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q16: Check Perfect Number ──────────────────────────────────────
            {
                "order": 16,
                "title": "Check Perfect Number",
                "slug": "check-perfect-number",
                "level": medium_level,
                "statement": (
                    "A Perfect number is a positive integer that is equal to the sum of its proper positive divisors "
                    "(excluding the number itself).\n\n"
                    "For example, `6` has proper divisors `1, 2, 3` and `1 + 2 + 3 = 6`.\n"
                    "For `n <= 1`, it cannot be a perfect number.\n\n"
                    "Print `True` if `n` is a perfect number, otherwise `False`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `True` if `n` is a perfect number, otherwise `False`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "6", "output": "True", "explanation": "Proper divisors of 6 are 1, 2, 3. 1 + 2 + 3 = 6."},
                    {"input": "28", "output": "True", "explanation": "Proper divisors of 28 are 1, 2, 4, 7, 14. Sum = 28."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. If `n <= 1`, return False.\n"
                    "2. Initialize `total = 1` (1 is a divisor for all `n > 1`).\n"
                    "3. Loop `i` from 2 up to `sqrt(n)`:\n"
                    "   - If `n % i == 0`:\n"
                    "     - `total += i`\n"
                    "     - If `i != n // i`, `total += n // i`.\n"
                    "4. Return `True` if `total == n` else `False`.\n\n"
                    "**Time Complexity:** O(sqrt(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Perfect Number, Factors, Math",
                "companies": "Amazon, Microsoft, TCS",
                "starter_code": {
                    "python": "def is_perfect_number(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(is_perfect_number(n))",
                    "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool is_perfect_number(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_perfect_number(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nbool isPerfectNumber(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isPerfectNumber(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isPerfectNumber(int n) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isPerfectNumber(n) ? \"True\" : \"False\");\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(is_perfect_number(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_perfect_number(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << (isPerfectNumber(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(isPerfectNumber(n) ? \"True\" : \"False\");\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def is_perfect_number(n):\n    if n <= 1:\n        return \"False\"\n    total = 1\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            total += i\n            if i * i != n:\n                total += n // i\n    return \"True\" if total == n else \"False\"",
                    "c": "bool is_perfect_number(int n) {\n    if (n <= 1) return false;\n    long long total = 1;\n    for (int i = 2; (long long)i * i <= n; i++) {\n        if (n % i == 0) {\n            total += i;\n            if (i * i != n) total += n / i;\n        }\n    }\n    return total == n;\n}",
                    "cpp": "bool isPerfectNumber(int n) {\n    if (n <= 1) return false;\n    long long total = 1;\n    for (int i = 2; (long long)i * i <= n; i++) {\n        if (n % i == 0) {\n            total += i;\n            if (i * i != n) total += n / i;\n        }\n    }\n    return total == n;\n}",
                    "java": "public static boolean isPerfectNumber(int n) {\n    if (n <= 1) return false;\n    long total = 1;\n    for (int i = 2; (long)i * i <= n; i++) {\n        if (n % i == 0) {\n            total += i;\n            if (i * i != n) total += n / i;\n        }\n    }\n    return total == n;\n}"
                }),
                "test_cases": [
                    {"input_data": "6", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "28", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "12", "expected_output": "False", "is_hidden": True, "weight": 1},
                    {"input_data": "496", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "1", "expected_output": "False", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q17: Check Automorphic Number ──────────────────────────────────
            {
                "order": 17,
                "title": "Check Automorphic Number",
                "slug": "check-automorphic-number",
                "level": medium_level,
                "statement": (
                    "An Automorphic number (also known as a circular number) is a number whose square ends in the same digits "
                    "as the number itself.\n\n"
                    "For example:\n"
                    "- `5^2 = 25` (ends with 5)\n"
                    "- `76^2 = 5776` (ends with 76)\n"
                    "- `25^2 = 625` (ends with 25)\n\n"
                    "Negative integers cannot be automorphic numbers.\n"
                    "Print `True` if `n` is automorphic, otherwise `False`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `True` if `n` is automorphic, otherwise `False`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "25", "output": "True", "explanation": "25^2 = 625, which ends with 25."},
                    {"input": "7", "output": "False", "explanation": "7^2 = 49, which ends with 9, not 7."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. If `n < 0`, return False.\n"
                    "2. If `n == 0`, return True (`0^2 = 0`).\n"
                    "3. Calculate `sq = n * n`.\n"
                    "4. Determine `mod`: while `temp > 0`, multiply `mod` by 10 (`temp //= 10`).\n"
                    "5. Return `True` if `sq % mod == n` else `False`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Automorphic, Math",
                "companies": "Wipro, Capgemini, Infosys",
                "starter_code": {
                    "python": "def is_automorphic(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(is_automorphic(n))",
                    "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool is_automorphic(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_automorphic(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nbool isAutomorphic(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isAutomorphic(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isAutomorphic(int n) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isAutomorphic(n) ? \"True\" : \"False\");\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(is_automorphic(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_automorphic(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << (isAutomorphic(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(isAutomorphic(n) ? \"True\" : \"False\");\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def is_automorphic(n):\n    if n < 0:\n        return \"False\"\n    if n == 0:\n        return \"True\"\n    sq = n * n\n    mod = 1\n    temp = n\n    while temp > 0:\n        mod *= 10\n        temp //= 10\n    return \"True\" if (sq % mod) == n else \"False\"",
                    "c": "bool is_automorphic(int n) {\n    if (n < 0) return false;\n    if (n == 0) return true;\n    long long sq = (long long)n * n;\n    long long mod = 1;\n    int temp = n;\n    while (temp > 0) {\n        mod *= 10;\n        temp /= 10;\n    }\n    return (sq % mod) == n;\n}",
                    "cpp": "bool isAutomorphic(int n) {\n    if (n < 0) return false;\n    if (n == 0) return true;\n    long long sq = (long long)n * n;\n    long long mod = 1;\n    int temp = n;\n    while (temp > 0) {\n        mod *= 10;\n        temp /= 10;\n    }\n    return (sq % mod) == n;\n}",
                    "java": "public static boolean isAutomorphic(int n) {\n    if (n < 0) return false;\n    if (n == 0) return true;\n    long sq = (long)n * n;\n    long mod = 1;\n    int temp = n;\n    while (temp > 0) {\n        mod *= 10;\n        temp /= 10;\n    }\n    return (sq % mod) == n;\n}"
                }),
                "test_cases": [
                    {"input_data": "25", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "76", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "7", "expected_output": "False", "is_hidden": True, "weight": 1},
                    {"input_data": "5", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "True", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q18: Find the Second Largest Digit ─────────────────────────────
            {
                "order": 18,
                "title": "Find the Second Largest Digit",
                "slug": "find-the-second-largest-digit",
                "level": hard_level,
                "statement": (
                    "Given an integer `n`, find and return the second largest distinct digit present in `n`.\n\n"
                    "If `n` does not have at least two distinct digits (e.g. `9999` or single digit numbers like `6`), "
                    "return `-1`.\n"
                    "If `n` is negative, consider the absolute value of `n`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the second largest distinct digit, or `-1` if none exists.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "28549", "output": "8", "explanation": "Distinct digits are 2, 8, 5, 4, 9. Largest is 9, second largest is 8."},
                    {"input": "9999", "output": "-1", "explanation": "All digits are identical (9). No distinct second largest exists."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Make `n = abs(n)`.\n"
                    "2. If `n < 10`, return -1.\n"
                    "3. Initialize `first = -1, second = -1`.\n"
                    "4. While `n > 0`:\n"
                    "   - `d = n % 10`\n"
                    "   - If `d > first`:\n"
                    "     `second = first`\n"
                    "     `first = d`\n"
                    "   - Else if `d < first and d > second`:\n"
                    "     `second = d`\n"
                    "   - `n //= 10`\n"
                    "5. Return `second`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Second Maximum, Digits",
                "companies": "Amazon, TCS Ninja, Cognizant",
                "starter_code": {
                    "python": "def second_largest_digit(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(second_largest_digit(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint second_largest_digit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", second_largest_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint secondLargestDigit(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << secondLargestDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int secondLargestDigit(int n) {\n        // Write your code here\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(secondLargestDigit(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(second_largest_digit(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", second_largest_digit(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << secondLargestDigit(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(secondLargestDigit(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def second_largest_digit(n):\n    n = abs(n)\n    if n < 10:\n        return -1\n    first = -1\n    second = -1\n    while n > 0:\n        d = n % 10\n        if d > first:\n            second = first\n            first = d\n        elif d < first and d > second:\n            second = d\n        n //= 10\n    return second",
                    "c": "int second_largest_digit(int n) {\n    n = abs(n);\n    if (n < 10) return -1;\n    int first = -1, second = -1;\n    while (n > 0) {\n        int d = n % 10;\n        if (d > first) {\n            second = first;\n            first = d;\n        } else if (d < first && d > second) {\n            second = d;\n        }\n        n /= 10;\n    }\n    return second;\n}",
                    "cpp": "int secondLargestDigit(int n) {\n    n = abs(n);\n    if (n < 10) return -1;\n    int first = -1, second = -1;\n    while (n > 0) {\n        int d = n % 10;\n        if (d > first) {\n            second = first;\n            first = d;\n        } else if (d < first && d > second) {\n            second = d;\n        }\n        n /= 10;\n    }\n    return second;\n}",
                    "java": "public static int secondLargestDigit(int n) {\n    n = Math.abs(n);\n    if (n < 10) return -1;\n    int first = -1, second = -1;\n    while (n > 0) {\n        int d = n % 10;\n        if (d > first) {\n            second = first;\n            first = d;\n        } else if (d < first && d > second) {\n            second = d;\n        }\n        n /= 10;\n    }\n    return second;\n}"
                }),
                "test_cases": [
                    {"input_data": "28549", "expected_output": "8", "is_hidden": False, "weight": 1},
                    {"input_data": "9999", "expected_output": "-1", "is_hidden": False, "weight": 1},
                    {"input_data": "752", "expected_output": "5", "is_hidden": True, "weight": 1},
                    {"input_data": "-908", "expected_output": "8", "is_hidden": True, "weight": 1},
                    {"input_data": "6", "expected_output": "-1", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q19: Find the Digital Root of a Number ─────────────────────────
            {
                "order": 19,
                "title": "Find the Digital Root of a Number",
                "slug": "find-the-digital-root-of-a-number",
                "level": hard_level,
                "statement": (
                    "The Digital Root (also called repeated sum of digits) of a non-negative integer `n` is the single-digit "
                    "value obtained by iteratively summing its digits until a single digit remains.\n\n"
                    "For example, for `9875`:\n"
                    "- `9 + 8 + 7 + 5 = 29`\n"
                    "- `2 + 9 = 11`\n"
                    "- `1 + 1 = 2` (single digit reached, so digital root is 2).\n\n"
                    "If `n` is negative, consider the absolute value of `n`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the single digit digital root of `n`.",
                "constraints": "-10^9 <= n <= 10^9",
                "examples": [
                    {"input": "9875", "output": "2", "explanation": "9875 -> 29 -> 11 -> 2."},
                    {"input": "38", "output": "2", "explanation": "38 -> 11 -> 2."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. Make `n = abs(n)`.\n"
                    "2. While `n >= 10`:\n"
                    "   - Compute the sum of digits of `n`.\n"
                    "   - Replace `n` with this sum.\n"
                    "3. Return `n`.\n\n"
                    "*(Mathematical shortcut: If n == 0 return 0, else 1 + (n - 1) % 9).*\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Digital Root, Math",
                "companies": "Google, Adobe, TCS Digital",
                "starter_code": {
                    "python": "def digital_root(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(digital_root(n))",
                    "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint digital_root(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", digital_root(n));\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\n#include <cstdlib>\nusing namespace std;\n\nint digitalRoot(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << digitalRoot(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static int digitalRoot(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(digitalRoot(n));\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(digital_root(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%d\\n\", digital_root(n));\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << digitalRoot(n) << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(digitalRoot(n));\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def digital_root(n):\n    n = abs(n)\n    while n >= 10:\n        s = 0\n        while n > 0:\n            s += n % 10\n            n //= 10\n        n = s\n    return n",
                    "c": "int digital_root(int n) {\n    n = abs(n);\n    while (n >= 10) {\n        int s = 0;\n        while (n > 0) {\n            s += n % 10;\n            n /= 10;\n        }\n        n = s;\n    }\n    return n;\n}",
                    "cpp": "int digitalRoot(int n) {\n    n = abs(n);\n    while (n >= 10) {\n        int s = 0;\n        while (n > 0) {\n            s += n % 10;\n            n /= 10;\n        }\n        n = s;\n    }\n    return n;\n}",
                    "java": "public static int digitalRoot(int n) {\n    n = Math.abs(n);\n    while (n >= 10) {\n        int s = 0;\n        while (n > 0) {\n            s += n % 10;\n            n /= 10;\n        }\n        n = s;\n    }\n    return n;\n}"
                }),
                "test_cases": [
                    {"input_data": "9875", "expected_output": "2", "is_hidden": False, "weight": 1},
                    {"input_data": "38", "expected_output": "2", "is_hidden": False, "weight": 1},
                    {"input_data": "9", "expected_output": "9", "is_hidden": True, "weight": 1},
                    {"input_data": "1000", "expected_output": "1", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "0", "is_hidden": True, "weight": 1}
                ]
            },

            # ── Q20: Check Happy Number ────────────────────────────────────────
            {
                "order": 20,
                "title": "Check Happy Number",
                "slug": "check-happy-number",
                "level": hard_level,
                "statement": (
                    "A Happy number is a number defined by the following process:\n"
                    "1. Starting with any positive integer, replace the number by the sum of the squares of its digits.\n"
                    "2. Repeat the process until the number equals `1` (where it will stay), or it loops endlessly in a cycle "
                    "which does not include `1` (e.g. entering the cycle containing `4, 16, 37, 58, 89, 145, 42, 20`).\n"
                    "3. Numbers that end in `1` are happy numbers.\n\n"
                    "Print `True` if `n` is a happy number, otherwise `False`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print `True` if `n` is a happy number, otherwise `False`.",
                "constraints": "1 <= n <= 10^9",
                "examples": [
                    {"input": "19", "output": "True", "explanation": "1^2 + 9^2 = 82 -> 8^2 + 2^2 = 68 -> 6^2 + 8^2 = 100 -> 1^2 + 0 + 0 = 1 (Happy)."},
                    {"input": "2", "output": "False", "explanation": "2 loops indefinitely in an unhappy cycle: 2 -> 4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4."}
                ],
                "notes": (
                    "**Step-by-step Algorithm:**\n"
                    "1. If `n <= 0`, return False.\n"
                    "2. Keep a set of seen numbers or check if `n == 4` (every non-happy number eventually cycles through 4).\n"
                    "3. While `n != 1 and n != 4`:\n"
                    "   - Calculate `s = sum of square of digits of n`.\n"
                    "   - `n = s`\n"
                    "4. Return `True` if `n == 1` else `False`.\n\n"
                    "**Time Complexity:** O(log10(n)) | **Space Complexity:** O(1)"
                ),
                "tags": "Number System, Happy Number, Hash Set, Fast Slow",
                "companies": "Amazon, Google, Apple, Microsoft",
                "starter_code": {
                    "python": "def is_happy_number(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    print(is_happy_number(n))",
                    "c": "#include <stdio.h>\n#include <stdbool.h>\n\nbool is_happy_number(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_happy_number(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nbool isHappyNumber(int n) {\n    // Write your code here\n}\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << (isHappyNumber(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static boolean isHappyNumber(int n) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(isHappyNumber(n) ? \"True\" : \"False\");\n        }\n    }\n}"
                },
                "driver_code": {
                    "python": "if __name__ == '__main__':\n    n = int(input())\n    print(is_happy_number(n))",
                    "c": "int main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"%s\\n\", is_happy_number(n) ? \"True\" : \"False\");\n    }\n    return 0;\n}",
                    "cpp": "int main() {\n    int n;\n    if (cin >> n) {\n        cout << (isHappyNumber(n) ? \"True\" : \"False\") << \"\\n\";\n    }\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n        int n = sc.nextInt();\n        System.out.println(isHappyNumber(n) ? \"True\" : \"False\");\n    }\n}"
                },
                "official_solution": json.dumps({
                    "python": "def is_happy_number(n):\n    if n <= 0:\n        return \"False\"\n    while n != 1 and n != 4:\n        s = 0\n        while n > 0:\n            d = n % 10\n            s += d * d\n            n //= 10\n        n = s\n    return \"True\" if n == 1 else \"False\"",
                    "c": "bool is_happy_number(int n) {\n    if (n <= 0) return false;\n    while (n != 1 && n != 4) {\n        int s = 0;\n        while (n > 0) {\n            int d = n % 10;\n            s += d * d;\n            n /= 10;\n        }\n        n = s;\n    }\n    return n == 1;\n}",
                    "cpp": "bool isHappyNumber(int n) {\n    if (n <= 0) return false;\n    while (n != 1 && n != 4) {\n        int s = 0;\n        while (n > 0) {\n            int d = n % 10;\n            s += d * d;\n            n /= 10;\n        }\n        n = s;\n    }\n    return n == 1;\n}",
                    "java": "public static boolean isHappyNumber(int n) {\n    if (n <= 0) return false;\n    while (n != 1 && n != 4) {\n        int s = 0;\n        while (n > 0) {\n            int d = n % 10;\n            s += d * d;\n            n /= 10;\n        }\n        n = s;\n    }\n    return n == 1;\n}"
                }),
                "test_cases": [
                    {"input_data": "19", "expected_output": "True", "is_hidden": False, "weight": 1},
                    {"input_data": "2", "expected_output": "False", "is_hidden": False, "weight": 1},
                    {"input_data": "7", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "100", "expected_output": "True", "is_hidden": True, "weight": 1},
                    {"input_data": "4", "expected_output": "False", "is_hidden": True, "weight": 1}
                ]
            }
        ]

        created_count = 0
        updated_count = 0
        total_tc_count = 0

        for q_data in questions_data:
            test_cases_list = q_data.pop("test_cases")
            q_slug = q_data["slug"]

            # Serialize JSON fields
            starter_code_str = json.dumps(q_data["starter_code"])
            driver_code_str = json.dumps(q_data["driver_code"])
            examples_str = json.dumps(q_data["examples"])

            question, created = Question.objects.update_or_create(
                slug=q_slug,
                defaults={
                    "section": section,
                    "topic": topic,
                    "level": q_data["level"],
                    "title": q_data["title"],
                    "statement": q_data["statement"],
                    "input_format": q_data["input_format"],
                    "output_format": q_data["output_format"],
                    "constraints": q_data["constraints"],
                    "notes": q_data["notes"],
                    "tags": q_data["tags"],
                    "companies": q_data["companies"],
                    "official_solution": q_data["official_solution"],
                    "starter_code": starter_code_str,
                    "driver_code": driver_code_str,
                    "examples": examples_str,
                    "order": q_data["order"],
                    "is_published": True,
                    "time_limit": 2.0,
                    "memory_limit": 256.0,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(f"  + Created: [{question.order}] {question.title}")
            else:
                updated_count += 1
                self.stdout.write(f"  * Updated: [{question.order}] {question.title}")

            # Re-sync test cases safely
            question.test_cases.all().delete()
            for tc_item in test_cases_list:
                TestCase.objects.create(
                    question=question,
                    input_data=tc_item["input_data"],
                    expected_output=tc_item["expected_output"],
                    is_hidden=tc_item["is_hidden"],
                    weight=tc_item.get("weight", 1)
                )
                total_tc_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nSuccessfully synced 20 Number System questions!\n"
            f"- Questions Created: {created_count}\n"
            f"- Questions Updated: {updated_count}\n"
            f"- Total Test Cases: {total_tc_count}\n"
            f"- Languages Supported: Python, C, C++, Java"
        ))


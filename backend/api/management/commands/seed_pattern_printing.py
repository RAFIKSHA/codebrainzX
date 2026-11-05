import json
from django.core.management.base import BaseCommand
from api.models import Topic, QuestionLevel, Question, TestCase

class Command(BaseCommand):
    help = 'Seeds 20 Pattern Printing questions under Topic: Pattern Printing with 4 languages starter/driver codes and 2 test cases each'

    def handle(self, *args, **kwargs):
        topic, _ = Topic.objects.get_or_create(
            slug='patterns',
            defaults={
                'name': 'Pattern Printing',
                'description': 'Master nested loops, star alignments, number pyramids, and geometric symmetry from beginner to advanced levels.',
                'order': 4,
            }
        )
        topic.name = 'Pattern Printing'
        topic.description = 'Master nested loops, star alignments, number pyramids, and geometric symmetry from beginner to advanced levels.'
        topic.order = 4
        topic.save()

        # Levels
        lvl_easy, _ = QuestionLevel.objects.get_or_create(topic=topic, level='easy')
        lvl_med, _ = QuestionLevel.objects.get_or_create(topic=topic, level='medium')
        lvl_hard, _ = QuestionLevel.objects.get_or_create(topic=topic, level='hard')

        # Standard starter codes
        starter_code_dict = {
            "c": "void printPattern(int n) {\n    // Write your code here\n}\n",
            "cpp": "void printPattern(int n) {\n    // Write your code here\n}\n",
            "java": "static void printPattern(int n) {\n    // Write your code here\n}\n",
            "python": "def printPattern(n):\n    # Write your code here\n    pass\n"
        }

        # Standard driver codes
        driver_code_dict = {
            "c": "#include <stdio.h>\n\nvoid printPattern(int n);\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printPattern(n);\n    }\n    return 0;\n}\n",
            "cpp": "#include <iostream>\nusing namespace std;\n\nvoid printPattern(int n);\n\nint main() {\n    int n;\n    if (cin >> n) {\n        printPattern(n);\n    }\n    return 0;\n}\n",
            "java": "import java.util.*;\n\npublic class Main {\n    // DRIVER_PLACEHOLDER\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            printPattern(n);\n        }\n    }\n}\n",
            "python": "if __name__ == '__main__':\n    n = int(input().strip())\n    printPattern(n)\n"
        }

        # Pattern generation functions for test cases
        def p1(n): return '\n'.join('*'*n for _ in range(n))
        def p2(n): return '\n'.join('*'*i for i in range(1, n+1))
        def p3(n): return '\n'.join('*'*(n-i) for i in range(n))
        def p4(n): return '\n'.join(' '*i + '*'*(n-i) for i in range(n))
        def p5(n): return '\n'.join('*'*n if i in (0, n-1) else '*' + ' '*(n-2) + '*' for i in range(n))
        def p6(n): return '\n'.join(''.join(str(j) for j in range(1, i+1)) for i in range(1, n+1))
        def p7(n): return '\n'.join(str(i)*i for i in range(1, n+1))
        def p8(n): return '\n'.join(' '*(n-i) + '*'*i for i in range(1, n+1))
        def p9(n): return '\n'.join(' '*(n-i) + '*'*(2*i-1) for i in range(1, n+1))
        def p10(n): return '\n'.join(' '*i + '*'*(2*(n-i)-1) for i in range(n))
        def p11(n):
            top = [' '*(n-i) + '*'*(2*i-1) for i in range(1, n+1)]
            bot = [' '*(n-i) + '*'*(2*i-1) for i in range(n-1, 0, -1)]
            return '\n'.join(top + bot)
        def p12(n):
            cur = 1
            lines = []
            for i in range(1, n+1):
                lines.append(' '.join(str(cur+j) for j in range(i)))
                cur += i
            return '\n'.join(lines)
        def p13(n):
            lines = []
            for i in range(1, n+1):
                asc = ''.join(str(j) for j in range(1, i+1))
                desc = ''.join(str(j) for j in range(i-1, 0, -1))
                lines.append(' '*(n-i) + asc + desc)
            return '\n'.join(lines)
        def p14(n): return '\n'.join(''.join(chr(65+j) for j in range(i)) for i in range(1, n+1))
        def p15(n):
            lines = []
            for i in range(1, n+1):
                if i == 1: lines.append(' '*(n-1) + '*')
                elif i == n: lines.append('*'*(2*n-1))
                else: lines.append(' '*(n-i) + '*' + ' '*(2*i-3) + '*')
            return '\n'.join(lines)
        def p16(n):
            lines = []
            for i in range(1, n+1):
                if i == 1: lines.append(' '*(n-1) + '*')
                else: lines.append(' '*(n-i) + '*' + ' '*(2*i-3) + '*')
            for i in range(n-1, 0, -1):
                if i == 1: lines.append(' '*(n-1) + '*')
                else: lines.append(' '*(n-i) + '*' + ' '*(2*i-3) + '*')
            return '\n'.join(lines)
        def p17(n):
            top = ['*'*i + ' '*(2*(n-i)) + '*'*i for i in range(1, n+1)]
            bot = ['*'*i + ' '*(2*(n-i)) + '*'*i for i in range(n-1, 0, -1)]
            return '\n'.join(top + bot)
        def p18(n):
            import math
            lines = []
            for i in range(n):
                row = [str(math.comb(i, k)) for k in range(i+1)]
                lines.append(' '*(n-1-i) + ' '.join(row))
            return '\n'.join(lines)
        def p19(n):
            lines = []
            for i in range(1, n+1):
                asc = ''.join(chr(65+j) for j in range(i))
                desc = ''.join(chr(65+j) for j in range(i-2, -1, -1))
                lines.append(' '*(n-i) + asc + desc)
            return '\n'.join(lines)
        def p20(n):
            lines = []
            size = 2*n - 1
            for r in range(size):
                row = ''.join(str(n - min(r, c, size-1-r, size-1-c)) for c in range(size))
                lines.append(row)
            return '\n'.join(lines)

        pattern_funcs = {
            1: p1, 2: p2, 3: p3, 4: p4, 5: p5,
            6: p6, 7: p7, 8: p8, 9: p9, 10: p10,
            11: p11, 12: p12, 13: p13, 14: p14, 15: p15,
            16: p16, 17: p17, 18: p18, 19: p19, 20: p20
        }

        # Python reference solutions
        python_solutions = {
            1: "def printPattern(n):\n    for i in range(n):\n        print('*' * n)\n",
            2: "def printPattern(n):\n    for i in range(1, n + 1):\n        print('*' * i)\n",
            3: "def printPattern(n):\n    for i in range(n, 0, -1):\n        print('*' * i)\n",
            4: "def printPattern(n):\n    for i in range(n):\n        print(' ' * i + '*' * (n - i))\n",
            5: "def printPattern(n):\n    for i in range(n):\n        if i == 0 or i == n - 1:\n            print('*' * n)\n        else:\n            print('*' + ' ' * (n - 2) + '*')\n",
            6: "def printPattern(n):\n    for i in range(1, n + 1):\n        print(''.join(str(j) for j in range(1, i + 1)))\n",
            7: "def printPattern(n):\n    for i in range(1, n + 1):\n        print(str(i) * i)\n",
            8: "def printPattern(n):\n    for i in range(1, n + 1):\n        print(' ' * (n - i) + '*' * i)\n",
            9: "def printPattern(n):\n    for i in range(1, n + 1):\n        print(' ' * (n - i) + '*' * (2 * i - 1))\n",
            10: "def printPattern(n):\n    for i in range(n):\n        print(' ' * i + '*' * (2 * (n - i) - 1))\n",
            11: "def printPattern(n):\n    for i in range(1, n + 1):\n        print(' ' * (n - i) + '*' * (2 * i - 1))\n    for i in range(n - 1, 0, -1):\n        print(' ' * (n - i) + '*' * (2 * i - 1))\n",
            12: "def printPattern(n):\n    num = 1\n    for i in range(1, n + 1):\n        row = [str(num + j) for j in range(i)]\n        print(' '.join(row))\n        num += i\n",
            13: "def printPattern(n):\n    for i in range(1, n + 1):\n        asc = ''.join(str(j) for j in range(1, i + 1))\n        desc = ''.join(str(j) for j in range(i - 1, 0, -1))\n        print(' ' * (n - i) + asc + desc)\n",
            14: "def printPattern(n):\n    for i in range(1, n + 1):\n        row = ''.join(chr(65 + j) for j in range(i))\n        print(row)\n",
            15: "def printPattern(n):\n    for i in range(1, n + 1):\n        if i == 1:\n            print(' ' * (n - 1) + '*')\n        elif i == n:\n            print('*' * (2 * n - 1))\n        else:\n            print(' ' * (n - i) + '*' + ' ' * (2 * i - 3) + '*')\n",
            16: "def printPattern(n):\n    for i in range(1, n + 1):\n        if i == 1:\n            print(' ' * (n - 1) + '*')\n        else:\n            print(' ' * (n - i) + '*' + ' ' * (2 * i - 3) + '*')\n    for i in range(n - 1, 0, -1):\n        if i == 1:\n            print(' ' * (n - 1) + '*')\n        else:\n            print(' ' * (n - i) + '*' + ' ' * (2 * i - 3) + '*')\n",
            17: "def printPattern(n):\n    for i in range(1, n + 1):\n        print('*' * i + ' ' * (2 * (n - i)) + '*' * i)\n    for i in range(n - 1, 0, -1):\n        print('*' * i + ' ' * (2 * (n - i)) + '*' * i)\n",
            18: "import math\ndef printPattern(n):\n    for i in range(n):\n        row = [str(math.comb(i, k)) for k in range(i + 1)]\n        print(' ' * (n - 1 - i) + ' '.join(row))\n",
            19: "def printPattern(n):\n    for i in range(1, n + 1):\n        asc = ''.join(chr(65 + j) for j in range(i))\n        desc = ''.join(chr(65 + j) for j in range(i - 2, -1, -1))\n        print(' ' * (n - i) + asc + desc)\n",
            20: "def printPattern(n):\n    size = 2 * n - 1\n    for r in range(size):\n        row = ''.join(str(n - min(r, c, size - 1 - r, size - 1 - c)) for c in range(size))\n        print(row)\n"
        }

        # Questions metadata
        questions_data = [
            # Level 1 – Easy (7 Problems)
            (1, "Solid Square Star Pattern", "solid-square-star-pattern", lvl_easy,
             "You are given an integer N. Print a solid square star pattern of size N × N using asterisks (`*`).\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (2, "Right-Angled Triangle Star Pattern", "right-angled-triangle-star-pattern", lvl_easy,
             "You are given an integer N. Print a right-angled triangle star pattern containing N rows, where row i contains i asterisks (`*`).\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (3, "Inverted Right-Angled Triangle", "inverted-right-angled-triangle", lvl_easy,
             "You are given an integer N. Print an inverted right-angled triangle containing N rows, where row i (1-indexed) contains N - i + 1 asterisks (`*`).\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (4, "Left-Aligned Inverted Triangle", "left-aligned-inverted-triangle", lvl_easy,
             "You are given an integer N. Print a right-aligned inverted triangle containing N rows. Row i (0-indexed) has i leading spaces followed by N - i asterisks (`*`).\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (5, "Hollow Square Star Pattern", "hollow-square-star-pattern", lvl_easy,
             "You are given an integer N. Print a hollow square of size N × N. The border consists of asterisks (`*`), while the interior contains spaces.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (6, "Increasing Number Triangle", "increasing-number-triangle", lvl_easy,
             "You are given an integer N. Print an increasing number triangle of N rows where row i contains natural numbers from 1 to i without spaces.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (7, "Repeated Number Triangle", "repeated-number-triangle", lvl_easy,
             "You are given an integer N. Print a triangle of N rows where each row i contains the digit i repeated i times.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),

            # Level 2 – Medium (7 Problems)
            (8, "Mirrored Right-Angled Triangle", "mirrored-right-angled-triangle", lvl_med,
             "You are given an integer N. Print a mirrored (right-aligned) right-angled triangle containing N rows. Row i (1 to N) contains N - i spaces followed by i asterisks (`*`).\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (9, "Full Pyramid Star Pattern", "full-pyramid-star-pattern", lvl_med,
             "You are given an integer N. Print a full pyramid of N rows using asterisks (`*`). Row i (1 to N) has N - i leading spaces followed by 2*i - 1 asterisks.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (10, "Inverted Pyramid Star Pattern", "inverted-pyramid-star-pattern", lvl_med,
             "You are given an integer N. Print an inverted pyramid of N rows using asterisks (`*`). Row i (0-indexed) has i leading spaces followed by 2*(N - i) - 1 asterisks.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (11, "Diamond Star Pattern", "diamond-star-pattern", lvl_med,
             "You are given an integer N. Print a symmetrical diamond star pattern of 2*N - 1 rows formed by a full pyramid of N rows followed by an inverted pyramid of N - 1 rows.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (12, "Floyd's Triangle", "floyds-triangle", lvl_med,
             "You are given an integer N. Print Floyd's Triangle containing N rows of continuous natural numbers starting from 1, separated by single spaces.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (13, "Palindromic Number Pyramid", "palindromic-number-pyramid", lvl_med,
             "You are given an integer N. Print a palindromic number pyramid of N rows. Row i contains N - i spaces, followed by numbers 1 up to i, then backwards down to 1.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (14, "Alphabet Triangle", "alphabet-triangle", lvl_med,
             "You are given an integer N. Print an uppercase alphabet triangle of N rows where row i contains uppercase characters from 'A' up to the i-th letter without spaces.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),

            # Level 3 – Hard (6 Problems)
            (15, "Hollow Pyramid Star Pattern", "hollow-pyramid-star-pattern", lvl_hard,
             "You are given an integer N. Print a hollow pyramid of N rows using asterisks (`*`). Row 1 has N - 1 spaces and 1 asterisk. Rows 2 to N - 1 have boundary asterisks with inner spaces. Row N is completely filled with 2*N - 1 asterisks.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (16, "Hollow Diamond Pattern", "hollow-diamond-pattern", lvl_hard,
             "You are given an integer N. Print a hollow diamond pattern of 2*N - 1 rows formed by boundary asterisks (`*`) and empty spaces inside and outside.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (17, "Butterfly Star Pattern", "butterfly-star-pattern", lvl_hard,
             "You are given an integer N. Print a butterfly star pattern of 2*N - 1 rows with wing widths symmetric across horizontal and vertical axes.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (18, "Pascal's Triangle", "pascals-triangle", lvl_hard,
             "You are given an integer N. Print Pascal's Triangle of N rows with centered indentation. Each number in row i is the sum of the two numbers directly above it.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (19, "Alphabet Palindrome Pyramid", "alphabet-palindrome-pyramid", lvl_hard,
             "You are given an integer N. Print a palindromic alphabet pyramid of N rows. Row i has N - i leading spaces, followed by letters 'A' up to the i-th letter, then backwards down to 'A'.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code."),
            (20, "Concentric Number Square Pattern", "concentric-number-square-pattern", lvl_hard,
             "You are given an integer N. Print a 2D concentric number square grid of size (2*N - 1) × (2*N - 1). The outer border is filled with N, decrementing towards 1 at the central cell.\n\n"
             "**Important Instructions:**\n"
             "- Implement the required function `printPattern(n)`.\n"
             "- Print the complete pattern directly inside the function.\n"
             "- Do not return the pattern or any value.\n"
             "- Use the given parameter `n` to determine the pattern size.\n"
             "- Follow the exact spacing and line formatting shown in the example.\n"
             "- The platform automatically provides the driver code.\n"
             "- Do not write your own main function or input-reading code.")
        ]

        # Clean existing questions under patterns topic
        topic.questions.all().delete()
        self.stdout.write(self.style.WARNING("Existing questions under Pattern Printing deleted."))

        created_count = 0
        for order, title, slug, level, statement in questions_data:
            p_fn = pattern_funcs[order]
            out_n5 = p_fn(5)
            out_n3 = p_fn(3)

            example_text = f"Input: 5\nOutput:\n{out_n5}\n"

            question = Question.objects.create(
                topic=topic,
                level=level,
                title=title,
                slug=slug,
                statement=statement,
                constraints="1 <= N <= 25",
                input_format="A single integer N denoting the size/rows of the pattern.",
                output_format="Print the exact pattern directly to standard output. Do not return any value.",
                examples=example_text,
                starter_code=json.dumps(starter_code_dict),
                driver_code=json.dumps(driver_code_dict),
                official_solution=python_solutions[order],
                time_limit=2.0,
                memory_limit=256,
                is_published=True,
                order=order
            )

            # Exactly 2 test cases: 1 Public (N=5), 1 Private (N=3)
            TestCase.objects.create(
                question=question,
                input_data="5",
                expected_output=out_n5,
                is_hidden=False,
                weight=50
            )

            TestCase.objects.create(
                question=question,
                input_data="3",
                expected_output=out_n3,
                is_hidden=True,
                weight=50
            )

            created_count += 1
            self.stdout.write(f"Created Question {order}: {title} ({level.level}) with 2 test cases.")

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {created_count} Pattern Printing questions under Topic 'Pattern Printing'."))

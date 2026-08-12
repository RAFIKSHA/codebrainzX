import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Topic, QuestionLevel, Question, TestCase

class Command(BaseCommand):
    help = 'Seeds the 20 production-ready Programming Basics coding questions for CodexPetra'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting Programming Basics questions seeding...'))

        topic, _ = Topic.objects.get_or_create(
            slug='programming-basics',
            defaults={
                'name': 'Programming Basics',
                'description': 'Learn fundamentals: input/output, variables, data types, operators and syntax.',
                'order': 1
            }
        )

        basic_level, _ = QuestionLevel.objects.get_or_create(
            topic=topic,
            level='basic'
        )

        # 20 Production-Ready Questions Data
        questions_data = [
            # 01
            {
                "order": 1,
                "title": "Welcome to CodexPetra",
                "slug": "welcome-to-codexpetra",
                "subtopic": "Standard Input and Output",
                "difficulty": "basic",
                "statement": "Every programmer's journey begins with mastering standard input and output. In this problem, you are given a developer's name. Print a warm welcome message to initiate them into the CodexPetra community.\n\nRead the single word or name from standard input and output two lines:\nLine 1: `Welcome to CodexPetra, <name>!`\nLine 2: `Start your journey to master problem solving.`",
                "input_format": "A single string `name` representing the developer's name.",
                "output_format": "Print the two welcome lines exactly as specified.",
                "constraints": "1 <= len(name) <= 50\nThe name contains only alphanumeric characters without spaces.",
                "examples": [
                    {
                        "input": "Alex",
                        "output": "Welcome to CodexPetra, Alex!\nStart your journey to master problem solving.",
                        "explanation": "Given name 'Alex', the program outputs the greeting addressing Alex followed by the inspiration tagline."
                    },
                    {
                        "input": "Sara",
                        "output": "Welcome to CodexPetra, Sara!\nStart your journey to master problem solving.",
                        "explanation": "Given name 'Sara', the greeting dynamically incorporates 'Sara'."
                    }
                ],
                "approach": "1. Read the input string `name` from standard input.\n2. Construct the formatted greeting string using string concatenation or template literals/f-strings.\n3. Output the two lines to standard output.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Input-Output, Strings, Basic Syntax, Beginner",
                "companies": "Cognizant, Infosys, Wipro, TCS",
                "estimated_time": "5 mins",
                "meta_title": "Welcome to CodexPetra | Programming Basics",
                "meta_description": "Learn basic input/output operations in Python, JavaScript, Java, C++, and C with this introductory challenge on CodexPetra.",
                "starter_code": {
                    "python": "def solve():\n    name = input().strip()\n    # Write your solution below\n    print(f\"Welcome to CodexPetra, {name}!\")\n    print(\"Start your journey to master problem solving.\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\n\nrl.on('line', (name) => {\n    console.log(`Welcome to CodexPetra, ${name.trim()}!`);\n    console.log('Start your journey to master problem solving.');\n    process.exit(0);\n});\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.next();\n        System.out.println(\"Welcome to CodexPetra, \" + name + \"!\");\n        System.out.println(\"Start your journey to master problem solving.\");\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    if (cin >> name) {\n        cout << \"Welcome to CodexPetra, \" << name << \"!\" << endl;\n        cout << \"Start your journey to master problem solving.\" << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    char name[100];\n    if (scanf(\"%s\", name) == 1) {\n        printf(\"Welcome to CodexPetra, %s!\\n\", name);\n        printf(\"Start your journey to master problem solving.\\n\");\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "Alex", "expected_output": "Welcome to CodexPetra, Alex!\nStart your journey to master problem solving.", "is_hidden": False, "weight": 1},
                    {"input_data": "Sara", "expected_output": "Welcome to CodexPetra, Sara!\nStart your journey to master problem solving.", "is_hidden": False, "weight": 1},
                    {"input_data": "Rohan", "expected_output": "Welcome to CodexPetra, Rohan!\nStart your journey to master problem solving.", "is_hidden": True, "weight": 1},
                    {"input_data": "Coder2026", "expected_output": "Welcome to CodexPetra, Coder2026!\nStart your journey to master problem solving.", "is_hidden": True, "weight": 1}
                ]
            },

            # 02
            {
                "order": 2,
                "title": "Introduce Yourself with Variables",
                "slug": "introduce-yourself-with-variables",
                "subtopic": "String & Integer Variables",
                "difficulty": "basic",
                "statement": "Variables allow programs to store and recall information. In this challenge, you will take a person's `name` and their `age` (in years) as input, and construct a sentence introducing them.\n\nOutput format:\n`My name is <name> and I am <age> years old.`",
                "input_format": "Line 1: A single word string `name`.\nLine 2: An integer `age`.",
                "output_format": "Print the introduction sentence exactly as specified.",
                "constraints": "1 <= len(name) <= 50\n1 <= age <= 120",
                "examples": [
                    {
                        "input": "John\n21",
                        "output": "My name is John and I am 21 years old.",
                        "explanation": "Name is 'John' and age is 21."
                    },
                    {
                        "input": "Priya\n19",
                        "output": "My name is Priya and I am 19 years old.",
                        "explanation": "Name is 'Priya' and age is 19."
                    }
                ],
                "approach": "1. Read `name` as string and `age` as integer.\n2. Interpolate them into the sentence `My name is <name> and I am <age> years old.`\n3. Print the result.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Variables, Data Types, String Interpolation, Beginner",
                "companies": "TCS, Infosys, Capgemini",
                "estimated_time": "5 mins",
                "meta_title": "Introduce Yourself with Variables | Programming Basics",
                "meta_description": "Practice storing and printing multiple data types with variables on CodexPetra.",
                "starter_code": {
                    "python": "def solve():\n    name = input().strip()\n    age = int(input().strip())\n    # Write your solution below\n    print(f\"My name is {name} and I am {age} years old.\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const name = input[0];\n    const age = input[1];\n    console.log(`My name is ${name} and I am ${age} years old.`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String name = sc.next();\n            int age = sc.nextInt();\n            System.out.println(\"My name is \" + name + \" and I am \" + age + \" years old.\");\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int age;\n    if (cin >> name >> age) {\n        cout << \"My name is \" << name << \" and I am \" << age << \" years old.\" << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    char name[100];\n    int age;\n    if (scanf(\"%s %d\", name, &age) == 2) {\n        printf(\"My name is %s and I am %d years old.\\n\", name, age);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "John\n21", "expected_output": "My name is John and I am 21 years old.", "is_hidden": False, "weight": 1},
                    {"input_data": "Priya\n19", "expected_output": "My name is Priya and I am 19 years old.", "is_hidden": False, "weight": 1},
                    {"input_data": "David\n35", "expected_output": "My name is David and I am 35 years old.", "is_hidden": True, "weight": 1},
                    {"input_data": "Emma\n8", "expected_output": "My name is Emma and I am 8 years old.", "is_hidden": True, "weight": 1}
                ]
            },

            # 03
            {
                "order": 3,
                "title": "Your First Calculation",
                "slug": "your-first-calculation",
                "subtopic": "Addition Operator",
                "difficulty": "basic",
                "statement": "Computers are built for calculations. In this challenge, take two integers `a` and `b`, compute their sum, and display the result in the format:\n`Sum = <result>`",
                "input_format": "Two space-separated integers `a` and `b` on a single line (or two separate lines).",
                "output_format": "Print `Sum = <result>`.",
                "constraints": "-10^6 <= a, b <= 10^6",
                "examples": [
                    {
                        "input": "15 25",
                        "output": "Sum = 40",
                        "explanation": "15 + 25 = 40."
                    },
                    {
                        "input": "-5 12",
                        "output": "Sum = 7",
                        "explanation": "-5 + 12 = 7."
                    }
                ],
                "approach": "1. Read integers `a` and `b`.\n2. Compute `total = a + b`.\n3. Output `Sum = <total>`.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Arithmetic, Addition, Math, Beginner",
                "companies": "Accenture, Tech Mahindra, Wipro",
                "estimated_time": "5 mins",
                "meta_title": "Your First Calculation | Programming Basics",
                "meta_description": "Perform basic arithmetic addition with variables in standard programming languages on CodexPetra.",
                "starter_code": {
                    "python": "def solve():\n    # Read two integers\n    import sys\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        a, b = int(tokens[0]), int(tokens[1])\n        print(f\"Sum = {a + b}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(`Sum = ${a + b}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(\"Sum = \" + (a + b));\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        cout << \"Sum = \" << (a + b) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long a, b;\n    if (scanf(\"%lld %lld\", &a, &b) == 2) {\n        printf(\"Sum = %lld\\n\", a + b);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "15 25", "expected_output": "Sum = 40", "is_hidden": False, "weight": 1},
                    {"input_data": "-5 12", "expected_output": "Sum = 7", "is_hidden": False, "weight": 1},
                    {"input_data": "100000 500000", "expected_output": "Sum = 600000", "is_hidden": True, "weight": 1},
                    {"input_data": "-50 -50", "expected_output": "Sum = -100", "is_hidden": True, "weight": 1}
                ]
            },

            # 04
            {
                "order": 4,
                "title": "Perform Four Basic Operations",
                "slug": "perform-four-basic-operations",
                "subtopic": "Arithmetic Operators (+, -, *, //)",
                "difficulty": "basic",
                "statement": "Given two positive integers `a` and `b` (where `b != 0`), calculate and display the results of all four primary arithmetic operations on separate lines:\n\n1. Sum: `Sum: <a + b>`\n2. Difference: `Difference: <a - b>`\n3. Product: `Product: <a * b>`\n4. Integer Quotient: `Quotient: <a // b>` (integer division)",
                "input_format": "Two space-separated integers `a` and `b`.",
                "output_format": "Four lines with labels Sum, Difference, Product, and Quotient.",
                "constraints": "1 <= a <= 10^6\n1 <= b <= 10^6",
                "examples": [
                    {
                        "input": "20 6",
                        "output": "Sum: 26\nDifference: 14\nProduct: 120\nQuotient: 3",
                        "explanation": "20+6=26, 20-6=14, 20*6=120, 20//6=3."
                    },
                    {
                        "input": "10 2",
                        "output": "Sum: 12\nDifference: 8\nProduct: 20\nQuotient: 5",
                        "explanation": "10+2=12, 10-2=8, 10*2=20, 10//2=5."
                    }
                ],
                "approach": "1. Read positive integers `a` and `b`.\n2. Compute sum (`a + b`), difference (`a - b`), product (`a * b`), and integer quotient (`Math.floor(a / b)` or `a // b`).\n3. Print each result with its respective prefix label.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Arithmetic, Operators, Integer Division, Beginner",
                "companies": "HCL, TCS, Mindtree",
                "estimated_time": "5 mins",
                "meta_title": "Perform Four Basic Operations | Programming Basics",
                "meta_description": "Master four basic mathematical operators in code with CodexPetra coding arena.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        a, b = int(tokens[0]), int(tokens[1])\n        print(f\"Sum: {a + b}\")\n        print(f\"Difference: {a - b}\")\n        print(f\"Product: {a * b}\")\n        print(f\"Quotient: {a // b}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(`Sum: ${a + b}`);\n    console.log(`Difference: ${a - b}`);\n    console.log(`Product: ${a * b}`);\n    console.log(`Quotient: ${Math.floor(a / b)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            long a = sc.nextLong();\n            long b = sc.nextLong();\n            System.out.println(\"Sum: \" + (a + b));\n            System.out.println(\"Difference: \" + (a - b));\n            System.out.println(\"Product: \" + (a * b));\n            System.out.println(\"Quotient: \" + (a / b));\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        cout << \"Sum: \" << (a + b) << endl;\n        cout << \"Difference: \" << (a - b) << endl;\n        cout << \"Product: \" << (a * b) << endl;\n        cout << \"Quotient: \" << (a / b) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long a, b;\n    if (scanf(\"%lld %lld\", &a, &b) == 2) {\n        printf(\"Sum: %lld\\n\", a + b);\n        printf(\"Difference: %lld\\n\", a - b);\n        printf(\"Product: %lld\\n\", a * b);\n        printf(\"Quotient: %lld\\n\", a / b);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "20 6", "expected_output": "Sum: 26\nDifference: 14\nProduct: 120\nQuotient: 3", "is_hidden": False, "weight": 1},
                    {"input_data": "10 2", "expected_output": "Sum: 12\nDifference: 8\nProduct: 20\nQuotient: 5", "is_hidden": False, "weight": 1},
                    {"input_data": "100 7", "expected_output": "Sum: 107\nDifference: 93\nProduct: 700\nQuotient: 14", "is_hidden": True, "weight": 1},
                    {"input_data": "15 4", "expected_output": "Sum: 19\nDifference: 11\nProduct: 60\nQuotient: 3", "is_hidden": True, "weight": 1}
                ]
            },

            # 05
            {
                "order": 5,
                "title": "Meet Your Variables",
                "slug": "meet-your-variables",
                "subtopic": "Variable Swapping",
                "difficulty": "basic",
                "statement": "Swapping the contents of two variables is a classic fundamental technique in computer science. Given two integer variables `x` and `y`, swap their values and output the updated state.\n\nOutput format:\n`After Swapping: x = <new_x>, y = <new_y>`",
                "input_format": "Two space-separated integers `x` and `y`.",
                "output_format": "Print `After Swapping: x = <new_x>, y = <new_y>`.",
                "constraints": "-10^5 <= x, y <= 10^5",
                "examples": [
                    {
                        "input": "10 20",
                        "output": "After Swapping: x = 20, y = 10",
                        "explanation": "Initial x=10, y=20. After swapping x becomes 20 and y becomes 10."
                    },
                    {
                        "input": "5 -3",
                        "output": "After Swapping: x = -3, y = 5",
                        "explanation": "Initial x=5, y=-3. Swapped to x=-3, y=5."
                    }
                ],
                "approach": "1. Store original `x` in a temporary variable `temp`.\n2. Assign `x = y`.\n3. Assign `y = temp` (or use tuple unpacking `x, y = y, x` in Python).\n4. Print the formatted result.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Variables, Swap, Fundamentals, Beginner",
                "companies": "Wipro, Infosys, LTI",
                "estimated_time": "5 mins",
                "meta_title": "Meet Your Variables (Swap Variables) | Programming Basics",
                "meta_description": "Learn how variable assignment and value swapping works under the hood on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        x, y = int(tokens[0]), int(tokens[1])\n        # Swap\n        x, y = y, x\n        print(f\"After Swapping: x = {x}, y = {y}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    let x = parseInt(input[0], 10);\n    let y = parseInt(input[1], 10);\n    let temp = x;\n    x = y;\n    y = temp;\n    console.log(`After Swapping: x = ${x}, y = ${y}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int x = sc.nextInt();\n            int y = sc.nextInt();\n            int temp = x;\n            x = y;\n            y = temp;\n            System.out.println(\"After Swapping: x = \" + x + \", y = \" + y);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x, y;\n    if (cin >> x >> y) {\n        int temp = x;\n        x = y;\n        y = temp;\n        cout << \"After Swapping: x = \" << x << \", y = \" << y << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    int x, y;\n    if (scanf(\"%d %d\", &x, &y) == 2) {\n        int temp = x;\n        x = y;\n        y = temp;\n        printf(\"After Swapping: x = %d, y = %d\\n\", x, y);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "10 20", "expected_output": "After Swapping: x = 20, y = 10", "is_hidden": False, "weight": 1},
                    {"input_data": "5 -3", "expected_output": "After Swapping: x = -3, y = 5", "is_hidden": False, "weight": 1},
                    {"input_data": "100 100", "expected_output": "After Swapping: x = 100, y = 100", "is_hidden": True, "weight": 1},
                    {"input_data": "-45 99", "expected_output": "After Swapping: x = 99, y = -45", "is_hidden": True, "weight": 1}
                ]
            },

            # 06
            {
                "order": 6,
                "title": "Add Three Numbers",
                "slug": "add-three-numbers",
                "subtopic": "Multi-variable Arithmetic",
                "difficulty": "basic",
                "statement": "Given three integers `a`, `b`, and `c`, compute their combined sum.\n\nOutput format:\n`Total = <sum>`",
                "input_format": "Three space-separated integers `a`, `b`, and `c`.",
                "output_format": "Print `Total = <sum>`.",
                "constraints": "-10^6 <= a, b, c <= 10^6",
                "examples": [
                    {
                        "input": "10 20 30",
                        "output": "Total = 60",
                        "explanation": "10 + 20 + 30 = 60."
                    },
                    {
                        "input": "5 -2 7",
                        "output": "Total = 10",
                        "explanation": "5 + (-2) + 7 = 10."
                    }
                ],
                "approach": "1. Read three integers `a`, `b`, and `c`.\n2. Compute `total = a + b + c`.\n3. Output `Total = <total>`.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Arithmetic, Addition, Multi-Variable, Beginner",
                "companies": "TCS, Cognizant, Wipro",
                "estimated_time": "5 mins",
                "meta_title": "Add Three Numbers | Programming Basics",
                "meta_description": "Calculate cumulative summation of multiple variables in CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 3:\n        a, b, c = map(int, tokens[:3])\n        print(f\"Total = {a + b + c}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 3) {\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    const c = parseInt(input[2], 10);\n    console.log(`Total = ${a + b + c}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            long a = sc.nextLong();\n            long b = sc.nextLong();\n            long c = sc.nextLong();\n            System.out.println(\"Total = \" + (a + b + c));\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b, c;\n    if (cin >> a >> b >> c) {\n        cout << \"Total = \" << (a + b + c) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long a, b, c;\n    if (scanf(\"%lld %lld %lld\", &a, &b, &c) == 3) {\n        printf(\"Total = %lld\\n\", a + b + c);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "10 20 30", "expected_output": "Total = 60", "is_hidden": False, "weight": 1},
                    {"input_data": "5 -2 7", "expected_output": "Total = 10", "is_hidden": False, "weight": 1},
                    {"input_data": "100 200 300", "expected_output": "Total = 600", "is_hidden": True, "weight": 1},
                    {"input_data": "-10 -20 -30", "expected_output": "Total = -60", "is_hidden": True, "weight": 1}
                ]
            },

            # 07
            {
                "order": 7,
                "title": "Calculate the Average",
                "slug": "calculate-the-average",
                "subtopic": "Floating-Point Arithmetic",
                "difficulty": "basic",
                "statement": "Given three numerical scores `a`, `b`, and `c`, calculate their arithmetic mean (average). Print the calculated average formatted to exactly 2 decimal places.\n\nFormula:\n`Average = (a + b + c) / 3`\n\nOutput format:\n`Average = <formatted_value>`",
                "input_format": "Three space-separated floating-point numbers or integers `a`, `b`, and `c`.",
                "output_format": "Print `Average = <value>` with 2 decimal places.",
                "constraints": "0 <= a, b, c <= 10^4",
                "examples": [
                    {
                        "input": "10 20 30",
                        "output": "Average = 20.00",
                        "explanation": "(10 + 20 + 30) / 3 = 60 / 3 = 20.00."
                    },
                    {
                        "input": "15 22 35",
                        "output": "Average = 24.00",
                        "explanation": "(15 + 22 + 35) / 3 = 72 / 3 = 24.00."
                    }
                ],
                "approach": "1. Read three floating-point numbers.\n2. Compute `avg = (a + b + c) / 3.0`.\n3. Format `avg` to 2 decimal places (`%.2f` or `toFixed(2)`).",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Floating Point, Precision, Average, Math",
                "companies": "Infosys, Capgemini, DXC",
                "estimated_time": "5 mins",
                "meta_title": "Calculate the Average | Programming Basics",
                "meta_description": "Learn floating point precision and average calculation in Python, JavaScript, Java and C++.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 3:\n        a, b, c = map(float, tokens[:3])\n        avg = (a + b + c) / 3.0\n        print(f\"Average = {avg:.2f}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 3) {\n    const a = parseFloat(input[0]);\n    const b = parseFloat(input[1]);\n    const c = parseFloat(input[2]);\n    const avg = (a + b + c) / 3;\n    console.log(`Average = ${avg.toFixed(2)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double a = sc.nextDouble();\n            double b = sc.nextDouble();\n            double c = sc.nextDouble();\n            double avg = (a + b + c) / 3.0;\n            System.out.printf(\"Average = %.2f%n\", avg);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double a, b, c;\n    if (cin >> a >> b >> c) {\n        double avg = (a + b + c) / 3.0;\n        cout << fixed << setprecision(2) << \"Average = \" << avg << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double a, b, c;\n    if (scanf(\"%lf %lf %lf\", &a, &b, &c) == 3) {\n        double avg = (a + b + c) / 3.0;\n        printf(\"Average = %.2f\\n\", avg);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "10 20 30", "expected_output": "Average = 20.00", "is_hidden": False, "weight": 1},
                    {"input_data": "15 22 35", "expected_output": "Average = 24.00", "is_hidden": False, "weight": 1},
                    {"input_data": "10 10 11", "expected_output": "Average = 10.33", "is_hidden": True, "weight": 1},
                    {"input_data": "0 0 0", "expected_output": "Average = 0.00", "is_hidden": True, "weight": 1}
                ]
            },

            # 08
            {
                "order": 8,
                "title": "Double, Triple and Half a Number",
                "slug": "double-triple-and-half-a-number",
                "subtopic": "Arithmetic Scaling",
                "difficulty": "basic",
                "statement": "Given an integer `n`, compute and print its double (`2 * n`), triple (`3 * n`), and half (`n / 2.0` with 1 decimal place).\n\nOutput format:\n`Double: <double_val>`\n`Triple: <triple_val>`\n`Half: <half_val>`",
                "input_format": "A single integer `n`.",
                "output_format": "Three lines displaying Double, Triple, and Half (1 decimal place).",
                "constraints": "-10^5 <= n <= 10^5",
                "examples": [
                    {
                        "input": "10",
                        "output": "Double: 20\nTriple: 30\nHalf: 5.0",
                        "explanation": "2*10=20, 3*10=30, 10/2=5.0."
                    },
                    {
                        "input": "7",
                        "output": "Double: 14\nTriple: 21\nHalf: 3.5",
                        "explanation": "2*7=14, 3*7=21, 7/2=3.5."
                    }
                ],
                "approach": "1. Read integer `n`.\n2. Compute `2 * n`, `3 * n`, and `n / 2.0`.\n3. Format the half value to 1 decimal place.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Scaling, Math, Division, Beginner",
                "companies": "TCS, Wipro",
                "estimated_time": "5 mins",
                "meta_title": "Double, Triple and Half a Number | Programming Basics",
                "meta_description": "Calculate scaled numerical multiples and fractions on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if tokens:\n        n = int(tokens[0])\n        print(f\"Double: {2 * n}\")\n        print(f\"Triple: {3 * n}\")\n        print(f\"Half: {n / 2.0:.1f}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    console.log(`Double: ${2 * n}`);\n    console.log(`Triple: ${3 * n}`);\n    console.log(`Half: ${(n / 2).toFixed(1)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            System.out.println(\"Double: \" + (2 * n));\n            System.out.println(\"Triple: \" + (3 * n));\n            System.out.printf(\"Half: %.1f%n\", n / 2.0);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        cout << \"Double: \" << (2 * n) << endl;\n        cout << \"Triple: \" << (3 * n) << endl;\n        cout << fixed << setprecision(1) << \"Half: \" << (n / 2.0) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) == 1) {\n        printf(\"Double: %d\\n\", 2 * n);\n        printf(\"Triple: %d\\n\", 3 * n);\n        printf(\"Half: %.1f\\n\", n / 2.0);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "10", "expected_output": "Double: 20\nTriple: 30\nHalf: 5.0", "is_hidden": False, "weight": 1},
                    {"input_data": "7", "expected_output": "Double: 14\nTriple: 21\nHalf: 3.5", "is_hidden": False, "weight": 1},
                    {"input_data": "25", "expected_output": "Double: 50\nTriple: 75\nHalf: 12.5", "is_hidden": True, "weight": 1},
                    {"input_data": "-8", "expected_output": "Double: -16\nTriple: -24\nHalf: -4.0", "is_hidden": True, "weight": 1}
                ]
            },

            # 09
            {
                "order": 9,
                "title": "Calculate Square and Cube",
                "slug": "calculate-square-and-cube",
                "subtopic": "Exponentiation & Powers",
                "difficulty": "basic",
                "statement": "Given an integer `n`, compute its square (`n^2 = n * n`) and cube (`n^3 = n * n * n`).\n\nOutput format:\n`Square: <square_val>`\n`Cube: <cube_val>`",
                "input_format": "A single integer `n`.",
                "output_format": "Two lines displaying Square and Cube.",
                "constraints": "-10^4 <= n <= 10^4",
                "examples": [
                    {
                        "input": "4",
                        "output": "Square: 16\nCube: 64",
                        "explanation": "4^2 = 16, 4^3 = 64."
                    },
                    {
                        "input": "-3",
                        "output": "Square: 9\nCube: -27",
                        "explanation": "(-3)^2 = 9, (-3)^3 = -27."
                    }
                ],
                "approach": "1. Read integer `n`.\n2. Compute `sq = n * n` and `cube = n * n * n`.\n3. Print the two formatted lines.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Math, Exponents, Power, Multiplication",
                "companies": "Cognizant, TCS, HCL",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Square and Cube | Programming Basics",
                "meta_description": "Compute power and polynomial exponentiation in coding challenges on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if tokens:\n        n = int(tokens[0])\n        print(f\"Square: {n * n}\")\n        print(f\"Cube: {n * n * n}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const n = parseInt(input, 10);\n    console.log(`Square: ${n * n}`);\n    console.log(`Cube: ${n * n * n}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long n = sc.nextLong();\n            System.out.println(\"Square: \" + (n * n));\n            System.out.println(\"Cube: \" + (n * n * n));\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        cout << \"Square: \" << (n * n) << endl;\n        cout << \"Cube: \" << (n * n * n) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf(\"%lld\", &n) == 1) {\n        printf(\"Square: %lld\\n\", n * n);\n        printf(\"Cube: %lld\\n\", n * n * n);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "4", "expected_output": "Square: 16\nCube: 64", "is_hidden": False, "weight": 1},
                    {"input_data": "-3", "expected_output": "Square: 9\nCube: -27", "is_hidden": False, "weight": 1},
                    {"input_data": "10", "expected_output": "Square: 100\nCube: 1000", "is_hidden": True, "weight": 1},
                    {"input_data": "12", "expected_output": "Square: 144\nCube: 1728", "is_hidden": True, "weight": 1}
                ]
            },

            # 10
            {
                "order": 10,
                "title": "Calculate Rectangle Area and Perimeter",
                "slug": "calculate-rectangle-area-and-perimeter",
                "subtopic": "Geometric Formulas",
                "difficulty": "basic",
                "statement": "Given the length `l` and breadth `b` of a rectangular field as integers, compute its Area and Perimeter.\n\nFormulas:\n- Area = `l * b`\n- Perimeter = `2 * (l + b)`\n\nOutput format:\n`Area: <area_val>`\n`Perimeter: <perimeter_val>`",
                "input_format": "Two space-separated positive integers `l` and `b`.",
                "output_format": "Two lines displaying Area and Perimeter.",
                "constraints": "1 <= l, b <= 10^6",
                "examples": [
                    {
                        "input": "10 5",
                        "output": "Area: 50\nPerimeter: 30",
                        "explanation": "Area = 10*5 = 50, Perimeter = 2*(10+5) = 30."
                    },
                    {
                        "input": "7 3",
                        "output": "Area: 21\nPerimeter: 20",
                        "explanation": "Area = 7*3 = 21, Perimeter = 2*(7+3) = 20."
                    }
                ],
                "approach": "1. Read integers `l` and `b`.\n2. Compute `area = l * b` and `perimeter = 2 * (l + b)`.\n3. Output the results on separate lines with labels.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Geometry, Rectangle, Area, Perimeter, Math",
                "companies": "Infosys, Wipro, TCS",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Rectangle Area and Perimeter | Programming Basics",
                "meta_description": "Implement standard 2D geometric formulas in code on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        l, b = int(tokens[0]), int(tokens[1])\n        print(f\"Area: {l * b}\")\n        print(f\"Perimeter: {2 * (l + b)}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const l = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(`Area: ${l * b}`);\n    console.log(`Perimeter: ${2 * (l + b)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long l = sc.nextLong();\n            long b = sc.nextLong();\n            System.out.println(\"Area: \" + (l * b));\n            System.out.println(\"Perimeter: \" + (2 * (l + b)));\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long l, b;\n    if (cin >> l >> b) {\n        cout << \"Area: \" << (l * b) << endl;\n        cout << \"Perimeter: \" << (2 * (l + b)) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long l, b;\n    if (scanf(\"%lld %lld\", &l, &b) == 2) {\n        printf(\"Area: %lld\\n\", l * b);\n        printf(\"Perimeter: %lld\\n\", 2 * (l + b));\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "10 5", "expected_output": "Area: 50\nPerimeter: 30", "is_hidden": False, "weight": 1},
                    {"input_data": "7 3", "expected_output": "Area: 21\nPerimeter: 20", "is_hidden": False, "weight": 1},
                    {"input_data": "100 50", "expected_output": "Area: 5000\nPerimeter: 300", "is_hidden": True, "weight": 1},
                    {"input_data": "12 12", "expected_output": "Area: 144\nPerimeter: 48", "is_hidden": True, "weight": 1}
                ]
            },

            # 11
            {
                "order": 11,
                "title": "Calculate Circle Area and Circumference",
                "slug": "calculate-circle-area-and-circumference",
                "subtopic": "Mathematical Constants (PI)",
                "difficulty": "basic",
                "statement": "Given the radius `r` of a circle as a number, calculate its Area and Circumference. Use the constant value `PI = 3.14159`.\n\nFormulas:\n- Area = `PI * r * r`\n- Circumference = `2 * PI * r`\n\nFormat both outputs to 2 decimal places:\n`Area: <formatted_area>`\n`Circumference: <formatted_circumference>`",
                "input_format": "A single floating-point number or integer `r` representing radius.",
                "output_format": "Two lines displaying Area and Circumference (2 decimal places).",
                "constraints": "0.1 <= r <= 10^4",
                "examples": [
                    {
                        "input": "7",
                        "output": "Area: 153.94\nCircumference: 43.98",
                        "explanation": "Area = 3.14159*49 = 153.93791 -> 153.94. Circumference = 2*3.14159*7 = 43.98226 -> 43.98."
                    },
                    {
                        "input": "10",
                        "output": "Area: 314.16\nCircumference: 62.83",
                        "explanation": "Area = 3.14159*100 = 314.159 -> 314.16. Circumference = 2*3.14159*10 = 62.8318 -> 62.83."
                    }
                ],
                "approach": "1. Read radius `r`.\n2. Define constant `PI = 3.14159`.\n3. Compute `area = PI * r * r` and `circ = 2 * PI * r`.\n4. Output both formatted to 2 decimal places.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Circle, Geometry, Constants, Math, Precision",
                "companies": "Accenture, TCS, Cognizant",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Circle Area and Circumference | Programming Basics",
                "meta_description": "Calculate circular geometrical metrics using PI constant with 2 decimal precision on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if tokens:\n        r = float(tokens[0])\n        PI = 3.14159\n        area = PI * r * r\n        circ = 2 * PI * r\n        print(f\"Area: {area:.2f}\")\n        print(f\"Circumference: {circ:.2f}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const r = parseFloat(input);\n    const PI = 3.14159;\n    const area = PI * r * r;\n    const circ = 2 * PI * r;\n    console.log(`Area: ${area.toFixed(2)}`);\n    console.log(`Circumference: ${circ.toFixed(2)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double r = sc.nextDouble();\n            double PI = 3.14159;\n            double area = PI * r * r;\n            double circ = 2 * PI * r;\n            System.out.printf(\"Area: %.2f%n\", area);\n            System.out.printf(\"Circumference: %.2f%n\", circ);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double r;\n    if (cin >> r) {\n        const double PI = 3.14159;\n        double area = PI * r * r;\n        double circ = 2 * PI * r;\n        cout << fixed << setprecision(2);\n        cout << \"Area: \" << area << endl;\n        cout << \"Circumference: \" << circ << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double r;\n    if (scanf(\"%lf\", &r) == 1) {\n        double PI = 3.14159;\n        double area = PI * r * r;\n        double circ = 2 * PI * r;\n        printf(\"Area: %.2f\\n\", area);\n        printf(\"Circumference: %.2f\\n\", circ);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "7", "expected_output": "Area: 153.94\nCircumference: 43.98", "is_hidden": False, "weight": 1},
                    {"input_data": "10", "expected_output": "Area: 314.16\nCircumference: 62.83", "is_hidden": False, "weight": 1},
                    {"input_data": "3.5", "expected_output": "Area: 38.48\nCircumference: 21.99", "is_hidden": True, "weight": 1},
                    {"input_data": "1", "expected_output": "Area: 3.14\nCircumference: 6.28", "is_hidden": True, "weight": 1}
                ]
            },

            # 12
            {
                "order": 12,
                "title": "Celsius to Fahrenheit Conversion",
                "slug": "celsius-to-fahrenheit-conversion",
                "subtopic": "Unit Conversion Formulas",
                "difficulty": "basic",
                "statement": "Temperature conversions are standard real-world formula challenges. Given temperature in degrees Celsius `C`, convert it to degrees Fahrenheit `F`.\n\nFormula:\n`F = (C * 9/5) + 32`\n\nOutput format (formatted to 2 decimal places):\n`<C_formatted>°C = <F_formatted>°F`",
                "input_format": "A single floating-point number or integer `C`.",
                "output_format": "Print `<C_formatted>°C = <F_formatted>°F` (both numbers with 2 decimal places).",
                "constraints": "-273.15 <= C <= 1000.0",
                "examples": [
                    {
                        "input": "0",
                        "output": "0.00°C = 32.00°F",
                        "explanation": "0 * 9/5 + 32 = 32.00."
                    },
                    {
                        "input": "100",
                        "output": "100.00°C = 212.00°F",
                        "explanation": "100 * 9/5 + 32 = 180 + 32 = 212.00."
                    }
                ],
                "approach": "1. Read temperature `C`.\n2. Compute `F = (C * 9.0 / 5.0) + 32.0`.\n3. Output formatted string `<C:.2f>°C = <F:.2f>°F`.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Physics, Temperature, Conversion, Formulas",
                "companies": "Wipro, Infosys, Capgemini",
                "estimated_time": "5 mins",
                "meta_title": "Celsius to Fahrenheit Conversion | Programming Basics",
                "meta_description": "Convert Celsius to Fahrenheit using mathematical precision on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if tokens:\n        c = float(tokens[0])\n        f = (c * 9.0 / 5.0) + 32.0\n        print(f\"{c:.2f}°C = {f:.2f}°F\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const c = parseFloat(input);\n    const f = (c * 9 / 5) + 32;\n    console.log(`${c.toFixed(2)}°C = ${f.toFixed(2)}°F`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double c = sc.nextDouble();\n            double f = (c * 9.0 / 5.0) + 32.0;\n            System.out.printf(\"%.2f°C = %.2f°F%n\", c, f);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double c;\n    if (cin >> c) {\n        double f = (c * 9.0 / 5.0) + 32.0;\n        cout << fixed << setprecision(2) << c << \"°C = \" << f << \"°F\" << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double c;\n    if (scanf(\"%lf\", &c) == 1) {\n        double f = (c * 9.0 / 5.0) + 32.0;\n        printf(\"%.2f°C = %.2f°F\\n\", c, f);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "0", "expected_output": "0.00°C = 32.00°F", "is_hidden": False, "weight": 1},
                    {"input_data": "100", "expected_output": "100.00°C = 212.00°F", "is_hidden": False, "weight": 1},
                    {"input_data": "37", "expected_output": "37.00°C = 98.60°F", "is_hidden": True, "weight": 1},
                    {"input_data": "-40", "expected_output": "-40.00°C = -40.00°F", "is_hidden": True, "weight": 1}
                ]
            },

            # 13
            {
                "order": 13,
                "title": "Kilometers to Meters and Centimeters",
                "slug": "kilometers-to-meters-and-centimeters",
                "subtopic": "Metric Unit Conversion",
                "difficulty": "basic",
                "statement": "Given a distance in kilometers `km` as a floating-point number, convert it into meters and centimeters.\n\nFormulas:\n- Meters = `km * 1000`\n- Centimeters = `km * 100000`\n\nOutput format (formatted to 2 decimal places):\n`Meters: <meters_val>`\n`Centimeters: <cm_val>`",
                "input_format": "A single floating-point number or integer `km`.",
                "output_format": "Two lines displaying Meters and Centimeters (2 decimal places).",
                "constraints": "0.0 <= km <= 10^5",
                "examples": [
                    {
                        "input": "2.5",
                        "output": "Meters: 2500.00\nCentimeters: 250000.00",
                        "explanation": "2.5 km = 2500 m = 250000 cm."
                    },
                    {
                        "input": "0.75",
                        "output": "Meters: 750.00\nCentimeters: 75000.00",
                        "explanation": "0.75 km = 750 m = 75000 cm."
                    }
                ],
                "approach": "1. Read distance `km`.\n2. Calculate `meters = km * 1000.0` and `cm = km * 100000.0`.\n3. Print both results formatted to 2 decimal places.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Metric, Distance, Unit Conversion, Math",
                "companies": "TCS, Mindtree",
                "estimated_time": "5 mins",
                "meta_title": "Kilometers to Meters and Centimeters | Programming Basics",
                "meta_description": "Convert metric distance measurements with float precision on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if tokens:\n        km = float(tokens[0])\n        print(f\"Meters: {km * 1000:.2f}\")\n        print(f\"Centimeters: {km * 100000:.2f}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const km = parseFloat(input);\n    console.log(`Meters: ${(km * 1000).toFixed(2)}`);\n    console.log(`Centimeters: ${(km * 100000).toFixed(2)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double km = sc.nextDouble();\n            System.out.printf(\"Meters: %.2f%n\", km * 1000.0);\n            System.out.printf(\"Centimeters: %.2f%n\", km * 100000.0);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double km;\n    if (cin >> km) {\n        cout << fixed << setprecision(2);\n        cout << \"Meters: \" << (km * 1000.0) << endl;\n        cout << \"Centimeters: \" << (km * 100000.0) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double km;\n    if (scanf(\"%lf\", &km) == 1) {\n        printf(\"Meters: %.2f\\n\", km * 1000.0);\n        printf(\"Centimeters: %.2f\\n\", km * 100000.0);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "2.5", "expected_output": "Meters: 2500.00\nCentimeters: 250000.00", "is_hidden": False, "weight": 1},
                    {"input_data": "0.75", "expected_output": "Meters: 750.00\nCentimeters: 75000.00", "is_hidden": False, "weight": 1},
                    {"input_data": "12", "expected_output": "Meters: 12000.00\nCentimeters: 1200000.00", "is_hidden": True, "weight": 1},
                    {"input_data": "0", "expected_output": "Meters: 0.00\nCentimeters: 0.00", "is_hidden": True, "weight": 1}
                ]
            },

            # 14
            {
                "order": 14,
                "title": "Convert Seconds into Hours, Minutes and Seconds",
                "slug": "convert-seconds-into-hours-minutes-and-seconds",
                "subtopic": "Modulo & Division Breakdown",
                "difficulty": "basic",
                "statement": "Given a total duration in seconds `T` as a non-negative integer, break it down into Hours, Minutes, and Remaining Seconds.\n\nFormulas:\n- Hours `H = T // 3600`\n- Remaining after hours `rem = T % 3600`\n- Minutes `M = rem // 60`\n- Seconds `S = rem % 60`\n\nOutput format:\n`<H> Hours, <M> Minutes, <S> Seconds`",
                "input_format": "A single non-negative integer `T`.",
                "output_format": "Print `<H> Hours, <M> Minutes, <S> Seconds`.",
                "constraints": "0 <= T <= 10^7",
                "examples": [
                    {
                        "input": "3665",
                        "output": "1 Hours, 1 Minutes, 5 Seconds",
                        "explanation": "3665 seconds = 1 hour (3600s) + 1 minute (60s) + 5 seconds."
                    },
                    {
                        "input": "7200",
                        "output": "2 Hours, 0 Minutes, 0 Seconds",
                        "explanation": "7200 seconds = exactly 2 hours."
                    }
                ],
                "approach": "1. Read integer `T`.\n2. Compute `h = T // 3600`.\n3. Compute `m = (T % 3600) // 60`.\n4. Compute `s = T % 60`.\n5. Print the formatted breakdown string.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Modulo, Time Decomposition, Arithmetic, Division",
                "companies": "Amazon, TCS, Accenture",
                "estimated_time": "5 mins",
                "meta_title": "Convert Seconds into Hours, Minutes and Seconds | Programming Basics",
                "meta_description": "Use division and modulo operators to convert raw seconds to hours, minutes and seconds on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if tokens:\n        t = int(tokens[0])\n        h = t // 3600\n        m = (t % 3600) // 60\n        s = t % 60\n        print(f\"{h} Hours, {m} Minutes, {s} Seconds\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const t = parseInt(input, 10);\n    const h = Math.floor(t / 3600);\n    const m = Math.floor((t % 3600) / 60);\n    const s = t % 60;\n    console.log(`${h} Hours, ${m} Minutes, ${s} Seconds`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long t = sc.nextLong();\n            long h = t / 3600;\n            long m = (t % 3600) / 60;\n            long s = t % 60;\n            System.out.println(h + \" Hours, \" + m + \" Minutes, \" + s + \" Seconds\");\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long t;\n    if (cin >> t) {\n        long long h = t / 3600;\n        long long m = (t % 3600) / 60;\n        long long s = t % 60;\n        cout << h << \" Hours, \" << m << \" Minutes, \" << s << \" Seconds\" << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long t;\n    if (scanf(\"%lld\", &t) == 1) {\n        long long h = t / 3600;\n        long long m = (t % 3600) / 60;\n        long long s = t % 60;\n        printf(\"%lld Hours, %lld Minutes, %lld Seconds\\n\", h, m, s);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "3665", "expected_output": "1 Hours, 1 Minutes, 5 Seconds", "is_hidden": False, "weight": 1},
                    {"input_data": "7200", "expected_output": "2 Hours, 0 Minutes, 0 Seconds", "is_hidden": False, "weight": 1},
                    {"input_data": "125", "expected_output": "0 Hours, 2 Minutes, 5 Seconds", "is_hidden": True, "weight": 1},
                    {"input_data": "86400", "expected_output": "24 Hours, 0 Minutes, 0 Seconds", "is_hidden": True, "weight": 1}
                ]
            },

            # 15
            {
                "order": 15,
                "title": "Calculate Simple Interest and Final Amount",
                "slug": "calculate-simple-interest-and-final-amount",
                "subtopic": "Financial Formulas",
                "difficulty": "basic",
                "statement": "Given Principal amount `P`, Annual Interest Rate `R` (in percentage), and Time period `T` (in years), compute the Simple Interest and the Total Final Amount.\n\nFormulas:\n- Simple Interest `SI = (P * R * T) / 100`\n- Final Amount `A = P + SI`\n\nOutput format (2 decimal places):\n`Interest: <si_val>`\n`Final Amount: <amount_val>`",
                "input_format": "Three space-separated numbers `P`, `R`, and `T`.",
                "output_format": "Two lines displaying Interest and Final Amount formatted to 2 decimal places.",
                "constraints": "1.0 <= P <= 10^7\n0.1 <= R <= 100.0\n0.1 <= T <= 100.0",
                "examples": [
                    {
                        "input": "1000 5 2",
                        "output": "Interest: 100.00\nFinal Amount: 1100.00",
                        "explanation": "SI = (1000 * 5 * 2) / 100 = 100.00. Final Amount = 1000 + 100 = 1100.00."
                    },
                    {
                        "input": "5000 7.5 3",
                        "output": "Interest: 1125.00\nFinal Amount: 6125.00",
                        "explanation": "SI = (5000 * 7.5 * 3) / 100 = 1125.00. Total = 5000 + 1125 = 6125.00."
                    }
                ],
                "approach": "1. Read `P`, `R`, and `T` as floating-point numbers.\n2. Compute `si = (P * R * T) / 100.0`.\n3. Compute `total = P + si`.\n4. Print both values formatted to 2 decimal places.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Finance, Simple Interest, Banking, Math",
                "companies": "HDFC, ICICI, TCS, Infosys",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Simple Interest and Final Amount | Programming Basics",
                "meta_description": "Implement banking and loan interest calculations in code on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 3:\n        p, r, t = map(float, tokens[:3])\n        si = (p * r * t) / 100.0\n        total = p + si\n        print(f\"Interest: {si:.2f}\")\n        print(f\"Final Amount: {total:.2f}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 3) {\n    const p = parseFloat(input[0]);\n    const r = parseFloat(input[1]);\n    const t = parseFloat(input[2]);\n    const si = (p * r * t) / 100;\n    const total = p + si;\n    console.log(`Interest: ${si.toFixed(2)}`);\n    console.log(`Final Amount: ${total.toFixed(2)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double p = sc.nextDouble();\n            double r = sc.nextDouble();\n            double t = sc.nextDouble();\n            double si = (p * r * t) / 100.0;\n            double total = p + si;\n            System.out.printf(\"Interest: %.2f%n\", si);\n            System.out.printf(\"Final Amount: %.2f%n\", total);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double p, r, t;\n    if (cin >> p >> r >> t) {\n        double si = (p * r * t) / 100.0;\n        double total = p + si;\n        cout << fixed << setprecision(2);\n        cout << \"Interest: \" << si << endl;\n        cout << \"Final Amount: \" << total << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double p, r, t;\n    if (scanf(\"%lf %lf %lf\", &p, &r, &t) == 3) {\n        double si = (p * r * t) / 100.0;\n        double total = p + si;\n        printf(\"Interest: %.2f\\n\", si);\n        printf(\"Final Amount: %.2f\\n\", total);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "1000 5 2", "expected_output": "Interest: 100.00\nFinal Amount: 1100.00", "is_hidden": False, "weight": 1},
                    {"input_data": "5000 7.5 3", "expected_output": "Interest: 1125.00\nFinal Amount: 6125.00", "is_hidden": False, "weight": 1},
                    {"input_data": "10000 10 1", "expected_output": "Interest: 1000.00\nFinal Amount: 11000.00", "is_hidden": True, "weight": 1},
                    {"input_data": "2500 4.2 5", "expected_output": "Interest: 525.00\nFinal Amount: 3025.00", "is_hidden": True, "weight": 1}
                ]
            },

            # 16
            {
                "order": 16,
                "title": "Calculate Student Marks and Percentage",
                "slug": "calculate-student-marks-and-percentage",
                "subtopic": "Cumulative Score & Percentage",
                "difficulty": "basic",
                "statement": "A student appeared for exams across 5 subjects (each scored out of 100 marks). Given their marks in the 5 subjects `m1, m2, m3, m4, m5`, calculate the Total Marks obtained (out of 500) and the overall Percentage.\n\nFormulas:\n- Total = `m1 + m2 + m3 + m4 + m5`\n- Percentage = `(Total / 500) * 100`\n\nOutput format:\n`Total Marks: <total>/500`\n`Percentage: <percentage_val>%` (percentage formatted to 2 decimal places)",
                "input_format": "Five space-separated numbers `m1 m2 m3 m4 m5`.",
                "output_format": "Two lines displaying Total Marks and Percentage.",
                "constraints": "0.0 <= m1, m2, m3, m4, m5 <= 100.0",
                "examples": [
                    {
                        "input": "85 90 78 92 88",
                        "output": "Total Marks: 433.00/500\nPercentage: 86.60%",
                        "explanation": "Total = 85+90+78+92+88 = 433.00. Percentage = 433/5 = 86.60%."
                    },
                    {
                        "input": "100 100 100 100 100",
                        "output": "Total Marks: 500.00/500\nPercentage: 100.00%",
                        "explanation": "Perfect score 500.00/500 = 100.00%."
                    }
                ],
                "approach": "1. Read five subject marks.\n2. Compute `total = m1 + m2 + m3 + m4 + m5`.\n3. Compute `pct = (total / 500.0) * 100.0`.\n4. Print `Total Marks: <total:.2f>/500` and `Percentage: <pct:.2f>%`.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Percentage, Student Analytics, Score, Math",
                "companies": "Wipro, Capgemini, LTI",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Student Marks and Percentage | Programming Basics",
                "meta_description": "Calculate academic total scores and percentages formatted to 2 decimals on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 5:\n        marks = [float(x) for x in tokens[:5]]\n        total = sum(marks)\n        pct = (total / 500.0) * 100.0\n        print(f\"Total Marks: {total:.2f}/500\")\n        print(f\"Percentage: {pct:.2f}%\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 5) {\n    const marks = input.slice(0, 5).map(Number);\n    const total = marks.reduce((a, b) => a + b, 0);\n    const pct = (total / 500) * 100;\n    console.log(`Total Marks: ${total.toFixed(2)}/500`);\n    console.log(`Percentage: ${pct.toFixed(2)}%`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double total = 0;\n            for (int i = 0; i < 5; i++) {\n                total += sc.nextDouble();\n            }\n            double pct = (total / 500.0) * 100.0;\n            System.out.printf(\"Total Marks: %.2f/500%n\", total);\n            System.out.printf(\"Percentage: %.2f%%%n\", pct);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double m1, m2, m3, m4, m5;\n    if (cin >> m1 >> m2 >> m3 >> m4 >> m5) {\n        double total = m1 + m2 + m3 + m4 + m5;\n        double pct = (total / 500.0) * 100.0;\n        cout << fixed << setprecision(2);\n        cout << \"Total Marks: \" << total << \"/500\" << endl;\n        cout << \"Percentage: \" << pct << \"%\" << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double m1, m2, m3, m4, m5;\n    if (scanf(\"%lf %lf %lf %lf %lf\", &m1, &m2, &m3, &m4, &m5) == 5) {\n        double total = m1 + m2 + m3 + m4 + m5;\n        double pct = (total / 500.0) * 100.0;\n        printf(\"Total Marks: %.2f/500\\n\", total);\n        printf(\"Percentage: %.2f%%\\n\", pct);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "85 90 78 92 88", "expected_output": "Total Marks: 433.00/500\nPercentage: 86.60%", "is_hidden": False, "weight": 1},
                    {"input_data": "100 100 100 100 100", "expected_output": "Total Marks: 500.00/500\nPercentage: 100.00%", "is_hidden": False, "weight": 1},
                    {"input_data": "50 60 70 80 90", "expected_output": "Total Marks: 350.00/500\nPercentage: 70.00%", "is_hidden": True, "weight": 1},
                    {"input_data": "40 40 40 40 40", "expected_output": "Total Marks: 200.00/500\nPercentage: 40.00%", "is_hidden": True, "weight": 1}
                ]
            },

            # 17
            {
                "order": 17,
                "title": "Calculate Product Discount and Final Price",
                "slug": "calculate-product-discount-and-final-price",
                "subtopic": "Percentage Discounts",
                "difficulty": "basic",
                "statement": "An e-commerce store offers a discount percentage `d` on an item priced at original price `p`. Calculate the discount savings and the final price payable by the customer.\n\nFormulas:\n- Discount Amount = `(p * d) / 100`\n- Final Price = `p - Discount Amount`\n\nOutput format (2 decimal places):\n`Original Price: $<p>`\n`Discount Saved: $<discount>`\n`Final Price: $<final>`",
                "input_format": "Two space-separated numbers `p` (price) and `d` (discount percentage).",
                "output_format": "Three lines displaying Original Price, Discount Saved, and Final Price.",
                "constraints": "1.0 <= p <= 10^6\n0.0 <= d <= 100.0",
                "examples": [
                    {
                        "input": "1200 15",
                        "output": "Original Price: $1200.00\nDiscount Saved: $180.00\nFinal Price: $1020.00",
                        "explanation": "15% of $1200 is $180. Final = 1200 - 180 = $1020.00."
                    },
                    {
                        "input": "500 50",
                        "output": "Original Price: $500.00\nDiscount Saved: $250.00\nFinal Price: $250.00",
                        "explanation": "50% off $500 saves $250, final is $250.00."
                    }
                ],
                "approach": "1. Read price `p` and discount percentage `d`.\n2. Compute `discount = (p * d) / 100.0`.\n3. Compute `final_price = p - discount`.\n4. Format all three values to 2 decimal places with `$` signs.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "E-Commerce, Discount, Percentage, Billing",
                "companies": "Flipkart, Amazon, Swiggy",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Product Discount and Final Price | Programming Basics",
                "meta_description": "Build automated e-commerce discount calculators in code on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        p, d = float(tokens[0]), float(tokens[1])\n        discount = (p * d) / 100.0\n        final_price = p - discount\n        print(f\"Original Price: ${p:.2f}\")\n        print(f\"Discount Saved: ${discount:.2f}\")\n        print(f\"Final Price: ${final_price:.2f}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const p = parseFloat(input[0]);\n    const d = parseFloat(input[1]);\n    const discount = (p * d) / 100;\n    const final_price = p - discount;\n    console.log(`Original Price: $${p.toFixed(2)}`);\n    console.log(`Discount Saved: $${discount.toFixed(2)}`);\n    console.log(`Final Price: $${final_price.toFixed(2)}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double p = sc.nextDouble();\n            double d = sc.nextDouble();\n            double discount = (p * d) / 100.0;\n            double finalPrice = p - discount;\n            System.out.printf(\"Original Price: $%.2f%n\", p);\n            System.out.printf(\"Discount Saved: $%.2f%n\", discount);\n            System.out.printf(\"Final Price: $%.2f%n\", finalPrice);\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double p, d;\n    if (cin >> p >> d) {\n        double discount = (p * d) / 100.0;\n        double final_price = p - discount;\n        cout << fixed << setprecision(2);\n        cout << \"Original Price: $\" << p << endl;\n        cout << \"Discount Saved: $\" << discount << endl;\n        cout << \"Final Price: $\" << final_price << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double p, d;\n    if (scanf(\"%lf %lf\", &p, &d) == 2) {\n        double discount = (p * d) / 100.0;\n        double final_price = p - discount;\n        printf(\"Original Price: $%.2f\\n\", p);\n        printf(\"Discount Saved: $%.2f\\n\", discount);\n        printf(\"Final Price: $%.2f\\n\", final_price);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "1200 15", "expected_output": "Original Price: $1200.00\nDiscount Saved: $180.00\nFinal Price: $1020.00", "is_hidden": False, "weight": 1},
                    {"input_data": "500 50", "expected_output": "Original Price: $500.00\nDiscount Saved: $250.00\nFinal Price: $250.00", "is_hidden": False, "weight": 1},
                    {"input_data": "250 10", "expected_output": "Original Price: $250.00\nDiscount Saved: $25.00\nFinal Price: $225.00", "is_hidden": True, "weight": 1},
                    {"input_data": "99.99 0", "expected_output": "Original Price: $99.99\nDiscount Saved: $0.00\nFinal Price: $99.99", "is_hidden": True, "weight": 1}
                ]
            },

            # 18
            {
                "order": 18,
                "title": "Calculate Profit, Loss and Percentage",
                "slug": "calculate-profit-loss-and-percentage",
                "subtopic": "Commercial Math",
                "difficulty": "basic",
                "statement": "Given the Cost Price `CP` and Selling Price `SP` of an item as numbers, determine the financial margin.\n\n- If `SP >= CP`, it is a **Profit**:\n  - Amount: `Profit = SP - CP`\n  - Percentage: `Profit% = (Profit / CP) * 100`\n  - Output: `Profit: <amount>` and `Profit Percentage: <percentage>%`\n- If `SP < CP`, it is a **Loss**:\n  - Amount: `Loss = CP - SP`\n  - Percentage: `Loss% = (Loss / CP) * 100`\n  - Output: `Loss: <amount>` and `Loss Percentage: <percentage>%`\n\nFormat both values to 2 decimal places.",
                "input_format": "Two space-separated positive numbers `CP` and `SP`.",
                "output_format": "Two lines formatted as specified above.",
                "constraints": "1.0 <= CP, SP <= 10^7",
                "examples": [
                    {
                        "input": "500 650",
                        "output": "Profit: 150.00\nProfit Percentage: 30.00%",
                        "explanation": "CP=500, SP=650. Profit = 150. Profit% = (150/500)*100 = 30.00%."
                    },
                    {
                        "input": "1000 800",
                        "output": "Loss: 200.00\nLoss Percentage: 20.00%",
                        "explanation": "CP=1000, SP=800. Loss = 200. Loss% = (200/1000)*100 = 20.00%."
                    }
                ],
                "approach": "1. Read `CP` and `SP`.\n2. Compare `SP` and `CP`.\n3. If `SP >= CP`: compute profit and profit percentage.\n4. If `SP < CP`: compute loss and loss percentage.\n5. Output formatted lines with 2 decimal precision.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Commercial Math, Profit and Loss, Financial Math",
                "companies": "Cognizant, TCS, Infosys",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Profit, Loss and Percentage | Programming Basics",
                "meta_description": "Calculate commercial margin and profit/loss percentage in code on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        cp, sp = float(tokens[0]), float(tokens[1])\n        if sp >= cp:\n            profit = sp - cp\n            pct = (profit / cp) * 100.0\n            print(f\"Profit: {profit:.2f}\")\n            print(f\"Profit Percentage: {pct:.2f}%\")\n        else:\n            loss = cp - sp\n            pct = (loss / cp) * 100.0\n            print(f\"Loss: {loss:.2f}\")\n            print(f\"Loss Percentage: {pct:.2f}%\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const cp = parseFloat(input[0]);\n    const sp = parseFloat(input[1]);\n    if (sp >= cp) {\n        const profit = sp - cp;\n        const pct = (profit / cp) * 100;\n        console.log(`Profit: ${profit.toFixed(2)}`);\n        console.log(`Profit Percentage: ${pct.toFixed(2)}%`);\n    } else {\n        const loss = cp - sp;\n        const pct = (loss / cp) * 100;\n        console.log(`Loss: ${loss.toFixed(2)}`);\n        console.log(`Loss Percentage: ${pct.toFixed(2)}%`);\n    }\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextDouble()) {\n            double cp = sc.nextDouble();\n            double sp = sc.nextDouble();\n            if (sp >= cp) {\n                double profit = sp - cp;\n                double pct = (profit / cp) * 100.0;\n                System.out.printf(\"Profit: %.2f%n\", profit);\n                System.out.printf(\"Profit Percentage: %.2f%%%n\", pct);\n            } else {\n                double loss = cp - sp;\n                double pct = (loss / cp) * 100.0;\n                System.out.printf(\"Loss: %.2f%n\", loss);\n                System.out.printf(\"Loss Percentage: %.2f%%%n\", pct);\n            }\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    double cp, sp;\n    if (cin >> cp >> sp) {\n        cout << fixed << setprecision(2);\n        if (sp >= cp) {\n            double profit = sp - cp;\n            double pct = (profit / cp) * 100.0;\n            cout << \"Profit: \" << profit << endl;\n            cout << \"Profit Percentage: \" << pct << \"%\" << endl;\n        } else {\n            double loss = cp - sp;\n            double pct = (loss / cp) * 100.0;\n            cout << \"Loss: \" << loss << endl;\n            cout << \"Loss Percentage: \" << pct << \"%\" << endl;\n        }\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    double cp, sp;\n    if (scanf(\"%lf %lf\", &cp, &sp) == 2) {\n        if (sp >= cp) {\n            double profit = sp - cp;\n            double pct = (profit / cp) * 100.0;\n            printf(\"Profit: %.2f\\n\", profit);\n            printf(\"Profit Percentage: %.2f%%\\n\", pct);\n        } else {\n            double loss = cp - sp;\n            double pct = (loss / cp) * 100.0;\n            printf(\"Loss: %.2f\\n\", loss);\n            printf(\"Loss Percentage: %.2f%%\\n\", pct);\n        }\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "500 650", "expected_output": "Profit: 150.00\nProfit Percentage: 30.00%", "is_hidden": False, "weight": 1},
                    {"input_data": "1000 800", "expected_output": "Loss: 200.00\nLoss Percentage: 20.00%", "is_hidden": False, "weight": 1},
                    {"input_data": "400 400", "expected_output": "Profit: 0.00\nProfit Percentage: 0.00%", "is_hidden": True, "weight": 1},
                    {"input_data": "120 150", "expected_output": "Profit: 30.00\nProfit Percentage: 25.00%", "is_hidden": True, "weight": 1}
                ]
            },

            # 19
            {
                "order": 19,
                "title": "Calculate Age from Birth Year",
                "slug": "calculate-age-from-birth-year",
                "subtopic": "Real-World Date Arithmetic",
                "difficulty": "basic",
                "statement": "Given a person's birth year `birth_year` and the current reference year `current_year`, calculate their age in years and their approximate number of days lived (assuming 365 days per year).\n\nFormulas:\n- Age in Years = `current_year - birth_year`\n- Approximate Days = `(current_year - birth_year) * 365`\n\nOutput format:\n`Age: <age> years`\n`Approximate Days Lived: <days> days`",
                "input_format": "Two space-separated integers `birth_year` and `current_year` (where `current_year >= birth_year`).",
                "output_format": "Two lines displaying Age and Approximate Days Lived.",
                "constraints": "1900 <= birth_year <= current_year <= 2100",
                "examples": [
                    {
                        "input": "2002 2026",
                        "output": "Age: 24 years\nApproximate Days Lived: 8760 days",
                        "explanation": "2026 - 2002 = 24 years. 24 * 365 = 8760 days."
                    },
                    {
                        "input": "2000 2020",
                        "output": "Age: 20 years\nApproximate Days Lived: 7300 days",
                        "explanation": "2020 - 2000 = 20 years. 20 * 365 = 7300 days."
                    }
                ],
                "approach": "1. Read `birth_year` and `current_year`.\n2. Compute `age = current_year - birth_year`.\n3. Compute `days = age * 365`.\n4. Output the two formatted lines.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Date Math, Arithmetic, Variables, Beginner",
                "companies": "TCS, Infosys, Tech Mahindra",
                "estimated_time": "5 mins",
                "meta_title": "Calculate Age from Birth Year | Programming Basics",
                "meta_description": "Compute chronological intervals and day breakdowns in code on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        birth_year = int(tokens[0])\n        current_year = int(tokens[1])\n        age = current_year - birth_year\n        days = age * 365\n        print(f\"Age: {age} years\")\n        print(f\"Approximate Days Lived: {days} days\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const birth_year = parseInt(input[0], 10);\n    const current_year = parseInt(input[1], 10);\n    const age = current_year - birth_year;\n    const days = age * 365;\n    console.log(`Age: ${age} years`);\n    console.log(`Approximate Days Lived: ${days} days`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int birthYear = sc.nextInt();\n            int currentYear = sc.nextInt();\n            int age = currentYear - birthYear;\n            long days = (long) age * 365;\n            System.out.println(\"Age: \" + age + \" years\");\n            System.out.println(\"Approximate Days Lived: \" + days + \" days\");\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int birth_year, current_year;\n    if (cin >> birth_year >> current_year) {\n        int age = current_year - birth_year;\n        long long days = 1LL * age * 365;\n        cout << \"Age: \" << age << \" years\" << endl;\n        cout << \"Approximate Days Lived: \" << days << \" days\" << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    int birth_year, current_year;\n    if (scanf(\"%d %d\", &birth_year, &current_year) == 2) {\n        int age = current_year - birth_year;\n        long long days = 1LL * age * 365;\n        printf(\"Age: %d years\\n\", age);\n        printf(\"Approximate Days Lived: %lld days\\n\", days);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "2002 2026", "expected_output": "Age: 24 years\nApproximate Days Lived: 8760 days", "is_hidden": False, "weight": 1},
                    {"input_data": "2000 2020", "expected_output": "Age: 20 years\nApproximate Days Lived: 7300 days", "is_hidden": False, "weight": 1},
                    {"input_data": "1995 2025", "expected_output": "Age: 30 years\nApproximate Days Lived: 10950 days", "is_hidden": True, "weight": 1},
                    {"input_data": "2024 2024", "expected_output": "Age: 0 years\nApproximate Days Lived: 0 days", "is_hidden": True, "weight": 1}
                ]
            },

            # 20
            {
                "order": 20,
                "title": "Build Your First Mini Calculator",
                "slug": "build-your-first-mini-calculator",
                "subtopic": "Comprehensive Basics Milestone",
                "difficulty": "basic",
                "statement": "Congratulations on reaching the final milestone problem of the **Programming Basics** module! In this challenge, synthesize all the arithmetic, precision, and formatting skills you have learned to build a 5-function Mini Calculator.\n\nGiven two integers `A` and `B` (where `B != 0`), generate a structured calculation report showing:\n1. Addition: `Addition: A + B = <val>`\n2. Subtraction: `Subtraction: A - B = <val>`\n3. Multiplication: `Multiplication: A * B = <val>`\n4. Floating Division: `Division: A / B = <val>` (formatted to 2 decimal places)\n5. Modulo: `Modulo: A % B = <val>`",
                "input_format": "Two space-separated integers `A` and `B`.",
                "output_format": "Five lines formatted exactly as specified.",
                "constraints": "-10^5 <= A <= 10^5\n1 <= B <= 10^5",
                "examples": [
                    {
                        "input": "25 4",
                        "output": "Addition: 25 + 4 = 29\nSubtraction: 25 - 4 = 21\nMultiplication: 25 * 4 = 100\nDivision: 25 / 4 = 6.25\nModulo: 25 % 4 = 1",
                        "explanation": "25+4=29, 25-4=21, 25*4=100, 25/4=6.25, 25%4=1."
                    },
                    {
                        "input": "10 3",
                        "output": "Addition: 10 + 3 = 13\nSubtraction: 10 - 3 = 7\nMultiplication: 10 * 3 = 30\nDivision: 10 / 3 = 3.33\nModulo: 10 % 3 = 1",
                        "explanation": "10+3=13, 10-3=7, 10*3=30, 10/3=3.33, 10%3=1."
                    }
                ],
                "approach": "1. Read integers `A` and `B`.\n2. Compute addition `A + B`, subtraction `A - B`, multiplication `A * B`, float division `A / B` (formatted to 2 decimals), and modulo `A % B`.\n3. Output the 5 lines with exact label syntax.",
                "time_complexity": "O(1)",
                "space_complexity": "O(1)",
                "tags": "Calculator, Milestone, Arithmetic, Modulo, Precision",
                "companies": "Amazon, Microsoft, Google, TCS, Infosys",
                "estimated_time": "10 mins",
                "meta_title": "Build Your First Mini Calculator | Programming Basics",
                "meta_description": "Capstone milestone coding challenge for the Programming Basics module on CodexPetra.",
                "starter_code": {
                    "python": "import sys\n\ndef solve():\n    tokens = sys.stdin.read().split()\n    if len(tokens) >= 2:\n        a, b = int(tokens[0]), int(tokens[1])\n        print(f\"Addition: {a} + {b} = {a + b}\")\n        print(f\"Subtraction: {a} - {b} = {a - b}\")\n        print(f\"Multiplication: {a} * {b} = {a * b}\")\n        print(f\"Division: {a} / {b} = {a / b:.2f}\")\n        print(f\"Modulo: {a} % {b} = {a % b}\")\n\nif __name__ == '__main__':\n    solve()\n",
                    "javascript": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    const a = parseInt(input[0], 10);\n    const b = parseInt(input[1], 10);\n    console.log(`Addition: ${a} + ${b} = ${a + b}`);\n    console.log(`Subtraction: ${a} - ${b} = ${a - b}`);\n    console.log(`Multiplication: ${a} * ${b} = ${a * b}`);\n    console.log(`Division: ${a} / ${b} = ${(a / b).toFixed(2)}`);\n    console.log(`Modulo: ${a} % ${b} = ${a % b}`);\n}\n",
                    "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(\"Addition: \" + a + \" + \" + b + \" = \" + (a + b));\n            System.out.println(\"Subtraction: \" + a + \" - \" + b + \" = \" + (a - b));\n            System.out.println(\"Multiplication: \" + a + \" * \" + b + \" = \" + (a * b));\n            System.out.printf(\"Division: %d / %d = %.2f%n\", a, b, (double) a / b);\n            System.out.println(\"Modulo: \" + a + \" % \" + b + \" = \" + (a % b));\n        }\n    }\n}\n",
                    "cpp": "#include <iostream>\n#include <iomanip>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        cout << \"Addition: \" << a << \" + \" << b << \" = \" << (a + b) << endl;\n        cout << \"Subtraction: \" << a << \" - \" << b << \" = \" << (a - b) << endl;\n        cout << \"Multiplication: \" << a << \" * \" << b << \" = \" << (a * b) << endl;\n        cout << fixed << setprecision(2) << \"Division: \" << a << \" / \" << b << \" = \" << ((double)a / b) << endl;\n        cout << \"Modulo: \" << a << \" % \" << b << \" = \" << (a % b) << endl;\n    }\n    return 0;\n}\n",
                    "c": "#include <stdio.h>\n\nint main() {\n    long long a, b;\n    if (scanf(\"%lld %lld\", &a, &b) == 2) {\n        printf(\"Addition: %lld + %lld = %lld\\n\", a, b, a + b);\n        printf(\"Subtraction: %lld - %lld = %lld\\n\", a, b, a - b);\n        printf(\"Multiplication: %lld * %lld = %lld\\n\", a, b, a * b);\n        printf(\"Division: %lld / %lld = %.2f\\n\", a, b, (double)a / b);\n        printf(\"Modulo: %lld %% %lld = %lld\\n\", a, b, a % b);\n    }\n    return 0;\n}\n"
                },
                "test_cases": [
                    {"input_data": "25 4", "expected_output": "Addition: 25 + 4 = 29\nSubtraction: 25 - 4 = 21\nMultiplication: 25 * 4 = 100\nDivision: 25 / 4 = 6.25\nModulo: 25 % 4 = 1", "is_hidden": False, "weight": 1},
                    {"input_data": "10 3", "expected_output": "Addition: 10 + 3 = 13\nSubtraction: 10 - 3 = 7\nMultiplication: 10 * 3 = 30\nDivision: 10 / 3 = 3.33\nModulo: 10 % 3 = 1", "is_hidden": False, "weight": 1},
                    {"input_data": "100 20", "expected_output": "Addition: 100 + 20 = 120\nSubtraction: 100 - 20 = 80\nMultiplication: 100 * 20 = 2000\nDivision: 100 / 20 = 5.00\nModulo: 100 % 20 = 0", "is_hidden": True, "weight": 1},
                    {"input_data": "7 2", "expected_output": "Addition: 7 + 2 = 9\nSubtraction: 7 - 2 = 5\nMultiplication: 7 * 2 = 14\nDivision: 7 / 2 = 3.50\nModulo: 7 % 2 = 1", "is_hidden": True, "weight": 1}
                ]
            }
        ]

        created_count = 0
        updated_count = 0

        for q_data in questions_data:
            q_slug = q_data["slug"]
            test_cases = q_data.pop("test_cases", [])
            
            question, created = Question.objects.get_or_create(
                slug=q_slug,
                defaults={
                    "topic": topic,
                    "level": basic_level,
                    "title": q_data["title"],
                    "statement": q_data["statement"],
                    "input_format": q_data["input_format"],
                    "output_format": q_data["output_format"],
                    "constraints": q_data["constraints"],
                    "examples": json.dumps(q_data["examples"]),
                    "starter_code": json.dumps(q_data["starter_code"]),
                    "editorial": q_data["approach"],
                    "tags": q_data["tags"],
                    "companies": q_data["companies"],
                    "meta_title": q_data["meta_title"],
                    "meta_description": q_data["meta_description"],
                    "order": q_data["order"],
                    "is_published": True
                }
            )

            if not created:
                question.topic = topic
                question.level = basic_level
                question.title = q_data["title"]
                question.statement = q_data["statement"]
                question.input_format = q_data["input_format"]
                question.output_format = q_data["output_format"]
                question.constraints = q_data["constraints"]
                question.examples = json.dumps(q_data["examples"])
                question.starter_code = json.dumps(q_data["starter_code"])
                question.editorial = q_data["approach"]
                question.tags = q_data["tags"]
                question.companies = q_data["companies"]
                question.meta_title = q_data["meta_title"]
                question.meta_description = q_data["meta_description"]
                question.order = q_data["order"]
                question.is_published = True
                question.save()
                updated_count += 1
            else:
                created_count += 1

            # Sync Test Cases
            question.test_cases.all().delete()
            for tc in test_cases:
                TestCase.objects.create(
                    question=question,
                    input_data=tc["input_data"],
                    expected_output=tc["expected_output"],
                    is_hidden=tc.get("is_hidden", False),
                    weight=tc.get("weight", 1)
                )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully synced 20 Programming Basics questions! (Created: {created_count}, Updated: {updated_count})"
        ))

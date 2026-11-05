import json
from django.core.management.base import BaseCommand
from api.models import Topic, QuestionLevel, Question, TestCase

class Command(BaseCommand):
    help = 'Separates Conditional Statements and Loops, and seeds 20 dedicated Loop coding questions with 4-language visible driver codes'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("1. Updating Topic: Conditional Statements..."))
        
        # 1. Update existing Topic 10 or find by slug
        cond_topic = Topic.objects.filter(slug='conditions-loops').first()
        if not cond_topic:
            cond_topic = Topic.objects.filter(name__icontains='Conditions').first()
        
        if cond_topic:
            cond_topic.name = 'Conditional Statements'
            cond_topic.slug = 'conditional-statements'
            cond_topic.description = 'Master if-else statements, decision logic, nested conditionals, and switch-case branching.'
            cond_topic.order = 2
            cond_topic.save()
            self.stdout.write(self.style.SUCCESS(f"Updated Topic {cond_topic.id} to '{cond_topic.name}' (slug: {cond_topic.slug})"))
        else:
            cond_topic, _ = Topic.objects.get_or_create(
                slug='conditional-statements',
                defaults={
                    'name': 'Conditional Statements',
                    'description': 'Master if-else statements, decision logic, nested conditionals, and switch-case branching.',
                    'order': 2
                }
            )

        self.stdout.write(self.style.NOTICE("2. Creating/Updating Topic: Loops..."))
        loop_topic, _ = Topic.objects.get_or_create(
            slug='loops',
            defaults={
                'name': 'Loops',
                'description': 'Master while loops, for loops, nested loops, break, continue, and repetition logic.',
                'order': 3
            }
        )
        loop_topic.name = 'Loops'
        loop_topic.description = 'Master while loops, for loops, nested loops, break, continue, and repetition logic.'
        loop_topic.order = 3
        loop_topic.save()

        # Update order of subsequent topics so roadmap stays sequential
        topic_orders = {
            'programming-basics': 1,
            'conditional-statements': 2,
            'loops': 3,
            'number-problems': 4,
            'patterns': 5,
            'functions': 6,
            'arrays': 7,
            'strings': 8,
            'searching-sorting': 9,
            'hashing': 10,
            'two-pointers': 11,
            'sliding-window': 12,
            'linked-list': 13,
            'stack-queue': 14,
            'recursion': 15,
            'trees': 16,
            'graphs': 17,
            'greedy': 18,
            'dynamic-programming': 19,
            'interview-problems': 20,
        }
        for slug, order in topic_orders.items():
            Topic.objects.filter(slug=slug).update(order=order)

        # Question Levels for Loops
        lvl_easy, _ = QuestionLevel.objects.get_or_create(topic=loop_topic, level='easy')
        lvl_medium, _ = QuestionLevel.objects.get_or_create(topic=loop_topic, level='medium')

        self.stdout.write(self.style.NOTICE("3. Seeding 20 Loop Questions..."))

        def make_single_arg_codes(fn_name, arg_name="n", arg_type="int"):
            starter = {
                "python": (
                    f"def {fn_name}({arg_name}):\n"
                    f"    # Write your code here\n"
                    f"    pass\n\n"
                    f"if __name__ == '__main__':\n"
                    f"    {arg_name} = int(input().strip())\n"
                    f"    {fn_name}({arg_name})\n"
                ),
                "c": (
                    f"#include <stdio.h>\n\n"
                    f"void {fn_name}({arg_type} {arg_name}) {{\n"
                    f"    // Write your code here\n"
                    f"}}\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg_name};\n"
                    f"    if (scanf(\"%d\", &{arg_name}) == 1) {{\n"
                    f"        {fn_name}({arg_name});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "cpp": (
                    f"#include <iostream>\n"
                    f"using namespace std;\n\n"
                    f"void {fn_name}({arg_type} {arg_name}) {{\n"
                    f"    // Write your code here\n"
                    f"}}\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg_name};\n"
                    f"    if (cin >> {arg_name}) {{\n"
                    f"        {fn_name}({arg_name});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "java": (
                    f"import java.util.Scanner;\n\n"
                    f"public class Main {{\n"
                    f"    public static void {fn_name}({arg_type} {arg_name}) {{\n"
                    f"        // Write your code here\n"
                    f"    }}\n\n"
                    f"    public static void main(String[] args) {{\n"
                    f"        Scanner sc = new Scanner(System.in);\n"
                    f"        if (sc.hasNextInt()) {{\n"
                    f"            {arg_type} {arg_name} = sc.nextInt();\n"
                    f"            {fn_name}({arg_name});\n"
                    f"        }}\n"
                    f"    }}\n"
                    f"}}\n"
                )
            }
            driver = {
                "python": (
                    f"if __name__ == '__main__':\n"
                    f"    {arg_name} = int(input().strip())\n"
                    f"    {fn_name}({arg_name})\n"
                ),
                "c": (
                    f"#include <stdio.h>\n\n"
                    f"void {fn_name}({arg_type} {arg_name});\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg_name};\n"
                    f"    if (scanf(\"%d\", &{arg_name}) == 1) {{\n"
                    f"        {fn_name}({arg_name});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "cpp": (
                    f"#include <iostream>\n"
                    f"using namespace std;\n\n"
                    f"void {fn_name}({arg_type} {arg_name});\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg_name};\n"
                    f"    if (cin >> {arg_name}) {{\n"
                    f"        {fn_name}({arg_name});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "java": (
                    f"import java.util.*;\n\n"
                    f"public class Main {{\n"
                    f"    // DRIVER_PLACEHOLDER\n\n"
                    f"    public static void main(String[] args) {{\n"
                    f"        Scanner sc = new Scanner(System.in);\n"
                    f"        if (sc.hasNextInt()) {{\n"
                    f"            {arg_type} {arg_name} = sc.nextInt();\n"
                    f"            {fn_name}({arg_name});\n"
                    f"        }}\n"
                    f"    }}\n"
                    f"}}\n"
                )
            }
            return starter, driver

        def make_two_arg_codes(fn_name, arg1="a", arg2="b", arg_type="int"):
            starter = {
                "python": (
                    f"def {fn_name}({arg1}, {arg2}):\n"
                    f"    # Write your code here\n"
                    f"    pass\n\n"
                    f"if __name__ == '__main__':\n"
                    f"    import sys\n"
                    f"    tokens = sys.stdin.read().split()\n"
                    f"    if len(tokens) >= 2:\n"
                    f"        {arg1} = int(tokens[0])\n"
                    f"        {arg2} = int(tokens[1])\n"
                    f"        {fn_name}({arg1}, {arg2})\n"
                ),
                "c": (
                    f"#include <stdio.h>\n\n"
                    f"void {fn_name}({arg_type} {arg1}, {arg_type} {arg2}) {{\n"
                    f"    // Write your code here\n"
                    f"}}\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg1}, {arg2};\n"
                    f"    if (scanf(\"%d %d\", &{arg1}, &{arg2}) == 2) {{\n"
                    f"        {fn_name}({arg1}, {arg2});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "cpp": (
                    f"#include <iostream>\n"
                    f"using namespace std;\n\n"
                    f"void {fn_name}({arg_type} {arg1}, {arg_type} {arg2}) {{\n"
                    f"    // Write your code here\n"
                    f"}}\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg1}, {arg2};\n"
                    f"    if (cin >> {arg1} >> {arg2}) {{\n"
                    f"        {fn_name}({arg1}, {arg2});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "java": (
                    f"import java.util.Scanner;\n\n"
                    f"public class Main {{\n"
                    f"    public static void {fn_name}({arg_type} {arg1}, {arg_type} {arg2}) {{\n"
                    f"        // Write your code here\n"
                    f"    }}\n\n"
                    f"    public static void main(String[] args) {{\n"
                    f"        Scanner sc = new Scanner(System.in);\n"
                    f"        if (sc.hasNextInt()) {{\n"
                    f"            {arg_type} {arg1} = sc.nextInt();\n"
                    f"            {arg_type} {arg2} = sc.nextInt();\n"
                    f"            {fn_name}({arg1}, {arg2});\n"
                    f"        }}\n"
                    f"    }}\n"
                    f"}}\n"
                )
            }
            driver = {
                "python": (
                    f"if __name__ == '__main__':\n"
                    f"    import sys\n"
                    f"    tokens = sys.stdin.read().split()\n"
                    f"    if len(tokens) >= 2:\n"
                    f"        {arg1} = int(tokens[0])\n"
                    f"        {arg2} = int(tokens[1])\n"
                    f"        {fn_name}({arg1}, {arg2})\n"
                ),
                "c": (
                    f"#include <stdio.h>\n\n"
                    f"void {fn_name}({arg_type} {arg1}, {arg_type} {arg2});\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg1}, {arg2};\n"
                    f"    if (scanf(\"%d %d\", &{arg1}, &{arg2}) == 2) {{\n"
                    f"        {fn_name}({arg1}, {arg2});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "cpp": (
                    f"#include <iostream>\n"
                    f"using namespace std;\n\n"
                    f"void {fn_name}({arg_type} {arg1}, {arg_type} {arg2});\n\n"
                    f"int main() {{\n"
                    f"    {arg_type} {arg1}, {arg2};\n"
                    f"    if (cin >> {arg1} >> {arg2}) {{\n"
                    f"        {fn_name}({arg1}, {arg2});\n"
                    f"    }}\n"
                    f"    return 0;\n"
                    f"}}\n"
                ),
                "java": (
                    f"import java.util.*;\n\n"
                    f"public class Main {{\n"
                    f"    // DRIVER_PLACEHOLDER\n\n"
                    f"    public static void main(String[] args) {{\n"
                    f"        Scanner sc = new Scanner(System.in);\n"
                    f"        if (sc.hasNextInt()) {{\n"
                    f"            {arg_type} {arg1} = sc.nextInt();\n"
                    f"            {arg_type} {arg2} = sc.nextInt();\n"
                    f"            {fn_name}({arg1}, {arg2});\n"
                    f"        }}\n"
                    f"    }}\n"
                    f"}}\n"
                )
            }
            return starter, driver

        problems = [
            # 1. Print Numbers from 1 to N
            {
                "order": 1,
                "title": "Print Numbers from 1 to N",
                "slug": "print-numbers-from-1-to-n",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, print all numbers from `1` to `n` in increasing order "
                    "separated by a single space using a loop.\n\n"
                    "**Problem Description:** Iterative loops are fundamental for traversing ranges. "
                    "In this challenge, you will implement a loop (for or while) that counts from 1 up to n."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print all integers from `1` to `n` on a single line separated by a space.",
                "constraints": "1 <= n <= 1000",
                "notes": "Important Instructions: Print directly inside your function. Do not use arrays, lists, or built-in range shortcuts.",
                "examples": [
                    {"input": "5", "output": "1 2 3 4 5", "explanation": "The numbers from 1 to 5 are 1, 2, 3, 4, and 5."}
                ],
                "fn_name": "print_1_to_n",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "5", "output": "1 2 3 4 5", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "8", "output": "1 2 3 4 5 6 7 8", "hidden": True},
                    {"input": "15", "output": " ".join(str(i) for i in range(1, 16)), "hidden": True},
                    {"input": "30", "output": " ".join(str(i) for i in range(1, 31)), "hidden": True},
                ]
            },

            # 2. Print Numbers from N to 1
            {
                "order": 2,
                "title": "Print Numbers from N to 1",
                "slug": "print-numbers-from-n-to-1",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, print all numbers in reverse order from `n` down to `1` "
                    "separated by a single space using a loop.\n\n"
                    "**Problem Description:** Reverse iteration is commonly used for countdowns, backtracking, and reverse scanning. "
                    "Use a decrementing loop that starts at n and stops after printing 1."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print all integers from `n` down to `1` on a single line separated by a space.",
                "constraints": "1 <= n <= 1000",
                "notes": "Important Instructions: Decrement from n down to 1 inside your function. Do not use arrays, lists, or collections.",
                "examples": [
                    {"input": "5", "output": "5 4 3 2 1", "explanation": "Counting down from 5 to 1 gives 5, 4, 3, 2, 1."}
                ],
                "fn_name": "print_n_to_1",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "5", "output": "5 4 3 2 1", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "7", "output": "7 6 5 4 3 2 1", "hidden": True},
                    {"input": "15", "output": " ".join(str(i) for i in range(15, 0, -1)), "hidden": True},
                    {"input": "30", "output": " ".join(str(i) for i in range(30, 0, -1)), "hidden": True},
                ]
            },

            # 3. Print Even Numbers from 1 to N
            {
                "order": 3,
                "title": "Print Even Numbers from 1 to N",
                "slug": "print-even-numbers-from-1-to-n",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, display all even numbers between `1` and `n` (inclusive) "
                    "in ascending order separated by a single space using a loop.\n\n"
                    "**Problem Description:** An even number is an integer that is exactly divisible by 2 (i.e. num % 2 == 0). "
                    "Iterate through the range from 1 to n and print only the even values."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print all even numbers between `1` and `n` separated by a space.",
                "constraints": "1 <= n <= 1000",
                "notes": "Important Instructions: Use an if condition inside the loop or increment with step 2 starting from 2.",
                "examples": [
                    {"input": "10", "output": "2 4 6 8 10", "explanation": "Even numbers up to 10 are 2, 4, 6, 8, 10."}
                ],
                "fn_name": "print_even_numbers",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "10", "output": "2 4 6 8 10", "hidden": False},
                    {"input": "2", "output": "2", "hidden": True},
                    {"input": "7", "output": "2 4 6", "hidden": True},
                    {"input": "16", "output": " ".join(str(i) for i in range(2, 17, 2)), "hidden": True},
                    {"input": "30", "output": " ".join(str(i) for i in range(2, 31, 2)), "hidden": True},
                ]
            },

            # 4. Print Odd Numbers from 1 to N
            {
                "order": 4,
                "title": "Print Odd Numbers from 1 to N",
                "slug": "print-odd-numbers-from-1-to-n",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, display all odd numbers between `1` and `n` (inclusive) "
                    "in ascending order separated by a single space using a loop.\n\n"
                    "**Problem Description:** An odd number is an integer not divisible by 2 (i.e. num % 2 != 0). "
                    "Use a loop to iterate from 1 to n and print all odd values."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print all odd numbers between `1` and `n` separated by a space.",
                "constraints": "1 <= n <= 1000",
                "notes": "Important Instructions: Print directly inside your function separated by a space.",
                "examples": [
                    {"input": "9", "output": "1 3 5 7 9", "explanation": "Odd numbers between 1 and 9 are 1, 3, 5, 7, 9."}
                ],
                "fn_name": "print_odd_numbers",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "9", "output": "1 3 5 7 9", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "6", "output": "1 3 5", "hidden": True},
                    {"input": "15", "output": " ".join(str(i) for i in range(1, 16, 2)), "hidden": True},
                    {"input": "25", "output": " ".join(str(i) for i in range(1, 26, 2)), "hidden": True},
                ]
            },

            # 5. Sum of First N Natural Numbers
            {
                "order": 5,
                "title": "Sum of First N Natural Numbers",
                "slug": "sum-of-first-n-natural-numbers",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, calculate and print the sum of the first `n` natural numbers "
                    "(1 + 2 + 3 + ... + n) using a loop.\n\n"
                    "**Problem Description:** Accumulation in a loop is a core algorithmic pattern. "
                    "Maintain a running sum variable, initialize it to 0, and add each number from 1 to n."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the sum.",
                "constraints": "1 <= n <= 10000",
                "notes": "Important Instructions: Calculate the sum iteratively using a loop. Do not use direct mathematical formulas.",
                "examples": [
                    {"input": "5", "output": "15", "explanation": "1 + 2 + 3 + 4 + 5 = 15."}
                ],
                "fn_name": "sum_natural_numbers",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "5", "output": "15", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "10", "output": "55", "hidden": True},
                    {"input": "100", "output": "5050", "hidden": True},
                    {"input": "1000", "output": "500500", "hidden": True},
                ]
            },

            # 6. Multiplication Table
            {
                "order": 6,
                "title": "Multiplication Table",
                "slug": "multiplication-table",
                "level": lvl_easy,
                "statement": (
                    "Given an integer `n`, print its multiplication table from 1 to 10 using a loop.\n\n"
                    "**Problem Description:** For an integer n, print 10 lines of multiplication products. "
                    "Each line must strictly follow the format: `<n> x <i> = <n*i>`."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print 10 lines, where each line has the format `<n> x <i> = <n*i>` for `i` from 1 to 10.",
                "constraints": "1 <= n <= 1000",
                "notes": "Important Instructions: Maintain exact spacing around 'x' and '=' as specified in the output format.",
                "examples": [
                    {
                        "input": "5",
                        "output": "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50",
                        "explanation": "Multiplication table of 5 from 1 to 10."
                    }
                ],
                "fn_name": "multiplication_table",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "5", "output": "\n".join(f"5 x {i} = {5*i}" for i in range(1, 11)), "hidden": False},
                    {"input": "1", "output": "\n".join(f"1 x {i} = {1*i}" for i in range(1, 11)), "hidden": True},
                    {"input": "7", "output": "\n".join(f"7 x {i} = {7*i}" for i in range(1, 11)), "hidden": True},
                    {"input": "12", "output": "\n".join(f"12 x {i} = {12*i}" for i in range(1, 11)), "hidden": True},
                    {"input": "25", "output": "\n".join(f"25 x {i} = {25*i}" for i in range(1, 11)), "hidden": True},
                ]
            },

            # 7. Count Numbers Divisible by K
            {
                "order": 7,
                "title": "Count Numbers Divisible by K",
                "slug": "count-numbers-divisible-by-k",
                "level": lvl_easy,
                "statement": (
                    "Given two positive integers `n` and `k`, count how many numbers between `1` and `n` (inclusive) "
                    "are divisible by `k` using a loop. Print the total count.\n\n"
                    "**Problem Description:** Iterate through all numbers from 1 to n, check if the current number is "
                    "evenly divisible by k (`i % k == 0`), and increment your counter."
                ),
                "input_format": "Two space-separated integers `n` and `k`.",
                "output_format": "Print a single integer representing the count of numbers divisible by `k`.",
                "constraints": "1 <= n <= 100000, 1 <= k <= 100000",
                "notes": "Important Instructions: Use a loop and conditional check to calculate the count.",
                "examples": [
                    {"input": "20 4", "output": "5", "explanation": "The numbers divisible by 4 up to 20 are 4, 8, 12, 16, 20 (5 numbers)."}
                ],
                "fn_name": "count_divisible_by_k",
                "is_two_arg": True,
                "arg1": "n",
                "arg2": "k",
                "test_cases": [
                    {"input": "20 4", "output": "5", "hidden": False},
                    {"input": "10 2", "output": "5", "hidden": True},
                    {"input": "7 8", "output": "0", "hidden": True},
                    {"input": "100 7", "output": "14", "hidden": True},
                    {"input": "50 5", "output": "10", "hidden": True},
                ]
            },

            # 8. Sum of Even Numbers
            {
                "order": 8,
                "title": "Sum of Even Numbers",
                "slug": "sum-of-even-numbers",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, calculate and print the sum of all even numbers "
                    "between `1` and `n` (inclusive) using a loop.\n\n"
                    "**Problem Description:** Loop through the numbers from 1 to n, detect even numbers, "
                    "and accumulate their sum."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the sum of even numbers.",
                "constraints": "1 <= n <= 10000",
                "notes": "Important Instructions: Accumulate only the even values using an accumulator variable.",
                "examples": [
                    {"input": "6", "output": "12", "explanation": "Even numbers are 2, 4, 6. Sum is 2 + 4 + 6 = 12."}
                ],
                "fn_name": "sum_of_even",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "6", "output": "12", "hidden": False},
                    {"input": "1", "output": "0", "hidden": True},
                    {"input": "10", "output": "30", "hidden": True},
                    {"input": "20", "output": "110", "hidden": True},
                    {"input": "100", "output": "2550", "hidden": True},
                ]
            },

            # 9. Sum of Odd Numbers
            {
                "order": 9,
                "title": "Sum of Odd Numbers",
                "slug": "sum-of-odd-numbers",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, calculate and print the sum of all odd numbers "
                    "between `1` and `n` (inclusive) using a loop.\n\n"
                    "**Problem Description:** Iterate from 1 to n, find all numbers where `i % 2 != 0`, "
                    "and accumulate their sum."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the sum of odd numbers.",
                "constraints": "1 <= n <= 10000",
                "notes": "Important Instructions: Iterate and accumulate odd numbers inside your loop.",
                "examples": [
                    {"input": "5", "output": "9", "explanation": "Odd numbers are 1, 3, 5. Sum is 1 + 3 + 5 = 9."}
                ],
                "fn_name": "sum_of_odd",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "5", "output": "9", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "10", "output": "25", "hidden": True},
                    {"input": "20", "output": "100", "hidden": True},
                    {"input": "100", "output": "2500", "hidden": True},
                ]
            },

            # 10. Count Multiples of 5
            {
                "order": 10,
                "title": "Count Multiples of 5",
                "slug": "count-multiples-of-5",
                "level": lvl_easy,
                "statement": (
                    "Given an integer `n`, count how many numbers between `1` and `n` (inclusive) "
                    "are multiples of 5 using a loop. Print the total count.\n\n"
                    "**Problem Description:** A multiple of 5 satisfies `i % 5 == 0`. Use a loop to iterate "
                    "over the range and count the matching numbers."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the count of multiples of 5.",
                "constraints": "1 <= n <= 100000",
                "notes": "Important Instructions: Count using an integer variable inside your loop.",
                "examples": [
                    {"input": "24", "output": "4", "explanation": "Multiples of 5 up to 24 are 5, 10, 15, 20 (4 numbers)."}
                ],
                "fn_name": "count_multiples_of_5",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "24", "output": "4", "hidden": False},
                    {"input": "4", "output": "0", "hidden": True},
                    {"input": "5", "output": "1", "hidden": True},
                    {"input": "50", "output": "10", "hidden": True},
                    {"input": "100", "output": "20", "hidden": True},
                ]
            },

            # 11. Print Numbers in a Given Range
            {
                "order": 11,
                "title": "Print Numbers in a Given Range",
                "slug": "print-numbers-in-a-given-range",
                "level": lvl_medium,
                "statement": (
                    "Given two integers `l` and `r` where `l <= r`, print all numbers from `l` to `r` "
                    "(inclusive) in ascending order separated by a single space using a loop.\n\n"
                    "**Problem Description:** Range queries require handling variable start and end bounds, "
                    "including negative numbers, zero, and positive bounds."
                ),
                "input_format": "Two space-separated integers `l` and `r`.",
                "output_format": "Print all integers from `l` to `r` separated by a space on one line.",
                "constraints": "-1000 <= l <= r <= 1000",
                "notes": "Important Instructions: Handle negative values and zero correctly. Print on a single line separated by a space.",
                "examples": [
                    {"input": "3 8", "output": "3 4 5 6 7 8", "explanation": "Numbers from 3 to 8 are 3, 4, 5, 6, 7, 8."}
                ],
                "fn_name": "print_range",
                "is_two_arg": True,
                "arg1": "l",
                "arg2": "r",
                "test_cases": [
                    {"input": "3 8", "output": "3 4 5 6 7 8", "hidden": False},
                    {"input": "5 5", "output": "5", "hidden": True},
                    {"input": "-3 3", "output": "-3 -2 -1 0 1 2 3", "hidden": True},
                    {"input": "10 15", "output": "10 11 12 13 14 15", "hidden": True},
                    {"input": "-10 -6", "output": "-10 -9 -8 -7 -6", "hidden": True},
                ]
            },

            # 12. Sum of Numbers in a Given Range
            {
                "order": 12,
                "title": "Sum of Numbers in a Given Range",
                "slug": "sum-of-numbers-in-a-given-range",
                "level": lvl_medium,
                "statement": (
                    "Given two integers `l` and `r` where `l <= r`, calculate and print the sum of all "
                    "integers between `l` and `r` (inclusive) using a loop.\n\n"
                    "**Problem Description:** Iterate from `l` to `r` and accumulate the sum of each integer. "
                    "Be mindful of negative numbers where signs cancel out."
                ),
                "input_format": "Two space-separated integers `l` and `r`.",
                "output_format": "Print a single integer representing the sum.",
                "constraints": "-10000 <= l <= r <= 10000",
                "notes": "Important Instructions: Sum the numbers iteratively in a loop.",
                "examples": [
                    {"input": "1 4", "output": "10", "explanation": "1 + 2 + 3 + 4 = 10."}
                ],
                "fn_name": "sum_in_range",
                "is_two_arg": True,
                "arg1": "l",
                "arg2": "r",
                "test_cases": [
                    {"input": "1 4", "output": "10", "hidden": False},
                    {"input": "5 5", "output": "5", "hidden": True},
                    {"input": "-2 2", "output": "0", "hidden": True},
                    {"input": "10 20", "output": "165", "hidden": True},
                    {"input": "1 100", "output": "5050", "hidden": True},
                ]
            },

            # 13. Count Positive Numbers Divisible by 3
            {
                "order": 13,
                "title": "Count Positive Numbers Divisible by 3",
                "slug": "count-positive-numbers-divisible-by-3",
                "level": lvl_easy,
                "statement": (
                    "Given a positive integer `n`, count and print how many numbers between `1` and `n` "
                    "(inclusive) are divisible by 3 using a loop.\n\n"
                    "**Problem Description:** A positive integer is divisible by 3 if the remainder when "
                    "divided by 3 is 0 (`i % 3 == 0`). Iterate from 1 to n and count how many numbers satisfy this condition."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the count.",
                "constraints": "1 <= n <= 100000",
                "notes": "Important Instructions: Use a loop with a conditional check to increment your count.",
                "examples": [
                    {"input": "10", "output": "3", "explanation": "The numbers divisible by 3 up to 10 are 3, 6, 9 (3 numbers)."}
                ],
                "fn_name": "count_divisible_by_3",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "10", "output": "3", "hidden": False},
                    {"input": "2", "output": "0", "hidden": True},
                    {"input": "3", "output": "1", "hidden": True},
                    {"input": "30", "output": "10", "hidden": True},
                    {"input": "99", "output": "33", "hidden": True},
                ]
            },

            # 14. Print Squares from 1 to N
            {
                "order": 14,
                "title": "Print Squares from 1 to N",
                "slug": "print-squares-from-1-to-n",
                "level": lvl_medium,
                "statement": (
                    "Given a positive integer `n`, print the squares of all numbers from `1` to `n` "
                    "in ascending order separated by a single space using a loop.\n\n"
                    "**Problem Description:** The square of an integer i is `i * i`. Iterate from 1 to n "
                    "and print each square separated by a single space."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the squares of numbers from `1` to `n` separated by a single space.",
                "constraints": "1 <= n <= 100",
                "notes": "Important Instructions: Compute the product i * i in each iteration of the loop.",
                "examples": [
                    {"input": "5", "output": "1 4 9 16 25", "explanation": "1^2=1, 2^2=4, 3^2=9, 4^2=16, 5^2=25."}
                ],
                "fn_name": "print_squares",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "5", "output": "1 4 9 16 25", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "3", "output": "1 4 9", "hidden": True},
                    {"input": "8", "output": "1 4 9 16 25 36 49 64", "hidden": True},
                    {"input": "10", "output": "1 4 9 16 25 36 49 64 81 100", "hidden": True},
                ]
            },

            # 15. Print Cubes from 1 to N
            {
                "order": 15,
                "title": "Print Cubes from 1 to N",
                "slug": "print-cubes-from-1-to-n",
                "level": lvl_medium,
                "statement": (
                    "Given a positive integer `n`, print the cubes of all numbers from `1` to `n` "
                    "in ascending order separated by a single space using a loop.\n\n"
                    "**Problem Description:** The cube of an integer i is `i * i * i`. "
                    "Use a loop running from 1 to n to calculate and print each cube separated by a space."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print the cubes of numbers from `1` to `n` separated by a single space.",
                "constraints": "1 <= n <= 50",
                "notes": "Important Instructions: Calculate i * i * i in each iteration.",
                "examples": [
                    {"input": "4", "output": "1 8 27 64", "explanation": "1^3=1, 2^3=8, 3^3=27, 4^3=64."}
                ],
                "fn_name": "print_cubes",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "4", "output": "1 8 27 64", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "3", "output": "1 8 27", "hidden": True},
                    {"input": "6", "output": "1 8 27 64 125 216", "hidden": True},
                    {"input": "10", "output": "1 8 27 64 125 216 343 512 729 1000", "hidden": True},
                ]
            },

            # 16. Sum of Squares
            {
                "order": 16,
                "title": "Sum of Squares",
                "slug": "sum-of-squares",
                "level": lvl_medium,
                "statement": (
                    "Given a positive integer `n`, calculate and print the sum of squares of the first `n` "
                    "natural numbers (1^2 + 2^2 + 3^2 + ... + n^2) using a loop.\n\n"
                    "**Problem Description:** Initialize an accumulator to 0. In each step of a loop from 1 to n, "
                    "add `i * i` to the accumulator, then print the final sum."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the sum of squares.",
                "constraints": "1 <= n <= 100",
                "notes": "Important Instructions: Calculate iteratively using a loop.",
                "examples": [
                    {"input": "3", "output": "14", "explanation": "1^2 + 2^2 + 3^2 = 1 + 4 + 9 = 14."}
                ],
                "fn_name": "sum_of_squares",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "3", "output": "14", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "5", "output": "55", "hidden": True},
                    {"input": "10", "output": "385", "hidden": True},
                    {"input": "20", "output": "2870", "hidden": True},
                ]
            },

            # 17. Sum of Cubes
            {
                "order": 17,
                "title": "Sum of Cubes",
                "slug": "sum-of-cubes",
                "level": lvl_medium,
                "statement": (
                    "Given a positive integer `n`, calculate and print the sum of cubes of the first `n` "
                    "natural numbers (1^3 + 2^3 + 3^3 + ... + n^3) using a loop.\n\n"
                    "**Problem Description:** Initialize an accumulator to 0. In each iteration from 1 to n, "
                    "add `i * i * i` to the accumulator, then print the final sum."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the sum of cubes.",
                "constraints": "1 <= n <= 50",
                "notes": "Important Instructions: Compute the cubes inside a loop and accumulate their total.",
                "examples": [
                    {"input": "3", "output": "36", "explanation": "1^3 + 2^3 + 3^3 = 1 + 8 + 27 = 36."}
                ],
                "fn_name": "sum_of_cubes",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "3", "output": "36", "hidden": False},
                    {"input": "1", "output": "1", "hidden": True},
                    {"input": "4", "output": "100", "hidden": True},
                    {"input": "10", "output": "3025", "hidden": True},
                    {"input": "15", "output": "14400", "hidden": True},
                ]
            },

            # 18. Find Power of a Number
            {
                "order": 18,
                "title": "Find Power of a Number",
                "slug": "find-power-of-a-number",
                "level": lvl_medium,
                "statement": (
                    "Given base integer `a` and exponent integer `b` (b >= 0), calculate and print `a^b` "
                    "using repeated multiplication with a loop.\n\n"
                    "**Problem Description:** Exponentiation can be calculated by multiplying the base `a` "
                    "repeatedly `b` times. If `b == 0`, any non-zero number raised to power 0 equals 1."
                ),
                "input_format": "Two space-separated integers `a` and `b`.",
                "output_format": "Print a single integer representing `a^b`.",
                "constraints": "1 <= a <= 20, 0 <= b <= 10",
                "notes": "Important Instructions: Use repeated multiplication inside a loop. Do not use built-in power operators (like ** or pow()).",
                "examples": [
                    {"input": "2 5", "output": "32", "explanation": "2 multiplied 5 times: 2 * 2 * 2 * 2 * 2 = 32."}
                ],
                "fn_name": "find_power",
                "is_two_arg": True,
                "arg1": "a",
                "arg2": "b",
                "test_cases": [
                    {"input": "2 5", "output": "32", "hidden": False},
                    {"input": "3 0", "output": "1", "hidden": True},
                    {"input": "5 3", "output": "125", "hidden": True},
                    {"input": "2 10", "output": "1024", "hidden": True},
                    {"input": "7 2", "output": "49", "hidden": True},
                ]
            },

            # 19. Count Numbers Ending with Zero
            {
                "order": 19,
                "title": "Count Numbers Ending with Zero",
                "slug": "count-numbers-ending-with-zero",
                "level": lvl_medium,
                "statement": (
                    "Given a positive integer `n`, count and print how many numbers between `1` and `n` "
                    "(inclusive) end with the digit zero using a loop.\n\n"
                    "**Problem Description:** A number ends with zero if its last digit is 0, which corresponds to "
                    "`num % 10 == 0` (multiples of 10). Iterate through 1 to n and count how many numbers end with 0."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print a single integer representing the count of numbers ending with zero.",
                "constraints": "1 <= n <= 100000",
                "notes": "Important Instructions: Check condition `i % 10 == 0` inside your loop.",
                "examples": [
                    {"input": "35", "output": "3", "explanation": "Numbers ending in zero up to 35 are 10, 20, 30 (3 numbers)."}
                ],
                "fn_name": "count_ending_with_zero",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "35", "output": "3", "hidden": False},
                    {"input": "9", "output": "0", "hidden": True},
                    {"input": "10", "output": "1", "hidden": True},
                    {"input": "50", "output": "5", "hidden": True},
                    {"input": "100", "output": "10", "hidden": True},
                ]
            },

            # 20. Print Numbers Divisible by Both 3 and 5
            {
                "order": 20,
                "title": "Print Numbers Divisible by Both 3 and 5",
                "slug": "print-numbers-divisible-by-both-3-and-5",
                "level": lvl_medium,
                "statement": (
                    "Given a positive integer `n`, print all numbers between `1` and `n` (inclusive) "
                    "that are divisible by both 3 and 5 in increasing order separated by a single space using a loop.\n\n"
                    "**Problem Description:** A number divisible by both 3 and 5 must satisfy `i % 3 == 0` and `i % 5 == 0` "
                    "(multiples of 15). Iterate from 1 to n and print all qualifying numbers."
                ),
                "input_format": "A single integer `n`.",
                "output_format": "Print numbers divisible by both 3 and 5 separated by a single space.",
                "constraints": "1 <= n <= 100000",
                "notes": "Important Instructions: Combine both divisibility checks inside your loop condition.",
                "examples": [
                    {"input": "50", "output": "15 30 45", "explanation": "Multiples of 15 up to 50 are 15, 30, and 45."}
                ],
                "fn_name": "print_divisible_by_3_and_5",
                "is_two_arg": False,
                "arg_name": "n",
                "test_cases": [
                    {"input": "50", "output": "15 30 45", "hidden": False},
                    {"input": "15", "output": "15", "hidden": True},
                    {"input": "35", "output": "15 30", "hidden": True},
                    {"input": "60", "output": "15 30 45 60", "hidden": True},
                    {"input": "100", "output": "15 30 45 60 75 90", "hidden": True},
                ]
            },
        ]

        created_count = 0
        updated_count = 0

        for p in problems:
            if p.get("is_two_arg"):
                starter_code_dict, driver_code_dict = make_two_arg_codes(p["fn_name"], p["arg1"], p["arg2"])
            else:
                starter_code_dict, driver_code_dict = make_single_arg_codes(p["fn_name"], p.get("arg_name", "n"))

            q, created = Question.objects.update_or_create(
                slug=p["slug"],
                defaults={
                    "topic": loop_topic,
                    "level": p["level"],
                    "title": p["title"],
                    "statement": p["statement"],
                    "input_format": p["input_format"],
                    "output_format": p["output_format"],
                    "constraints": p["constraints"],
                    "notes": p["notes"],
                    "examples": p["examples"],
                    "starter_code": json.dumps(starter_code_dict),
                    "driver_code": json.dumps(driver_code_dict),
                    "order": p["order"],
                    "is_published": True,
                    "time_limit": 2.0,
                    "memory_limit": 256,
                }
            )

            # Update test cases
            q.test_cases.all().delete()
            for tc_data in p["test_cases"]:
                TestCase.objects.create(
                    question=q,
                    input_data=tc_data["input"],
                    expected_output=tc_data["output"],
                    is_hidden=tc_data["hidden"],
                    weight=1
                )

            if created:
                created_count += 1
            else:
                updated_count += 1

            self.stdout.write(f"  [Q{p['order']:02d}] {p['title']} - {len(p['test_cases'])} test cases configured.")

        self.stdout.write(self.style.SUCCESS(
            f"\nSeeding completed! Created: {created_count}, Updated: {updated_count} questions under Topic 'Loops'."
        ))


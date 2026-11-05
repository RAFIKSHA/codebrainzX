import json
from django.core.management.base import BaseCommand
from api.models import Topic, QuestionLevel, Question, TestCase

class Command(BaseCommand):
    help = 'Updates Questions 1-10 of Arrays with professional LeetCode-style descriptions, visible driver code, and return-based format'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Updating Arrays Questions 1-10 to match format..."))

        topic = Topic.objects.filter(slug='arrays').first()
        if not topic:
            self.stdout.write(self.style.ERROR("Topic 'arrays' not found!"))
            return

        lvl_easy, _ = QuestionLevel.objects.get_or_create(topic=topic, level='easy')

        problems = [
            # 1. Find the Largest Element
            {
                "order": 1,
                "title": "Find the Largest Element",
                "slug": "find-the-largest-element",
                "statement": (
                    "Given an array of integers `arr`, find and return the largest element in the array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_largest(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the maximum element in the array.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n1 4 2 9 5",
                        "output": "9",
                        "explanation": "The largest element in the array [1, 4, 2, 9, 5] is 9."
                    }
                ],
                "py_fn": "find_largest",
                "cpp_fn": "findLargest",
                "java_fn": "findLargest",
                "c_fn": "findLargest",
                "kind": "int",
                "test_cases": [
                    {"input": "5\n1 4 2 9 5", "output": "9", "hidden": False},
                    {"input": "6\n-10 -20 -5 -30 -15 -8", "output": "-5", "hidden": True},
                    {"input": "1\n42", "output": "42", "hidden": True},
                    {"input": "4\n7 7 7 7", "output": "7", "hidden": True},
                    {"input": "5\n100 200 50 80 150", "output": "200", "hidden": True},
                    {"input": "3\n0 -10 -5", "output": "0", "hidden": True},
                ]
            },

            # 2. Find the Smallest Element
            {
                "order": 2,
                "title": "Find the Smallest Element",
                "slug": "find-the-smallest-element",
                "statement": (
                    "Given an array of integers `arr`, find and return the smallest element in the array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_smallest(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the minimum element in the array.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n7 2 8 1 5",
                        "output": "1",
                        "explanation": "The smallest element in the array [7, 2, 8, 1, 5] is 1."
                    }
                ],
                "py_fn": "find_smallest",
                "cpp_fn": "findSmallest",
                "java_fn": "findSmallest",
                "c_fn": "findSmallest",
                "kind": "int",
                "test_cases": [
                    {"input": "5\n7 2 8 1 5", "output": "1", "hidden": False},
                    {"input": "4\n-3 -10 5 -2", "output": "-10", "hidden": True},
                    {"input": "1\n-999", "output": "-999", "hidden": True},
                    {"input": "5\n15 15 15 15 15", "output": "15", "hidden": True},
                    {"input": "6\n10 50 4 20 8 3", "output": "3", "hidden": True},
                    {"input": "3\n0 10 5", "output": "0", "hidden": True},
                ]
            },

            # 3. Calculate Sum of Array Elements
            {
                "order": 3,
                "title": "Calculate Sum of Array Elements",
                "slug": "calculate-sum-of-array-elements",
                "statement": (
                    "Given an array of integers `arr`, calculate and return the sum of all elements in the array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `calculate_sum(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the total sum of all elements.",
                "constraints": "1 <= n <= 10^5\n-10^4 <= arr[i] <= 10^4",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "4\n1 2 3 4",
                        "output": "10",
                        "explanation": "1 + 2 + 3 + 4 = 10."
                    }
                ],
                "py_fn": "calculate_sum",
                "cpp_fn": "calculateSum",
                "java_fn": "calculateSum",
                "c_fn": "calculateSum",
                "kind": "int",
                "test_cases": [
                    {"input": "4\n1 2 3 4", "output": "10", "hidden": False},
                    {"input": "5\n10 -5 20 -10 5", "output": "20", "hidden": True},
                    {"input": "1\n100", "output": "100", "hidden": True},
                    {"input": "4\n-10 -20 -30 -40", "output": "-100", "hidden": True},
                    {"input": "6\n0 0 0 0 0 0", "output": "0", "hidden": True},
                    {"input": "3\n-5 0 5", "output": "0", "hidden": True},
                ]
            },

            # 4. Count Even Numbers
            {
                "order": 4,
                "title": "Count Even Numbers",
                "slug": "count-even-numbers",
                "statement": (
                    "Given an array of integers `arr`, count and return how many elements are even (`arr[i] % 2 == 0`).\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `count_even(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the count of even elements.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n1 2 3 4 6",
                        "output": "3",
                        "explanation": "The even numbers in the array are 2, 4, and 6 (count = 3)."
                    }
                ],
                "py_fn": "count_even",
                "cpp_fn": "countEven",
                "java_fn": "countEven",
                "c_fn": "countEven",
                "kind": "int",
                "test_cases": [
                    {"input": "5\n1 2 3 4 6", "output": "3", "hidden": False},
                    {"input": "4\n1 3 5 7", "output": "0", "hidden": True},
                    {"input": "5\n-2 -4 0 5 7", "output": "3", "hidden": True},
                    {"input": "4\n2 4 6 8", "output": "4", "hidden": True},
                    {"input": "1\n0", "output": "1", "hidden": True},
                    {"input": "3\n-1 -3 -5", "output": "0", "hidden": True},
                ]
            },

            # 5. Count Odd Numbers
            {
                "order": 5,
                "title": "Count Odd Numbers",
                "slug": "count-odd-numbers",
                "statement": (
                    "Given an array of integers `arr`, count and return how many elements are odd (`arr[i] % 2 != 0`).\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `count_odd(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the count of odd elements.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n1 2 3 4 5",
                        "output": "3",
                        "explanation": "The odd numbers in the array are 1, 3, and 5 (count = 3)."
                    }
                ],
                "py_fn": "count_odd",
                "cpp_fn": "countOdd",
                "java_fn": "countOdd",
                "c_fn": "countOdd",
                "kind": "int",
                "test_cases": [
                    {"input": "5\n1 2 3 4 5", "output": "3", "hidden": False},
                    {"input": "4\n2 4 6 8", "output": "0", "hidden": True},
                    {"input": "5\n-1 -3 2 4 -5", "output": "3", "hidden": True},
                    {"input": "4\n11 23 35 47", "output": "4", "hidden": True},
                    {"input": "1\n1", "output": "1", "hidden": True},
                    {"input": "3\n0 2 4", "output": "0", "hidden": True},
                ]
            },

            # 6. Reverse an Array
            {
                "order": 6,
                "title": "Reverse an Array",
                "slug": "reverse-an-array",
                "statement": (
                    "Given an array of integers `arr`, reverse the array elements and return the reversed array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `reverse_array(arr)`.\n\n"
                    "**CRITICAL:** You must return the reversed array. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return the array with elements in reversed order.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "4\n1 2 3 4",
                        "output": "4 3 2 1",
                        "explanation": "The array reversed becomes [4, 3, 2, 1]."
                    }
                ],
                "py_fn": "reverse_array",
                "cpp_fn": "reverseArray",
                "java_fn": "reverseArray",
                "c_fn": "reverseArray",
                "kind": "array",
                "test_cases": [
                    {"input": "4\n1 2 3 4", "output": "4 3 2 1", "hidden": False},
                    {"input": "5\n10 20 30 40 50", "output": "50 40 30 20 10", "hidden": True},
                    {"input": "1\n99", "output": "99", "hidden": True},
                    {"input": "3\n-5 0 5", "output": "5 0 -5", "hidden": True},
                    {"input": "6\n1 1 2 2 3 3", "output": "3 3 2 2 1 1", "hidden": True},
                    {"input": "4\n7 7 7 7", "output": "7 7 7 7", "hidden": True},
                ]
            },

            # 7. Search an Element
            {
                "order": 7,
                "title": "Search an Element",
                "slug": "search-an-element",
                "statement": (
                    "Given an integer array `arr` and a `target` integer, return `\"YES\"` if the target element exists in `arr`, otherwise return `\"NO\"`.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `search_element(arr, target)`.\n\n"
                    "**CRITICAL:** You must return the string result (\"YES\" or \"NO\"). Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.\nThe third line contains an integer `target`.",
                "output_format": "Return `\"YES\"` if target is found, otherwise return `\"NO\"`.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i], target <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "5\n10 20 30 40 50\n30",
                        "output": "YES",
                        "explanation": "30 is present at index 2, so the output is YES."
                    },
                    {
                        "input": "5\n10 20 30 40 50\n99",
                        "output": "NO",
                        "explanation": "99 is not present in the array, so the output is NO."
                    }
                ],
                "py_fn": "search_element",
                "cpp_fn": "searchElement",
                "java_fn": "searchElement",
                "c_fn": "searchElement",
                "kind": "search",
                "test_cases": [
                    {"input": "5\n10 20 30 40 50\n30", "output": "YES", "hidden": False},
                    {"input": "5\n10 20 30 40 50\n99", "output": "NO", "hidden": True},
                    {"input": "4\n-5 -10 15 20\n-10", "output": "YES", "hidden": True},
                    {"input": "1\n7\n7", "output": "YES", "hidden": True},
                    {"input": "1\n7\n8", "output": "NO", "hidden": True},
                    {"input": "5\n1 2 3 4 5\n1", "output": "YES", "hidden": True},
                ]
            },

            # 8. Count Occurrences of an Element
            {
                "order": 8,
                "title": "Count Occurrences of an Element",
                "slug": "count-occurrences-of-an-element",
                "statement": (
                    "Given an integer array `arr` and a `target` integer, return the frequency (count of occurrences) of `target` in the array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `count_occurrences(arr, target)`.\n\n"
                    "**CRITICAL:** You must return the integer count. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.\nThe third line contains an integer `target`.",
                "output_format": "Return a single integer representing how many times `target` appears in `arr`.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i], target <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "6\n1 2 2 3 2 4\n2",
                        "output": "3",
                        "explanation": "The number 2 appears 3 times in the array."
                    }
                ],
                "py_fn": "count_occurrences",
                "cpp_fn": "countOccurrences",
                "java_fn": "countOccurrences",
                "c_fn": "countOccurrences",
                "kind": "count_target",
                "test_cases": [
                    {"input": "6\n1 2 2 3 2 4\n2", "output": "3", "hidden": False},
                    {"input": "4\n1 2 3 4\n9", "output": "0", "hidden": True},
                    {"input": "5\n5 5 5 5 5\n5", "output": "5", "hidden": True},
                    {"input": "4\n-1 -2 -1 -3\n-1", "output": "2", "hidden": True},
                    {"input": "1\n42\n42", "output": "1", "hidden": True},
                    {"input": "5\n10 20 30 40 50\n30", "output": "1", "hidden": True},
                ]
            },

            # 9. Find the Average of Array Elements
            {
                "order": 9,
                "title": "Find the Average of Array Elements",
                "slug": "find-the-average-of-array-elements",
                "statement": (
                    "Given an array of integers `arr`, calculate and return the average (mean) of all elements in the array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_average(arr)`.\n\n"
                    "**CRITICAL:** You must return the average as a floating-point number. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a floating-point number representing the average of array elements.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "4\n10 20 30 40",
                        "output": "25.00",
                        "explanation": "(10 + 20 + 30 + 40) / 4 = 100 / 4 = 25.00."
                    }
                ],
                "py_fn": "find_average",
                "cpp_fn": "findAverage",
                "java_fn": "findAverage",
                "c_fn": "findAverage",
                "kind": "average",
                "test_cases": [
                    {"input": "4\n10 20 30 40", "output": "25.00", "hidden": False},
                    {"input": "3\n1 2 4", "output": "2.33", "hidden": True},
                    {"input": "5\n1 2 3 4 5", "output": "3.00", "hidden": True},
                    {"input": "2\n-10 -20", "output": "-15.00", "hidden": True},
                    {"input": "3\n-5 0 5", "output": "0.00", "hidden": True},
                    {"input": "1\n42", "output": "42.00", "hidden": True},
                ]
            },

            # 10. Print Positive Elements
            {
                "order": 10,
                "title": "Print Positive Elements",
                "slug": "print-positive-elements",
                "statement": (
                    "Given an array of integers `arr`, return a new array containing all strictly positive elements (`arr[i] > 0`) in their original order.\n\n"
                    "If no positive elements exist in `arr`, the function should return an empty array (or `[-1]` as handled by driver).\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `get_positive_elements(arr)`.\n\n"
                    "**CRITICAL:** You must return the result array. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return the array of positive elements, or an empty array if none exist.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "5\n-1 2 -3 4 5",
                        "output": "2 4 5",
                        "explanation": "Positive elements are 2, 4, 5."
                    },
                    {
                        "input": "3\n-1 -2 -3",
                        "output": "-1",
                        "explanation": "No positive elements exist, so the output is -1."
                    }
                ],
                "py_fn": "get_positive_elements",
                "cpp_fn": "getPositiveElements",
                "java_fn": "getPositiveElements",
                "c_fn": "getPositiveElements",
                "kind": "positive_elements",
                "test_cases": [
                    {"input": "5\n-1 2 -3 4 5", "output": "2 4 5", "hidden": False},
                    {"input": "3\n-1 -2 -3", "output": "-1", "hidden": True},
                    {"input": "4\n0 -5 0 -10", "output": "-1", "hidden": True},
                    {"input": "4\n10 20 30 40", "output": "10 20 30 40", "hidden": True},
                    {"input": "5\n-10 5 0 -2 8", "output": "5 8", "hidden": True},
                    {"input": "1\n7", "output": "7", "hidden": True},
                ]
            },
        ]

        for p in problems:
            py_fn = p["py_fn"]
            cpp_fn = p["cpp_fn"]
            java_fn = p["java_fn"]
            c_fn = p["c_fn"]
            kind = p["kind"]

            if kind == "int":
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print(result)\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"int {cpp_fn}(vector<int>& arr) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n\n"
                        f"    cout << {cpp_fn}(arr) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public int {java_fn}(int[] arr) {{\n"
                        f"        // Write your code here\n"
                        f"        return 0;\n"
                        f"    }}\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) {{\n"
                        f"            arr[i] = sc.nextInt();\n"
                        f"        }}\n\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.println(sol.{java_fn}(arr));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n\n"
                        f"int {c_fn}(int arr[], int n) {{\n"
                        f"    // Write your code here\n"
                        f"    return 0;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n\n"
                        f"    printf(\"%d\\n\", {c_fn}(arr, n));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
                driver_code = {
                    "python": (
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print(result)\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    cout << {cpp_fn}(arr) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    // DRIVER_PLACEHOLDER\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.println(sol.{java_fn}(arr));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    printf(\"%d\\n\", {c_fn}(arr, n));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            elif kind == "array":
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print(*(result if result is not None else []))\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"vector<int> {cpp_fn}(vector<int>& arr) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n\n"
                        f"    vector<int> result = {cpp_fn}(arr);\n"
                        f"    for (int i = 0; i < (int)result.size(); i++) {{\n"
                        f"        cout << result[i] << (i + 1 < (int)result.size() ? \" \" : \"\");\n"
                        f"    }}\n"
                        f"    cout << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public int[] {java_fn}(int[] arr) {{\n"
                        f"        // Write your code here\n"
                        f"        return arr;\n"
                        f"    }}\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) {{\n"
                        f"            arr[i] = sc.nextInt();\n"
                        f"        }}\n\n"
                        f"        Solution sol = new Solution();\n"
                        f"        int[] result = sol.{java_fn}(arr);\n"
                        f"        if (result != null) {{\n"
                        f"            for (int i = 0; i < result.length; i++) {{\n"
                        f"                System.out.print(result[i] + (i + 1 < result.length ? \" \" : \"\"));\n"
                        f"            }}\n"
                        f"        }}\n"
                        f"        System.out.println();\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n\n"
                        f"int* {c_fn}(int arr[], int n) {{\n"
                        f"    // Write your code here\n"
                        f"    return arr;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n\n"
                        f"    int* res = {c_fn}(arr, n);\n"
                        f"    if (!res) res = arr;\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        printf(\"%d%s\", res[i], (i + 1 < n ? \" \" : \"\"));\n"
                        f"    }}\n"
                        f"    printf(\"\\n\");\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
                driver_code = {
                    "python": (
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print(*(result if result is not None else []))\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    vector<int> result = {cpp_fn}(arr);\n"
                        f"    for (int i = 0; i < (int)result.size(); i++) {{\n"
                        f"        cout << result[i] << (i + 1 < (int)result.size() ? \" \" : \"\");\n"
                        f"    }}\n"
                        f"    cout << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    // DRIVER_PLACEHOLDER\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n"
                        f"        Solution sol = new Solution();\n"
                        f"        int[] result = sol.{java_fn}(arr);\n"
                        f"        if (result != null) {{\n"
                        f"            for (int i = 0; i < result.length; i++) System.out.print(result[i] + (i + 1 < result.length ? \" \" : \"\"));\n"
                        f"        }}\n"
                        f"        System.out.println();\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    int* res = {c_fn}(arr, n);\n"
                        f"    if (!res) res = arr;\n"
                        f"    for (int i = 0; i < n; i++) printf(\"%d%s\", res[i], (i + 1 < n ? \" \" : \"\"));\n"
                        f"    printf(\"\\n\");\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            elif kind == "search":
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr, target):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    target = int(input())\n"
                        f"    result = {py_fn}(arr, target)\n"
                        f"    print(result)\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"string {cpp_fn}(vector<int>& arr, int target) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    int target;\n"
                        f"    cin >> target;\n\n"
                        f"    cout << {cpp_fn}(arr, target) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public String {java_fn}(int[] arr, int target) {{\n"
                        f"        // Write your code here\n"
                        f"        return \"NO\";\n"
                        f"    }}\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) {{\n"
                        f"            arr[i] = sc.nextInt();\n"
                        f"        }}\n"
                        f"        int target = sc.nextInt();\n\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.println(sol.{java_fn}(arr, target));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n\n"
                        f"const char* {c_fn}(int arr[], int n, int target) {{\n"
                        f"    // Write your code here\n"
                        f"    return \"NO\";\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n"
                        f"    int target;\n"
                        f"    scanf(\"%d\", &target);\n\n"
                        f"    printf(\"%s\\n\", {c_fn}(arr, n, target));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
                driver_code = {
                    "python": (
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    target = int(input())\n"
                        f"    result = {py_fn}(arr, target)\n"
                        f"    print(result)\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    int target;\n"
                        f"    cin >> target;\n"
                        f"    cout << {cpp_fn}(arr, target) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    // DRIVER_PLACEHOLDER\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n"
                        f"        int target = sc.nextInt();\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.println(sol.{java_fn}(arr, target));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    int target;\n"
                        f"    scanf(\"%d\", &target);\n"
                        f"    printf(\"%s\\n\", {c_fn}(arr, n, target));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            elif kind == "count_target":
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr, target):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    target = int(input())\n"
                        f"    result = {py_fn}(arr, target)\n"
                        f"    print(result)\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"int {cpp_fn}(vector<int>& arr, int target) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    int target;\n"
                        f"    cin >> target;\n\n"
                        f"    cout << {cpp_fn}(arr, target) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public int {java_fn}(int[] arr, int target) {{\n"
                        f"        // Write your code here\n"
                        f"        return 0;\n"
                        f"    }}\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) {{\n"
                        f"            arr[i] = sc.nextInt();\n"
                        f"        }}\n"
                        f"        int target = sc.nextInt();\n\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.println(sol.{java_fn}(arr, target));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n\n"
                        f"int {c_fn}(int arr[], int n, int target) {{\n"
                        f"    // Write your code here\n"
                        f"    return 0;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n"
                        f"    int target;\n"
                        f"    scanf(\"%d\", &target);\n\n"
                        f"    printf(\"%d\\n\", {c_fn}(arr, n, target));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
                driver_code = {
                    "python": (
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    target = int(input())\n"
                        f"    result = {py_fn}(arr, target)\n"
                        f"    print(result)\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    int target;\n"
                        f"    cin >> target;\n"
                        f"    cout << {cpp_fn}(arr, target) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    // DRIVER_PLACEHOLDER\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n"
                        f"        int target = sc.nextInt();\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.println(sol.{java_fn}(arr, target));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    int target;\n"
                        f"    scanf(\"%d\", &target);\n"
                        f"    printf(\"%d\\n\", {c_fn}(arr, n, target));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            elif kind == "average":
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print(f'{{result:.2f}}')\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"double {cpp_fn}(vector<int>& arr) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n\n"
                        f"    cout << fixed << setprecision(2) << {cpp_fn}(arr) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public double {java_fn}(int[] arr) {{\n"
                        f"        // Write your code here\n"
                        f"        return 0.0;\n"
                        f"    }}\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) {{\n"
                        f"            arr[i] = sc.nextInt();\n"
                        f"        }}\n\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.printf(Locale.US, \"%.2f\\n\", sol.{java_fn}(arr));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n\n"
                        f"double {c_fn}(int arr[], int n) {{\n"
                        f"    // Write your code here\n"
                        f"    return 0.0;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n\n"
                        f"    printf(\"%.2f\\n\", {c_fn}(arr, n));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
                driver_code = {
                    "python": (
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print(f'{{result:.2f}}')\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    cout << fixed << setprecision(2) << {cpp_fn}(arr) << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    // DRIVER_PLACEHOLDER\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n"
                        f"        Solution sol = new Solution();\n"
                        f"        System.out.printf(Locale.US, \"%.2f\\n\", sol.{java_fn}(arr));\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    printf(\"%.2f\\n\", {c_fn}(arr, n));\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            elif kind == "positive_elements":
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    if result and len(result) > 0:\n"
                        f"        print(*result)\n"
                        f"    else:\n"
                        f"        print(-1)\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"vector<int> {cpp_fn}(vector<int>& arr) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n\n"
                        f"    vector<int> result = {cpp_fn}(arr);\n"
                        f"    if (result.empty()) {{\n"
                        f"        cout << \"-1\\n\";\n"
                        f"    }} else {{\n"
                        f"        for (int i = 0; i < (int)result.size(); i++) {{\n"
                        f"            cout << result[i] << (i + 1 < (int)result.size() ? \" \" : \"\");\n"
                        f"        }}\n"
                        f"        cout << \"\\n\";\n"
                        f"    }}\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public int[] {java_fn}(int[] arr) {{\n"
                        f"        // Write your code here\n"
                        f"        return new int[0];\n"
                        f"    }}\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) {{\n"
                        f"            arr[i] = sc.nextInt();\n"
                        f"        }}\n\n"
                        f"        Solution sol = new Solution();\n"
                        f"        int[] result = sol.{java_fn}(arr);\n"
                        f"        if (result == null || result.length == 0) {{\n"
                        f"            System.out.println(-1);\n"
                        f"        }} else {{\n"
                        f"            for (int i = 0; i < result.length; i++) {{\n"
                        f"                System.out.print(result[i] + (i + 1 < result.length ? \" \" : \"\"));\n"
                        f"            }}\n"
                        f"            System.out.println();\n"
                        f"        }}\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n\n"
                        f"int {c_fn}(int arr[], int n, int result[]) {{\n"
                        f"    // Write your code here\n"
                        f"    return 0;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n\n"
                        f"    int result[n];\n"
                        f"    int count = {c_fn}(arr, n, result);\n"
                        f"    if (count <= 0) {{\n"
                        f"        printf(\"-1\\n\");\n"
                        f"    }} else {{\n"
                        f"        for (int i = 0; i < count; i++) {{\n"
                        f"            printf(\"%d%s\", result[i], (i + 1 < count ? \" \" : \"\"));\n"
                        f"        }}\n"
                        f"        printf(\"\\n\");\n"
                        f"    }}\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
                driver_code = {
                    "python": (
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    if result and len(result) > 0:\n"
                        f"        print(*result)\n"
                        f"    else:\n"
                        f"        print(-1)\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    vector<int> result = {cpp_fn}(arr);\n"
                        f"    if (result.empty()) {{\n"
                        f"        cout << \"-1\\n\";\n"
                        f"    }} else {{\n"
                        f"        for (int i = 0; i < (int)result.size(); i++) {{\n"
                        f"            cout << result[i] << (i + 1 < (int)result.size() ? \" \" : \"\");\n"
                        f"        }}\n"
                        f"        cout << \"\\n\";\n"
                        f"    }}\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    // DRIVER_PLACEHOLDER\n\n"
                        f"    public static void main(String[] args) {{\n"
                        f"        Scanner sc = new Scanner(System.in);\n"
                        f"        if (!sc.hasNextInt()) return;\n"
                        f"        int n = sc.nextInt();\n"
                        f"        int[] arr = new int[n];\n"
                        f"        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();\n"
                        f"        Solution sol = new Solution();\n"
                        f"        int[] result = sol.{java_fn}(arr);\n"
                        f"        if (result == null || result.length == 0) {{\n"
                        f"            System.out.println(-1);\n"
                        f"        }} else {{\n"
                        f"            for (int i = 0; i < result.length; i++) System.out.print(result[i] + (i + 1 < result.length ? \" \" : \"\"));\n"
                        f"            System.out.println();\n"
                        f"        }}\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    int result[n];\n"
                        f"    int count = {c_fn}(arr, n, result);\n"
                        f"    if (count <= 0) printf(\"-1\\n\");\n"
                        f"    else {{\n"
                        f"        for (int i = 0; i < count; i++) printf(\"%d%s\", result[i], (i + 1 < count ? \" \" : \"\"));\n"
                        f"        printf(\"\\n\");\n"
                        f"    }}\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }

            q, created = Question.objects.update_or_create(
                slug=p["slug"],
                defaults={
                    "topic": topic,
                    "level": lvl_easy,
                    "title": p["title"],
                    "statement": p["statement"],
                    "input_format": p["input_format"],
                    "output_format": p["output_format"],
                    "constraints": p["constraints"],
                    "notes": p["notes"],
                    "examples": p["examples"],
                    "starter_code": json.dumps(starter_code),
                    "driver_code": json.dumps(driver_code),
                    "order": p["order"],
                    "is_published": True,
                    "time_limit": 2.0,
                    "memory_limit": 256,
                }
            )

            # Re-create test cases with 1 public sample + 5 private hidden test cases
            q.test_cases.all().delete()
            for tc_data in p["test_cases"]:
                TestCase.objects.create(
                    question=q,
                    input_data=tc_data["input"],
                    expected_output=tc_data["output"],
                    is_hidden=tc_data["hidden"],
                    weight=1
                )

            self.stdout.write(f"  [Q{p['order']:02d}] {p['title']} updated ({len(p['test_cases'])} test cases: 1 public, {len(p['test_cases'])-1} hidden).")

        self.stdout.write(self.style.SUCCESS("All Questions 1-10 of Arrays successfully updated!"))


import json
from django.core.management.base import BaseCommand
from api.models import Topic, QuestionLevel, Question, TestCase

class Command(BaseCommand):
    help = 'Seeds 10 new Easy-level Array problems (11-20) to CodexPetra Arrays Topic with return-based solutions'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Starting Array Problems (11-20) Seeding..."))

        topic = Topic.objects.filter(slug='arrays').first()
        if not topic:
            self.stdout.write(self.style.ERROR("Topic 'arrays' not found!"))
            return

        lvl_easy, _ = QuestionLevel.objects.get_or_create(topic=topic, level='easy')

        problems = [
            # 11. Find the Second Largest Element
            {
                "order": 11,
                "title": "Find the Second Largest Element",
                "slug": "find-the-second-largest-element",
                "statement": (
                    "Given an array of integers `arr`, find and return the second largest distinct element in the array.\n\n"
                    "If the second largest element does not exist (for example, if all elements are identical or the array has fewer than 2 distinct elements), return `-1`.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_second_largest(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n` representing the number of elements in the array.\nThe second line contains `n` space-separated integers representing the array elements.",
                "output_format": "Return a single integer representing the second largest distinct element, or `-1` if it does not exist.",
                "constraints": "2 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n12 35 1 10 34",
                        "output": "34",
                        "explanation": "The distinct elements in sorted order are 1, 10, 12, 34, 35. The second largest element is 34."
                    },
                    {
                        "input": "4\n10 10 10 10",
                        "output": "-1",
                        "explanation": "All elements are equal, so no second largest distinct element exists."
                    }
                ],
                "py_fn": "find_second_largest",
                "cpp_fn": "findSecondLargest",
                "java_fn": "findSecondLargest",
                "c_fn": "findSecondLargest",
                "ret_type": "int",
                "test_cases": [
                    {"input": "5\n12 35 1 10 34", "output": "34", "hidden": False},
                    {"input": "2\n10 5", "output": "5", "hidden": True},
                    {"input": "4\n10 10 10 10", "output": "-1", "hidden": True},
                    {"input": "5\n-10 -5 -2 -1 -20", "output": "-2", "hidden": True},
                    {"input": "6\n100 20 50 100 80 90", "output": "90", "hidden": True},
                    {"input": "3\n7 2 7", "output": "2", "hidden": True},
                ]
            },

            # 12. Find the Second Smallest Element
            {
                "order": 12,
                "title": "Find the Second Smallest Element",
                "slug": "find-the-second-smallest-element",
                "statement": (
                    "Given an array of integers `arr`, find and return the second smallest distinct element in the array.\n\n"
                    "If the second smallest element does not exist (for example, if all elements are identical or the array has fewer than 2 distinct elements), return `-1`.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_second_smallest(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n` representing the number of elements in the array.\nThe second line contains `n` space-separated integers representing the array elements.",
                "output_format": "Return a single integer representing the second smallest distinct element, or `-1` if it does not exist.",
                "constraints": "2 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n12 35 1 10 34",
                        "output": "10",
                        "explanation": "The distinct elements in sorted order are 1, 10, 12, 34, 35. The second smallest element is 10."
                    },
                    {
                        "input": "3\n5 5 5",
                        "output": "-1",
                        "explanation": "All elements are equal, so no second smallest distinct element exists."
                    }
                ],
                "py_fn": "find_second_smallest",
                "cpp_fn": "findSecondSmallest",
                "java_fn": "findSecondSmallest",
                "c_fn": "findSecondSmallest",
                "ret_type": "int",
                "test_cases": [
                    {"input": "5\n12 35 1 10 34", "output": "10", "hidden": False},
                    {"input": "2\n5 10", "output": "10", "hidden": True},
                    {"input": "3\n5 5 5", "output": "-1", "hidden": True},
                    {"input": "5\n-5 -2 -10 0 5", "output": "-5", "hidden": True},
                    {"input": "6\n4 1 1 2 3 5", "output": "2", "hidden": True},
                    {"input": "4\n99 100 99 105", "output": "100", "hidden": True},
                ]
            },

            # 13. Count Positive Elements
            {
                "order": 13,
                "title": "Count Positive Elements",
                "slug": "count-positive-elements",
                "statement": (
                    "Given an array of integers `arr`, count and return the total number of strictly positive elements (`arr[i] > 0`) present in the array.\n\n"
                    "Note that zero (`0`) is neither positive nor negative.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `count_positive(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the count of strictly positive elements.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "5\n-1 2 -3 4 5",
                        "output": "3",
                        "explanation": "The positive elements are 2, 4, and 5 (count = 3)."
                    }
                ],
                "py_fn": "count_positive",
                "cpp_fn": "countPositive",
                "java_fn": "countPositive",
                "c_fn": "countPositive",
                "ret_type": "int",
                "test_cases": [
                    {"input": "5\n-1 2 -3 4 5", "output": "3", "hidden": False},
                    {"input": "4\n-5 -4 -3 -2", "output": "0", "hidden": True},
                    {"input": "5\n0 0 0 0 0", "output": "0", "hidden": True},
                    {"input": "6\n1 2 3 4 5 6", "output": "6", "hidden": True},
                    {"input": "7\n-10 0 15 -2 30 0 4", "output": "3", "hidden": True},
                    {"input": "1\n42", "output": "1", "hidden": True},
                ]
            },

            # 14. Count Negative Elements
            {
                "order": 14,
                "title": "Count Negative Elements",
                "slug": "count-negative-elements",
                "statement": (
                    "Given an array of integers `arr`, count and return the total number of strictly negative elements (`arr[i] < 0`) present in the array.\n\n"
                    "Note that zero (`0`) is neither positive nor negative.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `count_negative(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the count of strictly negative elements.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "5\n-1 2 -3 4 -5",
                        "output": "3",
                        "explanation": "The negative elements are -1, -3, and -5 (count = 3)."
                    }
                ],
                "py_fn": "count_negative",
                "cpp_fn": "countNegative",
                "java_fn": "countNegative",
                "c_fn": "countNegative",
                "ret_type": "int",
                "test_cases": [
                    {"input": "5\n-1 2 -3 4 -5", "output": "3", "hidden": False},
                    {"input": "4\n1 2 3 4", "output": "0", "hidden": True},
                    {"input": "3\n0 0 0", "output": "0", "hidden": True},
                    {"input": "5\n-10 -20 -30 -40 -50", "output": "5", "hidden": True},
                    {"input": "6\n-5 10 -15 20 0 -2", "output": "3", "hidden": True},
                    {"input": "1\n-100", "output": "1", "hidden": True},
                ]
            },

            # 15. Count Zeros in an Array
            {
                "order": 15,
                "title": "Count Zeros in an Array",
                "slug": "count-zeros-in-an-array",
                "statement": (
                    "Given an array of integers `arr`, count and return how many times the value `0` occurs in the array.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `count_zeros(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the total count of elements equal to zero.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "6\n1 0 2 0 3 0",
                        "output": "3",
                        "explanation": "Zero appears 3 times in the array."
                    }
                ],
                "py_fn": "count_zeros",
                "cpp_fn": "countZeros",
                "java_fn": "countZeros",
                "c_fn": "countZeros",
                "ret_type": "int",
                "test_cases": [
                    {"input": "6\n1 0 2 0 3 0", "output": "3", "hidden": False},
                    {"input": "4\n1 2 3 4", "output": "0", "hidden": True},
                    {"input": "4\n0 0 0 0", "output": "4", "hidden": True},
                    {"input": "5\n-1 0 1 0 -5", "output": "2", "hidden": True},
                    {"input": "1\n0", "output": "1", "hidden": True},
                    {"input": "7\n10 20 0 40 50 0 70", "output": "2", "hidden": True},
                ]
            },

            # 16. Copy an Array
            {
                "order": 16,
                "title": "Copy an Array",
                "slug": "copy-an-array",
                "statement": (
                    "Given an array of integers `arr`, create and return a new array that contains an exact copy of all elements of `arr` in the same order.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `copy_array(arr)`.\n\n"
                    "**CRITICAL:** You must return the copied array. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return the new array containing identical elements in the same order.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(n).",
                "examples": [
                    {
                        "input": "5\n10 20 30 40 50",
                        "output": "10 20 30 40 50",
                        "explanation": "The returned array contains [10, 20, 30, 40, 50]."
                    }
                ],
                "is_array_ret": True,
                "py_fn": "copy_array",
                "cpp_fn": "copyArray",
                "java_fn": "copyArray",
                "c_fn": "copyArray",
                "test_cases": [
                    {"input": "5\n10 20 30 40 50", "output": "10 20 30 40 50", "hidden": False},
                    {"input": "1\n42", "output": "42", "hidden": True},
                    {"input": "4\n-5 -10 -15 -20", "output": "-5 -10 -15 -20", "hidden": True},
                    {"input": "5\n0 0 0 0 0", "output": "0 0 0 0 0", "hidden": True},
                    {"input": "6\n7 7 7 7 7 7", "output": "7 7 7 7 7 7", "hidden": True},
                    {"input": "5\n-100 50 0 -25 75", "output": "-100 50 0 -25 75", "hidden": True},
                ]
            },

            # 17. Check if Array is Sorted
            {
                "order": 17,
                "title": "Check if Array is Sorted",
                "slug": "check-if-array-is-sorted",
                "statement": (
                    "Given an array of integers `arr`, determine whether the array is sorted in non-decreasing (ascending) order.\n\n"
                    "An array is sorted in non-decreasing order if `arr[i] <= arr[i + 1]` for all `0 <= i < n - 1`.\n\n"
                    "Return `true` (or `True` in Python) if the array is sorted, otherwise return `false` (or `False`).\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `check_if_sorted(arr)`.\n\n"
                    "**CRITICAL:** You must return the boolean result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return `true` if the array is sorted in non-decreasing order, otherwise return `false`.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n), Space Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n1 2 3 4 5",
                        "output": "true",
                        "explanation": "Elements are in non-decreasing order (1 <= 2 <= 3 <= 4 <= 5)."
                    },
                    {
                        "input": "5\n5 4 3 2 1",
                        "output": "false",
                        "explanation": "Elements are in descending order, not non-decreasing order."
                    }
                ],
                "is_bool_ret": True,
                "py_fn": "check_if_sorted",
                "cpp_fn": "checkIfSorted",
                "java_fn": "checkIfSorted",
                "c_fn": "checkIfSorted",
                "test_cases": [
                    {"input": "5\n1 2 3 4 5", "output": "true", "hidden": False},
                    {"input": "5\n5 4 3 2 1", "output": "false", "hidden": True},
                    {"input": "1\n10", "output": "true", "hidden": True},
                    {"input": "4\n2 2 2 2", "output": "true", "hidden": True},
                    {"input": "6\n1 3 2 4 5 6", "output": "false", "hidden": True},
                    {"input": "5\n-10 -5 0 5 10", "output": "true", "hidden": True},
                ]
            },

            # 18. Find the First Element
            {
                "order": 18,
                "title": "Find the First Element",
                "slug": "find-the-first-element",
                "statement": (
                    "Given a non-empty array of integers `arr`, find and return the first element of the array (at index `0`).\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_first_element(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the first element (`arr[0]`).",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n10 20 30 40 50",
                        "output": "10",
                        "explanation": "The element at index 0 is 10."
                    }
                ],
                "py_fn": "find_first_element",
                "cpp_fn": "findFirstElement",
                "java_fn": "findFirstElement",
                "c_fn": "findFirstElement",
                "ret_type": "int",
                "test_cases": [
                    {"input": "5\n10 20 30 40 50", "output": "10", "hidden": False},
                    {"input": "1\n99", "output": "99", "hidden": True},
                    {"input": "3\n-5 0 5", "output": "-5", "hidden": True},
                    {"input": "4\n0 1 2 3", "output": "0", "hidden": True},
                    {"input": "6\n100 200 300 400 500 600", "output": "100", "hidden": True},
                    {"input": "2\n-42 42", "output": "-42", "hidden": True},
                ]
            },

            # 19. Find the Last Element
            {
                "order": 19,
                "title": "Find the Last Element",
                "slug": "find-the-last-element",
                "statement": (
                    "Given a non-empty array of integers `arr`, find and return the last element of the array (at index `n - 1`).\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `find_last_element(arr)`.\n\n"
                    "**CRITICAL:** You must return the result. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return a single integer representing the last element (`arr[n - 1]`).",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(1).",
                "examples": [
                    {
                        "input": "5\n10 20 30 40 50",
                        "output": "50",
                        "explanation": "The last element of the array is 50."
                    }
                ],
                "py_fn": "find_last_element",
                "cpp_fn": "findLastElement",
                "java_fn": "findLastElement",
                "c_fn": "findLastElement",
                "ret_type": "int",
                "test_cases": [
                    {"input": "5\n10 20 30 40 50", "output": "50", "hidden": False},
                    {"input": "1\n77", "output": "77", "hidden": True},
                    {"input": "3\n5 0 -5", "output": "-5", "hidden": True},
                    {"input": "4\n1 2 3 0", "output": "0", "hidden": True},
                    {"input": "6\n100 200 300 400 500 999", "output": "999", "hidden": True},
                    {"input": "2\n-42 -99", "output": "-99", "hidden": True},
                ]
            },

            # 20. Replace Negative Elements with Zero
            {
                "order": 20,
                "title": "Replace Negative Elements with Zero",
                "slug": "replace-negative-elements-with-zero",
                "statement": (
                    "Given an array of integers `arr`, replace all strictly negative elements (`arr[i] < 0`) with `0` and return the modified array.\n\n"
                    "Non-negative elements (`arr[i] >= 0`) should remain unchanged.\n\n"
                    "**Function Requirements:**\n"
                    "Implement the function `replace_negatives(arr)`.\n\n"
                    "**CRITICAL:** You must return the modified array. Do not print it."
                ),
                "input_format": "The first line contains an integer `n`.\nThe second line contains `n` space-separated integers.",
                "output_format": "Return the array with all negative values replaced by `0`.",
                "constraints": "1 <= n <= 10^5\n-10^9 <= arr[i] <= 10^9",
                "notes": "You must return the result. Do not print it. Time Complexity: O(n).",
                "examples": [
                    {
                        "input": "5\n1 -2 3 -4 5",
                        "output": "1 0 3 0 5",
                        "explanation": "Negative numbers -2 and -4 are replaced by 0."
                    }
                ],
                "is_array_ret": True,
                "py_fn": "replace_negatives",
                "cpp_fn": "replaceNegatives",
                "java_fn": "replaceNegatives",
                "c_fn": "replaceNegatives",
                "test_cases": [
                    {"input": "5\n1 -2 3 -4 5", "output": "1 0 3 0 5", "hidden": False},
                    {"input": "4\n-1 -2 -3 -4", "output": "0 0 0 0", "hidden": True},
                    {"input": "4\n1 2 3 4", "output": "1 2 3 4", "hidden": True},
                    {"input": "5\n0 -10 0 -20 30", "output": "0 0 0 0 30", "hidden": True},
                    {"input": "1\n-9", "output": "0", "hidden": True},
                    {"input": "6\n-50 10 -25 0 15 -5", "output": "0 10 0 0 15 0", "hidden": True},
                ]
            },
        ]

        created_count = 0
        updated_count = 0

        for p in problems:
            py_fn = p["py_fn"]
            cpp_fn = p["cpp_fn"]
            java_fn = p["java_fn"]
            c_fn = p["c_fn"]

            if p.get("is_array_ret"):
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
                        f"int* {c_fn}(int arr[], int n, int result[]) {{\n"
                        f"    // Write your code here\n"
                        f"    return result;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n\n"
                        f"    int result[n];\n"
                        f"    int* res = {c_fn}(arr, n, result);\n"
                        f"    if (!res) res = result;\n"
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
                        f"    int result[n];\n"
                        f"    int* res = {c_fn}(arr, n, result);\n"
                        f"    if (!res) res = result;\n"
                        f"    for (int i = 0; i < n; i++) printf(\"%d%s\", res[i], (i + 1 < n ? \" \" : \"\"));\n"
                        f"    printf(\"\\n\");\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            elif p.get("is_bool_ret"):
                starter_code = {
                    "python": (
                        f"def {py_fn}(arr):\n"
                        f"    # Write your code here\n"
                        f"    pass\n\n"
                        f"if __name__ == '__main__':\n"
                        f"    n = int(input())\n"
                        f"    arr = list(map(int, input().split()))\n"
                        f"    result = {py_fn}(arr)\n"
                        f"    print('true' if result else 'false')\n"
                    ),
                    "cpp": (
                        f"#include <bits/stdc++.h>\n"
                        f"using namespace std;\n\n"
                        f"bool {cpp_fn}(vector<int>& arr) {{\n"
                        f"    // Write your code here\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n\n"
                        f"    cout << ({cpp_fn}(arr) ? \"true\" : \"false\") << \"\\n\";\n"
                        f"    return 0;\n"
                        f"}}\n"
                    ),
                    "java": (
                        f"import java.util.*;\n\n"
                        f"class Solution {{\n"
                        f"    public boolean {java_fn}(int[] arr) {{\n"
                        f"        // Write your code here\n"
                        f"        return false;\n"
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
                        f"        System.out.println(sol.{java_fn}(arr) ? \"true\" : \"false\");\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"#include <stdio.h>\n"
                        f"#include <stdbool.h>\n\n"
                        f"bool {c_fn}(int arr[], int n) {{\n"
                        f"    // Write your code here\n"
                        f"    return false;\n"
                        f"}}\n\n"
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) {{\n"
                        f"        scanf(\"%d\", &arr[i]);\n"
                        f"    }}\n\n"
                        f"    printf(\"%s\\n\", {c_fn}(arr, n) ? \"true\" : \"false\");\n"
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
                        f"    print('true' if result else 'false')\n"
                    ),
                    "cpp": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (!(cin >> n)) return 0;\n"
                        f"    vector<int> arr(n);\n"
                        f"    for (int i = 0; i < n; i++) cin >> arr[i];\n"
                        f"    cout << ({cpp_fn}(arr) ? \"true\" : \"false\") << \"\\n\";\n"
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
                        f"        System.out.println(sol.{java_fn}(arr) ? \"true\" : \"false\");\n"
                        f"    }}\n"
                        f"}}\n"
                    ),
                    "c": (
                        f"int main() {{\n"
                        f"    int n;\n"
                        f"    if (scanf(\"%d\", &n) != 1) return 0;\n"
                        f"    int arr[n];\n"
                        f"    for (int i = 0; i < n; i++) scanf(\"%d\", &arr[i]);\n"
                        f"    printf(\"%s\\n\", {c_fn}(arr, n) ? \"true\" : \"false\");\n"
                        f"    return 0;\n"
                        f"}}\n"
                    )
                }
            else:
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

            # Re-create test cases cleanly
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
            f"\nSeeding completed! Created: {created_count}, Updated: {updated_count} questions under Topic 'Arrays'."
        ))


import type { 
  PythonLesson, CourseCurriculumLevel, PracticeProblem, 
  MiniProject, FinalAssessment 
} from './types';

export const COURSE_LEVELS: CourseCurriculumLevel[] = [
  {
    levelNumber: 1,
    name: 'LEVEL 1 — Python Foundations',
    slug: 'level-1-foundations',
    description: 'Master core programming fundamentals: syntax, variables, types, operators, I/O and debugging.',
    lessons: [
      {
        id: '1-1-introduction-to-python',
        lessonNumber: '1.1',
        title: 'Introduction to Python',
        readingTime: '10 min read',
        difficulty: 'Beginner',
      },
      {
        id: '1-2-python-installation-environment-setup',
        lessonNumber: '1.2',
        title: 'Python Installation & Environment Setup',
        readingTime: '12 min read',
        difficulty: 'Beginner',
      },
      {
        id: '1-3-python-tokens-basic-syntax',
        lessonNumber: '1.3',
        title: 'Python Tokens & Basic Syntax',
        readingTime: '15 min read',
        difficulty: 'Beginner',
      },
      {
        id: '1-4-variables-basic-data-types',
        lessonNumber: '1.4',
        title: 'Variables & Basic Data Types',
        readingTime: '12 min read',
        difficulty: 'Beginner',
      },
      {
        id: '1-5-operators-expressions',
        lessonNumber: '1.5',
        title: 'Operators & Expressions',
        readingTime: '14 min read',
        difficulty: 'Beginner',
      },
      {
        id: '1-6-input-output-formatting',
        lessonNumber: '1.6',
        title: 'Input, Output & Formatting',
        readingTime: '12 min read',
        difficulty: 'Beginner',
      },
      {
        id: '1-7-basic-error-understanding',
        lessonNumber: '1.7',
        title: 'Basic Error Understanding',
        readingTime: '10 min read',
        difficulty: 'Beginner',
      },
    ],
  },
  {
    levelNumber: 2,
    name: 'LEVEL 2 — Control Flow & Loops',
    slug: 'level-2-control-flow',
    description: 'Decision making with if-elif-else, while loops, for loops, break, continue and pattern matching.',
    lessons: [
      { id: '2-1-if-else-conditionals', lessonNumber: '2.1', title: 'If, Elif & Else Statements', readingTime: '10 min read', difficulty: 'Beginner' },
      { id: '2-2-for-loops-range', lessonNumber: '2.2', title: 'For Loops & the range() Function', readingTime: '12 min read', difficulty: 'Beginner' },
      { id: '2-3-while-loops', lessonNumber: '2.3', title: 'While Loops & Infinite Loops', readingTime: '10 min read', difficulty: 'Beginner' },
      { id: '2-4-break-continue-pass', lessonNumber: '2.4', title: 'Break, Continue & Pass Statements', readingTime: '8 min read', difficulty: 'Beginner' },
      { id: '2-5-nested-loops-patterns', lessonNumber: '2.5', title: 'Nested Loops & Star Patterns', readingTime: '15 min read', difficulty: 'Intermediate' },
    ],
  },
  {
    levelNumber: 3,
    name: 'LEVEL 3 — Core Data Structures',
    slug: 'level-3-data-structures',
    description: 'Master Python built-in collections: Lists, Tuples, Sets, Dictionaries and comprehension syntax.',
    lessons: [
      { id: '3-1-lists-and-operations', lessonNumber: '3.1', title: 'Python Lists & List Methods', readingTime: '15 min read', difficulty: 'Beginner' },
      { id: '3-2-tuples-immutability', lessonNumber: '3.2', title: 'Tuples & Immutability', readingTime: '10 min read', difficulty: 'Beginner' },
      { id: '3-3-dictionaries-key-values', lessonNumber: '3.3', title: 'Dictionaries & Hash Maps', readingTime: '14 min read', difficulty: 'Intermediate' },
      { id: '3-4-sets-operations', lessonNumber: '3.4', title: 'Sets & Mathematical Operations', readingTime: '10 min read', difficulty: 'Intermediate' },
      { id: '3-5-list-comprehensions', lessonNumber: '3.5', title: 'Comprehensions (List, Dict, Set)', readingTime: '12 min read', difficulty: 'Intermediate' },
    ],
  },
  {
    levelNumber: 4,
    name: 'LEVEL 4 — Functions & Modules',
    slug: 'level-4-functions',
    description: 'Modular code design: function definitions, *args, **kwargs, lambda functions, scopes, and packages.',
    lessons: [
      { id: '4-1-defining-calling-functions', lessonNumber: '4.1', title: 'Defining & Calling Functions', readingTime: '12 min read', difficulty: 'Beginner' },
      { id: '4-2-arguments-args-kwargs', lessonNumber: '4.2', title: 'Function Arguments, *args & **kwargs', readingTime: '14 min read', difficulty: 'Intermediate' },
      { id: '4-3-lambda-functions', lessonNumber: '4.3', title: 'Anonymous Lambda Functions', readingTime: '10 min read', difficulty: 'Intermediate' },
      { id: '4-4-scopes-namespaces', lessonNumber: '4.4', title: 'Global, Local & Nonlocal Scopes', readingTime: '10 min read', difficulty: 'Intermediate' },
      { id: '4-5-modules-import-system', lessonNumber: '4.5', title: 'Modules, Packages & sys.path', readingTime: '12 min read', difficulty: 'Intermediate' },
    ],
  },
  {
    levelNumber: 5,
    name: 'LEVEL 5 — File Handling & OOP',
    slug: 'level-5-oop',
    description: 'Object-Oriented Programming: classes, objects, inheritance, polymorphism, encapsulation, and file I/O.',
    lessons: [
      { id: '5-1-reading-writing-files', lessonNumber: '5.1', title: 'Reading & Writing Files with "with"', readingTime: '12 min read', difficulty: 'Intermediate' },
      { id: '5-2-classes-and-objects', lessonNumber: '5.2', title: 'Classes, Objects & __init__', readingTime: '15 min read', difficulty: 'Intermediate' },
      { id: '5-3-inheritance-polymorphism', lessonNumber: '5.3', title: 'Inheritance & Polymorphism', readingTime: '16 min read', difficulty: 'Intermediate' },
      { id: '5-4-encapsulation-abstraction', lessonNumber: '5.4', title: 'Encapsulation & Private Members', readingTime: '12 min read', difficulty: 'Intermediate' },
      { id: '5-5-dunder-methods', lessonNumber: '5.5', title: 'Magic / Dunder Methods (__str__, __repr__)', readingTime: '14 min read', difficulty: 'Advanced' },
    ],
  },
  {
    levelNumber: 6,
    name: 'LEVEL 6 — DSA with Python',
    slug: 'level-6-dsa',
    description: 'Implement essential data structures and algorithms in Python for technical interview success.',
    lessons: [
      { id: '6-1-recursion-backtracking', lessonNumber: '6.1', title: 'Recursion Fundamentals & Call Stack', readingTime: '18 min read', difficulty: 'Advanced' },
      { id: '6-2-stacks-and-queues', lessonNumber: '6.2', title: 'Stacks & Queues Implementation', readingTime: '16 min read', difficulty: 'Intermediate' },
      { id: '6-3-linked-lists', lessonNumber: '6.3', title: 'Singly & Doubly Linked Lists', readingTime: '20 min read', difficulty: 'Advanced' },
      { id: '6-4-binary-trees', lessonNumber: '6.4', title: 'Binary Trees & Traversals (DFS/BFS)', readingTime: '22 min read', difficulty: 'Advanced' },
      { id: '6-5-sorting-searching-algos', lessonNumber: '6.5', title: 'Binary Search & Sorting Algorithms', readingTime: '18 min read', difficulty: 'Advanced' },
    ],
  },
];

export const LEVEL_1_PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    id: 'welcome-to-codexpetra',
    order: 1,
    title: 'Print Your Name & Welcome Message',
    subtopic: 'Standard Output',
    difficulty: 'Basic',
    statement: 'Write a Python program that reads a user\'s name from standard input and prints a two-line welcome message.',
    inputFormat: 'A single string name from standard input.',
    outputFormat: 'Line 1: `Welcome to CodexPetra, <name>!`\nLine 2: `Start your journey to master Python.`',
    constraints: '1 <= len(name) <= 50',
    examples: [
      {
        input: 'Alex',
        output: 'Welcome to CodexPetra, Alex!\nStart your journey to master Python.',
        explanation: 'Given name "Alex", outputs the personalized greeting.',
      },
    ],
    starterCode: {
      python: 'def solve():\n    name = input().strip()\n    # Write your code below\n    print(f"Welcome to CodexPetra, {name}!")\n    print("Start your journey to master Python.")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    solutionCode: 'def solve():\n    name = input().strip()\n    print(f"Welcome to CodexPetra, {name}!")\n    print("Start your journey to master Python.")\n\nif __name__ == "__main__":\n    solve()',
    testCases: [
      { input_data: 'Alex', expected_output: 'Welcome to CodexPetra, Alex!\nStart your journey to master Python.', is_hidden: false },
      { input_data: 'Rafik', expected_output: 'Welcome to CodexPetra, Rafik!\nStart your journey to master Python.', is_hidden: false },
      { input_data: 'Deepak', expected_output: 'Welcome to CodexPetra, Deepak!\nStart your journey to master Python.', is_hidden: true },
    ],
  },
  {
    id: 'introduce-yourself-with-variables',
    order: 2,
    title: 'Introduce Yourself with Variables',
    subtopic: 'Variables & String Interpolation',
    difficulty: 'Basic',
    statement: 'Variables store information in memory. Given a person\'s name and their age in years, print an introduction sentence.',
    inputFormat: 'Line 1: String name\nLine 2: Integer age',
    outputFormat: '`My name is <name> and I am <age> years old.`',
    examples: [
      { input: 'John\n21', output: 'My name is John and I am 21 years old.' },
      { input: 'Priya\n19', output: 'My name is Priya and I am 19 years old.' },
    ],
    starterCode: {
      python: 'def solve():\n    name = input().strip()\n    age = int(input().strip())\n    # Your code here\n    print(f"My name is {name} and I am {age} years old.")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: 'John\n21', expected_output: 'My name is John and I am 21 years old.', is_hidden: false },
      { input_data: 'Priya\n19', expected_output: 'My name is Priya and I am 19 years old.', is_hidden: false },
      { input_data: 'Sara\n25', expected_output: 'My name is Sara and I am 25 years old.', is_hidden: true },
    ],
  },
  {
    id: 'add-two-integers',
    order: 3,
    title: 'Add Two Integers',
    subtopic: 'Arithmetic Operators & Type Conversion',
    difficulty: 'Basic',
    statement: 'Read two integers `a` and `b` from standard input and compute their sum.',
    inputFormat: 'Line 1: Integer a\nLine 2: Integer b',
    outputFormat: 'Print the integer sum of a and b.',
    examples: [
      { input: '12\n8', output: '20' },
      { input: '-5\n15', output: '10' },
    ],
    starterCode: {
      python: 'def solve():\n    a = int(input().strip())\n    b = int(input().strip())\n    # Write your code below\n    print(a + b)\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '12\n8', expected_output: '20', is_hidden: false },
      { input_data: '-5\n15', expected_output: '10', is_hidden: false },
      { input_data: '100\n250', expected_output: '350', is_hidden: true },
    ],
  },
  {
    id: 'calculate-square-and-cube',
    order: 4,
    title: 'Calculate Square & Cube of a Number',
    subtopic: 'Exponentiation Operator (**)',
    difficulty: 'Basic',
    statement: 'Given an integer `n`, calculate and print its square (`n^2`) on the first line and its cube (`n^3`) on the second line.',
    inputFormat: 'A single integer n.',
    outputFormat: 'Line 1: Square of n\nLine 2: Cube of n',
    examples: [
      { input: '4', output: '16\n64' },
      { input: '5', output: '25\n125' },
    ],
    starterCode: {
      python: 'def solve():\n    n = int(input().strip())\n    print(n ** 2)\n    print(n ** 3)\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '4', expected_output: '16\n64', is_hidden: false },
      { input_data: '5', expected_output: '25\n125', is_hidden: false },
      { input_data: '10', expected_output: '100\n1000', is_hidden: true },
    ],
  },
  {
    id: 'rectangle-area-and-perimeter',
    order: 5,
    title: 'Rectangle Area and Perimeter',
    subtopic: 'Arithmetic Expressions',
    difficulty: 'Basic',
    statement: 'Given the length and width of a rectangle, compute its Area (`length * width`) and Perimeter (`2 * (length + width)`).',
    inputFormat: 'Line 1: Integer length\nLine 2: Integer width',
    outputFormat: 'Line 1: `Area: <area>`\nLine 2: `Perimeter: <perimeter>`',
    examples: [
      { input: '5\n3', output: 'Area: 15\nPerimeter: 16' },
      { input: '10\n4', output: 'Area: 40\nPerimeter: 28' },
    ],
    starterCode: {
      python: 'def solve():\n    length = int(input().strip())\n    width = int(input().strip())\n    area = length * width\n    perimeter = 2 * (length + width)\n    print(f"Area: {area}")\n    print(f"Perimeter: {perimeter}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '5\n3', expected_output: 'Area: 15\nPerimeter: 16', is_hidden: false },
      { input_data: '10\n4', expected_output: 'Area: 40\nPerimeter: 28', is_hidden: false },
    ],
  },
  {
    id: 'circle-area-and-circumference',
    order: 6,
    title: 'Circle Area and Circumference',
    subtopic: 'Floating Point Math & Formatting',
    difficulty: 'Easy',
    statement: 'Given the radius `r` of a circle as a float, compute its Area (`3.14159 * r^2`) and Circumference (`2 * 3.14159 * r`). Format both outputs to 2 decimal places.',
    inputFormat: 'A float radius r.',
    outputFormat: 'Line 1: `Area: <area:.2f>`\nLine 2: `Circumference: <circumference:.2f>`',
    examples: [
      { input: '7.0', output: 'Area: 153.94\nCircumference: 43.98' },
    ],
    starterCode: {
      python: 'def solve():\n    r = float(input().strip())\n    PI = 3.14159\n    area = PI * (r ** 2)\n    circ = 2 * PI * r\n    print(f"Area: {area:.2f}")\n    print(f"Circumference: {circ:.2f}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '7.0', expected_output: 'Area: 153.94\nCircumference: 43.98', is_hidden: false },
      { input_data: '5.0', expected_output: 'Area: 78.54\nCircumference: 31.42', is_hidden: true },
    ],
  },
  {
    id: 'celsius-to-fahrenheit',
    order: 7,
    title: 'Celsius to Fahrenheit Temperature Converter',
    subtopic: 'Formulas & Math Conversions',
    difficulty: 'Basic',
    statement: 'Convert temperature from Celsius (`C`) to Fahrenheit (`F`) using the formula: `F = (C * 9/5) + 32`. Output formatted to 1 decimal place.',
    inputFormat: 'A float temperature in Celsius.',
    outputFormat: '`<Fahrenheit:.1f> F`',
    examples: [
      { input: '25.0', output: '77.0 F' },
      { input: '0.0', output: '32.0 F' },
      { input: '100.0', output: '212.0 F' },
    ],
    starterCode: {
      python: 'def solve():\n    celsius = float(input().strip())\n    fahrenheit = (celsius * 9/5) + 32\n    print(f"{fahrenheit:.1f} F")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '25.0', expected_output: '77.0 F', is_hidden: false },
      { input_data: '0.0', expected_output: '32.0 F', is_hidden: false },
      { input_data: '100.0', expected_output: '212.0 F', is_hidden: true },
    ],
  },
  {
    id: 'swap-two-variables',
    order: 8,
    title: 'Swap Two Variables (Tuple Unpacking)',
    subtopic: 'Multiple Assignment & Unpacking',
    difficulty: 'Basic',
    statement: 'Given two values `a` and `b`, swap their contents using Python\'s elegant tuple unpacking syntax `a, b = b, a` and print them.',
    inputFormat: 'Line 1: Value a\nLine 2: Value b',
    outputFormat: '`After Swap: a = <b>, b = <a>`',
    examples: [
      { input: '10\n20', output: 'After Swap: a = 20, b = 10' },
      { input: 'Apple\nBanana', output: 'After Swap: a = Banana, b = Apple' },
    ],
    starterCode: {
      python: 'def solve():\n    a = input().strip()\n    b = input().strip()\n    a, b = b, a\n    print(f"After Swap: a = {a}, b = {b}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '10\n20', expected_output: 'After Swap: a = 20, b = 10', is_hidden: false },
      { input_data: 'Apple\nBanana', expected_output: 'After Swap: a = Banana, b = Apple', is_hidden: false },
    ],
  },
  {
    id: 'simple-interest',
    order: 9,
    title: 'Simple Interest & Total Amount Calculator',
    subtopic: 'Financial Calculations',
    difficulty: 'Basic',
    statement: 'Calculate Simple Interest `SI = (P * R * T) / 100` and Total Amount `A = P + SI`. Format both to 2 decimal places.',
    inputFormat: 'Line 1: Principal P (float)\nLine 2: Rate of interest R (float)\nLine 3: Time in years T (float)',
    outputFormat: 'Line 1: `Interest: <SI:.2f>`\nLine 2: `Total: <A:.2f>`',
    examples: [
      { input: '1000.0\n5.0\n2.0', output: 'Interest: 100.00\nTotal: 1100.00' },
    ],
    starterCode: {
      python: 'def solve():\n    P = float(input().strip())\n    R = float(input().strip())\n    T = float(input().strip())\n    SI = (P * R * T) / 100\n    total = P + SI\n    print(f"Interest: {SI:.2f}")\n    print(f"Total: {total:.2f}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '1000.0\n5.0\n2.0', expected_output: 'Interest: 100.00\nTotal: 1100.00', is_hidden: false },
      { input_data: '5000.0\n7.5\n3.0', expected_output: 'Interest: 1125.00\nTotal: 6125.00', is_hidden: true },
    ],
  },
  {
    id: 'average-of-three-numbers',
    order: 10,
    title: 'Average of Three Numbers',
    subtopic: 'Arithmetic Mean',
    difficulty: 'Basic',
    statement: 'Given three numbers (integers or floats), compute their arithmetic average and format to 2 decimal places.',
    inputFormat: 'Line 1: num1\nLine 2: num2\nLine 3: num3',
    outputFormat: '`Average: <avg:.2f>`',
    examples: [
      { input: '10\n20\n30', output: 'Average: 20.00' },
      { input: '15\n25\n35', output: 'Average: 25.00' },
    ],
    starterCode: {
      python: 'def solve():\n    n1 = float(input().strip())\n    n2 = float(input().strip())\n    n3 = float(input().strip())\n    avg = (n1 + n2 + n3) / 3\n    print(f"Average: {avg:.2f}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '10\n20\n30', expected_output: 'Average: 20.00', is_hidden: false },
      { input_data: '15\n25\n35', expected_output: 'Average: 25.00', is_hidden: false },
    ],
  },
  {
    id: 'convert-minutes-to-hours',
    order: 11,
    title: 'Convert Total Minutes to Hours and Minutes',
    subtopic: 'Floor Division (//) & Modulo (%)',
    difficulty: 'Basic',
    statement: 'Given a total number of minutes as an integer, convert it into hours and remaining minutes using `//` and `%`.',
    inputFormat: 'An integer total_minutes.',
    outputFormat: '`<total_minutes> minutes = <hours> hours and <mins> minutes`',
    examples: [
      { input: '135', output: '135 minutes = 2 hours and 15 minutes' },
      { input: '60', output: '60 minutes = 1 hours and 0 minutes' },
    ],
    starterCode: {
      python: 'def solve():\n    total_minutes = int(input().strip())\n    hours = total_minutes // 60\n    mins = total_minutes % 60\n    print(f"{total_minutes} minutes = {hours} hours and {mins} minutes")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '135', expected_output: '135 minutes = 2 hours and 15 minutes', is_hidden: false },
      { input_data: '60', expected_output: '60 minutes = 1 hours and 0 minutes', is_hidden: false },
      { input_data: '245', expected_output: '245 minutes = 4 hours and 5 minutes', is_hidden: true },
    ],
  },
  {
    id: 'calculate-discount',
    order: 12,
    title: 'Calculate Discount and Final Price',
    subtopic: 'Percentage Calculations',
    difficulty: 'Basic',
    statement: 'Given original price and discount percentage, calculate savings and final payable price.',
    inputFormat: 'Line 1: Original price (float)\nLine 2: Discount percentage (float)',
    outputFormat: 'Line 1: `Discount: <discount:.2f>`\nLine 2: `Final Price: <final_price:.2f>`',
    examples: [
      { input: '1000.0\n15.0', output: 'Discount: 150.00\nFinal Price: 850.00' },
    ],
    starterCode: {
      python: 'def solve():\n    price = float(input().strip())\n    discount_pct = float(input().strip())\n    discount = (price * discount_pct) / 100\n    final_price = price - discount\n    print(f"Discount: {discount:.2f}")\n    print(f"Final Price: {final_price:.2f}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '1000.0\n15.0', expected_output: 'Discount: 150.00\nFinal Price: 850.00', is_hidden: false },
      { input_data: '250.0\n20.0', expected_output: 'Discount: 50.00\nFinal Price: 200.00', is_hidden: true },
    ],
  },
  {
    id: 'student-profile-summary',
    order: 13,
    title: 'Student Profile Summary Card',
    subtopic: 'f-strings & Multi-line Formatting',
    difficulty: 'Basic',
    statement: 'Read student name, age, city, and course, and print a formatted profile summary.',
    inputFormat: 'Line 1: Name\nLine 2: Age\nLine 3: City\nLine 4: Course',
    outputFormat: '=== Student Profile ===\nName: <name>\nAge: <age>\nCity: <city>\nCourse: <course>',
    examples: [
      { input: 'Rafik\n22\nMumbai\nPython Mastery', output: '=== Student Profile ===\nName: Rafik\nAge: 22\nCity: Mumbai\nCourse: Python Mastery' },
    ],
    starterCode: {
      python: 'def solve():\n    name = input().strip()\n    age = input().strip()\n    city = input().strip()\n    course = input().strip()\n    print("=== Student Profile ===")\n    print(f"Name: {name}")\n    print(f"Age: {age}")\n    print(f"City: {city}")\n    print(f"Course: {course}")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: 'Rafik\n22\nMumbai\nPython Mastery', expected_output: '=== Student Profile ===\nName: Rafik\nAge: 22\nCity: Mumbai\nCourse: Python Mastery', is_hidden: false },
    ],
  },
  {
    id: 'data-type-inspector',
    order: 14,
    title: 'Data Type Inspector and Conversions',
    subtopic: 'type() and Casting Functions',
    difficulty: 'Basic',
    statement: 'Read a numeric string, convert it to integer, float, and boolean, and print their types and values.',
    inputFormat: 'A single non-empty numeric string.',
    outputFormat: 'Line 1: `int: <val> (<type>)`\nLine 2: `float: <val:.1f> (<type>)`\nLine 3: `bool: <val> (<type>)`',
    examples: [
      { input: '42', output: "int: 42 (<class 'int'>)\nfloat: 42.0 (<class 'float'>)\nbool: True (<class 'bool'>)" },
    ],
    starterCode: {
      python: 'def solve():\n    s = input().strip()\n    i = int(s)\n    f = float(s)\n    b = bool(i)\n    print(f"int: {i} ({type(i)})")\n    print(f"float: {f:.1f} ({type(f)})")\n    print(f"bool: {b} ({type(b)})")\n\nif __name__ == "__main__":\n    solve()\n',
    },
    testCases: [
      { input_data: '42', expected_output: "int: 42 (<class 'int'>)\nfloat: 42.0 (<class 'float'>)\nbool: True (<class 'bool'>)", is_hidden: false },
    ],
  },
];

export const LEVEL_1_MINI_PROJECT: MiniProject = {
  id: 'student-basic-information-program',
  title: 'Student Basic Information & Report Card Program',
  level: 'Level 1 — Python Foundations',
  description: 'Apply everything learned in Level 1: user input, variable declarations, type casting, arithmetic operations, and beautiful multi-line f-string formatting to generate an official Student Profile Report Card.',
  inputs: [
    'Student Full Name (string)',
    'Age (integer)',
    'Course Name (string)',
    'City (string)',
    'Marks in 5 Subjects (English, Math, Science, History, Computer Science)',
  ],
  outputFormat: 'Formatted ASCII Report Card with Total Marks, Percentage, and Status.',
  starterCode: `# Level 1 Mini Project: Student Basic Information Program
def generate_student_report():
    print("========================================")
    print("     CODEXPETRA STUDENT PROFILE ENGINE  ")
    print("========================================")
    
    # 1. Capture Student Details
    name = input("Enter Student Name: ").strip()
    age = int(input("Enter Age: ").strip())
    course = input("Enter Course: ").strip()
    city = input("Enter City: ").strip()
    
    # 2. Capture Marks in 5 Subjects
    print("\\nEnter marks out of 100 for 5 subjects:")
    m1 = float(input("English: "))
    m2 = float(input("Mathematics: "))
    m3 = float(input("Science: "))
    m4 = float(input("History: "))
    m5 = float(input("Computer Science: "))
    
    # 3. Perform Calculations
    total_marks = m1 + m2 + m3 + m4 + m5
    max_marks = 500.0
    percentage = (total_marks / max_marks) * 100
    is_passed = percentage >= 40.0
    status = "PASSED" if is_passed else "NEEDS IMPROVEMENT"
    
    # 4. Display Formatted Profile & Report Card
    print("\\n" + "=" * 42)
    print("           STUDENT REPORT CARD            ")
    print("=" * 42)
    print(f"Name     : {name}")
    print(f"Age      : {age} years")
    print(f"Course   : {course}")
    print(f"City     : {city}")
    print("-" * 42)
    print(f"Total Marks : {total_marks:.1f} / {max_marks:.0f}")
    print(f"Percentage  : {percentage:.2f}%")
    print(f"Result      : {status}")
    print("=" * 42)

if __name__ == "__main__":
    generate_student_report()
`,
  solutionCode: `# Complete Reference Solution
def generate_student_report():
    name = "Alex Mercer"
    age = 20
    course = "Python Foundations"
    city = "San Francisco"
    marks = [85, 92, 88, 79, 95]
    total = sum(marks)
    percentage = (total / 500) * 100
    print(f"Name: {name}, Age: {age}, Course: {course}, Total: {total}, Percentage: {percentage:.2f}%")
`,
  keyConcepts: [
    'input() with prompt labels',
    'Explicit type conversion: int() and float()',
    'Arithmetic addition, multiplication and division',
    'f-string variable interpolation and floating precision {:.2f}',
    'Dynamic string repetition for borders: "=" * 42',
  ],
};

export const LEVEL_1_FINAL_ASSESSMENT: FinalAssessment = {
  id: 'level-1-final-assessment',
  title: 'Level 1 — Python Foundations Final Assessment',
  level: 'Level 1 — Python Foundations',
  totalQuestions: 10,
  timeLimitMinutes: 15,
  questions: [
    {
      id: 'fa-1',
      type: 'mcq',
      question: 'Which of the following statements about Python is TRUE?',
      options: [
        'Python is a purely compiled language like C.',
        'Python code is converted into bytecode before being executed by the PVM (Python Virtual Machine).',
        'Python requires manual memory allocation using malloc and free.',
        'Python does not support dynamic typing.',
      ],
      correctIndex: 1,
      explanation: 'Python is an interpreted language that first compiles human-readable source code into intermediate bytecode (.pyc), which the Python Virtual Machine (PVM) executes line-by-line.',
    },
    {
      id: 'fa-2',
      type: 'output_prediction',
      question: 'What is the output of the following Python expression?\nprint(10 // 3, 10 / 3, 10 % 3)',
      codeSnippet: 'print(10 // 3, 10 / 3, 10 % 3)',
      options: [
        '3 3.3333333333333335 1',
        '3.33 3.33 1',
        '3 3 1',
        '3.0 3.33 1.0',
      ],
      correctIndex: 0,
      explanation: '// performs integer floor division (returning 3), / performs float true division (returning 3.333...), and % returns the remainder (1).',
    },
    {
      id: 'fa-3',
      type: 'find_error',
      question: 'Which of the following variable names is INVALID in Python?',
      options: [
        '_user_count',
        'student_2_marks',
        '2nd_position',
        'totalAmount$',
      ],
      correctIndex: 2,
      explanation: 'Identifiers cannot start with a digit. Therefore `2nd_position` is invalid. Also `totalAmount$` is invalid because $ is not allowed in Python identifiers.',
    },
    {
      id: 'fa-4',
      type: 'mcq',
      question: 'What is the value of the expression `type(None)` in Python 3?',
      options: [
        '<class \'null\'>',
        '<class \'NoneType\'>',
        '<class \'void\'>',
        '<class \'undefined\'>',
      ],
      correctIndex: 1,
      explanation: 'None is a singleton object of the class `NoneType`.',
    },
    {
      id: 'fa-5',
      type: 'output_prediction',
      question: 'What is the output of the following code snippet?\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)',
      codeSnippet: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)',
      options: [
        '[1, 2, 3]',
        '[1, 2, 3, 4]',
        'Error: lists are immutable',
        '[4]',
      ],
      correctIndex: 1,
      explanation: 'In Python, assignment `y = x` copies the memory reference, not the object. Since lists are mutable, modifying `y` also modifies `x`.',
    },
    {
      id: 'fa-6',
      type: 'true_false',
      question: 'In Python, the `==` operator compares object identities (memory address), whereas the `is` operator compares values.',
      options: [
        'True',
        'False',
      ],
      correctIndex: 1,
      explanation: 'False! `==` compares values (equality), whereas `is` compares memory identity (whether both variables point to the exact same object in memory).',
    },
    {
      id: 'fa-7',
      type: 'output_prediction',
      question: 'What is the output of: `print("Python" * 3)`?',
      codeSnippet: 'print("Python" * 3)',
      options: [
        'Python Python Python',
        'PythonPythonPython',
        'TypeError: can\'t multiply sequence by non-int of type \'str\'',
        'Python^3',
      ],
      correctIndex: 1,
      explanation: 'The `*` operator on strings performs string repetition, producing "PythonPythonPython" without spaces.',
    },
    {
      id: 'fa-8',
      type: 'mcq',
      question: 'What happens when `input()` is called without converting its return value?',
      options: [
        'It automatically detects whether the input is integer, float, or string.',
        'It always returns a string (str), regardless of what the user types.',
        'It returns None if no prompt message is provided.',
        'It causes a SyntaxError if numbers are entered.',
      ],
      correctIndex: 1,
      explanation: 'Python\'s `input()` function always returns a string data type. If numbers are required, explicit conversion like `int()` or `float()` must be used.',
    },
    {
      id: 'fa-9',
      type: 'find_error',
      question: 'What type of error is raised by the following code?\nprint("User age is: " + 25)',
      codeSnippet: 'print("User age is: " + 25)',
      options: [
        'SyntaxError',
        'TypeError: can only concatenate str (not "int") to str',
        'ValueError',
        'NameError',
      ],
      correctIndex: 1,
      explanation: 'Python does not allow implicit concatenation between string and integer with `+`. You must convert with `str(25)` or use an f-string `f"User age is: {25}"`.',
    },
    {
      id: 'fa-10',
      type: 'output_prediction',
      question: 'What is the output of the following f-string?\npi = 3.14159265\nprint(f"{pi:.2f}")',
      codeSnippet: 'pi = 3.14159265\nprint(f"{pi:.2f}")',
      options: [
        '3.14',
        '3.141',
        '3.1',
        '3.14159265',
      ],
      correctIndex: 0,
      explanation: 'The formatting specifier `:.2f` formats the float to exactly 2 decimal places with rounding, yielding `3.14`.',
    },
  ],
};

export const LEVEL_1_LESSONS: Record<string, PythonLesson> = {
  '1-1-introduction-to-python': {
    id: '1-1-introduction-to-python',
    lessonNumber: '1.1',
    title: 'Introduction to Python',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '10 min read',
    difficulty: 'Beginner',
    introduction: 'Python is a modern, high-level, versatile programming language renowned for its English-like readability and immense power across Web Development, Data Science, AI, and Automation.',
    learningObjectives: [
      'Understand what Python is and how programming languages work',
      'Explain the history, creator, and evolution of Python 2 to Python 3',
      'Identify key features, advantages, and real-world industry applications',
      'Compare Python with C, C++, Java, and JavaScript in execution and syntax',
      'Understand how Python code executes via the Interpreter, Bytecode, and PVM',
    ],
    sections: [
      {
        id: 'what-is-python',
        title: '1. What is Python?',
        content: `**Python** is an open-source, high-level, general-purpose, dynamically-typed, and interpreted programming language created by **Guido van Rossum** in 1991.\n\nUnlike languages with verbose boilerplate (like C or Java), Python emphasizes **developer productivity and human readability**. Python code reads almost like plain English, allowing beginners and seasoned architects alike to turn ideas into working software in fewer lines of code.\n\n### Core Philosophy: The Zen of Python\nPython follows a set of design principles captured in *The Zen of Python* (accessible by typing \`import this\` in Python):\n- Beautiful is better than ugly.\n- Explicit is better than implicit.\n- Simple is better than complex.\n- Readability counts.`,
        callout: {
          type: 'analogy',
          title: 'Think of it like a Universal Translator',
          text: 'Computers only understand binary (0s and 1s). Python acts like an eloquent translator: you write clear, human-like instructions, and the Python Interpreter translates them into machine instructions instantly.',
        },
      },
      {
        id: 'history-and-evolution',
        title: '2. History & Evolution of Python',
        content: `Python was conceived in the late 1980s by Dutch programmer **Guido van Rossum** at the *Centrum Wiskunde & Informatica* (CWI) in the Netherlands. It was named not after the snake, but after the British comedy troupe **Monty Python's Flying Circus**.\n\n### Key Milestones:\n- **Python 0.9.0 (1991):** First public release featuring classes, functions, exception handling, and core data types.\n- **Python 2.0 (2000):** Introduced list comprehensions and cycle-detecting garbage collection.\n- **Python 3.0 (2008):** A major backward-incompatible revision designed to fix fundamental design flaws.\n- **Python 3.12+ (Present):** Ultra-fast specialized adaptive interpreter and typing support.`,
      },
      {
        id: 'features-of-python',
        title: '3. Features of Python',
        content: `Python is one of the world's most loved languages because of its unique combination of simplicity and power:\n\n1. **Simple and Easy to Learn:** Clean syntax without semicolons (\`;\`) or curly brackets (\`{}\`).\n2. **Interpreted Language:** Executes code line by line, simplifying debugging.\n3. **Dynamically Typed:** Variable types are resolved at runtime.\n4. **Cross-Platform / Portable:** Runs seamlessly on Windows, macOS, Linux, and embedded systems.\n5. **Batteries Included Standard Library:** Rich out-of-the-box modules.\n6. **Extensible and Embeddable:** Can be integrated with C, C++, and Rust.`,
      },
      {
        id: 'python-applications',
        title: '4. Industry Applications of Python',
        content: `Python powers the world's leading technology infrastructures across 7 massive sectors:`,
        cards: [
          { title: 'Web Development', description: 'Powering high-scale backends using Django, FastAPI, and Flask.', tag: 'Web' },
          { title: 'Data Science & Analytics', description: 'Analyzing petabytes of data using Pandas, NumPy, and Matplotlib.', tag: 'Data' },
          { title: 'Artificial Intelligence & ML', description: 'Building neural networks, LLMs, and computer vision with PyTorch and TensorFlow.', tag: 'AI/ML' },
          { title: 'Automation & Scripting', description: 'Automating repetitive OS workflows, web scraping, and DevOps pipelines.', tag: 'DevOps' },
          { title: 'Cybersecurity & Testing', description: 'Penetration testing and automated test suites with PyTest.', tag: 'Security' },
          { title: 'IoT & Embedded Systems', description: 'Running microcontrollers using MicroPython and CircuitPython.', tag: 'Hardware' },
        ],
      },
      {
        id: 'python-implementations',
        title: '5. Python Implementations',
        content: `Implementations tailored for different runtime environments:\n\n- **CPython:** The standard and most widely used implementation in C.\n- **PyPy:** High-performance JIT compiled implementation.\n- **Jython:** Runs Python on the Java Virtual Machine.\n- **IronPython:** Runs Python on Microsoft .NET.\n- **MicroPython:** Ultra-lightweight implementation for microcontrollers.`,
      },
      {
        id: 'language-comparisons',
        title: '6. Python vs C vs Java vs JavaScript',
        content: `Comparison of Python against other mainstream programming languages:`,
        comparisonTable: {
          headers: ['Feature', 'Python', 'C / C++', 'Java', 'JavaScript'],
          rows: [
            ['Paradigm', 'Multi-paradigm (OOP, Procedural, Functional)', 'Procedural / OOP', 'Pure Object-Oriented', 'Event-Driven / OOP'],
            ['Typing', 'Dynamic & Strong', 'Static & Strong', 'Static & Strong', 'Dynamic & Weak'],
            ['Syntax Complexity', 'Minimal / Human English', 'High / Memory Management', 'Moderate / Verbose', 'Moderate / C-style'],
            ['Execution', 'Interpreted (Bytecode + PVM)', 'Compiled to Native Machine Code', 'Compiled to JVM Bytecode', 'JIT Compiled (V8)'],
            ['Primary Use Case', 'AI, Data Science, Web, Scripting', 'System Software, Games, Embedded', 'Enterprise Backend, Android', 'Web Frontend & Fullstack Node'],
          ],
        },
      },
      {
        id: 'how-python-executes',
        title: '7. How Python Code Executes',
        content: `When you run a Python script like \`python main.py\`, the following process takes place under the hood:\n\n1. **Source Code (.py):** You write human-readable code in a text file.\n2. **Bytecode Compilation (.pyc):** CPython compiles the source code into an optimized intermediate representation called **Bytecode**.\n3. **Python Virtual Machine (PVM):** The PVM executes each bytecode instruction on your CPU.\n\n\`\`\`\n[ Source (.py) ] ──> [ Bytecode (.pyc) ] ──> [ Python Virtual Machine (PVM) ] ──> [ Machine Execution ]\n\`\`\``,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.1 Introduction to Python: Your First Program
platform = "CodexPetra"
category = "Python Foundations"
level = 1

# Display greeting and details
print("Welcome to", platform)
print(f"Course Track : {category} (Level {level})")
print("Status       : Ready to Learn!")
`,
      output: `Welcome to CodexPetra
Course Track : Python Foundations (Level 1)
Status       : Ready to Learn!`,
      howItWorks: [
        'Line 2-4: Variables store string and integer values in memory.',
        'Line 7: print() outputs text to the standard console.',
        'Line 8: An f-string dynamically embeds variables into the output.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Using uppercase for Python keywords or print',
        badCode: 'Print("Hello World")',
        goodCode: 'print("Hello World")',
        explanation: 'Python is strictly case-sensitive. print() must be lowercase.',
      },
    ],
    keyPoints: [
      'Python was created by Guido van Rossum in 1991.',
      'Python is high-level, dynamically typed, and interpreted.',
      'Code executes via Bytecode compilation followed by execution on the Python Virtual Machine (PVM).',
      'Python is case-sensitive: name, Name, and NAME are distinct identifiers.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[0],
      LEVEL_1_PRACTICE_PROBLEMS[1],
    ],
    quizzes: [
      {
        id: 'q-1-1-1',
        type: 'mcq',
        question: 'Who created the Python programming language?',
        options: ['James Gosling', 'Guido van Rossum', 'Brendan Eich', 'Dennis Ritchie'],
        correctIndex: 1,
        explanation: 'Guido van Rossum created Python in 1991 at CWI in the Netherlands.',
      },
      {
        id: 'q-1-1-2',
        type: 'mcq',
        question: 'How does CPython execute Python code?',
        options: [
          'Directly converts source code into native machine assembly in one step',
          'Compiles source code into Bytecode (.pyc) and executes it on the Python Virtual Machine (PVM)',
          'Requires a web browser engine to interpret script tags',
          'Only executes via an external C compiler',
        ],
        correctIndex: 1,
        explanation: 'CPython compiles human-readable code into intermediate Bytecode, which is then interpreted by the PVM.',
      },
    ],
    relatedTopics: [
      { id: '1-2-python-installation-environment-setup', title: 'Python Installation & Environment Setup', chapterName: 'Level 1 — Python Foundations', readingTime: '12 min read' },
      { id: '1-3-python-tokens-basic-syntax', title: 'Python Tokens & Basic Syntax', chapterName: 'Level 1 — Python Foundations', readingTime: '15 min read' },
    ],
    nextLessonId: '1-2-python-installation-environment-setup',
  },

  '1-2-python-installation-environment-setup': {
    id: '1-2-python-installation-environment-setup',
    lessonNumber: '1.2',
    title: 'Python Installation & Environment Setup',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '12 min read',
    difficulty: 'Beginner',
    introduction: 'Set up a professional Python development environment on Windows, macOS, or Linux, configure VS Code, explore the Python REPL, and master pip packages and virtual environments.',
    learningObjectives: [
      'Install Python 3 correctly on Windows, macOS, and Linux',
      'Understand and configure the system PATH environment variable',
      'Set up VS Code with the official Microsoft Python extension',
      'Run Python interactively via the REPL and execute script files (.py)',
      'Manage packages using pip and isolate projects with virtual environments (venv)',
    ],
    sections: [
      {
        id: 'installing-python',
        title: '1. Installing Python on Windows, macOS & Linux',
        content: `### Windows Installation:\n1. Download Python 3 from **python.org**.\n2. **CRITICAL:** Check **"Add python.exe to PATH"**.\n3. Click "Install Now".\n\n### macOS Installation:\n\`\`\`bash\nbrew install python\n\`\`\`\n\n### Linux Installation:\n\`\`\`bash\nsudo apt update && sudo apt install python3 python3-pip python3-venv\n\`\`\`\n\n### Verify Installation:\n\`\`\`bash\npython --version\n\`\`\``,
        callout: {
          type: 'warning',
          title: 'The #1 Beginner Setup Mistake',
          text: 'If you forgot to check "Add python.exe to PATH" on Windows, the terminal will report: \'python\' is not recognized. Re-run the installer and check Add to PATH.',
        },
      },
      {
        id: 'what-is-path',
        title: '2. Understanding the PATH Environment Variable',
        content: `The **PATH** is an operating system variable that tells your OS which directories to search for executable commands like \`python.exe\`.`,
      },
      {
        id: 'ides-and-editors',
        title: '3. Choosing an IDE: VS Code Setup',
        content: `Install **Visual Studio Code (VS Code)**, open the Extensions marketplace, and install the official **Python Extension** by Microsoft.`,
      },
      {
        id: 'running-python-scripts',
        title: '4. Running Your First Python Script',
        content: `Type \`python\` in your terminal for the interactive REPL prompt (\`>>>\`), or create an \`app.py\` file and execute with \`python app.py\`.`,
      },
      {
        id: 'pip-and-virtual-environments',
        title: '5. Managing Packages with pip & Virtual Environments',
        content: `Use **pip** to install packages (\`pip install requests\`) and **venv** to create isolated project environments (\`python -m venv venv\`).`,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.2 Verifying Python Runtime Environment
import sys
import os

print("=== Python Environment Diagnostics ===")
print("Python Version   :", sys.version.split()[0])
print("Platform         :", sys.platform)
print("Executable Path  :", sys.executable)
print("Environment Status: Operational & Ready!")
`,
      output: `=== Python Environment Diagnostics ===
Python Version   : 3.12.2
Platform         : win32
Executable Path  : C:\\Python312\\python.exe
Environment Status: Operational & Ready!`,
      howItWorks: [
        'Line 2-3: sys and os standard modules provide runtime metadata.',
        'Line 6: sys.version returns the active Python interpreter version.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Installing packages globally without a virtual environment',
        badCode: 'pip install pandas (without active venv)',
        goodCode: 'python -m venv venv && source venv/bin/activate && pip install pandas',
        explanation: 'Always use virtual environments to prevent package version conflicts.',
      },
    ],
    keyPoints: [
      'Enable "Add python.exe to PATH" during installation on Windows.',
      'Use the Python REPL (>>>) for quick testing.',
      'Use python -m venv venv to create project-specific virtual environments.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[0],
      LEVEL_1_PRACTICE_PROBLEMS[1],
    ],
    quizzes: [
      {
        id: 'q-1-2-1',
        type: 'mcq',
        question: 'Which command verifies the installed Python version in terminal?',
        options: ['python --version', 'python -check', 'python -v -all', 'get python version'],
        correctIndex: 0,
        explanation: '`python --version` (or `python -V`) prints the installed Python version.',
      },
    ],
    relatedTopics: [
      { id: '1-1-introduction-to-python', title: 'Introduction to Python', chapterName: 'Level 1 — Python Foundations', readingTime: '10 min read' },
      { id: '1-3-python-tokens-basic-syntax', title: 'Python Tokens & Basic Syntax', chapterName: 'Level 1 — Python Foundations', readingTime: '15 min read' },
    ],
    prevLessonId: '1-1-introduction-to-python',
    nextLessonId: '1-3-python-tokens-basic-syntax',
  },

  '1-3-python-tokens-basic-syntax': {
    id: '1-3-python-tokens-basic-syntax',
    lessonNumber: '1.3',
    title: 'Python Tokens & Basic Syntax',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '15 min read',
    difficulty: 'Beginner',
    introduction: 'Explore the fundamental building blocks of Python programs: Keywords, Identifiers, Literals, Operators, Delimiters, Comments, Indentation rules, and Escape Sequences.',
    learningObjectives: [
      'Identify the 5 core token types: Keywords, Identifiers, Literals, Operators, and Delimiters',
      'Follow the strict naming rules for Python identifiers and variables',
      'Master indentation syntax (PEP 8 rules) and understand IndentationError',
      'Write single-line comments, multiline conventions, and function docstrings',
    ],
    sections: [
      {
        id: 'what-are-tokens',
        title: '1. What are Tokens?',
        content: `A **Token** is the smallest individual unit in a Python program:\n1. **Keywords:** 35 reserved words (\`if\`, \`def\`, \`class\`, \`return\`).\n2. **Identifiers:** Names of variables, functions, and classes (\`user_name\`).\n3. **Literals:** Constant data values (\`42\`, \`3.14\`, \`"CodexPetra"\`, \`True\`).\n4. **Operators:** Symbols performing computations (\`+\`, \`-\`, \`*\`, \`==\`).\n5. **Delimiters:** Syntax symbols (\`(\`, \`)\`, \`[\`, \`]\`, \`{\`, \`}\`, \`:\`, \`,\`).`,
      },
      {
        id: 'keywords',
        title: '2. Python Keywords (Reserved Words)',
        content: `Python has **35 reserved keywords** that cannot be used as variable names. Only \`True\`, \`False\`, and \`None\` are capitalized. All others are strictly lowercase.`,
      },
      {
        id: 'identifiers-rules',
        title: '3. Identifiers & Naming Rules',
        content: `Rules for naming variables and functions:\n- Must start with a letter (\`a-z\`, \`A-Z\`) or underscore (\`_\`).\n- Cannot start with a digit (\`0-9\`).\n- Cannot contain special characters (\`$\`, \`@\`, \`-\`).\n- Cannot be a reserved keyword.\n- Case-sensitive (\`score\` != \`Score\`).`,
        comparisonTable: {
          headers: ['Identifier', 'Validity', 'Reason'],
          rows: [
            ['`user_name`', 'Valid ✅', 'Starts with letter, contains underscores.'],
            ['`_temp`', 'Valid ✅', 'Underscore start is allowed.'],
            ['`2nd_place`', 'Invalid ❌', 'Cannot begin with a digit.'],
            ['`user-name`', 'Invalid ❌', 'Hyphen (-) is treated as subtraction operator.'],
            ['`class`', 'Invalid ❌', 'Reserved keyword.'],
          ],
        },
      },
      {
        id: 'indentation-rules',
        title: '4. Python Indentation (The Whitespace Rule)',
        content: `Python uses **4 spaces** for indentation to define code blocks instead of curly brackets \`{}\`. Incorrect indentation raises \`IndentationError\`.`,
      },
      {
        id: 'comments-and-docstrings',
        title: '5. Comments & Docstrings',
        content: `Use \`#\` for single-line comments and \`"""docstring"""\` for documenting functions and modules.`,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.3 Python Tokens & Syntax Demonstration
student_name = "Alex"
marks_obtained = 94.5
is_enrolled = True

print(f"Student\\t: {student_name}")
print(f"Marks\\t: {marks_obtained}%")
print(f"Status\\t: {'Enrolled' if is_enrolled else 'Pending'}")
`,
      output: `Student\t: Alex
Marks\t: 94.5%
Status\t: Enrolled`,
      howItWorks: [
        'Line 2-4: Variable identifiers assigned to String, Float, and Boolean literals.',
        'Line 6-8: Formatted output using \\t escape sequence.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Using hyphen instead of underscore in variable names',
        badCode: 'user-age = 21',
        goodCode: 'user_age = 21',
        explanation: 'Hyphen (-) is subtraction in Python.',
      },
    ],
    keyPoints: [
      'There are 35 keywords in Python.',
      'Identifiers cannot start with digits.',
      'PEP 8 standard mandates 4 spaces per indentation level.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[1],
      LEVEL_1_PRACTICE_PROBLEMS[2],
    ],
    quizzes: [
      {
        id: 'q-1-3-1',
        type: 'mcq',
        question: 'Which of the following is a valid identifier in Python?',
        options: ['2nd_item', 'total-sum', '_user_count_2026', 'def'],
        correctIndex: 2,
        explanation: '`_user_count_2026` is valid because it starts with an underscore.',
      },
    ],
    relatedTopics: [
      { id: '1-2-python-installation-environment-setup', title: 'Python Installation & Environment Setup', chapterName: 'Level 1 — Python Foundations', readingTime: '12 min read' },
      { id: '1-4-variables-basic-data-types', title: 'Variables & Basic Data Types', chapterName: 'Level 1 — Python Foundations', readingTime: '12 min read' },
    ],
    prevLessonId: '1-2-python-installation-environment-setup',
    nextLessonId: '1-4-variables-basic-data-types',
  },

  '1-4-variables-basic-data-types': {
    id: '1-4-variables-basic-data-types',
    lessonNumber: '1.4',
    title: 'Variables & Basic Data Types',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '12 min read',
    difficulty: 'Beginner',
    introduction: 'A variable is a name that refers to a value stored in memory. In Python, you don\'t need to specify the type of a variable — Python automatically determines it based on the value.',
    learningObjectives: [
      'Understand what variables are and why they are used',
      'Learn how to declare, assign, and reassign values to variables',
      'Explore built-in data types: int, float, complex, bool, str, and NoneType',
      'Use type(), isinstance(), and id() to inspect memory objects',
      'Master explicit and implicit type conversions',
    ],
    sections: [
      {
        id: 'what-are-variables',
        title: '1. What are Variables?',
        content: `A **variable** is a named reference pointing to an object in computer memory. You assign values with \`=\` without needing type declarations.`,
        callout: {
          type: 'analogy',
          title: 'Think of it like a label',
          text: 'A variable is like a sticky note with a name, stuck to a box containing a value in memory.',
        },
      },
      {
        id: 'dynamic-typing',
        title: '2. Dynamic Typing & Multiple Assignment',
        content: `Python is **dynamically typed**: variables can be reassigned to different types at runtime.\n\n\`\`\`python\nx = 42         # int\nx = "Codex"    # str\na, b = 10, 20  # multiple assignment\n\`\`\``,
      },
      {
        id: 'builtin-data-types',
        title: '3. Python Built-in Data Types',
        content: `Core built-in data types:\n- **int:** Whole numbers (\`100\`, \`-5\`).\n- **float:** Decimal numbers (\`3.14159\`).\n- **complex:** Numbers with imaginary components (\`3 + 4j\`).\n- **str:** Unicode text (\`"CodexPetra"\`).\n- **bool:** \`True\` or \`False\`.\n- **NoneType:** Absence of a value (\`None\`).`,
      },
      {
        id: 'type-conversion',
        title: '4. Type Conversion (Casting)',
        content: `Convert types explicitly using constructor functions: \`int("42")\`, \`float("3.14")\`, \`str(100)\`, \`bool(1)\`.`,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.4 Variables and Data Types Demonstration
name = "CodexPetra"
age = 20
rating = 4.95
is_student = True
empty_val = None

print(f"Name      : {name} ({type(name).__name__})")
print(f"Age       : {age} ({type(age).__name__})")
print(f"Rating    : {rating} ({type(rating).__name__})")
print(f"Is Student: {is_student} ({type(is_student).__name__})")
print(f"Empty Val : {empty_val} ({type(empty_val).__name__})")
`,
      output: `Name      : CodexPetra (str)
Age       : 20 (int)
Rating    : 4.95 (float)
Is Student: True (bool)
Empty Val : None (NoneType)`,
      howItWorks: [
        'Line 2-6: Variables assigned to str, int, float, bool, and NoneType.',
        'Line 8-12: type(var).__name__ prints the class name.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Trying to convert invalid strings to int',
        badCode: 'val = int("Codex100")',
        goodCode: 'val = int("100")',
        explanation: 'int() requires decimal digits only.',
      },
    ],
    keyPoints: [
      'Variables store data in memory without manual type declaration.',
      'Built-in types include int, float, str, bool, and NoneType.',
      'Use type() to inspect object types.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[1],
      LEVEL_1_PRACTICE_PROBLEMS[2],
      LEVEL_1_PRACTICE_PROBLEMS[7],
      LEVEL_1_PRACTICE_PROBLEMS[13],
    ],
    quizzes: [
      {
        id: 'q-1-4-1',
        type: 'mcq',
        question: 'What is the output of `type(10 / 2)` in Python 3?',
        options: ['<class \'int\'>', '<class \'float\'>', '<class \'number\'>', '<class \'double\'>'],
        correctIndex: 1,
        explanation: 'Single division `/` always returns a `float` (5.0).',
      },
    ],
    relatedTopics: [
      { id: '1-3-python-tokens-basic-syntax', title: 'Python Tokens & Basic Syntax', chapterName: 'Level 1 — Python Foundations', readingTime: '15 min read' },
      { id: '1-5-operators-expressions', title: 'Operators & Expressions', chapterName: 'Level 1 — Python Foundations', readingTime: '14 min read' },
    ],
    prevLessonId: '1-3-python-tokens-basic-syntax',
    nextLessonId: '1-5-operators-expressions',
  },

  '1-5-operators-expressions': {
    id: '1-5-operators-expressions',
    lessonNumber: '1.5',
    title: 'Operators & Expressions',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '14 min read',
    difficulty: 'Beginner',
    introduction: 'Operators are special symbols that carry out arithmetic, logical, relational, and bitwise computations on operands to evaluate expressions.',
    learningObjectives: [
      'Master Arithmetic operators (+, -, *, /, //, %, **)',
      'Understand Relational comparison operators (==, !=, >, <, >=, <=)',
      'Learn Logical operators (and, or, not) and Short-Circuit evaluation',
      'Understand Membership (in, not in) and Identity (is, is not) operators',
    ],
    sections: [
      {
        id: 'arithmetic-operators',
        title: '1. Arithmetic Operators',
        content: `Arithmetic operators:\n- \`+\` Addition: \`5 + 3\` -> \`8\`\n- \`-\` Subtraction: \`10 - 4\` -> \`6\`\n- \`*\` Multiplication: \`4 * 3\` -> \`12\`\n- \`/\` True Division: \`7 / 2\` -> \`3.5\`\n- \`//\` Floor Division: \`7 // 2\` -> \`3\`\n- \`%\` Modulus: \`7 % 2\` -> \`1\`\n- \`**\` Exponentiation: \`2 ** 4\` -> \`16\``,
      },
      {
        id: 'comparison-operators',
        title: '2. Comparison & Logical Operators',
        content: `Comparison operators (\`==\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`) return boolean values. Logical operators (\`and\`, \`or\`, \`not\`) combine conditions with short-circuit evaluation.`,
      },
      {
        id: 'identity-and-membership',
        title: '3. Identity vs Equality (is vs ==)',
        content: `\`==\` compares values (equality), while \`is\` compares memory address (identity).`,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.5 Operators and Expressions in Action
a = 15
b = 4

print("Addition       :", a + b)
print("Floor Division :", a // b)
print("Remainder (%)  :", a % b)
print("Exponent (15^4):", a ** b)
`,
      output: `Addition       : 19
Floor Division : 3
Remainder (%)  : 3
Exponent (15^4): 50625`,
      howItWorks: [
        'Line 6: 15 // 4 evaluates to integer 3.',
        'Line 7: 15 % 4 evaluates to remainder 3.',
        'Line 8: 15 ** 4 computes 15 to the 4th power.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Confusing assignment = with equality ==',
        badCode: 'if x = 10:',
        goodCode: 'if x == 10:',
        explanation: '= is assignment, == is comparison.',
      },
    ],
    keyPoints: [
      '/ returns float, // performs floor division.',
      '% returns remainder, ** computes power.',
      '== compares values, is compares object identity.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[2],
      LEVEL_1_PRACTICE_PROBLEMS[3],
      LEVEL_1_PRACTICE_PROBLEMS[4],
      LEVEL_1_PRACTICE_PROBLEMS[10],
    ],
    quizzes: [
      {
        id: 'q-1-5-1',
        type: 'output_prediction',
        question: 'What is the output of: `print(2 ** 3 ** 2)`?',
        codeSnippet: 'print(2 ** 3 ** 2)',
        options: ['64', '512', '36', 'Error'],
        correctIndex: 1,
        explanation: '`**` is right-to-left: `3 ** 2 = 9`, then `2 ** 9 = 512`.',
      },
    ],
    relatedTopics: [
      { id: '1-4-variables-basic-data-types', title: 'Variables & Basic Data Types', chapterName: 'Level 1 — Python Foundations', readingTime: '12 min read' },
      { id: '1-6-input-output-formatting', title: 'Input, Output & Formatting', chapterName: 'Level 1 — Python Foundations', readingTime: '12 min read' },
    ],
    prevLessonId: '1-4-variables-basic-data-types',
    nextLessonId: '1-6-input-output-formatting',
  },

  '1-6-input-output-formatting': {
    id: '1-6-input-output-formatting',
    lessonNumber: '1.6',
    title: 'Input, Output & Formatting',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '12 min read',
    difficulty: 'Beginner',
    introduction: 'Master standard input and output streams in Python: input() data ingestion, type conversions, print() separators and terminators, and professional string formatting with f-strings.',
    learningObjectives: [
      'Use print() with custom sep and end parameters',
      'Capture interactive user input with input() and handle string conversion',
      'Read multiple inputs on a single line using split() and map()',
      'Format output using f-strings and precision specifiers (:.2f)',
    ],
    sections: [
      {
        id: 'mastering-print',
        title: '1. Mastering the print() Function',
        content: `\`print()\` accepts \`sep\` and \`end\` keyword parameters:\n\`\`\`python\nprint("2026", "10", "04", sep="-") # 2026-10-04\nprint("Loading", end="...")\n\`\`\``,
      },
      {
        id: 'capturing-user-input',
        title: '2. Capturing User Input with input()',
        content: `\`input()\` **always returns a string (\`str\`)**. For numeric input, explicitly convert using \`int(input())\` or \`float(input())\`.`,
      },
      {
        id: 'f-strings-formatting',
        title: '3. Modern String Formatting: f-strings',
        content: `Prefix strings with \`f\` and embed variables in \`{}\`:\n- \`f"{score:.2f}"\`: Rounds float to 2 decimal places.\n- \`f"USD {revenue:,}"\`: Adds thousand comma separators.`,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.6 Input, Output and Professional Formatting
item_name = "Python Mastery Pro"
price = 49.99
discount = 0.15
units_sold = 1420

discounted_price = price * (1 - discount)
total_revenue = units_sold * discounted_price

print("-" * 35)
print(f"Course Title : {item_name}")
print(f"Price (USD)  : {discounted_price:.2f}")
print(f"Units Sold   : {units_sold:,}")
print(f"Total Revenue: {total_revenue:,.2f}")
print("-" * 35)
`,
      output: `-----------------------------------
Course Title : Python Mastery Pro
Price (USD)  : 42.49
Units Sold   : 1,420
Total Revenue: 60,337.95
-----------------------------------`,
      howItWorks: [
        'Line 10: {:.2f} formats price to 2 decimal places.',
        'Line 11: {:,} formats 1420 with a comma separator.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Forgetting to cast input() for arithmetic',
        badCode: 'age = input() + 1',
        goodCode: 'age = int(input()) + 1',
        explanation: 'input() returns a string.',
      },
    ],
    keyPoints: [
      'print() supports sep and end keyword arguments.',
      'input() always returns a string.',
      'f-strings are the modern standard for string interpolation.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[0],
      LEVEL_1_PRACTICE_PROBLEMS[1],
      LEVEL_1_PRACTICE_PROBLEMS[5],
      LEVEL_1_PRACTICE_PROBLEMS[11],
    ],
    quizzes: [
      {
        id: 'q-1-6-1',
        type: 'output_prediction',
        question: 'What is the output of: `print("A", "B", "C", sep="-", end="!")`?',
        codeSnippet: 'print("A", "B", "C", sep="-", end="!")',
        options: ['A-B-C!', 'A B C!', 'A-B-C\n!', 'ABC!'],
        correctIndex: 0,
        explanation: 'sep="-" inserts hyphens and end="!" appends exclamation mark.',
      },
    ],
    relatedTopics: [
      { id: '1-5-operators-expressions', title: 'Operators & Expressions', chapterName: 'Level 1 — Python Foundations', readingTime: '14 min read' },
      { id: '1-7-basic-error-understanding', title: 'Basic Error Understanding', chapterName: 'Level 1 — Python Foundations', readingTime: '10 min read' },
    ],
    prevLessonId: '1-5-operators-expressions',
    nextLessonId: '1-7-basic-error-understanding',
  },

  '1-7-basic-error-understanding': {
    id: '1-7-basic-error-understanding',
    lessonNumber: '1.7',
    title: 'Basic Error Understanding',
    chapterName: 'Level 1 — Python Foundations',
    chapterNumber: 1,
    category: 'foundation',
    readingTime: '10 min read',
    difficulty: 'Beginner',
    introduction: 'Understand the three main categories of programming errors, learn how to read Python tracebacks and error messages, and master beginner debugging techniques.',
    learningObjectives: [
      'Differentiate between Syntax Errors, Runtime Errors, and Logical Errors',
      'Read and decode a Python Traceback from bottom to top',
      'Identify and fix common beginner errors: IndentationError, NameError, TypeError, ValueError, and ZeroDivisionError',
      'Apply practical debugging strategies using print() statements',
    ],
    sections: [
      {
        id: 'the-three-error-types',
        title: '1. The 3 Types of Programming Errors',
        content: `1. **Syntax Errors:** Violations of Python grammar caught before execution.\n2. **Runtime Errors (Exceptions):** Illegal operations during execution (\`ZeroDivisionError\`, \`TypeError\`).\n3. **Logical Errors:** Program runs without crashing but produces the wrong answer.`,
      },
      {
        id: 'reading-a-traceback',
        title: '2. How to Read a Python Traceback',
        content: `Read tracebacks **from bottom to top**: the last line contains the exception name and description, and preceding lines specify the file and line number.`,
      },
      {
        id: 'common-beginner-errors',
        title: '3. Common Beginner Errors',
        content: `Common errors:\n- \`IndentationError\`: Inconsistent block indentation.\n- \`NameError\`: Undefined variable name.\n- \`TypeError\`: Incompatible data types in operation.\n- \`ValueError\`: Valid type but invalid value.\n- \`ZeroDivisionError\`: Division by zero.`,
      },
      {
        id: 'debugging-with-print',
        title: '4. Debugging with print()',
        content: `Use print statements to inspect variable values and runtime types step-by-step.`,
      },
    ],
    codeExample: {
      language: 'Python',
      code: `# 1.7 Basic Error Understanding & Debugging
student_scores = [85, 90, 78, 92, 88]

total_sum = sum(student_scores)
num_students = len(student_scores)

print(f"DEBUG: Total Score = {total_sum}")
print(f"DEBUG: Count       = {num_students}")

if num_students > 0:
    average = total_sum / num_students
    print(f"Class Average: {average:.2f}")
`,
      output: `DEBUG: Total Score = 433
DEBUG: Count       = 5
Class Average: 86.60`,
      howItWorks: [
        'Line 7-8: Debug prints inspect intermediate variables before division.',
        'Line 10: Guard condition prevents ZeroDivisionError.',
      ],
    },
    commonMistakes: [
      {
        mistake: 'Ignoring the line number in the traceback',
        badCode: '# Guessing where bug is',
        goodCode: '# Read line number in traceback',
        explanation: 'The traceback identifies the exact line where the error occurred.',
      },
    ],
    keyPoints: [
      'Syntax errors are caught before runtime.',
      'Runtime errors crash the program.',
      'Logical errors produce wrong results without crashing.',
      'Read tracebacks from bottom to top.',
    ],
    practiceProblems: [
      LEVEL_1_PRACTICE_PROBLEMS[2],
      LEVEL_1_PRACTICE_PROBLEMS[9],
    ],
    quizzes: [
      {
        id: 'q-1-7-1',
        type: 'mcq',
        question: 'Which type of error occurs when a program calculates the wrong answer due to a formula bug, but does not crash?',
        options: ['Syntax Error', 'Runtime Error', 'Logical Error', 'Indentation Error'],
        correctIndex: 2,
        explanation: 'A Logical Error occurs when the code runs but produces incorrect results.',
      },
    ],
    miniProject: LEVEL_1_MINI_PROJECT,
    relatedTopics: [
      { id: '1-5-operators-expressions', title: 'Operators & Expressions', chapterName: 'Level 1 — Python Foundations', readingTime: '14 min read' },
      { id: '1-6-input-output-formatting', title: 'Input, Output & Formatting', chapterName: 'Level 1 — Python Foundations', readingTime: '12 min read' },
    ],
    prevLessonId: '1-6-input-output-formatting',
  },
};

export const getLessonById = (lessonId: string): PythonLesson => {
  const normalized = lessonId.toLowerCase().trim();
  
  if (LEVEL_1_LESSONS[normalized]) {
    return LEVEL_1_LESSONS[normalized];
  }
  
  const aliasMap: Record<string, string> = {
    'python-basics': '1-1-introduction-to-python',
    'introduction-to-python': '1-1-introduction-to-python',
    'intro-to-python': '1-1-introduction-to-python',
    'installation': '1-2-python-installation-environment-setup',
    'installation-setup': '1-2-python-installation-environment-setup',
    'tokens': '1-3-python-tokens-basic-syntax',
    'tokens-syntax': '1-3-python-tokens-basic-syntax',
    'variables': '1-4-variables-basic-data-types',
    'data-types': '1-4-variables-basic-data-types',
    'variables-data-types': '1-4-variables-basic-data-types',
    'operators': '1-5-operators-expressions',
    'operators-expressions': '1-5-operators-expressions',
    'input-output': '1-6-input-output-formatting',
    'input-output-formatting': '1-6-input-output-formatting',
    'errors': '1-7-basic-error-understanding',
    'basic-error-understanding': '1-7-basic-error-understanding',
  };

  if (aliasMap[normalized] && LEVEL_1_LESSONS[aliasMap[normalized]]) {
    return LEVEL_1_LESSONS[aliasMap[normalized]];
  }

  return LEVEL_1_LESSONS['1-1-introduction-to-python'];
};

export const getAllLessons = (): PythonLesson[] => {
  return Object.values(LEVEL_1_LESSONS);
};

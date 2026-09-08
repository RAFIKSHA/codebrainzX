import type { PythonConcept, ConceptCategory, CategoryKey } from './types';

export const CATEGORIES: Record<CategoryKey, ConceptCategory> = {
  foundation: {
    id: 'foundation',
    number: '01',
    name: 'FOUNDATION',
    title: 'Build the basics of Python',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    iconName: 'Sprout',
  },
  logic: {
    id: 'logic',
    number: '02',
    name: 'LOGIC',
    title: 'Understand the flow and logic',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    iconName: 'Brain',
  },
  core: {
    id: 'core',
    number: '03',
    name: 'CORE PYTHON',
    title: "Work with Python's built-in data structures",
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    iconName: 'Code2',
  },
  oop: {
    id: 'oop',
    number: '04',
    name: 'OOP',
    title: 'Build modular and reusable applications',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.25)',
    iconName: 'Boxes',
  },
  advanced: {
    id: 'advanced',
    number: '05',
    name: 'ADVANCED',
    title: 'Explore advanced Python features',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.08)',
    borderColor: 'rgba(236, 72, 153, 0.25)',
    iconName: 'Rocket',
  },
  dsa: {
    id: 'dsa',
    number: '06',
    name: 'DSA WITH PYTHON',
    title: 'Master data structures & algorithms using Python',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    iconName: 'Puzzle',
  },
};

export const PYTHON_CONCEPTS: PythonConcept[] = [
  // ================= 01 FOUNDATION =================
  {
    id: 'python-basics',
    order: 1,
    title: 'Python Basics',
    category: 'foundation',
    shortDefinition: 'Introduction to syntax, indentation, and writing first Python scripts.',
    definition: 'Python is a high-level, interpreted, dynamically-typed programming language emphasizing code readability with significant indentation.',
    simpleExplanation: 'Python lets you give clear step-by-step instructions to your computer using simple English words.',
    visualType: 'general',
    visualData: {
      headline: 'Code → Python Interpreter → Machine Execution',
      steps: ['Write Code in .py', 'Bytecode Compilation', 'PVM Execution', 'Output to Console']
    },
    whyItMatters: {
      description: 'Understanding Python’s clean syntax and execution model gives you the mental model needed for writing bug-free programs.',
      connectedChips: ['Variables', 'Syntax', 'Indentation', 'Interpreters']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Automation Scripting',
        icon: 'Bot',
        description: 'Automating daily business workflows and file renaming tasks.',
        mappings: [
          { key: 'task_name', typeOrValue: '"backup_files"', explanation: 'Defining script purpose' },
          { key: 'status', typeOrValue: '"running"', explanation: 'Real-time pipeline state' }
        ]
      }
    },
    code: {
      snippet: `# Your first Python program\nuser_name = "CodexPetra Student"\nprint("Welcome to Python Mastery,", user_name)\nprint("Code is poetry executed line by line!")`,
      expectedOutput: `Welcome to Python Mastery, CodexPetra Student\nCode is poetry executed line by line!`,
      explanation: 'Python executes top-to-bottom and prints output directly.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 3,
      questions: [
        {
          id: 'pb-1',
          difficulty: 'easy',
          title: 'Python Execution Model',
          question: 'How is Python code primarily executed?',
          options: ['Compiled to machine code ahead of time', 'Line-by-line via the Python interpreter (PVM)', 'Converted to Javascript in the browser', 'Directly in the CPU hardware'],
          correctIndex: 1,
          explanation: 'Python is an interpreted language executed by the Python Virtual Machine.'
        }
      ]
    },
    dsaConnection: {
      title: 'Foundation to Algorithmic Complexity',
      summary: 'Basic statement execution forms the O(1) constant time primitive operations in DSA analysis.',
      whyItMatters: 'Every line of basic Python executes in predictable constant time, establishing your baseline for Big-O analysis.',
      steps: [
        { title: 'Statement Execution', description: 'Single primitive commands run in O(1) time.' },
        { title: 'Memory Footprint', description: 'Python objects carry lightweight header overhead.' }
      ],
      recommendedProblems: [
        { title: 'Sum of Two Numbers', difficulty: 'Easy', pattern: 'Basic Arithmetic' }
      ]
    },
    prerequisites: [],
    nextConceptId: 'variables',
    nextConceptReason: 'Now learn how Python saves and references values in memory.',
    relatedConceptIds: ['variables', 'data-types', 'operators']
  },
  {
    id: 'variables',
    order: 2,
    title: 'Variables',
    category: 'foundation',
    shortDefinition: 'Named labels referencing memory locations storing data values.',
    definition: 'A variable is a symbolic name reference bound to an object in Python’s heap memory. Variables are dynamically typed and require no explicit declaration.',
    simpleExplanation: 'Think of a variable as a sticky note with a name, stuck to a box containing a value.',
    visualType: 'variable',
    visualData: {
      name: 'age',
      value: 25,
      type: 'int'
    },
    whyItMatters: {
      description: 'Without variables, computer programs could not hold user inputs, compute values across steps, or manage dynamic state.',
      connectedChips: ['Data Types', 'Memory Reference', 'Assignment', 'Scope']
    },
    realWorld: {
      primaryDomain: {
        domain: 'E-commerce System',
        icon: 'ShoppingCart',
        description: 'Tracking shopper cart state and prices.',
        mappings: [
          { key: 'customer_name', typeOrValue: '"Rahul"', explanation: 'Shopper username' },
          { key: 'cart_total', typeOrValue: '1299.50', explanation: 'Current checkout balance' },
          { key: 'item_count', typeOrValue: '3', explanation: 'Number of items selected' }
        ]
      },
      otherDomains: [
        {
          domain: 'Banking',
          icon: 'Landmark',
          description: 'Managing account identifiers and balances.',
          mappings: [
            { key: 'account_balance', typeOrValue: '54200.00', explanation: 'Current available balance' },
            { key: 'is_active', typeOrValue: 'True', explanation: 'Account verification state' }
          ]
        }
      ]
    },
    code: {
      snippet: `# Declaring variables and reassigning values\nage = 25\nname = "Rahul"\nprice = 499.99\nis_enrolled = True\n\nprint(f"User: {name}, Age: {age}")\nprint(f"Course price: \${price}, Active: {is_enrolled}")`,
      expectedOutput: `User: Rahul, Age: 25\nCourse price: $499.99, Active: True`,
      explanation: 'Variables in Python are dynamically typed; you don’t need to declare their type beforehand.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 3,
      questions: [
        {
          id: 'var-1',
          difficulty: 'easy',
          title: 'Variable Binding',
          question: 'What happens when you write `x = 10` then `x = "Ten"` in Python?',
          options: ['TypeError: Cannot change type', '`x` is reassigned to point to string "Ten"', 'Memory corruption occurs', '`x` retains both values as a tuple'],
          correctIndex: 1,
          explanation: 'Python variables are dynamic references. Reassigning `x` points the name label to a new object in memory.'
        }
      ]
    },
    dsaConnection: {
      title: 'Variables to Pointer Thinking',
      summary: 'Variables are reference pointers in Python. Understanding references is vital for in-place algorithms.',
      whyItMatters: 'In DSA, tracking multiple indices (left/right pointers, slow/fast pointers) relies entirely on variable manipulation.',
      steps: [
        { title: 'Pointer References', description: 'Tracking indices like i, j, left, right in loops.' },
        { title: 'In-Place Swapping', description: 'a, b = b, a allows O(1) auxiliary space swaps.' }
      ],
      recommendedProblems: [
        { title: 'Reverse String In-Place', difficulty: 'Easy', pattern: 'Two Pointers' }
      ]
    },
    prerequisites: ['python-basics'],
    nextConceptId: 'data-types',
    nextConceptReason: 'Now learn the different kinds of values variables can store.',
    relatedConceptIds: ['python-basics', 'data-types', 'type-conversion', 'operators']
  },
  {
    id: 'data-types',
    order: 3,
    title: 'Data Types',
    category: 'foundation',
    shortDefinition: 'Categories defining the kind of value (int, str, float, bool) and valid operations.',
    definition: 'Data types define the classification of data items, telling the Python compiler or interpreter how the programmer intends to use the data and what operations can be performed on it.',
    simpleExplanation: 'Python needs to know what kind of information you are working with—a number to calculate, words to read, or true/false to decide.',
    visualType: 'data-type',
    visualData: {
      types: [
        { label: '25', type: 'int', desc: 'Whole number for counts' },
        { label: '"Hello"', type: 'str', desc: 'Sequence of characters' },
        { label: '3.14', type: 'float', desc: 'Decimal precision number' },
        { label: 'True', type: 'bool', desc: 'Binary logic flag' }
      ]
    },
    whyItMatters: {
      description: 'Without data types, you could accidentally add a text string to a money balance. Types guarantee semantic correctness.',
      connectedChips: ['Variables', 'Operators', 'Conditions', 'Functions', 'Collections', 'DSA']
    },
    realWorld: {
      primaryDomain: {
        domain: 'E-commerce Catalog',
        icon: 'ShoppingBag',
        description: 'Representing a product item with accurate data specifications.',
        mappings: [
          { key: 'product_price', typeOrValue: 'float (499.99)', explanation: 'Currency representation' },
          { key: 'product_name', typeOrValue: 'str ("Laptop")', explanation: 'Readable title' },
          { key: 'stock_count', typeOrValue: 'int (12)', explanation: 'Inventory quantity' },
          { key: 'is_available', typeOrValue: 'bool (True)', explanation: 'Instant purchasing flag' }
        ]
      },
      otherDomains: [
        {
          domain: 'Fintech & Banking',
          icon: 'CreditCard',
          description: 'Payment transactions and fraud validation.',
          mappings: [
            { key: 'transaction_id', typeOrValue: 'str ("TXN-8841")', explanation: 'Unique alphanumeric identifier' },
            { key: 'amount', typeOrValue: 'float (250.75)', explanation: 'Exact monetary value' },
            { key: 'is_verified', typeOrValue: 'bool (True)', explanation: '2FA security status' }
          ]
        }
      ]
    },
    code: {
      snippet: `# Inspecting data types with type()\nage = 25\nprice = 499.99\nname = "Laptop"\navailable = True\n\nprint(age, "is", type(age).__name__)\nprint(price, "is", type(price).__name__)\nprint(name, "is", type(name).__name__)\nprint(available, "is", type(available).__name__)`,
      expectedOutput: `25 is int\n499.99 is float\nLaptop is str\nTrue is bool`,
      explanation: 'Use type() to inspect the runtime classification of any object in Python.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 3,
      questions: [
        {
          id: 'dt-1',
          difficulty: 'easy',
          title: 'Python Type System',
          question: 'What is the output of `type(3.14)` in Python?',
          options: ['<class \'int\'>', '<class \'float\'>', '<class \'number\'>', '<class \'decimal\'>'],
          correctIndex: 1,
          explanation: 'Floating point numbers in Python belong to the float class.'
        },
        {
          id: 'dt-2',
          difficulty: 'medium',
          title: 'Type Operations',
          question: 'What is the result of `"5" + "5"` vs `5 + 5`?',
          options: ['"10" and 10', '"55" and 10', 'TypeError on string addition', '10 and 10'],
          correctIndex: 1,
          explanation: 'Strings concatenate to "55" while integers add numerically to 10.'
        }
      ]
    },
    dsaConnection: {
      title: 'Primitive Types & Fixed-Size Words',
      summary: 'Data types define memory footprint and constant-time math operations in competitive programming.',
      whyItMatters: 'Understanding 64-bit integer limits and floating point precision prevents arithmetic overflow in algorithms.',
      steps: [
        { title: 'Arbitrary Precision Ints', description: 'Python automatically expands integers preventing 32-bit overflow.' },
        { title: 'Hashability', description: 'Immutable types (int, str, tuple) can serve as hash map keys.' }
      ],
      recommendedProblems: [
        { title: 'Palindrome Number', difficulty: 'Easy', pattern: 'Math / Type Manipulation' },
        { title: 'Valid Anagram', difficulty: 'Easy', pattern: 'String Frequency Array' }
      ]
    },
    prerequisites: ['python-basics', 'variables'],
    nextConceptId: 'conditions',
    nextConceptReason: 'Now learn how Python makes decisions based on boolean truth values.',
    relatedConceptIds: ['variables', 'type-conversion', 'operators', 'conditions', 'lists']
  },
  {
    id: 'type-conversion',
    order: 4,
    title: 'Type Conversion',
    category: 'foundation',
    shortDefinition: 'Transforming data from one data type into another (casting).',
    definition: 'Type conversion is the process of converting the value of one data type (integer, string, float) to another data type, either implicitly by Python or explicitly using built-in casting functions.',
    simpleExplanation: 'Changing the format of your information, like turning written text `"100"` into a real number `100` you can do math with.',
    visualType: 'general',
    visualData: {
      headline: 'Explicit Type Casting Pipeline',
      steps: ['str("25")', 'int("25") → 25', 'float(25) → 25.0', 'str(25.0) → "25.0"']
    },
    whyItMatters: {
      description: 'Web APIs and user forms always supply text strings. You must convert them to numbers before performing calculations.',
      connectedChips: ['Data Types', 'Input & Output', 'Operators', 'Exceptions']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Fintech Payment Gateway',
        icon: 'CreditCard',
        description: 'Parsing raw input from checkout web forms into numerical ledger amounts.',
        mappings: [
          { key: 'user_input_str', typeOrValue: '"149.99"', explanation: 'Raw input from web UI' },
          { key: 'converted_float', typeOrValue: '149.99', explanation: 'Ready for tax math' }
        ]
      }
    },
    code: {
      snippet: `# Explicit type casting\nstr_num = "42"\nint_num = int(str_num)\nfloat_num = float(str_num)\n\nprint("String:", str_num, type(str_num).__name__)\nprint("Integer + 8:", int_num + 8)\nprint("Float:", float_num)`,
      expectedOutput: `String: 42 str\nInteger + 8: 50\nFloat: 42.0`,
      explanation: 'int(), float(), str(), and bool() allow explicit type transformations.'
    },
    practice: {
      easyCount: 4,
      mediumCount: 4,
      interviewCount: 2,
      questions: [
        {
          id: 'tc-1',
          difficulty: 'easy',
          title: 'Boolean Casting',
          question: 'What does `bool("")` (empty string) evaluate to?',
          options: ['True', 'False', 'None', 'TypeError'],
          correctIndex: 1,
          explanation: 'Empty strings are falsy in Python and convert to False.'
        }
      ]
    },
    dsaConnection: {
      title: 'String to Integer Algorithms',
      summary: 'ASCII value transformations and base-10 digit reconstruction.',
      whyItMatters: 'Directly applicable to parsing problems like String to Integer (atoi) and Roman Numeral translation.',
      steps: [
        { title: 'Digit Extraction', description: 'Using ord(char) - ord("0") for fast ASCII numeric parsing.' }
      ],
      recommendedProblems: [
        { title: 'String to Integer (atoi)', difficulty: 'Medium', pattern: 'String Conversion' }
      ]
    },
    prerequisites: ['data-types'],
    nextConceptId: 'operators',
    nextConceptReason: 'Now learn how to perform calculations and evaluations.',
    relatedConceptIds: ['variables', 'data-types', 'operators', 'input-output']
  },
  {
    id: 'operators',
    order: 5,
    title: 'Operators',
    category: 'foundation',
    shortDefinition: 'Symbols (+, -, *, /, ==, and) performing computations on operands.',
    definition: 'Operators are special symbols and keywords in Python that carry out arithmetic, assignment, comparison, logical, and bitwise computations on values.',
    simpleExplanation: 'The action verbs of programming: adding numbers, comparing who is bigger, and checking if conditions agree.',
    visualType: 'general',
    visualData: {
      headline: 'Operator Categories',
      steps: ['Arithmetic (+, -, *, //, %)', 'Comparison (==, !=, <, >)', 'Logical (and, or, not)', 'Identity & Membership (is, in)']
    },
    whyItMatters: {
      description: 'Operators are the building blocks of every mathematical algorithm, business rule check, and decision branching.',
      connectedChips: ['Variables', 'Data Types', 'Conditions', 'Logic']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Discount Calculator',
        icon: 'Percent',
        description: 'Applying coupon percentages and checking eligibility.',
        mappings: [
          { key: 'discount_rate', typeOrValue: '0.15', explanation: '15% promotional discount' },
          { key: 'final_price', typeOrValue: 'total * (1 - 0.15)', explanation: 'Arithmetic formula' }
        ]
      }
    },
    code: {
      snippet: `# Arithmetic and comparison\nx = 17\ny = 5\n\nprint("Floor Division (17 // 5):", x // y)\nprint("Modulo Remainder (17 % 5):", x % y)\nprint("Power (2 ** 3):", 2 ** 3)\nprint("Comparison:", x > y and y > 0)`,
      expectedOutput: `Floor Division (17 // 5): 3\nModulo Remainder (17 % 5): 2\nPower (2 ** 3): 8\nComparison: True`,
      explanation: '// performs integer division while % extracts the remainder.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 4,
      interviewCount: 2,
      questions: [
        {
          id: 'op-1',
          difficulty: 'easy',
          title: 'Modulo Operator',
          question: 'What is `10 % 3` in Python?',
          options: ['3', '1', '0', '3.33'],
          correctIndex: 1,
          explanation: '10 divided by 3 is 3 with a remainder of 1.'
        }
      ]
    },
    dsaConnection: {
      title: 'Bitwise & Modulo Math in DSA',
      summary: 'Modulo arithmetic for hash tables and bitwise tricks for sub-second bit manipulation.',
      whyItMatters: 'Modulo 10^9+7 prevents integer overflow in competitive math, and bitwise XOR solves Single Number in O(N).',
      steps: [
        { title: 'Hash Table Bucketing', description: 'index = hash(key) % capacity' },
        { title: 'Bitmasking', description: 'Using bitwise AND/OR/XOR for state compression.' }
      ],
      recommendedProblems: [
        { title: 'Single Number', difficulty: 'Easy', pattern: 'Bitwise XOR' }
      ]
    },
    prerequisites: ['variables', 'data-types'],
    nextConceptId: 'conditions',
    nextConceptReason: 'Now use comparison and logical operators to build smart decision paths.',
    relatedConceptIds: ['variables', 'data-types', 'conditions', 'loops']
  },

  // ================= 02 LOGIC =================
  {
    id: 'conditions',
    order: 6,
    title: 'Conditions',
    category: 'logic',
    shortDefinition: 'Controlling execution flow with if, elif, and else decision branches.',
    definition: 'Conditional statements allow a program to evaluate boolean expressions and choose different branches of code execution based on whether a condition is true or false.',
    simpleExplanation: 'Like a fork in the road: "If it rains, take an umbrella; else, wear sunglasses."',
    visualType: 'condition',
    visualData: {
      condition: 'score >= 80',
      truePath: 'Print "Distinction Passed!"',
      falsePath: 'Print "Keep Practicing!"'
    },
    whyItMatters: {
      description: 'Without conditional logic, programs would only execute in a straight line. Conditions make software intelligent and adaptive.',
      connectedChips: ['Operators', 'Booleans', 'Loops', 'Error Handling', 'Algorithms']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Authentication Security',
        icon: 'ShieldCheck',
        description: 'Granting access based on role permissions and 2FA status.',
        mappings: [
          { key: 'if user.is_authenticated', typeOrValue: 'allow_dashboard()', explanation: 'Passed security check' },
          { key: 'elif user.needs_2fa', typeOrValue: 'prompt_otp()', explanation: 'Second-factor challenge' },
          { key: 'else', typeOrValue: 'redirect_login()', explanation: 'Unauthorized guest path' }
        ]
      },
      otherDomains: [
        {
          domain: 'Ride-Hailing Surge',
          icon: 'Car',
          description: 'Adjusting driver pricing during peak hours.',
          mappings: [
            { key: 'if demand > supply', typeOrValue: 'fare * 1.5', explanation: 'Surge multiplier' },
            { key: 'else', typeOrValue: 'standard_fare', explanation: 'Regular rate' }
          ]
        }
      ]
    },
    code: {
      snippet: `# Dynamic decision logic\nuser_age = 20\nhas_ticket = True\n\nif user_age >= 18 and has_ticket:\n    print("Access Granted: Welcome to the Tech Conference!")\nelif user_age >= 18 and not has_ticket:\n    print("Please purchase a ticket at the registration desk.")\nelse:\n    print("Student pass required.")`,
      expectedOutput: `Access Granted: Welcome to the Tech Conference!`,
      explanation: 'Python evaluates if conditions sequentially, executing the first block that evaluates to True.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 3,
      questions: [
        {
          id: 'cond-1',
          difficulty: 'easy',
          title: 'Condition Truthiness',
          question: 'Which of the following values will evaluate to False inside an `if` statement?',
          options: ['"False"', '[0]', '0', '-1'],
          correctIndex: 2,
          explanation: 'The number 0 is falsy, whereas non-empty strings and non-empty lists are truthy.'
        }
      ]
    },
    dsaConnection: {
      title: 'Branching in Binary Search & Dynamic Programming',
      summary: 'Conditions govern search direction decisions and base case termination in recursion.',
      whyItMatters: 'Every recursive algorithm (like Binary Search or Tree DFS) relies on crisp base-case conditional guards.',
      steps: [
        { title: 'Binary Search Branching', description: 'if target > arr[mid]: left = mid + 1 else: right = mid - 1' },
        { title: 'Recursion Base Guards', description: 'if not root: return 0' }
      ],
      recommendedProblems: [
        { title: 'Binary Search', difficulty: 'Easy', pattern: 'Divide & Conquer' },
        { title: 'Climbing Stairs', difficulty: 'Easy', pattern: 'DP Base Cases' }
      ]
    },
    prerequisites: ['data-types', 'operators'],
    nextConceptId: 'loops',
    nextConceptReason: 'Now learn how to repeat actions automatically using Loops.',
    relatedConceptIds: ['variables', 'data-types', 'operators', 'loops', 'functions']
  },
  {
    id: 'loops',
    order: 7,
    title: 'Loops',
    category: 'logic',
    shortDefinition: 'Automating repetitive tasks with for-in and while loops.',
    definition: 'Loops are control flow structures that repeatedly execute a block of code as long as a condition remains true or for each item across an iterable sequence.',
    simpleExplanation: 'Doing a task over and over again without copying and pasting code—like checking 100 student exam papers one by one.',
    visualType: 'loop',
    visualData: {
      type: 'for',
      iterable: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
      currentIndex: 1
    },
    whyItMatters: {
      description: 'Computers excel at repeating calculations millions of times in milliseconds. Loops harness that superpower.',
      connectedChips: ['Conditions', 'Lists', 'Iterators', 'Algorithms', 'Time Complexity']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Batch Notification Engine',
        icon: 'BellRing',
        description: 'Broadcasting email notifications to thousands of subscribers.',
        mappings: [
          { key: 'for subscriber in user_list:', typeOrValue: 'send_email(subscriber)', explanation: 'Sequential broadcast' },
          { key: 'while battery_level > 20:', typeOrValue: 'stream_video()', explanation: 'State-guarded repetition' }
        ]
      }
    },
    code: {
      snippet: `# Iterating over collections and ranges\nscores = [88, 92, 79, 95]\ntotal = 0\n\nfor s in scores:\n    total += s\n\naverage = total / len(scores)\nprint(f"Total Score: {total}")\nprint(f"Average: {average:.2f}")`,
      expectedOutput: `Total Score: 354\nAverage: 88.50`,
      explanation: 'The for-in loop iterates smoothly over elements of any sequence in Python.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 4,
      questions: [
        {
          id: 'loop-1',
          difficulty: 'easy',
          title: 'Range Function',
          question: 'How many times will `for i in range(1, 6):` execute?',
          options: ['6 times (1 to 6)', '5 times (1 to 5)', '4 times (2 to 5)', 'Infinite times'],
          correctIndex: 1,
          explanation: 'range(start, stop) stops BEFORE the stop number, so it runs for 1, 2, 3, 4, 5 (5 times).'
        }
      ]
    },
    dsaConnection: {
      title: 'Loops to Time Complexity (O(N), O(N²))',
      summary: 'Loops form the direct basis of algorithm time complexity analysis.',
      whyItMatters: 'A single loop over an array is O(N); a nested loop is O(N²). Recognizing loop boundaries is fundamental to optimization.',
      steps: [
        { title: 'Linear Traversal', description: 'Single loop over N elements = O(N) time.' },
        { title: 'Nested Loops', description: 'Scanning pairs (i, j) = O(N²) quadratic time.' }
      ],
      recommendedProblems: [
        { title: 'Two Sum', difficulty: 'Easy', pattern: 'Hash Map vs Nested Loop' },
        { title: 'Maximum Subarray (Kadane)', difficulty: 'Medium', pattern: 'Single Pass Loop' }
      ]
    },
    prerequisites: ['conditions'],
    nextConceptId: 'functions',
    nextConceptReason: 'Now bundle your logic and loops into reusable Functions.',
    relatedConceptIds: ['conditions', 'functions', 'lists', 'dictionaries']
  },
  {
    id: 'functions',
    order: 8,
    title: 'Functions',
    category: 'logic',
    shortDefinition: 'Reusable blocks of organized code taking inputs and returning outputs.',
    definition: 'A function is a packaged, reusable block of code created using the `def` keyword. Functions can accept input parameters, perform operations, and return result values to the caller.',
    simpleExplanation: 'A kitchen blender: you put in ingredients (inputs), push the button (process), and pour out a smoothie (output).',
    visualType: 'function',
    visualData: {
      funcName: 'calculate_tax',
      inputs: ['price=100', 'rate=0.08'],
      operation: 'price * rate',
      output: '8.0'
    },
    whyItMatters: {
      description: 'Functions allow DRY (Don’t Repeat Yourself) architecture, making code modular, testable, and maintainable.',
      connectedChips: ['Variables', 'Scope', 'Arguments', 'Return Values', 'Recursion']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Cloud Microservices',
        icon: 'Cpu',
        description: 'Serverless functions computing currency conversions on demand.',
        mappings: [
          { key: 'def convert_currency(usd, rate):', typeOrValue: 'return usd * rate', explanation: 'Pure computational logic' },
          { key: 'def validate_password(pwd):', typeOrValue: 'return len(pwd) >= 8', explanation: 'Security rule validation' }
        ]
      }
    },
    code: {
      snippet: `# Defining and invoking functions\ndef calculate_total(price, tax_rate=0.05, discount=0):\n    tax = price * tax_rate\n    final = price + tax - discount\n    return round(final, 2)\n\ntotal1 = calculate_total(100)\ntotal2 = calculate_total(200, tax_rate=0.10, discount=15)\n\nprint("Standard order total:", total1)\nprint("VIP discounted order:", total2)`,
      expectedOutput: `Standard order total: 105.0\nVIP discounted order: 205.0`,
      explanation: 'Functions accept default parameter values and return computed results via return.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 4,
      questions: [
        {
          id: 'fn-1',
          difficulty: 'easy',
          title: 'Return Value',
          question: 'What does a Python function return by default if no return statement is specified?',
          options: ['0', 'False', 'None', '""'],
          correctIndex: 2,
          explanation: 'In Python, functions without an explicit return statement return None.'
        }
      ]
    },
    dsaConnection: {
      title: 'Functions to Recursion & Call Stacks',
      summary: 'Function invocations push stack frames, forming the mathematical backbone of recursion and DFS.',
      whyItMatters: 'Mastering recursion depth and base cases enables solving Tree, Graph, and Backtracking interview questions.',
      steps: [
        { title: 'Stack Frame Allocation', description: 'Each recursive call uses O(H) auxiliary space on the call stack.' },
        { title: 'Memoization (DP)', description: 'Caching function results with @lru_cache reduces exponential time to O(N).' }
      ],
      recommendedProblems: [
        { title: 'Fibonacci Number', difficulty: 'Easy', pattern: 'Recursion / Memoization' },
        { title: 'Invert Binary Tree', difficulty: 'Easy', pattern: 'Tree Recursion' }
      ]
    },
    prerequisites: ['loops'],
    nextConceptId: 'lists',
    nextConceptReason: 'Now master Python’s most powerful ordered collection: Lists.',
    relatedConceptIds: ['loops', 'lists', 'strings', 'oop']
  },

  // ================= 03 CORE PYTHON =================
  {
    id: 'strings',
    order: 9,
    title: 'Strings',
    category: 'core',
    shortDefinition: 'Immutable text sequences supporting indexing, slicing, and rich string methods.',
    definition: 'Strings in Python are immutable sequences of Unicode characters. They support slicing syntax `[start:stop:step]`, formatted string interpolation (f-strings), and powerful built-in text manipulation methods.',
    simpleExplanation: 'A train of characters connected in order that cannot be altered in place, but can be split, sliced, and recombined.',
    visualType: 'general',
    visualData: {
      headline: 'String Slicing: "PYTHON"[1:4] → "YTH"',
      steps: ['Index 0: P', 'Index 1: Y', 'Index 2: T', 'Index 3: H', 'Index 4: O', 'Index 5: N']
    },
    whyItMatters: {
      description: 'Text parsing, log extraction, natural language processing, and API payloads are fundamentally string operations.',
      connectedChips: ['Indexing', 'Slicing', 'Immutability', 'Regular Expressions', 'Parsing']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Data Cleanse & Ingestion',
        icon: 'Database',
        description: 'Sanitizing user email addresses and phone numbers.',
        mappings: [
          { key: 'email.strip().lower()', typeOrValue: '"user@codexpetra.com"', explanation: 'Normalized identity' },
          { key: 'phone.replace("-", "")', typeOrValue: '"9876543210"', explanation: 'Standardized digits' }
        ]
      }
    },
    code: {
      snippet: `# String slicing and methods\ntext = "CodexPetra Learning"\n\nprint("Slice [0:10]:", text[:10])\nprint("Uppercase:", text.upper())\nprint("Words list:", text.split(" "))\nprint("Reversed:", text[::-1])`,
      expectedOutput: `Slice [0:10]: CodexPetra\nUppercase: CODEXPETRA LEARNING\nWords list: ['CodexPetra', 'Learning']\nReversed: gninraeL artePxedoC`,
      explanation: 'Slicing with [::-1] provides a clean, idiomatic way to reverse strings in Python.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 4,
      interviewCount: 3,
      questions: [
        {
          id: 'str-1',
          difficulty: 'easy',
          title: 'String Immutability',
          question: 'What happens if you execute `s = "Hello"; s[0] = "J"` in Python?',
          options: ['s becomes "Jello"', 'TypeError: \'str\' object does not support item assignment', 'IndexError', 's is deleted'],
          correctIndex: 1,
          explanation: 'Strings in Python are immutable; individual character indices cannot be modified in place.'
        }
      ]
    },
    dsaConnection: {
      title: 'String Algorithms & Two Pointers',
      summary: 'Palindrome verification, anagram hashing, and substring matching.',
      whyItMatters: 'Strings are the #1 most frequently asked topic in FAANG coding interviews.',
      steps: [
        { title: 'Two Pointers Palindrome', description: 'Left and Right indices converging inward in O(N) time.' },
        { title: 'Sliding Window', description: 'Tracking unique character frequencies in a dynamic substring window.' }
      ],
      recommendedProblems: [
        { title: 'Valid Palindrome', difficulty: 'Easy', pattern: 'Two Pointers' },
        { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', pattern: 'Sliding Window' }
      ]
    },
    prerequisites: ['data-types', 'functions'],
    nextConceptId: 'lists',
    nextConceptReason: 'Now explore mutable ordered collections with Lists.',
    relatedConceptIds: ['data-types', 'lists', 'tuples', 'dictionaries']
  },
  {
    id: 'lists',
    order: 10,
    title: 'Lists',
    category: 'core',
    shortDefinition: 'Dynamic, ordered, mutable sequences holding heterogeneous elements.',
    definition: 'A list is an ordered, mutable sequence data type in Python that can hold arbitrary objects. Lists support dynamic resizing, index lookup in O(1) time, and flexible manipulation methods.',
    simpleExplanation: 'An adjustable row of lockers, numbered from 0 upwards, where you can store, replace, add, or remove anything anytime.',
    visualType: 'list',
    visualData: {
      items: ['Apple', 'Banana', 'Cherry', 'Dates'],
      indices: [0, 1, 2, 3]
    },
    whyItMatters: {
      description: 'Lists are the most widely used collection in Python. They form the foundation of tabular data, search results, and algorithm arrays.',
      connectedChips: ['Arrays', 'Indexing', 'Mutability', 'Sorting', 'DSA Thinking']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Streaming Playlist Queue',
        icon: 'Music',
        description: 'Managing a dynamic queue of user songs with playback order.',
        mappings: [
          { key: 'playlist.append("Song 4")', typeOrValue: '["Song 1", "Song 2", "Song 3", "Song 4"]', explanation: 'Add track to end' },
          { key: 'current = playlist.pop(0)', typeOrValue: '"Song 1"', explanation: 'Play first in queue' }
        ]
      }
    },
    code: {
      snippet: `# Manipulating Python lists\nfruits = ["Apple", "Banana", "Cherry"]\nfruits.append("Dragonfruit")\nfruits.insert(1, "Blueberry")\n\nprint("Current List:", fruits)\nprint("Item at index 2:", fruits[2])\nprint("Sliced first 3:", fruits[:3])`,
      expectedOutput: `Current List: ['Apple', 'Blueberry', 'Banana', 'Cherry', 'Dragonfruit']\nItem at index 2: Banana\nSliced first 3: ['Apple', 'Blueberry', 'Banana']`,
      explanation: 'Lists are mutable: elements can be inserted, updated, and removed dynamically.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 4,
      questions: [
        {
          id: 'list-1',
          difficulty: 'easy',
          title: 'List Indexing',
          question: 'What is the index of the last element of a non-empty list `nums` using negative indexing?',
          options: ['nums[0]', 'nums[-1]', 'nums[len(nums)]', 'nums[-0]'],
          correctIndex: 1,
          explanation: 'Negative indexing starts from -1 at the last element.'
        }
      ]
    },
    dsaConnection: {
      title: 'Python Lists to Array Thinking',
      summary: 'Python lists are dynamic arrays (like Java ArrayList / C++ vector) backed by contiguous memory.',
      whyItMatters: 'O(1) random access lookup vs O(N) insertion in the middle forms the core tradeoff of linear data structures.',
      steps: [
        { title: 'Array Thinking', description: 'Contiguous memory layout enables instant index math.' },
        { title: 'Traversal', description: 'Single pass scanning over N elements.' },
        { title: 'Searching', description: 'Linear search O(N) vs Binary search O(log N) on sorted lists.' },
        { title: 'Two Pointers', description: 'Manipulating left & right indices to solve pair sums.' },
        { title: 'Sliding Window', description: 'Subarray continuous range tracking.' }
      ],
      recommendedProblems: [
        { title: 'Two Sum', difficulty: 'Easy', pattern: 'Hash Map Lookup' },
        { title: 'Container With Most Water', difficulty: 'Medium', pattern: 'Two Pointers' },
        { title: 'Trapping Rain Water', difficulty: 'Hard', pattern: 'Two Pointers' }
      ]
    },
    prerequisites: ['loops', 'strings'],
    nextConceptId: 'dictionaries',
    nextConceptReason: 'Now learn how to store key-value associations with Dictionaries.',
    relatedConceptIds: ['strings', 'tuples', 'dictionaries', 'list-comprehension']
  },
  {
    id: 'dictionaries',
    order: 11,
    title: 'Dictionaries',
    category: 'core',
    shortDefinition: 'Hash map data structures mapping unique keys to corresponding values.',
    definition: 'A dictionary is a built-in Python collection of key-value pairs. Dictionaries are mutable, maintain insertion order (Python 3.7+), and provide near instantaneous O(1) average time complexity for lookups, insertions, and deletions using hash tables.',
    simpleExplanation: 'A real dictionary book: instead of searching every page, you look up the word (key) and instantly get its meaning (value).',
    visualType: 'dict',
    visualData: {
      entries: [
        { key: '"user_id"', value: '1042' },
        { key: '"role"', value: '"Admin"' },
        { key: '"status"', value: '"Active"' }
      ]
    },
    whyItMatters: {
      description: 'Dictionaries represent JSON objects, database rows, cache stores, and frequency counters in real-world systems.',
      connectedChips: ['Hash Tables', 'O(1) Lookup', 'Keys', 'JSON Data', 'Caching']
    },
    realWorld: {
      primaryDomain: {
        domain: 'User Profile Service',
        icon: 'UserCheck',
        description: 'Instant lookup of student record by student UUID.',
        mappings: [
          { key: 'student["id"]', typeOrValue: '"STU-9921"', explanation: 'Unique primary identifier' },
          { key: 'student["gpa"]', typeOrValue: '3.92', explanation: 'Academic metric' },
          { key: 'student["courses"]', typeOrValue: '["Python", "DSA", "ML"]', explanation: 'Enrolled subjects' }
        ]
      }
    },
    code: {
      snippet: `# Working with Python dictionaries\nuser = {\n    "name": "Sarah",\n    "role": "Software Engineer",\n    "skills": ["Python", "Docker", "React"]\n}\n\nuser["location"] = "Bangalore"\n\nfor key, value in user.items():\n    print(f"{key.capitalize()}: {value}")`,
      expectedOutput: `Name: Sarah\nRole: Software Engineer\nSkills: ['Python', 'Docker', 'React']\nLocation: Bangalore`,
      explanation: 'Use .items() to iterate over key and value pairs simultaneously.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 4,
      questions: [
        {
          id: 'dict-1',
          difficulty: 'easy',
          title: 'Dictionary Lookup Complexity',
          question: 'What is the average time complexity to look up a key in a Python dictionary?',
          options: ['O(N)', 'O(log N)', 'O(1)', 'O(N²)'],
          correctIndex: 2,
          explanation: 'Python dictionaries are hash tables and achieve O(1) average lookup time.'
        }
      ]
    },
    dsaConnection: {
      title: 'Dictionaries to Hash Tables & Frequency Maps',
      summary: 'The single most critical data structure for reducing O(N²) brute-force solutions to O(N) linear time.',
      whyItMatters: 'Hash maps solve 70%+ of coding interview questions involving pairs, frequencies, and caching.',
      steps: [
        { title: 'Hash Map Lookup', description: 'Instant O(1) existence checks.' },
        { title: 'Frequency Counter', description: 'Counting character and number frequencies in O(N) space.' }
      ],
      recommendedProblems: [
        { title: 'Two Sum', difficulty: 'Easy', pattern: 'Hash Map Lookup' },
        { title: 'Group Anagrams', difficulty: 'Medium', pattern: 'Hash Map Keying' }
      ]
    },
    prerequisites: ['lists'],
    nextConceptId: 'classes',
    nextConceptReason: 'Now step into Object-Oriented Programming with Classes and Objects.',
    relatedConceptIds: ['lists', 'tuples', 'sets', 'classes']
  },

  // ================= 04 OOP =================
  {
    id: 'classes',
    order: 12,
    title: 'Classes & Objects',
    category: 'oop',
    shortDefinition: 'User-defined blueprints encapsulating data attributes and member methods.',
    definition: 'Classes are blueprints for creating objects. An object is an instance of a class that bundles state (attributes) and behavior (methods) together according to the principles of Object-Oriented Programming.',
    simpleExplanation: 'An architect’s blueprint for a house: the blueprint (Class) defines the rooms, and you can build 100 real houses (Objects) from it.',
    visualType: 'oop',
    visualData: {
      className: 'Car',
      attributes: ['make', 'model', 'year'],
      methods: ['start_engine()', 'drive()'],
      instances: ['car1 = Car("Tesla", "Model 3")', 'car2 = Car("Porsche", "911")']
    },
    whyItMatters: {
      description: 'OOP structure powers large software codebases like Django, PyTorch, and game engines by keeping complex state organized.',
      connectedChips: ['Objects', 'Self Keyword', '__init__', 'Inheritance', 'Polymorphism']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Bank Account Architecture',
        icon: 'Landmark',
        description: 'Modeling bank account objects with balance protection and deposit/withdraw methods.',
        mappings: [
          { key: 'class BankAccount:', typeOrValue: 'def deposit(self, amt): self.balance += amt', explanation: 'Encapsulated financial state' }
        ]
      }
    },
    code: {
      snippet: `# Defining a class and creating instances\nclass Student:\n    def __init__(self, name, roll_no):\n        self.name = name\n        self.roll_no = roll_no\n        self.grade = "A"\n\n    def get_summary(self):\n        return f"Student: {self.name} (Roll: #{self.roll_no}) - Grade: {self.grade}"\n\ns1 = Student("Aarav", 101)\ns2 = Student("Diya", 102)\n\nprint(s1.get_summary())\nprint(s2.get_summary())`,
      expectedOutput: `Student: Aarav (Roll: #101) - Grade: A\nStudent: Diya (Roll: #102) - Grade: A`,
      explanation: '__init__ is the initializer method automatically called when a new object instance is constructed.'
    },
    practice: {
      easyCount: 4,
      mediumCount: 5,
      interviewCount: 3,
      questions: [
        {
          id: 'oop-1',
          difficulty: 'easy',
          title: 'The self parameter',
          question: 'What is the purpose of `self` in Python class methods?',
          options: ['It refers to the current instance of the class', 'It is a keyword to import libraries', 'It allocates memory on the CPU', 'It deletes the object'],
          correctIndex: 0,
          explanation: '`self` represents the instance of the class, allowing access to its attributes and methods.'
        }
      ]
    },
    dsaConnection: {
      title: 'Classes to Node & Tree Implementations in DSA',
      summary: 'Linked Lists, Stacks, Queues, Binary Trees, and Graphs are implemented as Python classes.',
      whyItMatters: 'Every custom data structure question in interviews requires writing `class ListNode` or `class TreeNode`.',
      steps: [
        { title: 'ListNode Definition', description: 'class ListNode: def __init__(self, val=0, next=None)' },
        { title: 'TreeNode Definition', description: 'class TreeNode: def __init__(self, val=0, left=None, right=None)' }
      ],
      recommendedProblems: [
        { title: 'Design Linked List', difficulty: 'Medium', pattern: 'OOP Data Structure Design' },
        { title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', pattern: 'Tree OOP' }
      ]
    },
    prerequisites: ['functions', 'dictionaries'],
    nextConceptId: 'inheritance',
    nextConceptReason: 'Now learn how classes share and reuse logic using Inheritance.',
    relatedConceptIds: ['functions', 'dictionaries', 'inheritance', 'polymorphism']
  },
  {
    id: 'inheritance',
    order: 13,
    title: 'Inheritance',
    category: 'oop',
    shortDefinition: 'Reusing and extending parent class properties and behaviors in child classes.',
    definition: 'Inheritance is an OOP mechanism where a child subclass derives attributes and methods from a parent superclass, enabling code reuse and polymorphic extensions via `super()`.',
    simpleExplanation: 'Like genetic inheritance: a child inherits physical traits from parents, but can also develop unique skills of their own.',
    visualType: 'general',
    visualData: {
      headline: 'Parent Class: Animal → Subclasses: Dog, Cat',
      steps: ['Animal (eat, sleep)', 'Dog extends Animal (+ bark)', 'Cat extends Animal (+ meow)']
    },
    whyItMatters: {
      description: 'Prevents writing duplicated logic across dozens of related business entities.',
      connectedChips: ['Classes', 'super()', 'Method Overriding', 'Polymorphism']
    },
    realWorld: {
      primaryDomain: {
        domain: 'UI Component Hierarchy',
        icon: 'Layout',
        description: 'Base UI widget inherited by Button, InputBox, and Modal.',
        mappings: [
          { key: 'class Button(Widget):', typeOrValue: 'def on_click(self): ...', explanation: 'Specialized button behavior' }
        ]
      }
    },
    code: {
      snippet: `# Parent and Child classes\nclass Employee:\n    def __init__(self, name, base_salary):\n        self.name = name\n        self.base_salary = base_salary\n\n    def calculate_pay(self):\n        return self.base_salary\n\nclass Manager(Employee):\n    def __init__(self, name, base_salary, bonus):\n        super().__init__(name, base_salary)\n        self.bonus = bonus\n\n    def calculate_pay(self):\n        return self.base_salary + self.bonus\n\nmgr = Manager("Vikram", 80000, 15000)\nprint(f"Manager {mgr.name} Total Pay: \${mgr.calculate_pay()}")`,
      expectedOutput: `Manager Vikram Total Pay: $95000`,
      explanation: 'super().__init__() calls the parent constructor and calculate_pay overrides parent behavior.'
    },
    practice: {
      easyCount: 4,
      mediumCount: 4,
      interviewCount: 3,
      questions: [
        {
          id: 'inh-1',
          difficulty: 'easy',
          title: 'super() function',
          question: 'What is `super()` used for in a child class in Python?',
          options: ['To call methods from the parent (super) class', 'To supercharge CPU performance', 'To delete the child class', 'To convert variables to uppercase'],
          correctIndex: 0,
          explanation: 'super() provides a reference to the parent class, commonly used in __init__.'
        }
      ]
    },
    dsaConnection: {
      title: 'Inheritance in Design Pattern Questions',
      summary: 'Factory, Strategy, and Decorator OOP design patterns frequently asked in Senior / SDE II interviews.',
      whyItMatters: 'System design interviews evaluate clean class inheritance hierarchies.',
      steps: [
        { title: 'Abstract Base Classes', description: 'Enforcing interfaces across algorithm strategies.' }
      ],
      recommendedProblems: [
        { title: 'LRU Cache Design', difficulty: 'Medium', pattern: 'OOP System Design' }
      ]
    },
    prerequisites: ['classes'],
    nextConceptId: 'exception-handling',
    nextConceptReason: 'Now learn how to protect your code from runtime errors with Exception Handling.',
    relatedConceptIds: ['classes', 'polymorphism', 'exception-handling']
  },

  // ================= 05 ADVANCED =================
  {
    id: 'exception-handling',
    order: 14,
    title: 'Exception Handling',
    category: 'advanced',
    shortDefinition: 'Gracefully intercepting and handling runtime errors with try, except, finally.',
    definition: 'Exception handling provides structured error handling in Python using `try`, `except`, `else`, and `finally` blocks, preventing application crashes and ensuring safe resource cleanup.',
    simpleExplanation: 'A safety net underneath a trapeze artist: if something goes wrong, the net catches it safely instead of causing disaster.',
    visualType: 'general',
    visualData: {
      headline: 'Error Handling Pipeline',
      steps: ['try: Risky Code', 'except: Catch & Recover', 'else: If No Error', 'finally: Always Clean Up']
    },
    whyItMatters: {
      description: 'Real-world networks drop connections and users submit invalid data. Robust software handles exceptions gracefully.',
      connectedChips: ['Try/Except', 'Custom Exceptions', 'Finally', 'Debugging', 'Logging']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Production REST API',
        icon: 'Server',
        description: 'Catching database connection drops and returning 500 error responses without crashing the server.',
        mappings: [
          { key: 'try: fetch_db_user()', typeOrValue: 'except DatabaseTimeout: return 503', explanation: 'Service resilience' }
        ]
      }
    },
    code: {
      snippet: `# Handling potential division by zero and format errors\ndef safe_divide(a, b):\n    try:\n        result = a / b\n    except ZeroDivisionError:\n        return "Error: Cannot divide by zero!"\n    except TypeError:\n        return "Error: Both arguments must be numbers."\n    else:\n        return f"Result: {result}"\n    finally:\n        # Runs regardless\n        pass\n\nprint(safe_divide(10, 2))\nprint(safe_divide(10, 0))`,
      expectedOutput: `Result: 5.0\nError: Cannot divide by zero!`,
      explanation: 'try attempts the risky block, while except catches specific anticipated errors.'
    },
    practice: {
      easyCount: 4,
      mediumCount: 4,
      interviewCount: 3,
      questions: [
        {
          id: 'exc-1',
          difficulty: 'easy',
          title: 'Finally Block Execution',
          question: 'When does the `finally` block execute in Python?',
          options: ['Only when an error occurs', 'Only when no error occurs', 'Always, whether an error occurred or not', 'Never'],
          correctIndex: 2,
          explanation: 'The finally block executes unconditionally, ideal for closing file streams or database connections.'
        }
      ]
    },
    dsaConnection: {
      title: 'Defensive Bounds Checking in Algorithms',
      summary: 'Preventing IndexError and Null Pointer / NoneType crashes during tree traversals.',
      whyItMatters: 'Writing robust competitive programming code requires bulletproof base condition bounds validation.',
      steps: [
        { title: 'Index Bounds Checks', description: 'Validating 0 <= r < rows and 0 <= c < cols in Grid DFS.' }
      ],
      recommendedProblems: [
        { title: 'Number of Islands', difficulty: 'Medium', pattern: 'Grid Bounds Validation' }
      ]
    },
    prerequisites: ['functions', 'classes'],
    nextConceptId: 'decorators',
    nextConceptReason: 'Now master advanced Python metaprogramming with Decorators.',
    relatedConceptIds: ['functions', 'decorators', 'generators']
  },
  {
    id: 'decorators',
    order: 15,
    title: 'Decorators',
    category: 'advanced',
    shortDefinition: 'Higher-order functions wrapping and enhancing behavior without modifying source code.',
    definition: 'A decorator is a design pattern in Python that allows you to dynamically extend or modify the behavior of a callable function or class without permanently modifying its original source code, using `@decorator_name` syntax.',
    simpleExplanation: 'Gift wrapping a box: the present inside stays the same, but the wrapping adds ribbons, glitter, and special tags on the outside.',
    visualType: 'general',
    visualData: {
      headline: '@timer_decorator → [Before Hook] → Original Function → [After Hook]',
      steps: ['Receive Target Function', 'Execute Pre-logic (e.g. start timer)', 'Call Original Function', 'Execute Post-logic (log elapsed ms)']
    },
    whyItMatters: {
      description: 'Used everywhere in production frameworks: `@app.route` in Flask/FastAPI, `@login_required` in Django, `@lru_cache` in performance tuning.',
      connectedChips: ['Higher-Order Functions', 'Closures', 'Metadata', 'FastAPI', 'Performance']
    },
    realWorld: {
      primaryDomain: {
        domain: 'API Performance Monitoring',
        icon: 'Gauge',
        description: 'Measuring latency across hundreds of endpoint functions automatically.',
        mappings: [
          { key: '@measure_time', typeOrValue: 'Logs "Endpoint /checkout took 42ms"', explanation: 'Non-intrusive APM metrics' }
        ]
      }
    },
    code: {
      snippet: `import time\n\n# Defining a timing decorator\ndef timer_decorator(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        duration = (time.time() - start) * 1000\n        print(f"[{func.__name__}] executed in {duration:.3f} ms")\n        return result\n    return wrapper\n\n@timer_decorator\ndef compute_sum(n):\n    return sum(i * i for i in range(n))\n\nans = compute_sum(10000)\nprint("Answer computed successfully!")`,
      expectedOutput: `[compute_sum] executed in 0.812 ms\nAnswer computed successfully!`,
      explanation: '@timer_decorator wraps compute_sum with automatic timing and execution logging.'
    },
    practice: {
      easyCount: 4,
      mediumCount: 4,
      interviewCount: 3,
      questions: [
        {
          id: 'dec-1',
          difficulty: 'medium',
          title: 'Decorator Mechanics',
          question: 'What does the `@my_decorator` syntax above `def greet():` compile to under the hood?',
          options: ['greet = my_decorator(greet)', 'my_decorator = greet()', 'greet.decorator = my_decorator', 'import my_decorator'],
          correctIndex: 0,
          explanation: '@my_decorator is syntactic sugar for `greet = my_decorator(greet)`.'
        }
      ]
    },
    dsaConnection: {
      title: 'Decorators for Dynamic Programming Memoization',
      summary: '`@functools.lru_cache(maxsize=None)` transforms O(2^N) exponential recursive algorithms into O(N) linear time.',
      whyItMatters: 'Using lru_cache allows you to write clean top-down recursion that automatically memoizes overlapping subproblems.',
      steps: [
        { title: 'Memoization Decorator', description: '@lru_cache automatically hashes function arguments as memo keys.' }
      ],
      recommendedProblems: [
        { title: 'Coin Change', difficulty: 'Medium', pattern: 'Top-Down DP with @lru_cache' },
        { title: 'Word Break', difficulty: 'Medium', pattern: 'Memoized Recursion' }
      ]
    },
    prerequisites: ['functions', 'exception-handling'],
    nextConceptId: 'stack-queue',
    nextConceptReason: 'Now step into DSA with Python: Master Stacks & Queues.',
    relatedConceptIds: ['functions', 'generators', 'stack-queue']
  },

  // ================= 06 DSA WITH PYTHON =================
  {
    id: 'stack-queue',
    order: 16,
    title: 'Stack & Queue',
    category: 'dsa',
    shortDefinition: 'Linear data structures following LIFO (Last In First Out) and FIFO (First In First Out).',
    definition: 'A Stack is a LIFO (Last-In-First-Out) linear structure where elements are added and removed from the top. A Queue is a FIFO (First-In-First-Out) structure where items enter at the rear and exit from the front.',
    simpleExplanation: 'Stack: A stack of cafeteria trays (you take the top tray first). Queue: A line of people at a movie theater ticket counter (first person in line gets served first).',
    visualType: 'dsa-stack',
    visualData: {
      stackItems: ['Tray 1', 'Tray 2', 'Tray 3 (TOP)'],
      actions: ['push("Tray 4")', 'pop() → returns Tray 3']
    },
    whyItMatters: {
      description: 'Powers browser history back/forward buttons, undo-redo in text editors, DFS/BFS graph traversals, and call stacks.',
      connectedChips: ['LIFO', 'FIFO', 'collections.deque', 'DFS Traversal', 'BFS Traversal']
    },
    realWorld: {
      primaryDomain: {
        domain: 'Browser Navigation & Job Scheduler',
        icon: 'Layers',
        description: 'Stack powers Back Button navigation; Queue powers background print/email jobs.',
        mappings: [
          { key: 'browser_history.push(url)', typeOrValue: 'Stack (LIFO)', explanation: 'Back button pops last visited' },
          { key: 'print_spooler.append(job)', typeOrValue: 'Queue (FIFO)', explanation: 'First job printed first' }
        ]
      }
    },
    code: {
      snippet: `from collections import deque\n\n# Stack implementation (LIFO)\nstack = []\nstack.append("Page A")\nstack.append("Page B")\nstack.append("Page C")\npopped = stack.pop()\nprint("Stack Popped (LIFO):", popped)\n\n# Queue implementation (FIFO) with deque\nqueue = deque()\nqueue.append("Customer 1")\nqueue.append("Customer 2")\nserved = queue.popleft()\nprint("Queue Served (FIFO):", served)`,
      expectedOutput: `Stack Popped (LIFO): Page C\nQueue Served (FIFO): Customer 1`,
      explanation: 'Use collections.deque for O(1) time pops from the front of a queue.'
    },
    practice: {
      easyCount: 5,
      mediumCount: 5,
      interviewCount: 4,
      questions: [
        {
          id: 'sq-1',
          difficulty: 'easy',
          title: 'Stack Principle',
          question: 'Which element is removed first in a Stack data structure?',
          options: ['The first element inserted (FIFO)', 'The last element inserted (LIFO)', 'The smallest element', 'A random element'],
          correctIndex: 1,
          explanation: 'Stack follows Last-In-First-Out (LIFO); the most recently added item is popped first.'
        }
      ]
    },
    dsaConnection: {
      title: 'Monotonic Stacks & BFS Queues in Interviews',
      summary: 'Parentheses validation, Next Greater Element, and Level-Order Tree Traversal.',
      whyItMatters: 'Stack and Queue questions test your ability to maintain ordering invariants efficiently.',
      steps: [
        { title: 'Valid Parentheses', description: 'Push open brackets to stack, pop on matching close bracket in O(N).' },
        { title: 'Level-Order BFS', description: 'Using queue.popleft() to process tree nodes level by level.' }
      ],
      recommendedProblems: [
        { title: 'Valid Parentheses', difficulty: 'Easy', pattern: 'Stack Matching' },
        { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', pattern: 'Queue BFS' },
        { title: 'Daily Temperatures', difficulty: 'Medium', pattern: 'Monotonic Stack' }
      ]
    },
    prerequisites: ['lists', 'classes'],
    nextConceptId: 'python-basics',
    nextConceptReason: 'You have mastered the core journey! Explore the Full Roadmap or practice more topics.',
    relatedConceptIds: ['lists', 'classes', 'functions']
  }
];

export const getConceptById = (id: string): PythonConcept => {
  const found = PYTHON_CONCEPTS.find(c => c.id === id);
  return found || PYTHON_CONCEPTS[0];
};

export const getNearbyConcepts = (currentId: string, count: number = 5): PythonConcept[] => {
  const currentIndex = PYTHON_CONCEPTS.findIndex(c => c.id === currentId);
  if (currentIndex === -1) return PYTHON_CONCEPTS.slice(0, count);

  const half = Math.floor(count / 2);
  let start = Math.max(0, currentIndex - half);
  let end = start + count;

  if (end > PYTHON_CONCEPTS.length) {
    end = PYTHON_CONCEPTS.length;
    start = Math.max(0, end - count);
  }

  return PYTHON_CONCEPTS.slice(start, end);
};

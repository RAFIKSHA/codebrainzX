import json
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Profile, Topic, QuestionLevel, Question, TestCase, Language

class Command(BaseCommand):
    help = 'Seeds the database with languages, topics, sample questions, and initial users'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # 1. Create Default Users
        self.stdout.write("Creating default users...")
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser('admin', 'admin@codexpetra.com', 'admin123')
            Profile.objects.create(user=admin_user, role='admin')
            self.stdout.write("Created Admin: admin / admin123")
        else:
            self.stdout.write("Admin user already exists")

        if not User.objects.filter(username='student').exists():
            student_user = User.objects.create_user('student', 'student@codexpetra.com', 'student123')
            Profile.objects.create(user=student_user, role='student')
            self.stdout.write("Created Student: student / student123")
        else:
            self.stdout.write("Student user already exists")

        # 2. Seed Programming Languages
        self.stdout.write("Seeding languages...")
        languages_data = [
            {'name': 'Python 3', 'slug': 'python', 'judge0_id': 71, 'extension': 'py'},
            {'name': 'Java (OpenJDK 13.0.1)', 'slug': 'java', 'judge0_id': 62, 'extension': 'java'},
            {'name': 'C (GCC 9.2.0)', 'slug': 'c', 'judge0_id': 50, 'extension': 'c'},
            {'name': 'C++ (GCC 9.2.0)', 'slug': 'cpp', 'judge0_id': 54, 'extension': 'cpp'},
            {'name': 'JavaScript (Node.js 12.14.0)', 'slug': 'javascript', 'judge0_id': 63, 'extension': 'js'},
        ]

        langs = {}
        for lang_info in languages_data:
            lang, created = Language.objects.get_or_create(
                slug=lang_info['slug'],
                defaults={
                    'name': lang_info['name'],
                    'judge0_id': lang_info['judge0_id'],
                    'extension': lang_info['extension']
                }
            )
            langs[lang.slug] = lang
            if created:
                self.stdout.write(f"Added language: {lang.name}")

        # 3. Seed Topics & QuestionLevels
        self.stdout.write("Seeding topics...")
        topics_data = [
            {'name': 'Arrays', 'description': 'Learn contiguous array processing and calculations.', 'order': 1},
            {'name': 'Strings', 'description': 'Master string parsing, reverse actions, and palindrome checks.', 'order': 2},
            {'name': 'Sorting', 'description': 'Understand bubble, merge, and quicksort logic.', 'order': 3},
            {'name': 'Searching', 'description': 'Explore binary and linear search principles.', 'order': 4},
            {'name': 'Stack', 'description': 'LIFO structures for matching brackets and prefix notation.', 'order': 5},
            {'name': 'Queue', 'description': 'FIFO sequences for scheduling and request operations.', 'order': 6},
        ]

        topic_objs = {}
        levels_map = {}
        for t_info in topics_data:
            topic, created = Topic.objects.get_or_create(
                name=t_info['name'],
                defaults={'description': t_info['description'], 'order': t_info['order']}
            )
            topic_objs[topic.name] = topic
            
            # Create the 4 standard levels for each topic
            levels_map[topic.name] = {}
            for level_name in ['basic', 'easy', 'medium', 'hard']:
                level_obj, _ = QuestionLevel.objects.get_or_create(topic=topic, level=level_name)
                levels_map[topic.name][level_name] = level_obj

        # 4. Seed Questions
        self.stdout.write("Seeding sample questions...")
        
        # Starter code mapping templates
        starter_code_sum_array = {
            'python': "def solve(arr):\n    # Write your python code here\n    return sum(arr)\n\n# Input parsing simulation for Judge0\nimport json\nimport sys\nif __name__ == '__main__':\n    # Read input string representation of list e.g. [1, 2, 3]\n    inp = sys.stdin.read().strip()\n    arr = json.loads(inp)\n    print(solve(arr))",
            
            'javascript': "function solve(arr) {\n    // Write your javascript code here\n    return arr.reduce((a, b) => a + b, 0);\n}\n\n// Input parsing simulation for Judge0\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst arr = JSON.parse(input);\nconsole.log(solve(arr));",
            
            'cpp': "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nint solve(vector<int>& arr) {\n    int sum = 0;\n    for(int x : arr) sum += x;\n    return sum;\n}\n\nint main() {\n    // Parsing numbers from inputs e.g. 1 2 3\n    int val;\n    vector<int> arr;\n    while(cin >> val) {\n        arr.push_back(val);\n    }\n    cout << solve(arr) << endl;\n    return 0;\n}",
            
            'c': "#include <stdio.h>\n\nint main() {\n    int val, sum = 0;\n    while(scanf(\"%d\", &val) != EOF) {\n        sum += val;\n    }\n    printf(\"%d\\n\", sum);\n    return 0;\n}",
            
            'java': "import java.util.Scanner;\nimport java.util.ArrayList;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int sum = 0;\n        while (sc.hasNextInt()) {\n            sum += sc.nextInt();\n        }\n        System.out.println(sum);\n    }\n}"
        }

        starter_code_reverse_str = {
            'python': "def solve(s):\n    # Write python code to reverse string\n    return s[::-1]\n\nimport sys\nif __name__ == '__main__':\n    inp = sys.stdin.read().strip()\n    print(solve(inp))",
            
            'javascript': "function solve(s) {\n    return s.split('').reverse().join('');\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(solve(input));",
            
            'cpp': "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        reverse(s.begin(), s.end());\n        cout << s << endl;\n    }\n    return 0;\n}",
            
            'c': "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[1000];\n    if (fgets(s, sizeof(s), stdin)) {\n        // remove newline\n        s[strcspn(s, \"\\r\\n\")] = 0;\n        int len = strlen(s);\n        for(int i = len - 1; i >= 0; i--) {\n            putchar(s[i]);\n        }\n        putchar('\\n');\n    }\n    return 0;\n}",
            
            'java': "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String s = sc.nextLine();\n            System.out.println(new StringBuilder(s).reverse().toString());\n        }\n    }\n}"
        }



        # Question 3: Reverse String (Topic: Strings, Level: Basic)
        q3, created = Question.objects.get_or_create(
            slug='reverse-string',
            defaults={
                'topic': topic_objs['Strings'],
                'level': levels_map['Strings']['basic'],
                'title': 'Reverse String',
                'statement': 'Given a single line input representing a string, return the reversed string.',
                'constraints': '1 <= string length <= 1000',
                'starter_code': json.dumps(starter_code_reverse_str),
                'time_limit': 2.0,
                'memory_limit': 256.0,
                'is_published': True,
                'order': 1
            }
        )
        # 5. Seed 10 Array questions with driver code
        from django.core.management import call_command
        call_command('seed_array_questions')

        self.stdout.write("Database seeded successfully!")

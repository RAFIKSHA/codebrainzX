from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Question, AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion
from api.models_internship import (
    InternshipProgram, ScholarshipRule, InternshipAssessment,
    InternshipApplication, InternshipAttempt, InternshipQuestionResponse
)


class Command(BaseCommand):
    help = "Seed initial production-grade Internship programs, scholarship rules, and 30 Full-Stack MCQs assessment"

    def handle(self, *args, **options):
        self.stdout.write("Seeding CodexPetra Internship Programs & 30 Full-Stack MCQs...")

        # 1. Global Scholarship Rules
        scholarship_rules_data = [
            {
                'title': 'Platinum Merit Scholarship',
                'min_score': 85.0,
                'max_score': 100.0,
                'concession_percentage': 75.0,
                'badge_label': '75% Concession',
                'description': 'Top percentile performance across Full Stack Engineering assessment.',
                'order': 1
            },
            {
                'title': 'Gold Merit Scholarship',
                'min_score': 70.0,
                'max_score': 84.9,
                'concession_percentage': 50.0,
                'badge_label': '50% Concession',
                'description': 'Strong proficiency across software engineering, web architecture, and database logic.',
                'order': 2
            },
            {
                'title': 'Silver Merit Scholarship',
                'min_score': 50.0,
                'max_score': 69.9,
                'concession_percentage': 25.0,
                'badge_label': '25% Concession',
                'description': 'Solid understanding of core development fundamentals.',
                'order': 3
            },
            {
                'title': 'Standard Admission Tier',
                'min_score': 0.0,
                'max_score': 49.9,
                'concession_percentage': 0.0,
                'badge_label': 'Standard Admission',
                'description': 'Standard qualification without fee concession.',
                'order': 4
            }
        ]

        for s_data in scholarship_rules_data:
            ScholarshipRule.objects.update_or_create(
                internship=None,
                min_score=s_data['min_score'],
                max_score=s_data['max_score'],
                defaults=s_data
            )
        self.stdout.write(self.style.SUCCESS("[OK] Seeded global scholarship rules"))

        # 2. Main Internship Programs
        highlights_main = [
            {
                'number': '01',
                'title': 'Skill Assessment',
                'description': 'Demonstrate your programming fundamentals & algorithms through a structured test.'
            },
            {
                'number': '02',
                'title': 'Real Learning Experience',
                'description': 'Work on practical production development skills and enterprise architectures.'
            },
            {
                'number': '03',
                'title': 'Mentorship',
                'description': 'Learn with structured 1-on-1 code reviews and weekly industry syncs.'
            },
            {
                'number': '04',
                'title': 'Certificate',
                'description': 'Receive a verifiable digital certificate based on program milestone completion.'
            },
            {
                'number': '05',
                'title': 'Scholarship Opportunity',
                'description': 'Assessment performance can unlock up to 75% fee concessions.'
            },
            {
                'number': '06',
                'title': 'Career Opportunity',
                'description': 'Shortlisted candidates advance directly to the technical interview pipeline.'
            }
        ]

        who_can_apply = [
            'College students & pre-final/final year graduates',
            'Fresh graduates looking for real project experience',
            'Beginners with core programming knowledge',
            'Students aiming for product company technical interviews'
        ]

        skills_web = [
            'React.js & TypeScript',
            'Node.js & Python Backend',
            'Database Architecture & SQL',
            'System Design & REST APIs',
            'Git & CI/CD Deployment'
        ]

        today = timezone.now().date()
        p1, _ = InternshipProgram.objects.update_or_create(
            slug='full-stack-web-development',
            defaults={
                'title': 'Full Stack Software Engineering Internship',
                'badge': 'CODEXPETRA INTERNSHIP 2026',
                'subtitle': 'Learn → Build → Prove',
                'description': 'An intensive 8-week structured software engineering internship. Candidates work on full-stack web applications, distributed systems, and real API integrations under engineering mentorship.',
                'duration': '8 Weeks',
                'mode': 'online',
                'program_type': 'Skill-Based Internship',
                'stipend_info': 'Performance-Based',
                'who_can_apply': who_can_apply,
                'skills_covered': skills_web,
                'highlights': highlights_main,
                'certificate_info': 'Program Completion Based',
                'mentorship_info': 'Available with Senior Engineers',
                'interview_info': 'Shortlisted Candidates',
                'start_date': today + timedelta(days=14),
                'end_date': today + timedelta(days=70),
                'application_deadline': today + timedelta(days=10),
                'is_published': True,
                'status': 'open',
                'display_order': 1
            }
        )

        p2, _ = InternshipProgram.objects.update_or_create(
            slug='python-ai-backend-engineering',
            defaults={
                'title': 'Python & Applied AI Engineering Internship',
                'badge': 'CODEXPETRA INTERNSHIP 2026',
                'subtitle': 'Learn → Build → Prove',
                'description': 'Master modern Python backend engineering, asynchronous architectures, REST APIs, and generative AI workflow integrations on production scale datasets.',
                'duration': '8 Weeks',
                'mode': 'online',
                'program_type': 'Skill-Based Internship',
                'stipend_info': 'Performance-Based',
                'who_can_apply': who_can_apply,
                'skills_covered': ['Python 3.10+', 'FastAPI / Django', 'PostgreSQL & Redis', 'LLM Integrations & Vector DBs', 'Docker'],
                'highlights': highlights_main,
                'certificate_info': 'Program Completion Based',
                'mentorship_info': 'Available with AI Practitioners',
                'interview_info': 'Shortlisted Candidates',
                'start_date': today + timedelta(days=14),
                'end_date': today + timedelta(days=70),
                'application_deadline': today + timedelta(days=10),
                'is_published': True,
                'status': 'open',
                'display_order': 2
            }
        )

        p3, _ = InternshipProgram.objects.update_or_create(
            slug='dsa-competitive-programming',
            defaults={
                'title': 'Data Structures & Problem Solving Track',
                'badge': 'CODEXPETRA INTERNSHIP 2026',
                'subtitle': 'Learn → Build → Prove',
                'description': 'Fast-track your algorithmic thinking, problem decomposition, and coding interview readiness across data structures, graph theory, and dynamic programming.',
                'duration': '6 Weeks',
                'mode': 'online',
                'program_type': 'Skill-Based Internship',
                'stipend_info': 'Performance-Based',
                'who_can_apply': who_can_apply,
                'skills_covered': ['Arrays & Strings', 'Linked Lists & Trees', 'Graphs & DP', 'Time/Space Complexity', 'C++ / Java / Python'],
                'highlights': highlights_main,
                'certificate_info': 'Program Completion Based',
                'mentorship_info': 'Available with ICPC Regionalists',
                'interview_info': 'Shortlisted Candidates',
                'start_date': today + timedelta(days=21),
                'end_date': today + timedelta(days=63),
                'application_deadline': today + timedelta(days=14),
                'is_published': True,
                'status': 'open',
                'display_order': 3
            }
        )

        self.stdout.write(self.style.SUCCESS("[OK] Seeded 3 Internship Programs"))

        # 3. Category & Topic for Full Stack Software Engineering Questions
        cat, _ = AptitudeCategory.objects.get_or_create(
            name='Software Engineering & Full Stack',
            defaults={'description': 'Core software development lifecycle, web architecture, APIs, databases, testing, and system scenarios.', 'order': 1}
        )
        topic, _ = AptitudeTopic.objects.get_or_create(
            category=cat,
            name='Full Stack Web Engineering',
            defaults={'description': 'Assessment questions for CodexPetra Full Stack Engineering Cohort.', 'order': 1}
        )

        # 4. Seed the 30 CodexPetra Full-Stack MCQs
        mcqs_30_data = [
            {
                'title': 'SDLC: Requirement Analysis Deficiency',
                'statement': 'A development team starts coding immediately after receiving a high-level requirement from the client. Later, they discover that the client expected completely different functionality. Which SDLC phase was most likely insufficient?',
                'options': ['Testing', 'Requirement Analysis', 'Deployment', 'Maintenance'],
                'correct_answer': ['Requirement Analysis', 'B'],
                'explanation': 'Requirement Analysis ensures that the team and client have a shared understanding of what needs to be built before coding begins.'
            },
            {
                'title': 'SDLC: Typical Lifecycle Sequence',
                'statement': 'Which sequence best represents a typical Software Development Life Cycle (SDLC)?',
                'options': [
                    'Testing → Requirement → Design → Coding → Deployment',
                    'Requirement → Design → Development → Testing → Deployment',
                    'Design → Requirement → Testing → Development → Deployment',
                    'Development → Requirement → Design → Testing → Deployment'
                ],
                'correct_answer': ['Requirement → Design → Development → Testing → Deployment', 'B'],
                'explanation': 'The standard SDLC sequence begins with requirements, followed by architectural design, development, quality testing, and production deployment.'
            },
            {
                'title': 'Real-Life Scenario: Initial Requirement Clarification',
                'statement': 'A client says: "I want an application where users can order food online." Before developers start designing the database, what should the team primarily do?',
                'options': [
                    'Start writing APIs',
                    'Purchase a server',
                    'Clarify functional and business requirements',
                    'Start UI development'
                ],
                'correct_answer': ['Clarify functional and business requirements', 'C'],
                'explanation': 'Understanding user stories, actors, order lifecycle, and business rules is essential before designing schemas or writing code.'
            },
            {
                'title': 'SDLC: Handling Frequent Requirements',
                'statement': 'A requirement changes frequently during development and the customer wants to see working software every few weeks. Which approach is most suitable?',
                'options': ['Waterfall', 'Agile', 'Big Bang', 'V-Model'],
                'correct_answer': ['Agile', 'B'],
                'explanation': 'Agile emphasizes iterative delivery, customer collaboration, and adaptability to evolving requirements.'
            },
            {
                'title': 'Agile: Purpose of a Sprint',
                'statement': 'In Agile development, what is the main purpose of a sprint?',
                'options': [
                    'To deploy the complete application',
                    'To complete a defined set of work within a fixed time period',
                    'To permanently freeze requirements',
                    'To perform only security testing'
                ],
                'correct_answer': ['To complete a defined set of work within a fixed time period', 'B'],
                'explanation': 'A sprint is a time-boxed iteration (usually 1–4 weeks) where a specific set of backlog items are built and made ready for review.'
            },
            {
                'title': 'Project Development: Team Code Integration',
                'statement': "A developer completes a feature but does not commit the code to the team's Git repository. What is the biggest immediate problem?",
                'options': [
                    'The application cannot use a database',
                    'Other team members cannot easily access and integrate the changes',
                    'The frontend will automatically stop working',
                    'The server will shut down'
                ],
                'correct_answer': ['Other team members cannot easily access and integrate the changes', 'B'],
                'explanation': 'Without committing and pushing code to the remote repository, teammates cannot access, test, or integrate with new changes.'
            },
            {
                'title': 'Git: Resolving Merge Conflicts',
                'statement': 'Two developers modify the same lines of a file and Git reports a merge conflict. What should they normally do?',
                'options': [
                    'Delete the repository',
                    'Ignore the conflict',
                    'Manually resolve the conflicting changes and commit the result',
                    'Reinstall Git'
                ],
                'correct_answer': ['Manually resolve the conflicting changes and commit the result', 'C'],
                'explanation': 'Merge conflicts must be reviewed and resolved by inspecting both changes, selecting the correct logic, and committing the unified result.'
            },
            {
                'title': 'Tech Stack: Full-Stack Application Layers',
                'statement': 'Which combination represents a reasonable full-stack web application architecture?',
                'options': [
                    'HTML + CSS + JavaScript + Backend + Database',
                    'Photoshop + Excel + PowerPoint',
                    'BIOS + RAM + CPU',
                    'Git + Monitor + Keyboard'
                ],
                'correct_answer': ['HTML + CSS + JavaScript + Backend + Database', 'A'],
                'explanation': 'A full-stack application encompasses client presentation (HTML/CSS/JS), server business logic (Backend API), and persistence (Database).'
            },
            {
                'title': 'Backend: REST API POST Request',
                'statement': 'A frontend application sends: POST /api/users. What is the most likely purpose of this request?',
                'options': [
                    'Retrieve an existing user',
                    'Create a new user/resource',
                    'Delete the server',
                    'Display an HTML file only'
                ],
                'correct_answer': ['Create a new user/resource', 'B'],
                'explanation': 'In RESTful architecture, HTTP POST is the standard method used to create a new resource on the server.'
            },
            {
                'title': 'API: Inter-System Communication',
                'statement': 'A mobile application needs current weather information. Instead of maintaining weather data itself, it requests information from another service through an API. What does the API primarily provide?',
                'options': [
                    'A way for different software systems to communicate',
                    'A replacement for the operating system',
                    'A physical server',
                    'A programming language'
                ],
                'correct_answer': ['A way for different software systems to communicate', 'A'],
                'explanation': 'An API (Application Programming Interface) defines protocols and endpoints allowing disparate applications to exchange data seamlessly.'
            },
            {
                'title': 'Database: Table Normalization & Separation',
                'statement': 'An e-commerce application stores User information, Product information, and Orders. Why would separate tables commonly be used?',
                'options': [
                    'To make the database more difficult to access',
                    'To organize related data and reduce unnecessary duplication',
                    'Because databases cannot store multiple types of data',
                    'To eliminate the need for APIs'
                ],
                'correct_answer': ['To organize related data and reduce unnecessary duplication', 'B'],
                'explanation': 'Relational modeling organizes distinct entities into normalized tables, preventing data redundancy and ensuring integrity.'
            },
            {
                'title': 'SQL: Filtering with WHERE Clause',
                'statement': 'Which query correctly retrieves all users whose age is greater than 18?',
                'options': [
                    'SELECT users WHERE age > 18;',
                    'GET users WHERE age > 18;',
                    'SELECT * FROM users WHERE age > 18;',
                    'FETCH * users age > 18;'
                ],
                'correct_answer': ['SELECT * FROM users WHERE age > 18;', 'C'],
                'explanation': 'In SQL, `SELECT * FROM table_name WHERE condition;` is the standard syntax for querying filtered records.'
            },
            {
                'title': 'Authentication: Purpose of Auth Tokens',
                'statement': 'A website allows users to log in using email and password. After successful login, the server provides a token that the client sends with future requests. What is the primary purpose of this token?',
                'options': [
                    'Store images',
                    'Identify/authenticate the user for subsequent requests',
                    'Increase screen resolution',
                    'Replace the database'
                ],
                'correct_answer': ['Identify/authenticate the user for subsequent requests', 'B'],
                'explanation': 'Tokens allow stateless authentication so the server can verify the candidate identity on subsequent API calls without repeatedly asking for passwords.'
            },
            {
                'title': 'Security: Plain Text Password Vulnerability',
                'statement': "A developer stores user passwords directly in the database like this: 'rahul123'. What is the major problem?",
                'options': [
                    'Passwords are too short',
                    'Passwords should not be stored as plain text',
                    'SQL cannot store passwords',
                    'Passwords should be stored in frontend code'
                ],
                'correct_answer': ['Passwords should not be stored as plain text', 'B'],
                'explanation': 'Passwords must always be hashed using strong cryptographic algorithms (such as bcrypt or Argon2) with salt to protect user credentials if the DB is compromised.'
            },
            {
                'title': 'Project Scenario: Handling Duplicate Submissions',
                'statement': 'You are developing an online examination system. A student submits an answer, but due to a network problem the request is sent twice. What should the backend ideally consider to prevent the same submission from being processed incorrectly?',
                'options': [
                    'Idempotency / duplicate request handling',
                    'Changing the website font',
                    'Increasing monitor size',
                    'Removing the database'
                ],
                'correct_answer': ['Idempotency / duplicate request handling', 'A'],
                'explanation': 'Idempotency and unique transaction keys guarantee that duplicate incoming requests do not cause double evaluation or duplicate record creation.'
            },
            {
                'title': 'Testing: Valid and Invalid Credentials Testing',
                'statement': 'A developer tests whether the login feature works correctly with valid and invalid passwords. This is primarily an example of:',
                'options': [
                    'Functional testing',
                    'Performance testing',
                    'Deployment',
                    'Database normalization'
                ],
                'correct_answer': ['Functional testing', 'A'],
                'explanation': 'Functional testing validates that software features operate according to their specified functional requirements.'
            },
            {
                'title': 'Testing Scenario: High Concurrency Bottlenecks',
                'statement': 'An application works correctly for 10 users but becomes extremely slow when 10,000 users access it simultaneously. Which type of testing would help identify this problem?',
                'options': [
                    'Unit testing',
                    'Load/Performance testing',
                    'UI testing only',
                    'Syntax testing'
                ],
                'correct_answer': ['Load/Performance testing', 'B'],
                'explanation': 'Load and performance testing simulates high traffic volumes to identify throughput bottlenecks, memory leaks, and query latency under stress.'
            },
            {
                'title': 'Unit Testing: Component Isolation',
                'statement': 'What is the main purpose of unit testing?',
                'options': [
                    "Test the entire company's infrastructure",
                    'Test small individual components/functions in isolation',
                    'Deploy the application',
                    'Design the database'
                ],
                'correct_answer': ['Test small individual components/functions in isolation', 'B'],
                'explanation': 'Unit tests verify that individual units of source code (functions, methods, classes) behave correctly in isolation.'
            },
            {
                'title': 'Deployment: Transitioning to Production',
                'statement': 'A developer has tested an application locally and now wants to make it accessible to real users through the internet. Which stage is this?',
                'options': [
                    'Requirement gathering',
                    'Deployment',
                    'Requirement analysis',
                    'Database normalization'
                ],
                'correct_answer': ['Deployment', 'B'],
                'explanation': 'Deployment is the process of building, configuring, and publishing an application onto production servers or cloud infrastructure for end users.'
            },
            {
                'title': 'Environment: Staging vs Production',
                'statement': 'Why are separate development, testing/staging, and production environments commonly used?',
                'options': [
                    'To make development slower',
                    'To test changes safely before exposing them to real users',
                    'To avoid using Git',
                    'To eliminate testing'
                ],
                'correct_answer': ['To test changes safely before exposing them to real users', 'B'],
                'explanation': 'Environment isolation prevents untested bugs or experimental code from breaking live services used by active customers.'
            },
            {
                'title': 'Real-Life Scenario: Testing Payment Gateways',
                'statement': 'Your team has developed a payment feature. Before releasing it to all users, the team wants to test it using realistic data without affecting actual customers. Which environment is most appropriate?',
                'options': ['Production', 'Staging', 'BIOS', 'Local hardware only'],
                'correct_answer': ['Staging', 'B'],
                'explanation': 'A staging environment mirrors production settings and allows full end-to-end testing with sandbox payment gateways safely.'
            },
            {
                'title': 'Frontend + Backend: Complete Request-Response Flow',
                'statement': 'A user clicks "Buy Now" on a website. Which flow is most appropriate?',
                'options': [
                    'Frontend → Backend/API → Database/Services → Backend → Frontend',
                    'Frontend → Monitor → Database',
                    'Database → Keyboard → Frontend',
                    'Backend → Printer → Database'
                ],
                'correct_answer': ['Frontend → Backend/API → Database/Services → Backend → Frontend', 'A'],
                'explanation': 'The frontend dispatches an API call to the backend, which executes business logic, queries the database, and returns a formatted response back to the client.'
            },
            {
                'title': 'Project Architecture: Decoupling Frontend and Backend',
                'statement': 'Why is separating frontend and backend often useful?',
                'options': [
                    'It allows UI and business logic to be developed and maintained independently',
                    'It removes the need for testing',
                    'It makes databases unnecessary',
                    'It prevents APIs from being used'
                ],
                'correct_answer': ['It allows UI and business logic to be developed and maintained independently', 'A'],
                'explanation': 'Decoupling enables independent scaling, technology upgrades, easier team collaboration, and multi-client support (e.g. web and mobile apps sharing the same backend).'
            },
            {
                'title': 'Tech Stack Scenario: Framework Roles',
                'statement': 'A team chooses React for frontend, Django for backend, and PostgreSQL for database. Which statement is correct?',
                'options': [
                    'React is primarily the database',
                    'Django is primarily the backend framework',
                    'PostgreSQL is the frontend framework',
                    'React replaces the operating system'
                ],
                'correct_answer': ['Django is primarily the backend framework', 'B'],
                'explanation': 'React is a client-side UI library, Django is a server-side Python web framework, and PostgreSQL is a relational database management system.'
            },
            {
                'title': 'Bug Handling: Large File Upload Crash',
                'statement': 'A user reports: "The application crashes whenever I upload a PDF larger than 20 MB." What should the developer ideally do first?',
                'options': [
                    'Immediately rewrite the entire application',
                    'Reproduce and investigate the issue using relevant logs/input conditions',
                    'Delete the database',
                    'Ignore the user'
                ],
                'correct_answer': ['Reproduce and investigate the issue using relevant logs/input conditions', 'B'],
                'explanation': 'Systematic debugging starts by replicating the issue with matching inputs and inspecting server logs to diagnose payload limits or timeout errors.'
            },
            {
                'title': 'Requirements Scenario: Uncontrolled Scope Growth',
                'statement': 'A client initially requests a simple attendance system. After development starts, they ask for: Face recognition, Notifications, Analytics, Parent login, and Mobile application without adjusting timeline or budget. What is this situation commonly associated with?',
                'options': ['Scope creep', 'Unit testing', 'Database indexing', 'Version control'],
                'correct_answer': ['Scope creep', 'A'],
                'explanation': 'Scope creep refers to uncontrolled growth or continuous expansion of project requirements without corresponding adjustments in time, budget, or resources.'
            },
            {
                'title': 'Performance: Eliminating Unnecessary Queries',
                'statement': 'An e-commerce website takes 8 seconds to display products because every request retrieves thousands of unnecessary database records. Which solution could improve the situation?',
                'options': [
                    'Fetch only required records and use appropriate database optimization/indexing',
                    'Increase font size',
                    'Remove the frontend',
                    'Add more HTML comments'
                ],
                'correct_answer': ['Fetch only required records and use appropriate database optimization/indexing', 'A'],
                'explanation': 'Limiting result sets with pagination, selective column projection, and index optimization dramatically cuts query time and network overhead.'
            },
            {
                'title': 'Version Control Scenario: Feature Branching',
                'statement': 'A developer is working on a new payment feature that is not ready for production. What is generally a good Git practice?',
                'options': [
                    'Directly modify the production branch',
                    'Work on a separate feature branch and merge after review/testing',
                    'Delete all previous commits',
                    'Avoid committing until the project is finished'
                ],
                'correct_answer': ['Work on a separate feature branch and merge after review/testing', 'B'],
                'explanation': 'Feature branching isolates in-progress development, allowing code review, CI test suites, and safe merging into the main codebase.'
            },
            {
                'title': 'Real-World Project Scenario: Stale Dashboard Metrics',
                'statement': 'Your team is building a student portal. During testing, students report that their dashboard sometimes shows outdated marks. Which area should the team investigate first?',
                'options': [
                    'Data retrieval/caching/synchronization logic',
                    'Button color',
                    'Logo size',
                    'Keyboard layout'
                ],
                'correct_answer': ['Data retrieval/caching/synchronization logic', 'A'],
                'explanation': 'Stale UI data is typically caused by uninvalidated cache layers, stale client state, or delayed database synchronization.'
            },
            {
                'title': 'Overall Project Scenario: First Step in System Design',
                'statement': 'You are assigned a real-world project with the requirement: "Build a platform where students can take coding tests and receive scores." What would be the best first step?',
                'options': [
                    'Start writing the scoring algorithm immediately',
                    'Select a programming language and start coding',
                    'Understand and document requirements, users, workflows, and expected outcomes',
                    'Deploy an empty website'
                ],
                'correct_answer': ['Understand and document requirements, users, workflows, and expected outcomes', 'C'],
                'explanation': 'Successful software engineering begins with understanding the user personas, functional boundaries, architectural requirements, and evaluation workflows.'
            }
        ]

        seeded_mcqs = []
        for q_data in mcqs_30_data:
            q_obj, _ = AptitudeQuestion.objects.update_or_create(
                topic=topic,
                title=q_data['title'],
                defaults={
                    'statement': q_data['statement'],
                    'options': q_data['options'],
                    'correct_answer': q_data['correct_answer'],
                    'explanation': q_data['explanation'],
                    'difficulty': 'medium',
                    'question_type': 'single_mcq',
                    'marks': 1.0,
                    'negative_marks': 0.0,
                    'time_limit': 60,
                    'status': 'active',
                    'visibility': 'public'
                }
            )
            seeded_mcqs.append(q_obj)

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(seeded_mcqs)} Full-Stack Software Engineering MCQs in Question Bank"))

        # 5. Link the 30 MCQs to the Full Stack Web Development Internship Assessment
        assessment_fullstack, _ = InternshipAssessment.objects.update_or_create(
            internship=p1,
            defaults={
                'title': 'Full Stack Software Engineering — Entrance Assessment',
                'slug': 'full-stack-web-development-assessment',
                'description': '30-question entrance and merit scholarship evaluation covering SDLC, Agile, Git, REST APIs, Databases, Security, Testing, and Real-World Architecture.',
                'duration_minutes': 30,
                'total_marks': 30,
                'passing_percentage': 50.0,
                'instructions': """- Complete all 30 multiple choice questions within the allotted 30 minutes.
- Each correct answer awards 1 mark (Total: 30 Marks).
- The countdown timer runs continuously once launched.
- Do not refresh or close the assessment window.
- Score percentage determines merit scholarship concessions (up to 75%) and interview consideration.""",
                'is_published': True
            }
        )

        assessment_fullstack.mcq_questions.set(seeded_mcqs)
        assessment_fullstack.coding_questions.clear()
        assessment_fullstack.save()
        self.stdout.write(self.style.SUCCESS("[OK] Linked all 30 MCQs to Full Stack Software Engineering Assessment (30 Mins, 30 Marks)"))

        # Link assessments for p2 and p3 as well
        for program in [p2, p3]:
            assessment, _ = InternshipAssessment.objects.update_or_create(
                internship=program,
                defaults={
                    'title': f'{program.title} - Entrance & Scholarship Assessment',
                    'slug': f'{program.slug}-assessment',
                    'description': 'Demonstrate your foundational programming logic, algorithmic problem-solving, and aptitude skills.',
                    'duration_minutes': 30,
                    'total_marks': 30,
                    'passing_percentage': 50.0,
                    'instructions': """- Complete the assessment within the allotted 30 minutes.
- Do not refresh or close the assessment window.
- Review your flagged answers before final submission.
- Assessment score unlocks merit scholarship concessions & interview shortlist consideration.""",
                    'is_published': True
                }
            )
            assessment.mcq_questions.set(seeded_mcqs)
            assessment.save()

        # 6. Seed sample candidates for recruitment pipeline demonstration
        sample_candidates = [
            {
                'app_id': 'CP-INT-2026-8291',
                'name': 'Aarav Sharma',
                'email': 'aarav.sharma@example.com',
                'phone': '+91 98765 43210',
                'city': 'Bengaluru',
                'college': 'RV College of Engineering',
                'course': 'B.Tech Computer Science',
                'year': '3rd Year',
                'skill': 'React, Python, DSA',
                'status': 'under_review',
                'score': 86.7,
                'mcq_score': 26.0,
                'coding_score': 0.0,
                'concession': 75.0
            },
            {
                'app_id': 'CP-INT-2026-9143',
                'name': 'Priya Patel',
                'email': 'priya.patel@example.com',
                'phone': '+91 98765 43211',
                'city': 'Pune',
                'college': 'COEP Technological University',
                'course': 'B.Tech Information Technology',
                'year': '4th Year',
                'skill': 'Python, Machine Learning, SQL',
                'status': 'shortlisted',
                'score': 93.3,
                'mcq_score': 28.0,
                'coding_score': 0.0,
                'concession': 75.0
            },
            {
                'app_id': 'CP-INT-2026-7312',
                'name': 'Rohan Deshmukh',
                'email': 'rohan.deshmukh@example.com',
                'phone': '+91 98765 43212',
                'city': 'Mumbai',
                'college': 'VJTI Mumbai',
                'course': 'B.Tech Computer Engineering',
                'year': '3rd Year',
                'skill': 'JavaScript, Node.js, Next.js',
                'status': 'interview_scheduled',
                'score': 76.7,
                'mcq_score': 23.0,
                'coding_score': 0.0,
                'concession': 50.0,
                'interview_date': timezone.now() + timedelta(days=2)
            },
            {
                'app_id': 'CP-INT-2026-6420',
                'name': 'Ananya Iyer',
                'email': 'ananya.iyer@example.com',
                'phone': '+91 98765 43213',
                'city': 'Chennai',
                'college': 'Anna University',
                'course': 'B.Tech CSE',
                'year': '4th Year',
                'skill': 'Python, PyTorch, FastAPIs',
                'status': 'selected',
                'score': 96.7,
                'mcq_score': 29.0,
                'coding_score': 0.0,
                'concession': 75.0
            },
            {
                'app_id': 'CP-INT-2026-5519',
                'name': 'Vikram Mehra',
                'email': 'vikram.mehra@example.com',
                'phone': '+91 98765 43214',
                'city': 'Delhi',
                'college': 'DTU Delhi',
                'course': 'B.Tech Software Engineering',
                'year': '2nd Year',
                'skill': 'C++, Data Structures',
                'status': 'assessment_pending',
                'score': 0.0,
                'mcq_score': 0.0,
                'coding_score': 0.0,
                'concession': 0.0
            }
        ]

        gold_rule = ScholarshipRule.objects.filter(concession_percentage=50.0).first()
        plat_rule = ScholarshipRule.objects.filter(concession_percentage=75.0).first()

        for cand in sample_candidates:
            app, created = InternshipApplication.objects.update_or_create(
                application_id=cand['app_id'],
                defaults={
                    'internship': p1,
                    'full_name': cand['name'],
                    'email': cand['email'],
                    'phone': cand['phone'],
                    'city': cand['city'],
                    'college': cand['college'],
                    'course': cand['course'],
                    'year_of_study': cand['year'],
                    'primary_skill': cand['skill'],
                    'programming_experience': 'Intermediate',
                    'status': cand['status'],
                    'interview_date': cand.get('interview_date'),
                    'admin_notes': 'Strong fundamental logic demonstrated in assessment.' if cand['score'] > 80 else ''
                }
            )

            if cand['score'] > 0:
                rule_match = plat_rule if cand['concession'] == 75 else gold_rule
                attempt, _ = InternshipAttempt.objects.update_or_create(
                    application=app,
                    defaults={
                        'assessment': p1.assessment,
                        'started_at': timezone.now() - timedelta(hours=2),
                        'completed_at': timezone.now() - timedelta(hours=1),
                        'status': 'completed',
                        'score_percentage': cand['score'],
                        'total_score': cand['mcq_score'],
                        'max_score': 30.0,
                        'mcq_score': cand['mcq_score'],
                        'coding_score': 0.0,
                        'total_questions': 30,
                        'correct_questions': int(cand['mcq_score']),
                        'time_spent_seconds': 1420,
                        'concession_percentage': cand['concession'],
                        'concession_rule': rule_match,
                        'is_eligible_for_concession': cand['concession'] > 0,
                        'concession_summary': f"{cand['concession']:.0f}% Scholarship Concession",
                        'topic_breakdown': [
                            {'topic': 'SDLC & Agile', 'percentage': int(cand['score'] * 1.02)},
                            {'topic': 'Git & Version Control', 'percentage': int(cand['score'] * 0.98)},
                            {'topic': 'APIs & Web Architecture', 'percentage': int(cand['score'] * 1.05)},
                            {'topic': 'Databases & Security', 'percentage': int(cand['score'] * 0.95)},
                            {'topic': 'Testing & Real-World Scenarios', 'percentage': int(cand['score'] * 1.0)},
                        ]
                    }
                )

        self.stdout.write(self.style.SUCCESS("[OK] Seeded sample candidates for recruitment pipeline & analytics"))
        self.stdout.write(self.style.SUCCESS("[SUCCESS] 30 MCQs Seeded & Full Stack Internship Assessment Configured!"))

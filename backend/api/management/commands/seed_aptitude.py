import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.contrib.auth.models import User
from api.models import (
    AptitudeTrainer, AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion,
    AptitudeTest, AptitudeTestQuestion, AptitudeTestSection, GamificationProfile
)

class Command(BaseCommand):
    help = 'Seeds the database with placement aptitude categories, topics, trainers, and question banks'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding placement aptitude content...")

        # 0. Create Trainers
        trainers_data = [
            {
                'name': 'Dr. Rajesh Sharma',
                'specialization': 'Quantitative Aptitude & Speed Math',
                'bio': '12+ years mentoring 50,000+ candidates for TCS NQT, Infosys, and CAT with mental math hacks and speed techniques.',
                'profile_image': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'is_active': True
            },
            {
                'name': 'Ananya Sen',
                'specialization': 'Logical Reasoning & Critical Thinking',
                'bio': 'Former placement cell head specializing in syllogisms, puzzle grids, seating matrices, and coding-decoding patterns.',
                'profile_image': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
                'is_active': True
            },
            {
                'name': 'Vikram Malhotra',
                'specialization': 'Verbal Ability & Reading Comprehension',
                'bio': 'Corporate communication expert and author of aptitude handbooks, helping students master grammar and RC speed.',
                'profile_image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                'is_active': True
            }
        ]

        trainers = {}
        for t_info in trainers_data:
            trainer, created = AptitudeTrainer.objects.get_or_create(
                name=t_info['name'],
                defaults={
                    'specialization': t_info['specialization'],
                    'bio': t_info['bio'],
                    'profile_image': t_info['profile_image'],
                    'is_active': t_info['is_active'],
                    'slug': slugify(t_info['name'])
                }
            )
            trainers[trainer.name] = trainer
            if created:
                self.stdout.write(f"Added Trainer: {trainer.name}")

        # 1. Create Categories
        cats_data = [
            {'name': 'Quantitative Aptitude', 'desc': 'Mathematical operations, arithmetic equations, algebra, and mensuration problems.'},
            {'name': 'Logical Reasoning', 'desc': 'Blood relations, seating arrangements, syllogisms, and puzzle solving.'},
            {'name': 'Verbal Ability', 'desc': 'Reading comprehension, synonyms, antonyms, vocabulary, and grammar improvements.'}
        ]

        cats = {}
        for c_info in cats_data:
            cat, created = AptitudeCategory.objects.get_or_create(
                name=c_info['name'],
                defaults={'description': c_info['desc'], 'slug': slugify(c_info['name'])}
            )
            cats[cat.name] = cat
            if created:
                self.stdout.write(f"Added Category: {cat.name}")

        # 2. Create Topics & Subtopics
        topics_data = {
            'Quantitative Aptitude': [
                {
                    'name': 'Percentages',
                    'desc': 'Percentage calculations, fraction conversion, and percentage increases/decreases.',
                    'subs': ['Percentage basics', 'Profit margins', 'Discount calculations']
                },
                {
                    'name': 'Profit & Loss',
                    'desc': 'Cost price, selling price, profit percentage, loss percentage, and marked price.',
                    'subs': ['Basic Profit/Loss', 'Dishonest dealers', 'Successive discounts']
                }
            ],
            'Logical Reasoning': [
                {
                    'name': 'Blood Relations',
                    'desc': 'Family trees, relationship puzzles, and deciphering relationship codes.',
                    'subs': ['Family tree diagrams', 'Coded relationships', 'Direct relationships']
                },
                {
                    'name': 'Syllogisms',
                    'desc': 'Venn diagram representations, logical deductions from statements.',
                    'subs': ['Two statements', 'Three statements', 'Either-Or cases']
                }
            ],
            'Verbal Ability': [
                {
                    'name': 'Reading Comprehension',
                    'desc': 'Passage reading, context matching, vocabulary extraction, and title inference.',
                    'subs': ['Short passages', 'Scientific journals', 'Economic reviews']
                },
                {
                    'name': 'Synonyms',
                    'desc': 'Identifying words with similar contexts.',
                    'subs': ['High frequency vocabulary', 'Contextual meanings']
                }
            ]
        }

        topic_objs = {}
        sub_objs = {}
        for cat_name, t_list in topics_data.items():
            cat = cats[cat_name]
            for idx, t_info in enumerate(t_list, start=1):
                topic, created = AptitudeTopic.objects.get_or_create(
                    category=cat,
                    name=t_info['name'],
                    defaults={'description': t_info['desc'], 'slug': slugify(t_info['name']), 'order': idx}
                )
                topic_objs[topic.name] = topic
                if created:
                    self.stdout.write(f"  Added Topic: {topic.name}")

                for sub_name in t_info['subs']:
                    sub, _ = AptitudeSubTopic.objects.get_or_create(
                        topic=topic,
                        name=sub_name,
                        defaults={'slug': slugify(sub_name)}
                    )
                    sub_objs[f"{topic.name} - {sub_name}"] = sub

        # 3. Create Questions
        self.stdout.write("Inserting placement questions...")
        
        # Percentages Qs
        q1 = AptitudeQuestion.objects.create(
            topic=topic_objs['Percentages'],
            sub_topic=sub_objs['Percentages - Percentage basics'],
            trainer=trainers['Dr. Rajesh Sharma'],
            title='Salary Increase Calculation',
            statement='A employee\'s salary is increased by 20% and then subsequently decreased by 20%. What is the net change in his salary?',
            difficulty='easy',
            question_type='single_mcq',
            options=[
                {"key": "A", "text": "No change"},
                {"key": "B", "text": "4% increase"},
                {"key": "C", "text": "4% decrease"},
                {"key": "D", "text": "2% decrease"}
            ],
            correct_answer=["C"],
            explanation='Let initial salary be 100. After 20% increase, salary = 120. Decreasing this by 20% = 120 - (20% of 120) = 120 - 24 = 96. Net change = (96 - 100) = -4%. Net change is 4% decrease.',
            shortcut_trick='Formula for successive percentage changes is: a + b + (ab/100). Here, a = +20, b = -20. Net change = 20 - 20 + ((20 * -20)/100) = -400/100 = -4% (4% decrease).',
            hint='Assume initial salary to be 100 and apply calculations sequentially.',
            marks=1.0,
            negative_marks=0.25,
            time_limit=60,
            company_tags=['TCS', 'Infosys', 'Wipro'],
            source='TCS NQT 2024'
        )

        q2 = AptitudeQuestion.objects.create(
            topic=topic_objs['Percentages'],
            sub_topic=sub_objs['Percentages - Profit margins'],
            trainer=trainers['Dr. Rajesh Sharma'],
            title='Multiple Correct MCQ Example',
            statement='Which of the following fraction to percentage conversions are correct?',
            difficulty='medium',
            question_type='multiple_mcq',
            options=[
                {"key": "A", "text": "1/4 is 25%"},
                {"key": "B", "text": "1/8 is 12.5%"},
                {"key": "C", "text": "1/3 is 33.33%"},
                {"key": "D", "text": "1/5 is 25%"}
            ],
            correct_answer=["A", "B", "C"],
            explanation='1/4 * 100 = 25%. 1/8 * 100 = 12.5%. 1/3 * 100 = 33.33%. 1/5 * 100 = 20% (so option D is incorrect).',
            shortcut_trick='Standard fraction values lookup.',
            marks=2.0,
            negative_marks=0.5,
            time_limit=90,
            company_tags=['Deloitte', 'Cognizant']
        )

        # Profit & Loss
        q3 = AptitudeQuestion.objects.create(
            topic=topic_objs['Profit & Loss'],
            sub_topic=sub_objs['Profit & Loss - Basic Profit/Loss'],
            trainer=trainers['Dr. Rajesh Sharma'],
            title='Cost Price Profit Calculation',
            statement='A vendor sells an item for $180, incurring a loss of 10%. At what price should he sell it to gain 10%?',
            difficulty='medium',
            question_type='numerical',
            options=[],
            correct_answer=["220"],
            explanation='Loss is 10%, meaning Selling Price = 90% of Cost Price. 0.90 * CP = 180 => CP = 180/0.9 = 200. To gain 10%, selling price should be 110% of CP => 1.10 * 200 = 220.',
            shortcut_trick='Formula: SP2 = SP1 * (100 + Gain%) / (100 - Loss%) => SP2 = 180 * (110 / 90) = 180 * 1.222 = 220.',
            marks=1.5,
            negative_marks=0.0,
            time_limit=75,
            company_tags=['Accenture', 'Cognizant']
        )

        # Blood Relations
        q4 = AptitudeQuestion.objects.create(
            topic=topic_objs['Blood Relations'],
            sub_topic=sub_objs['Blood Relations - Family tree diagrams'],
            trainer=trainers['Ananya Sen'],
            title='Uncle-Aunt Relation Decode',
            statement='Pointing to a photograph, a man says, "I have no brother or sister but that man\'s father is my father\'s son." Whose photograph is it?',
            difficulty='easy',
            question_type='single_mcq',
            options=[
                {"key": "A", "text": "His nephew\'s"},
                {"key": "B", "text": "His father\'s"},
                {"key": "C", "text": "His son\'s"},
                {"key": "D", "text": "His own"}
            ],
            correct_answer=["C"],
            explanation='The man says "I have no brother or sister". Therefore, "my father\'s son" is the man himself. Consequently, "that man\'s father is my father\'s son" translates to "that man\'s father is myself". So, the photograph is of the speaker\'s son.',
            shortcut_trick='Break statements from backward: my father\'s son => myself (since no siblings). That man\'s father is myself => It is my son.',
            marks=1.0,
            negative_marks=0.25,
            time_limit=60,
            company_tags=['Capgemini', 'Wipro']
        )

        # Syllogisms True / False
        q5 = AptitudeQuestion.objects.create(
            topic=topic_objs['Syllogisms'],
            sub_topic=sub_objs['Syllogisms - Two statements'],
            trainer=trainers['Ananya Sen'],
            title='Logical syllogism deduction validation',
            statement='Statement: All dogs are cats. All cats are black.\nConclusion: All dogs are black.\nIs this logical conclusion valid?',
            difficulty='easy',
            question_type='true_false',
            options=[],
            correct_answer=["True"],
            explanation='Since all dogs are cats, and all cats are black, it follows transitively that all dogs are black.',
            marks=1.0,
            negative_marks=0.0,
            time_limit=45,
            company_tags=['Infosys', 'TCS']
        )

        # Reading Comprehension (Comprehension Passage questions)
        q_parent = AptitudeQuestion.objects.create(
            topic=topic_objs['Reading Comprehension'],
            sub_topic=sub_objs['Reading Comprehension - Short passages'],
            trainer=trainers['Vikram Malhotra'],
            title='Technology Evolution Comprehension',
            statement='<p>Artificial intelligence (AI) has progressed from simple chess-playing algorithms to complex deep learning models capable of synthesizing human speech, analyzing MRI scans, and coding software. However, this explosive growth has triggered concern regarding regulatory guardrails. Proponents argue that premature regulation might stifle startup innovation, while critics emphasize that unfettered growth could compromise cybersecurity, privacy, and systemic job markets.</p>',
            difficulty='hard',
            question_type='reading_comprehension',
            options=[],
            correct_answer=[],
            explanation='',
            marks=0.0,
            time_limit=0
        )

        # Sub-question 1 under Passage
        AptitudeQuestion.objects.create(
            topic=topic_objs['Reading Comprehension'],
            sub_topic=sub_objs['Reading Comprehension - Short passages'],
            trainer=trainers['Vikram Malhotra'],
            parent=q_parent,
            title='Core concern raised in passage',
            statement='According to the passage, what is the primary source of concern regarding artificial intelligence?',
            difficulty='medium',
            question_type='single_mcq',
            options=[
                {"key": "A", "text": "The lack of interest among startup investors."},
                {"key": "B", "text": "The threat of AI taking over search engines."},
                {"key": "C", "text": "The lack of regulatory guardrails for explosive growth."},
                {"key": "D", "text": "The limitations of chess-playing algorithms."}
            ],
            correct_answer=["C"],
            explanation='The passage states: "this explosive growth has triggered concern regarding regulatory guardrails."',
            marks=1.5,
            negative_marks=0.25,
            time_limit=60
        )

        # Sub-question 2 under Passage
        AptitudeQuestion.objects.create(
            topic=topic_objs['Reading Comprehension'],
            sub_topic=sub_objs['Reading Comprehension - Short passages'],
            trainer=trainers['Vikram Malhotra'],
            parent=q_parent,
            title='Proponents argument',
            statement='What argument do proponents of unfettered AI development raise?',
            difficulty='medium',
            question_type='single_mcq',
            options=[
                {"key": "A", "text": "Regulation could compromise systemic job markets."},
                {"key": "B", "text": "Premature regulation might stifle startup innovation."},
                {"key": "C", "text": "AI will solve cybersecurity risks automatically."},
                {"key": "D", "text": "Job growth will increase tenfold."}
            ],
            correct_answer=["B"],
            explanation='The passage states: "Proponents argue that premature regulation might stifle startup innovation..."',
            marks=1.5,
            negative_marks=0.25,
            time_limit=60
        )

        # 4. Create standard mock test using seeded questions
        self.stdout.write("Configuring default Mock Tests...")
        m_test = AptitudeTest.objects.create(
            title='TCS NQT National Mock Exam #1',
            description='Simulates standard TCS NQT Aptitude papers. Cover Percentages, Puzzles, and Verbal Comprehension.',
            test_type='mock',
            overall_duration=20,
            section_timer=False,
            pass_percentage=50.0,
            negative_marking=True,
            calculator_enabled=True,
            company_tags=['TCS']
        )
        
        # Add sections
        sec1 = AptitudeTestSection.objects.create(test=m_test, name='Quantitative Section', duration=10, order=1)
        sec2 = AptitudeTestSection.objects.create(test=m_test, name='Logical & Verbal Section', duration=10, order=2)
        
        # Map questions
        AptitudeTestQuestion.objects.create(test=m_test, section=sec1, question=q1, order=1)
        AptitudeTestQuestion.objects.create(test=m_test, section=sec1, question=q2, order=2)
        AptitudeTestQuestion.objects.create(test=m_test, section=sec1, question=q3, order=3)
        AptitudeTestQuestion.objects.create(test=m_test, section=sec2, question=q4, order=4)
        AptitudeTestQuestion.objects.create(test=m_test, section=sec2, question=q5, order=5)
        
        # Create standard gamification profile for students if any
        for user in User.objects.filter(profile__role='student'):
            GamificationProfile.objects.get_or_create(
                user=user,
                defaults={'xp': 150, 'coins': 30, 'level': 1, 'daily_streak': 3}
            )

        self.stdout.write("Placement Aptitude Module seeded successfully.")

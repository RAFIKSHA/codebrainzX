import json
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from api.models import Topic, QuestionLevel, Question, TestCase
from update_programming_basics import all_configs


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

        # Update each question with function-based starter/driver code without solution
        updated = 0
        for order_num, (py_st, py_dr, py_sol, c_st, cpp_st, java_st) in all_configs.items():
            q = Question.objects.filter(topic=topic, order=order_num).first()
            if q:
                starter_dict = {
                    "python": py_st,
                    "c": c_st,
                    "cpp": cpp_st,
                    "java": java_st
                }
                driver_dict = {
                    "python": py_dr,
                    "c": "int main() {\n    // protected driver\n    return 0;\n}",
                    "cpp": "int main() {\n    // protected driver\n    return 0;\n}",
                    "java": "public static void main(String[] args) {\n    // protected driver\n}"
                }
                q.starter_code = json.dumps(starter_dict)
                q.driver_code = json.dumps(driver_dict)
                q.official_solution = py_sol
                q.save()
                updated += 1
                self.stdout.write(f"  + Updated Q{order_num}: {q.title}")

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated}/20 Programming Basics questions!'))

import csv
import io
import json
from django.db import transaction
from django.utils.text import slugify
from .models import AptitudeCategory, AptitudeTopic, AptitudeSubTopic, AptitudeQuestion

def import_aptitude_questions_from_csv(file_data):
    """
    Parses a CSV file and inserts questions.
    Supports CSV columns (case-insensitive headers):
    - Category
    - Topic
    - Sub Topic (optional)
    - Difficulty (easy, medium, hard)
    - Question Title
    - Statement (Rich text/LaTeX support)
    - Option A
    - Option B
    - Option C
    - Option D
    - Correct Answer (e.g. A, B, C, D, or multiple like A,B, or numerical/text values)
    - Detailed Explanation
    - Shortcut Trick
    - Hint
    - Marks
    - Negative Marks
    - Time Limit (seconds)
    - Company Tags (comma-separated list, e.g. "TCS,Infosys")
    - University Tags (comma-separated list, e.g. "Deloitte")
    - Question Source
    - Status (active/archived)
    - Visibility (public/private)
    """
    if isinstance(file_data, bytes):
        file_data = file_data.decode('utf-8-sig') # Handle BOMs if uploaded from Excel
    
    f = io.StringIO(file_data)
    reader = csv.DictReader(f)
    
    # Standardize column headers to lowercase with no spaces or underscores
    headers_mapping = {}
    for h in reader.fieldnames or []:
        normalized = h.strip().lower().replace(' ', '').replace('_', '')
        headers_mapping[normalized] = h
        
    created_count = 0
    errors = []
    
    def get_field_val(row, *aliases):
        for alias in aliases:
            norm_alias = alias.strip().lower().replace(' ', '').replace('_', '')
            if norm_alias in headers_mapping:
                return row[headers_mapping[norm_alias]].strip()
        return ""

    with transaction.atomic():
        for index, row in enumerate(reader, start=1):
            try:
                # Require category, topic, title, statement, correct answer
                cat_name = get_field_val(row, 'category')
                topic_name = get_field_val(row, 'topic')
                sub_topic_name = get_field_val(row, 'subtopic', 'sub_topic')
                difficulty = get_field_val(row, 'difficulty').lower() or 'medium'
                title = get_field_val(row, 'questiontitle', 'title')
                statement = get_field_val(row, 'statement', 'question', 'questiontext')
                correct_answer_str = get_field_val(row, 'correctanswer', 'answer')
                
                if not cat_name or not topic_name or not title or not statement:
                    errors.append(f"Row {index}: Missing category, topic, title, or statement.")
                    continue
                
                # Fetch/Create structures
                category, _ = AptitudeCategory.objects.get_or_create(
                    name=cat_name,
                    defaults={'slug': slugify(cat_name)}
                )
                topic, _ = AptitudeTopic.objects.get_or_create(
                    category=category,
                    name=topic_name,
                    defaults={'slug': slugify(topic_name)}
                )
                
                sub_topic = None
                if sub_topic_name:
                    sub_topic, _ = AptitudeSubTopic.objects.get_or_create(
                        topic=topic,
                        name=sub_topic_name,
                        defaults={'slug': slugify(sub_topic_name)}
                    )
                
                # Extract options
                option_a = get_field_val(row, 'optiona', 'a')
                option_b = get_field_val(row, 'optionb', 'b')
                option_c = get_field_val(row, 'optionc', 'c')
                option_d = get_field_val(row, 'optiond', 'd')
                
                options_list = []
                if option_a: options_list.append({"key": "A", "text": option_a})
                if option_b: options_list.append({"key": "B", "text": option_b})
                if option_c: options_list.append({"key": "C", "text": option_c})
                if option_d: options_list.append({"key": "D", "text": option_d})
                
                # Setup correct answer format based on question type
                # Simple heuristic: if option key list exists, correct answer must match keys, else numerical or text
                # We can store correct answer as list, e.g. ["A"] or ["A", "B"]
                correct_ans = []
                if ',' in correct_answer_str:
                    correct_ans = [ans.strip().upper() for ans in correct_answer_str.split(',') if ans.strip()]
                else:
                    correct_ans = [correct_answer_str.strip()]
                
                # Formulate type
                q_type = 'single_mcq'
                if len(correct_ans) > 1:
                    q_type = 'multiple_mcq'
                elif correct_answer_str.strip().lower() in ['true', 'false']:
                    q_type = 'true_false'
                    correct_ans = [correct_answer_str.strip().capitalize()]
                elif not option_a and not option_b:
                    q_type = 'numerical'
                
                # Extract rest of fields
                explanation = get_field_val(row, 'detailedexplanation', 'explanation')
                shortcut_trick = get_field_val(row, 'shortcuttrick', 'shortcut')
                hint = get_field_val(row, 'hint')
                
                try:
                    marks = float(get_field_val(row, 'marks') or 1.0)
                except ValueError:
                    marks = 1.0
                    
                try:
                    neg_marks = float(get_field_val(row, 'negativemarks', 'negative_marks') or 0.0)
                except ValueError:
                    neg_marks = 0.0
                    
                try:
                    time_limit = int(get_field_val(row, 'timelimit', 'time_limit') or 60)
                except ValueError:
                    time_limit = 60
                
                company_str = get_field_val(row, 'companytags', 'companies')
                university_str = get_field_val(row, 'universitytags', 'universities')
                
                company_tags = [c.strip() for c in company_str.split(',') if c.strip()] if company_str else []
                university_tags = [u.strip() for u in university_str.split(',') if u.strip()] if university_str else []
                
                source = get_field_val(row, 'questionsource', 'source')
                status_val = get_field_val(row, 'status').lower() or 'active'
                visibility_val = get_field_val(row, 'visibility').lower() or 'public'
                
                # Create question
                AptitudeQuestion.objects.create(
                    topic=topic,
                    sub_topic=sub_topic,
                    title=title,
                    statement=statement,
                    difficulty=difficulty if difficulty in ['easy', 'medium', 'hard'] else 'medium',
                    question_type=q_type,
                    options=options_list,
                    correct_answer=correct_ans,
                    explanation=explanation,
                    shortcut_trick=shortcut_trick,
                    hint=hint,
                    marks=marks,
                    negative_marks=neg_marks,
                    time_limit=time_limit,
                    company_tags=company_tags,
                    university_tags=university_tags,
                    source=source,
                    status=status_val if status_val in ['active', 'archived'] else 'active',
                    visibility=visibility_val if visibility_val in ['public', 'private'] else 'public'
                )
                created_count += 1
            except Exception as e:
                errors.append(f"Row {index}: Error: {str(e)}")
                
    return {
        "success": len(errors) == 0,
        "created_count": created_count,
        "errors": errors
    }

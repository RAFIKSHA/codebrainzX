from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class TutorialLanguage(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
        ('archived', 'Archived'),
    )
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    icon = models.CharField(max_length=100, blank=True, help_text="Lucide icon name or emoji")
    banner = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    estimated_duration = models.CharField(max_length=100, default='10 hours', help_text="e.g. 10 hours")
    display_order = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class TutorialChapter(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
        ('archived', 'Archived'),
    )
    language = models.ForeignKey(TutorialLanguage, on_delete=models.CASCADE, related_name='chapters')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'id']
        unique_together = ('language', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.language.name} - {self.name}"


class TutorialLesson(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
        ('archived', 'Archived'),
    )
    language = models.ForeignKey(TutorialLanguage, on_delete=models.CASCADE, related_name='lessons')
    chapter = models.ForeignKey(TutorialChapter, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    content = models.TextField(blank=True, help_text="Lesson content in Markdown or HTML")
    code_example = models.TextField(blank=True, help_text="Interactive code runner code")
    code_output = models.TextField(blank=True, help_text="Expected code runner output")
    code_explanation = models.TextField(blank=True, help_text="Explanation of the code")
    estimated_reading_time = models.IntegerField(default=5, help_text="In minutes")
    display_order = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    publish_date = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'id']
        unique_together = ('language', 'slug')

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.language.name} - {self.chapter.name} - {self.title}"


class TutorialLessonBlock(models.Model):
    lesson = models.ForeignKey(TutorialLesson, on_delete=models.CASCADE, related_name='blocks')
    block_type = models.CharField(max_length=50, help_text="paragraph, heading, code, note, tip, warning, table, image, video, summary")
    content = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)
    data = models.JSONField(default=dict, blank=True, help_text="Stores image URL, language for code, table columns etc.")

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"{self.lesson.title} Block {self.display_order} ({self.block_type})"


class TutorialQuiz(models.Model):
    lesson = models.ForeignKey(TutorialLesson, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255, default="Lesson Quiz")
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Quiz for {self.lesson.title}"


class TutorialQuizQuestion(models.Model):
    quiz = models.ForeignKey(TutorialQuiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=500)
    option_b = models.CharField(max_length=500)
    option_c = models.CharField(max_length=500)
    option_d = models.CharField(max_length=500)
    correct_option = models.CharField(max_length=1, choices=(('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')))
    explanation = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Quiz Question: {self.question_text[:50]}"


class TutorialPracticeQuestion(models.Model):
    TYPE_CHOICES = (
        ('mcq', 'Multiple Choice'),
        ('fill_in_the_blank', 'Fill in the Blank'),
        ('output_prediction', 'Output Prediction'),
        ('coding', 'Coding Challenge'),
    )
    lesson = models.ForeignKey(TutorialLesson, on_delete=models.CASCADE, related_name='practices')
    question_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True, help_text="Code snippet shown above the question")
    options = models.JSONField(default=list, blank=True, help_text="List of choices (for MCQ/fill blanks)")
    correct_answer = models.TextField(help_text="Expected string answer, option letter, or blank fills")
    explanation = models.TextField(blank=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Practice Question ({self.question_type}): {self.question_text[:50]}"


class TutorialLessonResource(models.Model):
    lesson = models.ForeignKey(TutorialLesson, on_delete=models.CASCADE, related_name='resources')
    name = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=50, default='link', help_text="link, pdf, zip")
    url = models.TextField()
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return self.name


class TutorialMedia(models.Model):
    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='tutorials/media/')
    media_type = models.CharField(max_length=50, default='image', help_text="image, video")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or self.file.name


class TutorialLessonAnalytics(models.Model):
    lesson = models.OneToOneField(TutorialLesson, on_delete=models.CASCADE, related_name='analytics')
    views_count = models.IntegerField(default=0)
    total_reading_time = models.IntegerField(default=0, help_text="in seconds")
    average_reading_time = models.FloatField(default=0.0, help_text="in seconds")

    def __str__(self):
        return f"Analytics for {self.lesson.title}"

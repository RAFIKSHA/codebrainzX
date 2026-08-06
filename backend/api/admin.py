from django.contrib import admin
from django.core.mail import send_mail
from django.conf import settings
from .models import Hackathon, Team, Application, Payment, Certificate, EmailLog, HackathonNotification, HackathonSetting
from .models_tutorials import (
    TutorialLanguage, TutorialChapter, TutorialLesson, TutorialLessonBlock,
    TutorialQuiz, TutorialQuizQuestion, TutorialPracticeQuestion,
    TutorialLessonResource, TutorialMedia, TutorialLessonAnalytics
)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'utr_number', 'team', 'amount', 'status', 'invoice_number', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('payment_id', 'utr_number', 'team__name', 'invoice_number')
    actions = ['approve_payments', 'fail_payments']

    @admin.action(description="Approve selected payments & activate team registration")
    def approve_payments(self, request, queryset):
        approved_count = 0
        for payment in queryset:
            if payment.status != 'success':
                payment.status = 'success'
                payment.save()
                
                # Approve Team Application
                team = payment.team
                if hasattr(team, 'application'):
                    team.application.status = 'approved'
                    team.application.save()
                
                # Send confirmation email
                recipients = [team.leader_email] + [m.email for m in team.members.all()]
                subject = f"Registration & Payment Confirmation - {team.hackathon.title}"
                body = (
                    f"Dear Participant,\n\n"
                    f"We are excited to confirm that your payment and registration for '{team.hackathon.title}' has been verified and approved!\n\n"
                    f"Team Details:\n"
                    f"- Team Name: {team.name}\n"
                    f"- Registration ID: {team.registration_number}\n"
                    f"- Payment ID: {payment.payment_id}\n"
                    f"- Amount Paid: ₹{payment.amount}\n\n"
                    f"Event Details:\n"
                    f"- Mode: {team.hackathon.get_mode_display()}\n"
                    f"- Venue: {team.hackathon.venue or 'Virtual Link'}\n"
                    f"- Start Date: {team.hackathon.start_date.strftime('%B %d, %Y %I:%M %p')}\n\n"
                    f"Looking forward to coding with you!\n"
                    f"Best regards,\nOrganizing Committee"
                )
                try:
                    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@codexpetra.com', recipients, fail_silently=True)
                    for email in recipients:
                        EmailLog.objects.create(hackathon=team.hackathon, recipient_email=email, subject=subject, body=body, status='sent')
                except Exception:
                    for email in recipients:
                        EmailLog.objects.create(hackathon=team.hackathon, recipient_email=email, subject=subject, body=body, status='failed')
                
                # Create notification
                from django.contrib.auth.models import User
                leader_user_obj = User.objects.filter(email=team.leader_email).first()
                if leader_user_obj:
                    HackathonNotification.objects.create(
                        user=leader_user_obj,
                        title="Payment Approved!",
                        message=f"Your payment of ₹{payment.amount} has been verified. Team registration is now active.",
                        type="payment_success"
                    )
                approved_count += 1
        self.message_user(request, f"Successfully approved {approved_count} payments.")

    @admin.action(description="Mark selected payments as failed")
    def fail_payments(self, request, queryset):
        updated = queryset.update(status='failed')
        self.message_user(request, f"Successfully marked {updated} payments as failed.")

admin.site.register(Hackathon)
admin.site.register(Team)
admin.site.register(Application)
admin.site.register(Certificate)
admin.site.register(EmailLog)
admin.site.register(HackathonNotification)
admin.site.register(HackathonSetting)

admin.site.register(TutorialLanguage)
admin.site.register(TutorialChapter)
admin.site.register(TutorialLesson)
admin.site.register(TutorialLessonBlock)
admin.site.register(TutorialQuiz)
admin.site.register(TutorialQuizQuestion)
admin.site.register(TutorialPracticeQuestion)
admin.site.register(TutorialLessonResource)
admin.site.register(TutorialMedia)
admin.site.register(TutorialLessonAnalytics)


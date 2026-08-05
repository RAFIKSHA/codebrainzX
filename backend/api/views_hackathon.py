import os
import csv
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth, TruncDay
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.files.storage import default_storage
from django.conf import settings
from django.http import HttpResponse

from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Hackathon, Team, TeamMember, Application,
    Payment, Certificate, EmailLog, HackathonNotification, HackathonSetting,
    ProblemStatement, ProblemApplication
)
from .serializers_hackathon import (
    HackathonSerializer, TeamSerializer, TeamMemberSerializer,
    ApplicationSerializer, PaymentSerializer, CertificateSerializer,
    EmailLogSerializer, HackathonNotificationSerializer, HackathonSettingSerializer,
    ProblemStatementSerializer, ProblemApplicationSerializer
)

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'


class FileUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)
        
        # Save file to media storage
        path = default_storage.save(f'hackathons/{file_obj.name}', file_obj)
        # Build URL
        media_url = getattr(settings, 'MEDIA_URL', '/media/')
        url = request.build_absolute_uri(media_url + path)
        return Response({'url': url, 'name': file_obj.name})


class HackathonViewSet(viewsets.ModelViewSet):
    queryset = Hackathon.objects.all().order_by('-created_at')
    serializer_class = HackathonSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        # If admin, show all. If normal user or unauthenticated, show only published/closed/completed
        if user.is_authenticated and hasattr(user, 'profile') and user.profile.role == 'admin':
            return Hackathon.objects.all().order_by('-created_at')
        return Hackathon.objects.filter(status__in=['published', 'closed', 'completed']).order_by('-created_at')

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def details_by_slug(self, request, pk=None):
        try:
            hackathon = Hackathon.objects.get(slug=pk)
            serializer = self.get_serializer(hackathon)
            return Response(serializer.data)
        except Hackathon.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all().order_by('-created_at')
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Team.objects.all().order_by('-created_at')
        
        # Student sees teams they are leader of or member in
        return Team.objects.filter(
            Q(leader_email=user.email) | Q(members__email=user.email)
        ).distinct().order_by('-created_at')

    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        user = request.user
        teams = Team.objects.filter(
            Q(leader_email=user.email) | Q(members__email=user.email)
        ).distinct()
        serializer = self.get_serializer(teams, many=True)
        return Response(serializer.data)


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by('-created_at')
    serializer_class = ApplicationSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        app = self.get_object()
        app.status = 'approved'
        app.save()

        # Generate Notification for Team Leader if matching user exists
        leader_user = User.objects.filter(email=app.team.leader_email).first()
        if leader_user:
            HackathonNotification.objects.create(
                user=leader_user,
                title="Application Approved!",
                message=f"Your team application '{app.team.name}' for {app.hackathon.title} has been approved.",
                type="application_approved"
            )

        # Log confirmation Email to leader and all team members
        recipients = [app.team.leader_email] + [m.email for m in app.team.members.all()]
        for email in recipients:
            subject = f"Application Approved - {app.hackathon.title}"
            body = (
                f"Hello,\n\nYour application for {app.hackathon.title} under the team name '{app.team.name}' "
                f"has been APPROVED by the administrator.\n\nRegistration Number: {app.team.registration_number}\n"
                f"Venue: {app.hackathon.venue}\nEvent Date: {app.hackathon.start_date.strftime('%d %B %Y %I:%M %p')}\n\n"
                f"Prepare your presentations. Carry your college ID.\n\nBest of Luck!\nOrganizing Team"
            )
            # Simulated Email Blaster logs
            try:
                send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@codebrainzx.edu', [email], fail_silently=True)
                EmailLog.objects.create(hackathon=app.hackathon, recipient_email=email, subject=subject, body=body, status='sent')
            except Exception:
                EmailLog.objects.create(hackathon=app.hackathon, recipient_email=email, subject=subject, body=body, status='failed')

        return Response({"status": "Application approved and emails dispatched."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        app = self.get_object()
        app.status = 'rejected'
        app.save()

        # Reject associated pending payments
        Payment.objects.filter(team=app.team, status='pending').update(status='failed')

        leader_user = User.objects.filter(email=app.team.leader_email).first()
        if leader_user:
            HackathonNotification.objects.create(
                user=leader_user,
                title="Application Rejected",
                message="payment utr wrong hai fake transaction detected",
                type="application_rejected"
            )

        # Email Notification
        recipients = [app.team.leader_email] + [m.email for m in app.team.members.all()]
        for email in recipients:
            subject = f"Application Rejected - {app.hackathon.title}"
            body = (
                f"Hello,\n\n"
                f"We regret to inform you that your application for {app.hackathon.title} under the team name '{app.team.name}' "
                f"has been rejected by the administrator.\n\n"
                f"Reason: payment utr wrong hai fake transaction detected\n\n"
                f"You can log back into the portal to resubmit your registration with valid payment details.\n\n"
                f"Best regards,\nOrganizing Team"
            )
            try:
                send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@codebrainzx.edu', [email], fail_silently=True)
                EmailLog.objects.create(hackathon=app.hackathon, recipient_email=email, subject=subject, body=body, status='sent')
            except Exception:
                EmailLog.objects.create(hackathon=app.hackathon, recipient_email=email, subject=subject, body=body, status='failed')

        return Response({"status": "Application rejected."})

    @action(detail=True, methods=['post'])
    def waitlist(self, request, pk=None):
        app = self.get_object()
        app.status = 'waitlisted'
        app.save()

        leader_user = User.objects.filter(email=app.team.leader_email).first()
        if leader_user:
            HackathonNotification.objects.create(
                user=leader_user,
                title="Application Waitlisted",
                message=f"Your team application '{app.team.name}' for {app.hackathon.title} is placed on the waitlist.",
                type="application_waitlisted"
            )

        return Response({"status": "Application waitlisted."})

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        hackathon_id = request.query_params.get('hackathon_id')
        if not hackathon_id:
            return Response({"error": "hackathon_id query parameter is required"}, status=400)
        
        apps = Application.objects.filter(hackathon_id=hackathon_id)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="applications_hackathon_{hackathon_id}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Application ID', 'Team Name', 'College', 'Department', 'Year', 'Leader Name', 'Leader Email', 'Leader Phone', 'Status', 'Registration Date'])
        
        for app in apps:
            writer.writerow([
                app.id,
                app.team.name,
                app.team.college,
                app.team.department,
                app.team.year,
                app.team.leader_name,
                app.team.leader_email,
                app.team.leader_mobile,
                app.status,
                app.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
            
        return response


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(team__leader_email=user.email).order_by('-created_at')

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def upi_config(self, request):
        from django.conf import settings
        return Response({
            "upi_id": getattr(settings, 'MERCHANT_UPI_ID', 'upi-id@bank'),
            "merchant_name": getattr(settings, 'MERCHANT_UPI_NAME', 'CodeBrainzx')
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        payment = self.get_object()
        if payment.status != 'pending':
            return Response({"error": "Payment is not in pending status."}, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'success'
        payment.save()
        
        # Approve team application if it exists
        team = payment.team
        if hasattr(team, 'application'):
            team.application.status = 'approved'
            team.application.save()
            
            # Send confirmation emails
            recipients = [team.leader_email] + [m.email for m in team.members.all()]
            subject = f"Registration & Payment Confirmation - {team.hackathon.title}"
            for email in recipients:
                body = (
                    f"Dear Participant,\n\n"
                    f"We are excited to confirm that your registration for '{team.hackathon.title}' is successful!\n\n"
                    f"Team Details:\n"
                    f"- Team Name: {team.name}\n"
                    f"- Registration ID: {team.registration_number}\n"
                    f"- Payment ID: {payment.payment_id}\n"
                    f"- Invoice Number: {payment.invoice_number}\n"
                    f"- Amount Paid: ₹{payment.amount}\n\n"
                    f"Event Details:\n"
                    f"- Mode: {team.hackathon.get_mode_display()}\n"
                    f"- Venue: {team.hackathon.venue or 'Virtual Link'}\n"
                    f"- Start Date: {team.hackathon.start_date.strftime('%B %d, %Y %I:%M %p')}\n\n"
                    f"Rules Overview:\n{team.hackathon.rules or 'Standard Hackathon rules apply.'}\n\n"
                    f"Looking forward to coding with you!\n"
                    f"Best regards,\nOrganizing Committee"
                )
                try:
                    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@codebrainzx.edu', [email], fail_silently=True)
                    EmailLog.objects.create(hackathon=team.hackathon, recipient_email=email, subject=subject, body=body, status='sent')
                except Exception:
                    EmailLog.objects.create(hackathon=team.hackathon, recipient_email=email, subject=subject, body=body, status='failed')

            # Generate in-app notifications
            leader_user = User.objects.filter(email=team.leader_email).first()
            if leader_user:
                HackathonNotification.objects.create(
                    user=leader_user,
                    title="Payment Verified & Approved!",
                    message=f"Payment of ₹{payment.amount} has been verified by the administrator. Registration number: {team.registration_number}.",
                    type="payment_success"
                )
                
        return Response({"status": "Payment verified and application approved."})

    @action(detail=False, methods=['post'])
    def process_payment(self, request):
        team_id = request.data.get('team_id')
        payment_method = request.data.get('payment_method', 'card')
        card_number = request.data.get('card_number')
        upi_id = request.data.get('upi_id')
        utr_number = request.data.get('utr_number')

        try:
            team = Team.objects.get(id=team_id)
        except Team.DoesNotExist:
            return Response({"error": "Team not found."}, status=404)

        # Check if successful payment already exists
        if Payment.objects.filter(team=team, status='success').exists():
            return Response({"error": "Duplicate Payment: Payment has already been successfully processed for this team."}, status=400)

        # Calculate Fees
        fee = team.hackathon.registration_fee

        if payment_method == 'upi':
            if not utr_number:
                return Response({"error": "UTR Number is required for UPI payment verification."}, status=400)
            
            utr_number = utr_number.strip()
            if not (utr_number.isdigit() and len(utr_number) == 12):
                return Response({"error": "Invalid UTR Number. Must be exactly a 12-digit number."}, status=400)

            # Check if UTR is already submitted
            if Payment.objects.filter(utr_number=utr_number).exists():
                return Response({"error": "This UPI Transaction UTR Number has already been submitted."}, status=400)

            # Reset application status to pending if it was rejected or waitlisted
            if hasattr(team, 'application'):
                team.application.status = 'pending'
                team.application.save()

            # Save payment transaction in pending state
            payment = Payment.objects.create(
                team=team,
                amount=fee,
                payment_id=f"UTR-{utr_number}",
                utr_number=utr_number,
                status='pending'
            )

            return Response({
                "message": "UPI payment details submitted successfully. Registration approval is pending admin verification.",
                "payment_id": payment.payment_id,
                "invoice_number": payment.invoice_number,
                "registration_number": team.registration_number,
                "amount": payment.amount,
                "status": payment.status
            })

        # Simulate Card Payment verification/gateway delay and authorize
        import uuid
        payment_id = f"PAY-{uuid.uuid4().hex[:12].upper()}"
        
        # Save payment transaction
        payment = Payment.objects.create(
            team=team,
            amount=fee,
            payment_id=payment_id,
            status='success',
            receipt_url=f"https://codebrainzx-receipts.s3.amazonaws.com/{payment_id}.pdf"
        )

        # Automatically approve Team Application upon successful payment
        if hasattr(team, 'application'):
            team.application.status = 'approved'
            team.application.save()

        # Send confirmation email to all team members
        recipients = [team.leader_email] + [m.email for m in team.members.all()]
        subject = f"Registration & Payment Confirmation - {team.hackathon.title}"
        
        for email in recipients:
            body = (
                f"Dear Participant,\n\n"
                f"We are excited to confirm that your registration for '{team.hackathon.title}' is successful!\n\n"
                f"Team Details:\n"
                f"- Team Name: {team.name}\n"
                f"- Registration ID: {team.registration_number}\n"
                f"- Payment ID: {payment.payment_id}\n"
                f"- Invoice Number: {payment.invoice_number}\n"
                f"- Amount Paid: ₹{payment.amount}\n\n"
                f"Event Details:\n"
                f"- Mode: {team.hackathon.get_mode_display()}\n"
                f"- Venue: {team.hackathon.venue or 'Virtual Link'}\n"
                f"- Start Date: {team.hackathon.start_date.strftime('%B %d, %Y %I:%M %p')}\n\n"
                f"Rules Overview:\n{team.hackathon.rules or 'Standard Hackathon rules apply.'}\n\n"
                f"Looking forward to coding with you!\n"
                f"Best regards,\nOrganizing Committee"
            )
            try:
                send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@codebrainzx.edu', [email], fail_silently=True)
                EmailLog.objects.create(hackathon=team.hackathon, recipient_email=email, subject=subject, body=body, status='sent')
            except Exception:
                EmailLog.objects.create(hackathon=team.hackathon, recipient_email=email, subject=subject, body=body, status='failed')

        # Generate in-app notifications
        leader_user = User.objects.filter(email=team.leader_email).first()
        if leader_user:
            HackathonNotification.objects.create(
                user=leader_user,
                title="Payment Successful!",
                message=f"Payment of ₹{fee} was verified. Registration number: {team.registration_number}.",
                type="payment_success"
            )

        return Response({
            "message": "Payment verified successfully.",
            "payment_id": payment.payment_id,
            "invoice_number": payment.invoice_number,
            "registration_number": team.registration_number,
            "amount": payment.amount,
            "status": payment.status
        })


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all().order_by('-created_at')
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            return Certificate.objects.all().order_by('-created_at')
        return Certificate.objects.filter(recipient_email=user.email).order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def generate_certificates(self, request):
        hackathon_id = request.data.get('hackathon_id')
        cert_type = request.data.get('type')  # participation, winner, runner_up
        teams_list = request.data.get('teams', [])  # list of team IDs

        try:
            hackathon = Hackathon.objects.get(id=hackathon_id)
        except Hackathon.DoesNotExist:
            return Response({"error": "Hackathon not found."}, status=404)

        generated_count = 0

        # Generate certificates for teams
        teams = Team.objects.filter(hackathon=hackathon, id__in=teams_list) if teams_list else Team.objects.filter(hackathon=hackathon)

        for team in teams:
            # 1. Leader
            if not Certificate.objects.filter(hackathon=hackathon, recipient_email=team.leader_email, type=cert_type).exists():
                cert = Certificate.objects.create(
                    hackathon=hackathon,
                    team=team,
                    recipient_name=team.leader_name,
                    recipient_email=team.leader_email,
                    type=cert_type,
                )
                # Store local download URL using certificate_id
                cert.file_url = request.build_absolute_uri(f'/api/hackathon-certificates/{cert.certificate_id}/download/')
                cert.save()
                generated_count += 1

                # Notification
                user = User.objects.filter(email=team.leader_email).first()
                if user:
                    HackathonNotification.objects.create(
                        user=user,
                        title="Certificate Available!",
                        message=f"Your {cert_type.replace('_', ' ').title()} certificate for {hackathon.title} is now ready to download.",
                        type="certificate_available"
                    )

            # 2. Members
            for member in team.members.all():
                if not Certificate.objects.filter(hackathon=hackathon, recipient_email=member.email, type=cert_type).exists():
                    cert = Certificate.objects.create(
                        hackathon=hackathon,
                        team=team,
                        recipient_name=member.name,
                        recipient_email=member.email,
                        type=cert_type,
                    )
                    cert.file_url = request.build_absolute_uri(f'/api/hackathon-certificates/{cert.certificate_id}/download/')
                    cert.save()
                    generated_count += 1

                    user = User.objects.filter(email=member.email).first()
                    if user:
                        HackathonNotification.objects.create(
                            user=user,
                            title="Certificate Available!",
                            message=f"Your {cert_type.replace('_', ' ').title()} certificate for {hackathon.title} is now ready to download.",
                            type="certificate_available"
                        )

        return Response({"status": f"Generated {generated_count} certificates."})

    @action(detail=False, methods=['get'], url_path='(?P<certificate_id>[^/.]+)/download',
            permission_classes=[permissions.IsAuthenticated])
    def download(self, request, certificate_id=None):
        """Generate and stream a PDF certificate on-the-fly."""
        try:
            cert = Certificate.objects.select_related('hackathon', 'team').get(certificate_id=certificate_id)
        except Certificate.DoesNotExist:
            return Response({"error": "Certificate not found."}, status=404)

        # Security: only allow owner or admin
        user = request.user
        is_admin = hasattr(user, 'profile') and user.profile.role == 'admin'
        if not is_admin and user.email != cert.recipient_email:
            return Response({"error": "Access denied."}, status=403)

        try:
            from reportlab.lib.pagesizes import A4, landscape
            from reportlab.lib import colors
            from reportlab.lib.units import cm, mm
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.enums import TA_CENTER
            import io

            buffer = io.BytesIO()
            width, height = landscape(A4)
            doc = SimpleDocTemplate(
                buffer,
                pagesize=landscape(A4),
                rightMargin=2*cm, leftMargin=2*cm,
                topMargin=2*cm, bottomMargin=2*cm,
            )

            styles = getSampleStyleSheet()

            # Define styles
            cert_type_label = {
                'winner': 'WINNER',
                'runner_up': 'RUNNER-UP',
                'participation': 'PARTICIPATION',
            }.get(cert.type, cert.type.upper())

            title_color = {
                'winner': colors.HexColor('#D4AF37'),
                'runner_up': colors.HexColor('#A8A9AD'),
                'participation': colors.HexColor('#1D4ED8'),
            }.get(cert.type, colors.HexColor('#1D4ED8'))

            heading_style = ParagraphStyle('heading', fontSize=11, textColor=colors.HexColor('#64748B'),
                                           alignment=TA_CENTER, spaceAfter=4, fontName='Helvetica')
            cert_type_style = ParagraphStyle('cert_type', fontSize=38, textColor=title_color,
                                             alignment=TA_CENTER, spaceAfter=8, fontName='Helvetica-Bold')
            name_style = ParagraphStyle('name', fontSize=28, textColor=colors.HexColor('#0F172A'),
                                        alignment=TA_CENTER, spaceAfter=6, fontName='Helvetica-Bold')
            body_style = ParagraphStyle('body', fontSize=13, textColor=colors.HexColor('#334155'),
                                        alignment=TA_CENTER, spaceAfter=8, fontName='Helvetica')
            hackathon_style = ParagraphStyle('hackathon', fontSize=16, textColor=colors.HexColor('#1D4ED8'),
                                             alignment=TA_CENTER, spaceAfter=4, fontName='Helvetica-Bold')
            cert_id_style = ParagraphStyle('cert_id', fontSize=9, textColor=colors.HexColor('#94A3B8'),
                                           alignment=TA_CENTER, fontName='Helvetica')
            date_style = ParagraphStyle('date', fontSize=11, textColor=colors.HexColor('#64748B'),
                                        alignment=TA_CENTER, fontName='Helvetica')

            # Build content
            content = []
            content.append(Spacer(1, 0.5*cm))
            content.append(Paragraph("CODEBRAINZX", heading_style))
            content.append(Paragraph("Certificate of Achievement", heading_style))
            content.append(Spacer(1, 0.6*cm))
            content.append(Paragraph(f"CERTIFICATE OF<br/>{cert_type_label}", cert_type_style))
            content.append(Spacer(1, 0.4*cm))
            content.append(Paragraph("This is to certify that", body_style))
            content.append(Paragraph(cert.recipient_name, name_style))
            content.append(Paragraph(f"Team: <b>{cert.team.name if cert.team else 'N/A'}</b>", body_style))

            if cert.type == 'winner':
                achievement = "has secured <b>1st Place</b> in"
            elif cert.type == 'runner_up':
                achievement = "has secured <b>2nd Place (Runner-Up)</b> in"
            else:
                achievement = "has successfully participated in"

            content.append(Paragraph(achievement, body_style))
            content.append(Paragraph(cert.hackathon.title, hackathon_style))
            content.append(Spacer(1, 0.3*cm))

            dates = ""
            if cert.hackathon.start_date:
                dates = f"{cert.hackathon.start_date.strftime('%B %d, %Y')}"
                if cert.hackathon.end_date:
                    dates += f" – {cert.hackathon.end_date.strftime('%B %d, %Y')}"
            if dates:
                content.append(Paragraph(dates, date_style))

            content.append(Spacer(1, 0.8*cm))
            content.append(Paragraph(f"Certificate ID: {cert.certificate_id}", cert_id_style))
            content.append(Paragraph(f"Issued: {cert.created_at.strftime('%B %d, %Y')}", cert_id_style))

            doc.build(content)
            buffer.seek(0)

            response = HttpResponse(buffer, content_type='application/pdf')
            safe_name = cert.recipient_name.replace(' ', '_')
            response['Content-Disposition'] = f'attachment; filename="Certificate_{safe_name}_{cert.certificate_id}.pdf"'
            return response

        except ImportError:
            return Response({"error": "PDF generation library (reportlab) is not installed on the server."}, status=500)


class EmailViewSet(viewsets.ModelViewSet):
    queryset = EmailLog.objects.all().order_by('-sent_at')
    serializer_class = EmailLogSerializer
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'])
    def send_broadcast_reminder(self, request):
        hackathon_id = request.data.get('hackathon_id')
        reminder_type = request.data.get('reminder_type')  # 7_days, 3_days, 1_day, morning
        custom_content = request.data.get('content', '')

        try:
            hackathon = Hackathon.objects.get(id=hackathon_id)
        except Hackathon.DoesNotExist:
            return Response({"error": "Hackathon not found."}, status=404)

        # Get all registered teams
        teams = Team.objects.filter(hackathon=hackathon)
        recipients = set()
        for t in teams:
            recipients.add(t.leader_email)
            for m in t.members.all():
                recipients.add(m.email)

        dispatch_count = 0
        subject = f"Reminder: {hackathon.title} - Upcoming Event"
        
        # Build reminder email body
        default_body = (
            f"Hello,\n\nThis is a friendly reminder for the upcoming event '{hackathon.title}'.\n"
            f"Event Date: {hackathon.start_date.strftime('%B %d, %Y %I:%M %p')}\n"
            f"Mode: {hackathon.get_mode_display()}\n"
            f"Venue: {hackathon.venue or 'Virtual'}\n\n"
            f"Presentation Date: {hackathon.presentation_date.strftime('%B %d, %Y') if hackathon.presentation_date else 'TBD'}\n\n"
            f"Important Guidelines:\n"
            f"- Ensure your projects are complete before presentation.\n"
            f"- Carry college ID (for offline venues).\n"
            f"- Adhere to presentation deadlines.\n"
            f"- Contact coordinator if you run into any issues.\n\n"
            f"Best regards,\nOrganizing Team"
        )
        body = custom_content if custom_content else default_body

        for email in recipients:
            try:
                send_mail(subject, body, settings.DEFAULT_FROM_EMAIL or 'noreply@codebrainzx.edu', [email], fail_silently=True)
                EmailLog.objects.create(hackathon=hackathon, recipient_email=email, subject=subject, body=body, status='sent')
                dispatch_count += 1
            except Exception:
                EmailLog.objects.create(hackathon=hackathon, recipient_email=email, subject=subject, body=body, status='failed')

        return Response({"status": f"Dispatched reminder emails to {dispatch_count} participants."})


class HackathonSettingViewSet(viewsets.ModelViewSet):
    queryset = HackathonSetting.objects.all()
    serializer_class = HackathonSettingSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    lookup_field = 'key'


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = HackathonNotification.objects.all().order_by('-created_at')
    serializer_class = HackathonNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HackathonNotification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "Notification marked as read"})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"status": "All notifications marked as read"})


class AnalyticsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Revenue metrics
        total_revenue = Payment.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0.0
        
        # Monthly Revenue (current month)
        now = datetime.now()
        monthly_revenue = Payment.objects.filter(
            status='success', 
            created_at__year=now.year, 
            created_at__month=now.month
        ).aggregate(Sum('amount'))['amount__sum'] or 0.0

        today_revenue = Payment.objects.filter(
            status='success',
            created_at__date=now.date()
        ).aggregate(Sum('amount'))['amount__sum'] or 0.0

        # Payment Status Distribution
        successful_payments = Payment.objects.filter(status='success').count()
        pending_payments = Payment.objects.filter(status='pending').count()
        failed_payments = Payment.objects.filter(status='failed').count()

        # 2. Hackathons stats
        total_hackathons = Hackathon.objects.count()
        upcoming = Hackathon.objects.filter(start_date__gt=now).count()
        active = Hackathon.objects.filter(start_date__lte=now, end_date__gte=now).count()
        completed = Hackathon.objects.filter(status='completed').count()

        # 3. Applications and Teams stats
        total_applications = Application.objects.count()
        approved_teams = Application.objects.filter(status='approved').count()
        rejected_teams = Application.objects.filter(status='rejected').count()
        pending_teams = Application.objects.filter(status='pending').count()

        # 4. College distribution
        colleges = Team.objects.values('college').annotate(count=Count('id')).order_by('-count')
        total_colleges = len(colleges)

        # 5. Participants count (Leaders + Members)
        total_teams = Team.objects.count()
        total_members = TeamMember.objects.count()
        total_participants = total_teams + total_members
        avg_team_size = round(total_participants / total_teams, 1) if total_teams > 0 else 0.0

        # 6. Revenue per Hackathon
        event_performance = []
        hackathons = Hackathon.objects.all()
        for h in hackathons:
            revenue = Payment.objects.filter(team__hackathon=h, status='success').aggregate(Sum('amount'))['amount__sum'] or 0.0
            registrations = h.teams.count()
            event_performance.append({
                "id": h.id,
                "title": h.title,
                "revenue": revenue,
                "registrations": registrations,
                "max_teams": h.max_teams,
                "status": h.status
            })

        # Most Popular Hackathon
        most_popular = sorted(event_performance, key=lambda x: x['registrations'], reverse=True)
        most_popular_name = most_popular[0]['title'] if most_popular else "N/A"

        # 7. Trends (Last 6 Months Registrations)
        registration_trends = []
        six_months_ago = now - timedelta(days=180)
        
        monthly_trends = Team.objects.filter(created_at__gte=six_months_ago)\
            .annotate(month=TruncMonth('created_at'))\
            .values('month')\
            .annotate(count=Count('id'))\
            .order_by('month')

        for entry in monthly_trends:
            registration_trends.append({
                "label": entry['month'].strftime('%b %Y'),
                "value": entry['count']
            })

        # 8. Daily Registrations Trend (Last 14 days)
        daily_registrations = []
        fourteen_days_ago = now - timedelta(days=14)
        
        day_trends = Team.objects.filter(created_at__gte=fourteen_days_ago)\
            .annotate(day=TruncDay('created_at'))\
            .values('day')\
            .annotate(count=Count('id'))\
            .order_by('day')

        for entry in day_trends:
            daily_registrations.append({
                "label": entry['day'].strftime('%d %b'),
                "value": entry['count']
            })

        return Response({
            "metrics": {
                "total_revenue": total_revenue,
                "monthly_revenue": monthly_revenue,
                "today_revenue": today_revenue,
                "total_hackathons": total_hackathons,
                "upcoming": upcoming,
                "active": active,
                "completed": completed,
                "total_applications": total_applications,
                "approved_teams": approved_teams,
                "rejected_teams": rejected_teams,
                "pending_teams": pending_teams,
                "total_participants": total_participants,
                "total_colleges": total_colleges,
                "avg_team_size": avg_team_size,
                "most_popular": most_popular_name,
                "successful_payments": successful_payments,
                "pending_payments": pending_payments,
                "failed_payments": failed_payments
            },
            "event_performance": event_performance,
            "registration_trends": registration_trends,
            "daily_registrations": daily_registrations,
            "colleges": list(colleges[:5])
        })


def uuid_hex():
    import uuid
    return uuid.uuid4().hex


class ProblemStatementViewSet(viewsets.ModelViewSet):
    queryset = ProblemStatement.objects.all().order_by('hackathon', 'order', 'created_at')
    serializer_class = ProblemStatementSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        qs = ProblemStatement.objects.all().order_by('order', 'created_at')
        hackathon_id = self.request.query_params.get('hackathon_id')
        hackathon_slug = self.request.query_params.get('hackathon_slug')
        if hackathon_id:
            qs = qs.filter(hackathon_id=hackathon_id)
        if hackathon_slug:
            qs = qs.filter(hackathon__slug=hackathon_slug)
        return qs


class ProblemApplicationViewSet(viewsets.ModelViewSet):
    queryset = ProblemApplication.objects.all().order_by('-created_at')
    serializer_class = ProblemApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'admin':
            qs = ProblemApplication.objects.all().order_by('-created_at')
            hackathon_id = self.request.query_params.get('hackathon_id')
            problem_id = self.request.query_params.get('problem_id')
            if hackathon_id:
                qs = qs.filter(hackathon_id=hackathon_id)
            if problem_id:
                qs = qs.filter(problem_statement_id=problem_id)
            return qs
        return ProblemApplication.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def my_application(self, request):
        """Returns the current user's problem application for a given hackathon."""
        hackathon_id = request.query_params.get('hackathon_id')
        if not hackathon_id:
            return Response({'error': 'hackathon_id query param is required'}, status=400)
        try:
            app = ProblemApplication.objects.get(hackathon_id=hackathon_id, user=request.user)
            return Response(ProblemApplicationSerializer(app, context={'request': request}).data)
        except ProblemApplication.DoesNotExist:
            return Response(None)

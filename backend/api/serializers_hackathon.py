from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Hackathon, Team, TeamMember, Application,
    Payment, Certificate, EmailLog, HackathonNotification, HackathonSetting,
    ProblemStatement, ProblemApplication
)

class HackathonSerializer(serializers.ModelSerializer):
    registered_teams_count = serializers.SerializerMethodField()
    remaining_slots = serializers.SerializerMethodField()
    registration_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Hackathon
        fields = '__all__'
        read_only_fields = ('slug', 'created_at', 'updated_at')

    def get_registered_teams_count(self, obj):
        return obj.teams.count()

    def get_remaining_slots(self, obj):
        count = obj.teams.count()
        return max(0, obj.max_teams - count)

    def get_registration_percentage(self, obj):
        if obj.max_teams <= 0:
            return 0
        percentage = (obj.teams.count() / obj.max_teams) * 100
        return min(100.0, round(percentage, 1))


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ('id', 'name', 'email', 'phone', 'college')


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, required=False)
    payment_status = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    utr_number = serializers.SerializerMethodField()
    payment_id = serializers.SerializerMethodField()
    payment_record_id = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = (
            'id', 'hackathon', 'name', 'college', 'department', 'year',
            'leader_name', 'leader_email', 'leader_mobile', 'leader_roll_number',
            'github_url', 'linkedin_url', 'resume_url', 'registration_number',
            'members', 'payment_status', 'application_status', 'utr_number',
            'payment_id', 'payment_record_id', 'created_at'
        )
        read_only_fields = ('registration_number', 'created_at')

    def get_payment_status(self, obj):
        if obj.payments.filter(status='success').exists():
            return 'success'
        if obj.payments.filter(status='pending').exists():
            return 'pending'
        return 'none'

    def get_application_status(self, obj):
        if hasattr(obj, 'application'):
            return obj.application.status
        return 'pending'

    def get_utr_number(self, obj):
        payment = obj.payments.filter(status='pending').first()
        if not payment:
            payment = obj.payments.filter(status='success').first()
        return getattr(payment, 'utr_number', None)

    def get_payment_id(self, obj):
        payment = obj.payments.filter(status='pending').first()
        if not payment:
            payment = obj.payments.filter(status='success').first()
        return getattr(payment, 'payment_id', None)

    def get_payment_record_id(self, obj):
        payment = obj.payments.filter(status='pending').first()
        if not payment:
            payment = obj.payments.filter(status='success').first()
        return getattr(payment, 'id', None)

    def validate(self, data):
        # Fallback to self.instance values for updates/partial updates
        hackathon = data.get('hackathon') or (self.instance.hackathon if self.instance else None)
        leader_email = data.get('leader_email') or (self.instance.leader_email if self.instance else None)
        leader_mobile = data.get('leader_mobile') or (self.instance.leader_mobile if self.instance else None)

        if 'members' in data:
            members_data = data.get('members') or []
        else:
            if self.instance:
                members_data = [{'email': m.email, 'phone': m.phone} for m in self.instance.members.all()]
            else:
                members_data = []

        if hackathon:
            max_size = hackathon.max_team_members
            if len(members_data) + 1 > max_size:
                raise serializers.ValidationError({
                    "members": f"Maximum team size allowed is {max_size} members (including the team leader)."
                })

            # Check maximum team registration limit (only on new registrations, not updates)
            if not self.instance:
                if hackathon.teams.count() >= hackathon.max_teams:
                    raise serializers.ValidationError({
                        "non_field_errors": "Registration is closed. Maximum team limit has been reached."
                    })

        all_emails = [leader_email] if leader_email else []
        all_phones = [leader_mobile] if leader_mobile else []

        for member in members_data:
            email = member.get('email')
            phone = member.get('phone')
            if email:
                if email in all_emails:
                    raise serializers.ValidationError({"members": f"Duplicate email '{email}' detected within the team."})
                all_emails.append(email)
            if phone:
                if phone in all_phones:
                    raise serializers.ValidationError({"members": f"Duplicate phone '{phone}' detected within the team."})
                all_phones.append(phone)

        if hackathon:
            existing_teams = Team.objects.filter(hackathon=hackathon)
            if self.instance:
                existing_teams = existing_teams.exclude(pk=self.instance.pk)
            for team in existing_teams:
                if team.leader_email and team.leader_email in all_emails:
                    raise serializers.ValidationError({
                        "non_field_errors": f"Email '{team.leader_email}' is already registered in team '{team.name}'."
                    })
                for m in team.members.all():
                    if m.email and m.email in all_emails:
                        raise serializers.ValidationError({
                            "non_field_errors": f"Email '{m.email}' is already registered in team '{team.name}'."
                        })

        return data

    def create(self, validated_data):
        members_data = validated_data.pop('members', [])
        team = Team.objects.create(**validated_data)
        
        for member_data in members_data:
            TeamMember.objects.create(team=team, **member_data)
            
        Application.objects.create(hackathon=team.hackathon, team=team, status='pending')
        return team

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', None)
        
        # Update team instance standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Recreate members if new list provided
        if members_data is not None:
            instance.members.all().delete()
            for member_data in members_data:
                TeamMember.objects.create(team=instance, **member_data)
                
        return instance


class ApplicationSerializer(serializers.ModelSerializer):
    team_details = TeamSerializer(source='team', read_only=True)
    hackathon_title = serializers.ReadOnlyField(source='hackathon.title')

    class Meta:
        model = Application
        fields = ('id', 'hackathon', 'hackathon_title', 'team', 'team_details', 'status', 'created_at', 'updated_at')


class PaymentSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')
    hackathon_title = serializers.ReadOnlyField(source='team.hackathon.title')

    class Meta:
        model = Payment
        fields = ('id', 'team', 'team_name', 'hackathon_title', 'amount', 'payment_id', 'status', 'invoice_number', 'receipt_url', 'created_at')
        read_only_fields = ('invoice_number', 'created_at')


class CertificateSerializer(serializers.ModelSerializer):
    hackathon_title = serializers.ReadOnlyField(source='hackathon.title')

    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ('certificate_id', 'created_at')


class EmailLogSerializer(serializers.ModelSerializer):
    hackathon_title = serializers.ReadOnlyField(source='hackathon.title')

    class Meta:
        model = EmailLog
        fields = '__all__'


class HackathonNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonNotification
        fields = '__all__'


class HackathonSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackathonSetting
        fields = '__all__'


class ProblemStatementSerializer(serializers.ModelSerializer):
    application_count = serializers.SerializerMethodField()
    hackathon_title = serializers.ReadOnlyField(source='hackathon.title')

    class Meta:
        model = ProblemStatement
        fields = (
            'id', 'hackathon', 'hackathon_title', 'title', 'description',
            'difficulty', 'tech_stack', 'order', 'application_count',
            'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')

    def get_application_count(self, obj):
        return obj.applications.count()


class ProblemApplicationSerializer(serializers.ModelSerializer):
    problem_statement_detail = ProblemStatementSerializer(source='problem_statement', read_only=True)
    hackathon_title = serializers.ReadOnlyField(source='hackathon.title')
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ProblemApplication
        fields = (
            'id', 'hackathon', 'hackathon_title', 'user', 'username',
            'problem_statement', 'problem_statement_detail',
            'selected_tech_stack', 'team_name', 'created_at'
        )
        read_only_fields = ('user', 'created_at')

    def validate(self, data):
        request = self.context.get('request')
        hackathon = data.get('hackathon')
        problem_statement = data.get('problem_statement')

        # Ensure the problem statement belongs to the hackathon
        if problem_statement and hackathon and problem_statement.hackathon_id != hackathon.id:
            raise serializers.ValidationError({
                "problem_statement": "This problem statement does not belong to the selected hackathon."
            })

        # Enforce one application per user per hackathon
        if request and hackathon:
            existing = ProblemApplication.objects.filter(
                hackathon=hackathon, user=request.user
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({
                    "non_field_errors": "You have already applied to a problem statement in this hackathon."
                })

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)

from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users (role='admin' or Django is_staff).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            (hasattr(request.user, 'profile') and request.user.profile.role == 'admin') or 
            request.user.is_staff or 
            request.user.is_superuser
        )

class IsStudentUser(permissions.BasePermission):
    """
    Allows access only to student users (role='student').
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'profile') and request.user.profile.role == 'student'

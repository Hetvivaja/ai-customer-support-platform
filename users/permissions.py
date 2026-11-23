from rest_framework.permissions import BasePermission
from users.models import User

class IsStaffRole(BasePermission):
    """Agent, manager or admin."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated
            and user.role in (User.Role.AGENT, User.Role.MANAGER, User.Role.ADMIN)
        )

class IsManagerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated
            and user.role in (User.Role.MANAGER, User.Role.ADMIN)
        )
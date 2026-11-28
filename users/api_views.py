from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsManagerOrAdmin
from users.serializers import RegisterSerializer
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.throttling import ScopedRateThrottle
from users.services.auth_service import change_password, update_profile

from users.permissions import IsAdmin
from users.services.auth_service import (
    list_active_agents,
    create_user_by_admin,
    list_users,
    update_user_by_admin,)

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

def _me_data(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
    }

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_me_data(request.user))

    def patch(self, request):
        try:
            user = update_profile(request.user, request.data)
        except ValueError as error:
            raise ValidationError(str(error))
        return Response(_me_data(user))

class AgentListView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        agents = list_active_agents()
        return Response([
            {
                "id": agent.id,
                "username": agent.username,
                "email": agent.email,
                "active_tickets": agent.active_tickets,
            }
            for agent in agents
        ])
def _user_data(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "date_joined": user.date_joined,
    }


def _to_api_error(error):
    if isinstance(error, PermissionError):
        return PermissionDenied(str(error))
    if isinstance(error, LookupError):
        return NotFound(str(error))
    return ValidationError(str(error))


class UserListCreateView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        users = list_users(request.user)
        return Response([_user_data(u) for u in users])

    def post(self, request):
        try:
            user = create_user_by_admin(
                request.user,
                request.data.get("username"),
                request.data.get("email"),
                request.data.get("password"),
                request.data.get("role"),
            )
        except (ValueError, PermissionError) as error:
            raise _to_api_error(error)

        return Response(_user_data(user), status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            user = update_user_by_admin(request.user, pk, request.data)
        except (ValueError, PermissionError, LookupError) as error:
            raise _to_api_error(error)

        return Response(_user_data(user))

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_change"

    def post(self, request):
        try:
            change_password(
                request.user,
                request.data.get("current_password"),
                request.data.get("new_password"),
            )
        except ValueError as error:
            raise ValidationError(str(error))
        return Response({"detail": "Password changed."})
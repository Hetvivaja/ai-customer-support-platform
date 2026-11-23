from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from users.permissions import IsManagerOrAdmin
from users.services.auth_service import list_active_agents
from users.serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        })

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
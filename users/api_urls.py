from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import ChangePasswordView, RegisterView, MeView
from .email_auth import EmailTokenObtainPairView
from .api_views import (RegisterView, MeView, AgentListView, UserListCreateView, UserDetailView,)


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("agents/", AgentListView.as_view(), name="agent-list"),
    path("me/", MeView.as_view(), name="me"),
    path("users/", UserListCreateView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]

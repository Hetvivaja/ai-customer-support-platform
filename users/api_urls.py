from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import RegisterView, MeView
from .email_auth import EmailTokenObtainPairView
from .api_views import RegisterView, MeView, AgentListView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("agents/", AgentListView.as_view(), name="agent-list"),
    path("me/", MeView.as_view(), name="me"),
]

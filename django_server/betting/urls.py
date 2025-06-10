from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'bets', views.BetViewSet)
router.register(r'social-posts', views.SocialPostViewSet)
router.register(r'missions', views.MissionViewSet)
router.register(r'user-missions', views.UserMissionViewSet, basename='user-mission')
router.register(r'impact-projects', views.ImpactProjectViewSet)
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'friendships', views.FriendshipViewSet, basename='friendship')
router.register(r'categories', views.CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('invite/use-code/', views.use_invite_code, name='use-invite-code'),
]
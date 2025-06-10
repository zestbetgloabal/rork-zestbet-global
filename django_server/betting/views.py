from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Sum, Count, Q, F, ExpressionWrapper, FloatField
from django.shortcuts import get_object_or_404
from datetime import timedelta
import os
import uuid
import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib
import json
import random
from pathlib import Path

from .models import (
    User, Bet, BetPlacement, SocialPost, Comment, 
    Mission, UserMission, ImpactProject, Transaction,
    Notification, Friendship, Category, MediaFile, ConsentLog,
    UserBehavior, AIRecommendation, AIModel
)
from .serializers import (
    UserSerializer, BetSerializer, BetPlacementSerializer,
    SocialPostSerializer, CommentSerializer, MissionSerializer,
    UserMissionSerializer, ImpactProjectSerializer, TransactionSerializer,
    NotificationSerializer, FriendshipSerializer, CategorySerializer,
    UserRegistrationSerializer, LoginSerializer, UserProfileUpdateSerializer,
    MediaFileSerializer, InviteSerializer, ConsentUpdateSerializer, ConsentLogSerializer,
    UserBehaviorSerializer, AIRecommendationSerializer, AIModelSerializer
)
from .permissions import IsOwnerOrReadOnly, IsCreatorOrReadOnly

# Authentication views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        # Create initial missions for the user
        missions = Mission.objects.all()
        for mission in missions:
            UserMission.objects.create(user=user, mission=mission)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# Media File views
class MediaFileViewSet(viewsets.ModelViewSet):
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Generate a unique filename
        original_filename = self.request.data.get('file').name
        extension = os.path.splitext(original_filename)[1]
        new_filename = f"{uuid.uuid4()}{extension}"
        
        # Set the new filename
        file_obj = self.request.data.get('file')
        file_obj.name = new_filename
        
        serializer.save()


# User views
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.all()
        username = self.request.query_params.get('username', None)
        if username:
            queryset = queryset.filter(username__icontains=username)
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        user = request.user
        serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def update_consent(self, request):
        user = request.user
        serializer = ConsentUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            agb_consent = serializer.validated_data.get('agb_consent')
            privacy_consent = serializer.validated_data.get('privacy_consent')
            
            # Update user consent
            user.agb_consent = agb_consent
            user.privacy_consent = privacy_consent
            user.consent_date = timezone.now()
            user.save()
            
            # Create consent log
            ConsentLog.objects.create(
                user=user,
                agb_consent=agb_consent,
                privacy_consent=privacy_consent,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            return Response({
                'success': True,
                'message': 'Consent updated successfully',
                'user': UserSerializer(user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def consent_history(self, request):
        user = request.user
        consent_logs = ConsentLog.objects.filter(user=user).order_by('-consent_date')
        serializer = ConsentLogSerializer(consent_logs, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_test_zest(self, request):
        user = request.user
        amount = int(request.data.get('amount', 100))
        
        # Check daily limit
        today = timezone.now().date()
        daily_limit = 100  # Same as DAILY_BET_LIMIT in frontend
        
        if user.last_bet_date != today:
            # Reset daily amount if it's a new day
            user.daily_bet_amount = 0
            user.last_bet_date = today
        
        remaining_limit = daily_limit - user.daily_bet_amount
        
        if remaining_limit <= 0:
            return Response({
                'error': 'Daily limit reached',
                'remaining_limit': 0
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add the smaller of requested amount or remaining limit
        amount_to_add = min(amount, remaining_limit)
        user.zest_balance += amount_to_add
        user.daily_bet_amount += amount_to_add
        user.save()
        
        # Create transaction record
        Transaction.objects.create(
            user=user,
            amount=amount_to_add,
            transaction_type='daily',
            description='Added free Zest'
        )
        
        return Response({
            'success': True,
            'amount_added': amount_to_add,
            'new_balance': user.zest_balance,
            'remaining_limit': daily_limit - user.daily_bet_amount
        })
    
    @action(detail=False, methods=['post'])
    def send_invite(self, request):
        user = request.user
        serializer = InviteSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data.get('email')
        phone_number = serializer.validated_data.get('phone_number')
        
        # In a real app, this would send an email or SMS
        # For now, we'll just return a success response
        
        return Response({
            'success': True,
            'message': f"Invitation sent to {email or phone_number}",
            'invite_code': user.invite_code
        })


# Bet views
class BetViewSet(viewsets.ModelViewSet):
    queryset = Bet.objects.all()
    serializer_class = BetSerializer
    permission_classes = [IsAuthenticated, IsCreatorOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'end_date', 'total_pool', 'likes']
    
    def get_queryset(self):
        queryset = Bet.objects.all()
        
        # Filter by visibility
        visibility = self.request.query_params.get('visibility', None)
        if visibility == 'public':
            queryset = queryset.filter(visibility='public')
        elif visibility == 'private':
            # For private bets, only show those created by the user or where they're invited
            queryset = queryset.filter(
                Q(visibility='private') & 
                (Q(creator=self.request.user) | Q(invited_friends=self.request.user))
            ).distinct()
        elif visibility == 'all' or visibility is None:
            # Show public bets and private bets where the user is creator or invited
            queryset = queryset.filter(
                Q(visibility='public') | 
                (Q(visibility='private') & 
                 (Q(creator=self.request.user) | Q(invited_friends=self.request.user)))
            ).distinct()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status == 'active':
            queryset = queryset.filter(end_date__gt=timezone.now(), is_resolved=False)
        elif status == 'ended':
            queryset = queryset.filter(Q(end_date__lte=timezone.now()) | Q(is_resolved=True))
        
        # Filter by AI recommendation
        ai_recommended = self.request.query_params.get('ai_recommended', None)
        if ai_recommended == 'true':
            # Get user's preferences
            user = self.request.user
            
            # Calculate similarity score between user preferences and bet scores
            # This is a simple dot product similarity
            queryset = queryset.annotate(
                similarity=ExpressionWrapper(
                    F('strategic_score') * user.prefers_strategic +
                    F('creative_score') * user.prefers_creative +
                    F('social_score') * user.prefers_social +
                    F('competitive_score') * user.prefers_competitive +
                    F('quick_score') * user.prefers_quick,
                    output_field=FloatField()
                )
            ).order_by('-similarity')
        
        return queryset
    
    def perform_create(self, serializer):
        bet = serializer.save(creator=self.request.user)
        
        # Handle media files
        media_files = self.request.data.get('media_files', [])
        if media_files:
            for media_file in media_files:
                media_type = media_file.get('type', 'image')
                file_obj = media_file.get('file')
                
                if file_obj:
                    # Create a MediaFile instance
                    media_instance = MediaFile.objects.create(
                        file=file_obj,
                        media_type=media_type
                    )
                    # Add it to the bet
                    bet.media_files.add(media_instance)
        
        # Record user behavior
        UserBehavior.objects.create(
            user=self.request.user,
            behavior_type='bet_placed',
            value=1.0,
            related_bet=bet
        )
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        bet = self.get_object()
        user = request.user
        
        if bet.likes.filter(id=user.id).exists():
            bet.likes.remove(user)
            # Record user behavior (unlike)
            UserBehavior.objects.create(
                user=user,
                behavior_type='bet_liked',
                value=-1.0,
                related_bet=bet
            )
            return Response({'status': 'unliked'})
        else:
            bet.likes.add(user)
            # Record user behavior (like)
            UserBehavior.objects.create(
                user=user,
                behavior_type='bet_liked',
                value=1.0,
                related_bet=bet
            )
            return Response({'status': 'liked'})
    
    @action(detail=True, methods=['post'])
    def place_bet(self, request, pk=None):
        bet = self.get_object()
        user = request.user
        
        # Check if bet is still active
        if bet.end_date <= timezone.now() or bet.is_resolved:
            return Response({'error': 'This bet has ended'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already placed a bet
        if BetPlacement.objects.filter(user=user, bet=bet).exists():
            return Response({'error': 'You have already placed a bet'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate amount
        amount = int(request.data.get('amount', 0))
        if amount < bet.min_bet or amount > bet.max_bet:
            return Response({
                'error': f'Bet amount must be between {bet.min_bet} and {bet.max_bet}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check user balance
        if user.zest_balance < amount:
            return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check daily limit
        today = timezone.now().date()
        daily_limit = 100  # Same as DAILY_BET_LIMIT in frontend
        
        if user.last_bet_date != today:
            # Reset daily amount if it's a new day
            user.daily_bet_amount = 0
            user.last_bet_date = today
        
        if user.daily_bet_amount + amount > daily_limit:
            return Response({
                'error': f'Daily bet limit exceeded. You can bet {daily_limit - user.daily_bet_amount} more today.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate fees
        platform_fee = int(amount * 0.1)  # 10% platform fee
        charity_donation = int(platform_fee * 0.2)  # 20% of platform fee goes to charity
        net_amount = amount - platform_fee
        
        # Create bet placement
        prediction = request.data.get('prediction', '')
        if not prediction:
            return Response({'error': 'Prediction is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        bet_placement = BetPlacement.objects.create(
            user=user,
            bet=bet,
            amount=amount,
            prediction=prediction,
            platform_fee=platform_fee,
            charity_donation=charity_donation
        )
        
        # Update user balance and daily bet amount
        user.zest_balance -= amount
        user.daily_bet_amount += amount
        user.save()
        
        # Update bet total pool
        bet.total_pool += net_amount
        bet.save()
        
        # Create transaction record
        Transaction.objects.create(
            user=user,
            amount=-amount,
            transaction_type='bet',
            description=f'Bet on {bet.title}',
            related_bet=bet
        )
        
        # If there's a featured charity project, add the donation
        featured_project = ImpactProject.objects.filter(featured=True).first()
        if featured_project and charity_donation > 0:
            featured_project.amount += charity_donation
            featured_project.save()
        
        # Record user behavior
        UserBehavior.objects.create(
            user=user,
            behavior_type='bet_placed',
            value=float(amount),
            related_bet=bet
        )
        
        # Check if this completes any missions
        self._check_bet_missions(user)
        
        # Update user preferences based on bet characteristics
        self._update_user_preferences(user, bet)
        
        return Response({
            'success': True,
            'bet_placement': BetPlacementSerializer(bet_placement).data,
            'new_balance': user.zest_balance
        })
    
    def _check_bet_missions(self, user):
        # Check for "Place your first bet" mission
        first_bet_mission = Mission.objects.filter(title__icontains='first bet').first()
        if first_bet_mission:
            user_mission = UserMission.objects.filter(user=user, mission=first_bet_mission).first()
            if user_mission and user_mission.status == 'open':
                user_mission.status = 'completed'
                user_mission.completed_at = timezone.now()
                user_mission.save()
                
                # Award the user
                user.zest_balance += first_bet_mission.reward
                user.save()
                
                # Create transaction record
                Transaction.objects.create(
                    user=user,
                    amount=first_bet_mission.reward,
                    transaction_type='mission',
                    description=f'Completed mission: {first_bet_mission.title}'
                )
                
                # Create notification
                Notification.objects.create(
                    user=user,
                    title='Mission Completed!',
                    message=f'You completed the mission "{first_bet_mission.title}" and earned {first_bet_mission.reward} Zest!',
                    notification_type='mission_complete'
                )
                
                # Record user behavior
                UserBehavior.objects.create(
                    user=user,
                    behavior_type='mission_completed',
                    value=float(first_bet_mission.reward),
                    related_mission=first_bet_mission
                )
    
    def _update_user_preferences(self, user, bet):
        # Update user preferences based on bet characteristics
        # This is a simple learning algorithm that slightly shifts user preferences
        # toward the characteristics of bets they engage with
        
        # Learning rate - how quickly preferences adapt
        learning_rate = 0.05
        
        # Update each preference dimension
        user.prefers_strategic = user.prefers_strategic * (1 - learning_rate) + bet.strategic_score * learning_rate
        user.prefers_creative = user.prefers_creative * (1 - learning_rate) + bet.creative_score * learning_rate
        user.prefers_social = user.prefers_social * (1 - learning_rate) + bet.social_score * learning_rate
        user.prefers_competitive = user.prefers_competitive * (1 - learning_rate) + bet.competitive_score * learning_rate
        user.prefers_quick = user.prefers_quick * (1 - learning_rate) + bet.quick_score * learning_rate
        
        # Save updated preferences
        user.save()


# Social Post views
class SocialPostViewSet(viewsets.ModelViewSet):
    queryset = SocialPost.objects.all()
    serializer_class = SocialPostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def perform_create(self, serializer):
        post = serializer.save(user=self.request.user)
        
        # Handle media files
        media_files = self.request.data.get('media_files', [])
        if media_files:
            for media_file in media_files:
                media_type = media_file.get('type', 'image')
                file_obj = media_file.get('file')
                
                if file_obj:
                    # Create a MediaFile instance
                    media_instance = MediaFile.objects.create(
                        file=file_obj,
                        media_type=media_type
                    )
                    # Add it to the post
                    post.media_files.add(media_instance)
        
        # Record user behavior
        UserBehavior.objects.create(
            user=self.request.user,
            behavior_type='social_post',
            value=1.0
        )
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            return Response({'status': 'unliked'})
        else:
            post.likes.add(user)
            return Response({'status': 'liked'})
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        post = self.get_object()
        comments = Comment.objects.filter(post=post)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        post = self.get_object()
        user = request.user
        content = request.data.get('content', '')
        
        if not content:
            return Response({'error': 'Comment content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = Comment.objects.create(
            post=post,
            user=user,
            content=content
        )
        
        # Record user behavior
        UserBehavior.objects.create(
            user=user,
            behavior_type='comment',
            value=1.0
        )
        
        return Response(CommentSerializer(comment).data)


# Mission views
class MissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Mission.objects.all()
    serializer_class = MissionSerializer
    permission_classes = [IsAuthenticated]


class UserMissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserMissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserMission.objects.filter(user=self.request.user)


# Impact Project views
class ImpactProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImpactProject.objects.all()
    serializer_class = ImpactProjectSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured = ImpactProject.objects.filter(featured=True).first()
        if featured:
            serializer = self.get_serializer(featured)
            return Response(serializer.data)
        return Response({})


# Transaction views
class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


# Notification views
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})


# Friendship views
class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            Q(requester=user) | Q(addressee=user)
        )
    
    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friendship = self.get_object()
        
        if friendship.addressee != request.user:
            return Response({'error': 'You cannot accept this request'}, status=status.HTTP_403_FORBIDDEN)
        
        friendship.status = 'accepted'
        friendship.save()
        
        # Create notification for requester
        Notification.objects.create(
            user=friendship.requester,
            title='Friend Request Accepted',
            message=f'{request.user.username} accepted your friend request!',
            notification_type='friend_request'
        )
        
        return Response({'status': 'accepted'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friendship = self.get_object()
        
        if friendship.addressee != request.user:
            return Response({'error': 'You cannot reject this request'}, status=status.HTTP_403_FORBIDDEN)
        
        friendship.status = 'rejected'
        friendship.save()
        
        return Response({'status': 'rejected'})


# Category views
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


# Consent Log views
class ConsentLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ConsentLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ConsentLog.objects.filter(user=self.request.user)


# User Behavior views
class UserBehaviorViewSet(viewsets.ModelViewSet):
    serializer_class = UserBehaviorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserBehavior.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def track(self, request):
        """Track user behavior"""
        behavior_type = request.data.get('behavior_type')
        value = float(request.data.get('value', 1.0))
        related_bet_id = request.data.get('related_bet')
        related_mission_id = request.data.get('related_mission')
        
        related_bet = None
        related_mission = None
        
        if related_bet_id:
            try:
                related_bet = Bet.objects.get(id=related_bet_id)
            except Bet.DoesNotExist:
                pass
        
        if related_mission_id:
            try:
                related_mission = Mission.objects.get(id=related_mission_id)
            except Mission.DoesNotExist:
                pass
        
        behavior = UserBehavior.objects.create(
            user=request.user,
            behavior_type=behavior_type,
            value=value,
            related_bet=related_bet,
            related_mission=related_mission
        )
        
        return Response(UserBehaviorSerializer(behavior).data)


# AI Recommendation views
class AIRecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = AIRecommendationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_shown(self, request, pk=None):
        recommendation = self.get_object()
        recommendation.is_shown = True
        recommendation.save()
        return Response({'status': 'marked as shown'})
    
    @action(detail=True, methods=['post'])
    def mark_clicked(self, request, pk=None):
        recommendation = self.get_object()
        recommendation.is_clicked = True
        recommendation.save()
        return Response({'status': 'marked as clicked'})
    
    @action(detail=False, methods=['get'])
    def get_recommendations(self, request):
        """Get AI recommendations for the user"""
        recommendation_type = request.query_params.get('type', 'bet')
        limit = int(request.query_params.get('limit', 5))
        
        # Get active recommendations that haven't expired
        recommendations = AIRecommendation.objects.filter(
            user=request.user,
            recommendation_type=recommendation_type,
            expires_at__gt=timezone.now()
        ).order_by('-score')[:limit]
        
        # If we don't have enough recommendations, generate new ones
        if recommendations.count() < limit:
            self._generate_recommendations(request.user, recommendation_type, limit - recommendations.count())
            
            # Get the updated recommendations
            recommendations = AIRecommendation.objects.filter(
                user=request.user,
                recommendation_type=recommendation_type,
                expires_at__gt=timezone.now()
            ).order_by('-score')[:limit]
        
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)
    
    def _generate_recommendations(self, user, recommendation_type, count):
        """Generate new AI recommendations for the user"""
        if recommendation_type == 'bet':
            self._generate_bet_recommendations(user, count)
        elif recommendation_type == 'mission':
            self._generate_mission_recommendations(user, count)
        elif recommendation_type == 'friend':
            self._generate_friend_recommendations(user, count)
    
    def _generate_bet_recommendations(self, user, count):
        """Generate bet recommendations using a simple similarity model"""
        # Get active bets
        active_bets = Bet.objects.filter(
            end_date__gt=timezone.now(),
            is_resolved=False
        ).exclude(
            # Exclude bets the user has already placed
            id__in=BetPlacement.objects.filter(user=user).values_list('bet_id', flat=True)
        )
        
        if not active_bets:
            return
        
        # Calculate similarity scores
        bet_scores = []
        for bet in active_bets:
            # Simple dot product similarity between user preferences and bet characteristics
            similarity = (
                user.prefers_strategic * bet.strategic_score +
                user.prefers_creative * bet.creative_score +
                user.prefers_social * bet.social_score +
                user.prefers_competitive * bet.competitive_score +
                user.prefers_quick * bet.quick_score
            )
            bet_scores.append((bet, similarity))
        
        # Sort by similarity score
        bet_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Create recommendations for top bets
        for bet, score in bet_scores[:count]:
            # Check if recommendation already exists
            if not AIRecommendation.objects.filter(
                user=user,
                recommendation_type='bet',
                related_bet=bet
            ).exists():
                # Create new recommendation
                AIRecommendation.objects.create(
                    user=user,
                    recommendation_type='bet',
                    score=score,
                    created_at=timezone.now(),
                    expires_at=timezone.now() + timedelta(days=7),
                    related_bet=bet
                )
    
    def _generate_mission_recommendations(self, user, count):
        """Generate mission recommendations"""
        # Get open missions
        open_missions = UserMission.objects.filter(
            user=user,
            status='open'
        ).select_related('mission')
        
        if not open_missions:
            return
        
        # For now, just recommend random open missions
        # In a real implementation, this would use a more sophisticated algorithm
        missions_to_recommend = random.sample(list(open_missions), min(count, len(open_missions)))
        
        for user_mission in missions_to_recommend:
            # Check if recommendation already exists
            if not AIRecommendation.objects.filter(
                user=user,
                recommendation_type='mission',
                related_mission=user_mission.mission
            ).exists():
                # Create new recommendation
                AIRecommendation.objects.create(
                    user=user,
                    recommendation_type='mission',
                    score=0.9,  # High score for missions
                    created_at=timezone.now(),
                    expires_at=timezone.now() + timedelta(days=7),
                    related_mission=user_mission.mission
                )
    
    def _generate_friend_recommendations(self, user, count):
        """Generate friend recommendations"""
        # Get users who are not already friends
        existing_friends = Friendship.objects.filter(
            (Q(requester=user) | Q(addressee=user)) & Q(status='accepted')
        ).values_list('requester', 'addressee')
        
        # Flatten the list of friend IDs
        friend_ids = set()
        for req, addr in existing_friends:
            friend_ids.add(req)
            friend_ids.add(addr)
        
        # Remove the user's own ID
        friend_ids.discard(user.id)
        
        # Get users who are not already friends
        potential_friends = User.objects.exclude(
            id__in=friend_ids
        ).exclude(
            id=user.id
        )
        
        if not potential_friends:
            return
        
        # For now, just recommend random users
        # In a real implementation, this would use a more sophisticated algorithm
        users_to_recommend = random.sample(list(potential_friends), min(count, len(potential_friends)))
        
        for recommended_user in users_to_recommend:
            # Check if recommendation already exists
            if not AIRecommendation.objects.filter(
                user=user,
                recommendation_type='friend',
                related_user=recommended_user
            ).exists():
                # Create new recommendation
                AIRecommendation.objects.create(
                    user=user,
                    recommendation_type='friend',
                    score=0.8,  # High score for friends
                    created_at=timezone.now(),
                    expires_at=timezone.now() + timedelta(days=7),
                    related_user=recommended_user
                )


# AI Model views
class AIModelViewSet(viewsets.ModelViewSet):
    queryset = AIModel.objects.all()
    serializer_class = AIModelSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def train(self, request):
        """Train or update an AI model"""
        model_type = request.data.get('model_type')
        
        if model_type == 'recommendation':
            self._train_recommendation_model()
        elif model_type == 'personalization':
            self._train_personalization_model()
        elif model_type == 'engagement':
            self._train_engagement_model()
        elif model_type == 'social':
            self._train_social_model()
        elif model_type == 'moderation':
            self._train_moderation_model()
        else:
            return Response({'error': 'Invalid model type'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'status': 'model training initiated'})
    
    def _train_recommendation_model(self):
        """Train the recommendation model"""
        # In a real implementation, this would use a more sophisticated algorithm
        # For now, we'll just create a dummy model
        
        # Get the latest model version
        latest_model = AIModel.objects.filter(model_type='recommendation').order_by('-version').first()
        
        if latest_model:
            version = int(latest_model.version) + 1
        else:
            version = 1
        
        # Create a new model
        AIModel.objects.create(
            model_type='recommendation',
            version=str(version),
            accuracy=0.85,  # Dummy accuracy
            last_trained=timezone.now(),
            is_active=True,
            parameters={
                'algorithm': 'knn',
                'k': 5,
                'distance_metric': 'euclidean'
            }
        )
    
    def _train_personalization_model(self):
        """Train the personalization model"""
        # Similar to recommendation model
        latest_model = AIModel.objects.filter(model_type='personalization').order_by('-version').first()
        
        if latest_model:
            version = int(latest_model.version) + 1
        else:
            version = 1
        
        AIModel.objects.create(
            model_type='personalization',
            version=str(version),
            accuracy=0.82,
            last_trained=timezone.now(),
            is_active=True,
            parameters={
                'algorithm': 'gradient_boosting',
                'learning_rate': 0.1,
                'max_depth': 3
            }
        )
    
    def _train_engagement_model(self):
        """Train the engagement model"""
        latest_model = AIModel.objects.filter(model_type='engagement').order_by('-version').first()
        
        if latest_model:
            version = int(latest_model.version) + 1
        else:
            version = 1
        
        AIModel.objects.create(
            model_type='engagement',
            version=str(version),
            accuracy=0.78,
            last_trained=timezone.now(),
            is_active=True,
            parameters={
                'algorithm': 'random_forest',
                'n_estimators': 100,
                'max_features': 'sqrt'
            }
        )
    
    def _train_social_model(self):
        """Train the social interaction model"""
        latest_model = AIModel.objects.filter(model_type='social').order_by('-version').first()
        
        if latest_model:
            version = int(latest_model.version) + 1
        else:
            version = 1
        
        AIModel.objects.create(
            model_type='social',
            version=str(version),
            accuracy=0.81,
            last_trained=timezone.now(),
            is_active=True,
            parameters={
                'algorithm': 'kmeans',
                'n_clusters': 5,
                'init': 'k-means++'
            }
        )
    
    def _train_moderation_model(self):
        """Train the content moderation model"""
        latest_model = AIModel.objects.filter(model_type='moderation').order_by('-version').first()
        
        if latest_model:
            version = int(latest_model.version) + 1
        else:
            version = 1
        
        AIModel.objects.create(
            model_type='moderation',
            version=str(version),
            accuracy=0.92,
            last_trained=timezone.now(),
            is_active=True,
            parameters={
                'algorithm': 'bert',
                'max_length': 128,
                'batch_size': 16
            }
        )


# Leaderboard view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    top_users = User.objects.annotate(
        total_points=models.F('points')
    ).order_by('-total_points')[:10]
    
    result = []
    for i, user in enumerate(top_users):
        result.append({
            'rank': i + 1,
            'username': user.username,
            'points': user.points,
            'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None
        })
    
    return Response(result)


# Invite view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def use_invite_code(request):
    invite_code = request.data.get('invite_code', '')
    
    if not invite_code:
        return Response({'error': 'Invite code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        inviter = User.objects.get(invite_code=invite_code)
        
        # Can't use your own code
        if inviter == request.user:
            return Response({'error': 'You cannot use your own invite code'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if this user has already used an invite code
        if Transaction.objects.filter(user=request.user, transaction_type='invite').exists():
            return Response({'error': 'You have already used an invite code'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Award both users
        reward = 50  # 50 Zest reward
        
        inviter.zest_balance += reward
        inviter.save()
        
        request.user.zest_balance += reward
        request.user.save()
        
        # Create transaction records
        Transaction.objects.create(
            user=inviter,
            amount=reward,
            transaction_type='invite',
            description=f'Invite reward from {request.user.username}'
        )
        
        Transaction.objects.create(
            user=request.user,
            amount=reward,
            transaction_type='invite',
            description=f'Used invite code from {inviter.username}'
        )
        
        # Create notifications
        Notification.objects.create(
            user=inviter,
            title='Invite Reward',
            message=f'{request.user.username} used your invite code! You received {reward} Zest.',
            notification_type='system'
        )
        
        Notification.objects.create(
            user=request.user,
            title='Invite Reward',
            message=f'You used {inviter.username}\'s invite code and received {reward} Zest!',
            notification_type='system'
        )
        
        # Check for invite mission
        invite_mission = Mission.objects.filter(title__icontains='invite').first()
        if invite_mission:
            user_mission = UserMission.objects.filter(user=inviter, mission=invite_mission).first()
            if user_mission and user_mission.status == 'open':
                user_mission.status = 'completed'
                user_mission.completed_at = timezone.now()
                user_mission.save()
                
                # Award the user
                inviter.zest_balance += invite_mission.reward
                inviter.save()
                
                # Create transaction record
                Transaction.objects.create(
                    user=inviter,
                    amount=invite_mission.reward,
                    transaction_type='mission',
                    description=f'Completed mission: {invite_mission.title}'
                )
                
                # Create notification
                Notification.objects.create(
                    user=inviter,
                    title='Mission Completed!',
                    message=f'You completed the mission "{invite_mission.title}" and earned {invite_mission.reward} Zest!',
                    notification_type='mission_complete'
                )
        
        return Response({
            'success': True,
            'reward': reward,
            'new_balance': request.user.zest_balance
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Invalid invite code'}, status=status.HTTP_400_BAD_REQUEST)


# Send invitation via email or SMS
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invitation(request):
    serializer = InviteSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    email = serializer.validated_data.get('email')
    phone_number = serializer.validated_data.get('phone_number')
    
    # In a real app, this would send an email or SMS with the invite code
    # For now, we'll just return a success response
    
    return Response({
        'success': True,
        'message': f"Invitation sent to {email or phone_number}",
        'invite_code': user.invite_code
    })


# AI Recommendation API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_recommendations(request):
    """Get AI recommendations for the user"""
    user = request.user
    recommendation_type = request.query_params.get('type', 'bet')
    limit = int(request.query_params.get('limit', 5))
    
    # Get active recommendations
    recommendations = AIRecommendation.objects.filter(
        user=user,
        recommendation_type=recommendation_type,
        expires_at__gt=timezone.now()
    ).order_by('-score')[:limit]
    
    # If we don't have enough recommendations, generate new ones
    if recommendations.count() < limit:
        # This would call the recommendation generation logic
        # For now, we'll just return what we have
        pass
    
    serializer = AIRecommendationSerializer(recommendations, many=True)
    return Response(serializer.data)


# Track app usage
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_app_usage(request):
    """Track app usage for AI personalization"""
    user = request.user
    action = request.data.get('action', 'app_opened')
    duration = float(request.data.get('duration', 0))
    
    if action == 'app_opened':
        UserBehavior.objects.create(
            user=user,
            behavior_type='app_opened',
            value=1.0
        )
    elif action == 'time_spent':
        UserBehavior.objects.create(
            user=user,
            behavior_type='time_spent',
            value=duration
        )
    
    return Response({'status': 'tracked'})


# Get personalized content
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def personalized_content(request):
    """Get personalized content for the user"""
    user = request.user
    content_type = request.query_params.get('type', 'bets')
    limit = int(request.query_params.get('limit', 5))
    
    if content_type == 'bets':
        # Get bets that match user preferences
        bets = Bet.objects.filter(
            end_date__gt=timezone.now(),
            is_resolved=False
        ).annotate(
            similarity=ExpressionWrapper(
                F('strategic_score') * user.prefers_strategic +
                F('creative_score') * user.prefers_creative +
                F('social_score') * user.prefers_social +
                F('competitive_score') * user.prefers_competitive +
                F('quick_score') * user.prefers_quick,
                output_field=FloatField()
            )
        ).order_by('-similarity')[:limit]
        
        serializer = BetSerializer(bets, many=True)
        return Response(serializer.data)
    
    elif content_type == 'missions':
        # Get open missions
        missions = UserMission.objects.filter(
            user=user,
            status='open'
        ).select_related('mission')[:limit]
        
        serializer = UserMissionSerializer(missions, many=True)
        return Response(serializer.data)
    
    return Response({'error': 'Invalid content type'}, status=status.HTTP_400_BAD_REQUEST)
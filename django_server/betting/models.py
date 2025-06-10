from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
import uuid

class User(AbstractUser):
    """Custom user model for ZestBet"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    zest_balance = models.IntegerField(default=100)
    points = models.IntegerField(default=0)
    invite_code = models.CharField(max_length=10, unique=True, null=True, blank=True)
    daily_bet_amount = models.IntegerField(default=0)
    last_bet_date = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    is_phone_verified = models.BooleanField(default=False)
    biography = models.TextField(blank=True, null=True)
    instagram = models.CharField(max_length=100, blank=True, null=True)
    twitter = models.CharField(max_length=100, blank=True, null=True)
    facebook = models.CharField(max_length=100, blank=True, null=True)
    linkedin = models.CharField(max_length=100, blank=True, null=True)
    tiktok = models.CharField(max_length=100, blank=True, null=True)
    youtube = models.CharField(max_length=100, blank=True, null=True)
    pinterest = models.CharField(max_length=100, blank=True, null=True)
    snapchat = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(max_length=200, blank=True, null=True)
    # Legal consent fields
    agb_consent = models.BooleanField(default=False)
    privacy_consent = models.BooleanField(default=False)
    consent_date = models.DateTimeField(null=True, blank=True)
    # User preferences for AI recommendations
    prefers_strategic = models.FloatField(default=0.5)  # 0-1 scale
    prefers_creative = models.FloatField(default=0.5)   # 0-1 scale
    prefers_social = models.FloatField(default=0.5)     # 0-1 scale
    prefers_competitive = models.FloatField(default=0.5) # 0-1 scale
    prefers_quick = models.FloatField(default=0.5)      # 0-1 scale
    
    def __str__(self):
        return self.username
    
    def save(self, *args, **kwargs):
        if not self.invite_code:
            # Generate a unique invite code
            self.invite_code = f"ZEST{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)


class Category(models.Model):
    """Categories for bets"""
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"


class MediaFile(models.Model):
    """Media files for bets and social posts"""
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='media_files/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.media_type} - {self.uploaded_at.strftime('%Y-%m-%d')}"


class Bet(models.Model):
    """Bet model for ZestBet"""
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_bets')
    likes = models.ManyToManyField(User, related_name='liked_bets', blank=True)
    participants = models.ManyToManyField(User, through='BetPlacement', related_name='participated_bets')
    total_pool = models.IntegerField(default=0)
    min_bet = models.IntegerField(default=10)
    max_bet = models.IntegerField(default=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='bets')
    image = models.ImageField(upload_to='bet_images/', null=True, blank=True)
    media_files = models.ManyToManyField(MediaFile, related_name='bets', blank=True)
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    invited_friends = models.ManyToManyField(User, related_name='bet_invitations', blank=True)
    is_resolved = models.BooleanField(default=False)
    winning_prediction = models.CharField(max_length=255, null=True, blank=True)
    # AI recommendation fields
    strategic_score = models.FloatField(default=0.5)  # 0-1 scale
    creative_score = models.FloatField(default=0.5)   # 0-1 scale
    social_score = models.FloatField(default=0.5)     # 0-1 scale
    competitive_score = models.FloatField(default=0.5) # 0-1 scale
    quick_score = models.FloatField(default=0.5)      # 0-1 scale
    
    def __str__(self):
        return self.title
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    @property
    def participants_count(self):
        return self.participants.count()
    
    class Meta:
        ordering = ['-created_at']


class BetPlacement(models.Model):
    """Records a user's bet placement"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bet = models.ForeignKey(Bet, on_delete=models.CASCADE)
    amount = models.IntegerField()
    prediction = models.CharField(max_length=255)
    platform_fee = models.IntegerField(default=0)
    charity_donation = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    is_winner = models.BooleanField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.bet.title} - {self.amount}"
    
    class Meta:
        unique_together = ('user', 'bet')


class SocialPost(models.Model):
    """Social posts by users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    media_files = models.ManyToManyField(MediaFile, related_name='posts', blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"
    
    @property
    def likes_count(self):
        return self.likes.count()
    
    @property
    def comments_count(self):
        return self.comments.count()
    
    class Meta:
        ordering = ['-created_at']


class Comment(models.Model):
    """Comments on social posts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} on {self.post.id}"
    
    class Meta:
        ordering = ['created_at']


class Mission(models.Model):
    """Missions for users to complete"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    description = models.TextField()
    reward = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class UserMission(models.Model):
    """Tracks user progress on missions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Mission.STATUS_CHOICES, default='open')
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.mission.title}"
    
    class Meta:
        unique_together = ('user', 'mission')


class ImpactProject(models.Model):
    """Charity projects for social impact"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.IntegerField(default=0)
    image = models.ImageField(upload_to='impact_projects/', null=True, blank=True)
    featured = models.BooleanField(default=False)
    end_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-featured', '-created_at']


class Transaction(models.Model):
    """Records all Zest transactions"""
    TRANSACTION_TYPES = [
        ('bet', 'Bet Placement'),
        ('win', 'Bet Win'),
        ('purchase', 'Zest Purchase'),
        ('mission', 'Mission Reward'),
        ('invite', 'Invite Reward'),
        ('daily', 'Daily Free Zest'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    related_bet = models.ForeignKey(Bet, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"
    
    class Meta:
        ordering = ['-created_at']


class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPES = [
        ('bet_invite', 'Bet Invitation'),
        ('bet_result', 'Bet Result'),
        ('friend_request', 'Friend Request'),
        ('mission_complete', 'Mission Completed'),
        ('system', 'System Notification'),
        ('ai_recommendation', 'AI Recommendation'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=100)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_bet = models.ForeignKey(Bet, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.notification_type} - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']


class Friendship(models.Model):
    """User friendships"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_sent')
    addressee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendship_requests_received')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.requester.username} -> {self.addressee.username} ({self.status})"
    
    class Meta:
        unique_together = ('requester', 'addressee')


class ConsentLog(models.Model):
    """Logs user consent for legal compliance"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consent_logs')
    agb_consent = models.BooleanField()
    privacy_consent = models.BooleanField()
    consent_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.consent_date.strftime('%Y-%m-%d %H:%M:%S')}"
    
    class Meta:
        ordering = ['-consent_date']


class UserBehavior(models.Model):
    """Tracks user behavior for AI recommendations"""
    BEHAVIOR_TYPES = [
        ('bet_placed', 'Bet Placed'),
        ('bet_viewed', 'Bet Viewed'),
        ('bet_liked', 'Bet Liked'),
        ('mission_completed', 'Mission Completed'),
        ('social_post', 'Social Post Created'),
        ('comment', 'Comment Created'),
        ('app_opened', 'App Opened'),
        ('time_spent', 'Time Spent in App'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='behaviors')
    behavior_type = models.CharField(max_length=20, choices=BEHAVIOR_TYPES)
    value = models.FloatField(default=1.0)  # Numeric value associated with behavior
    created_at = models.DateTimeField(auto_now_add=True)
    related_bet = models.ForeignKey(Bet, on_delete=models.SET_NULL, null=True, blank=True)
    related_mission = models.ForeignKey(Mission, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.behavior_type} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
    
    class Meta:
        ordering = ['-created_at']


class AIRecommendation(models.Model):
    """Stores AI-generated recommendations for users"""
    RECOMMENDATION_TYPES = [
        ('bet', 'Bet Recommendation'),
        ('mission', 'Mission Recommendation'),
        ('friend', 'Friend Recommendation'),
        ('content', 'Content Recommendation'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_recommendations')
    recommendation_type = models.CharField(max_length=20, choices=RECOMMENDATION_TYPES)
    score = models.FloatField()  # Confidence score of recommendation
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # When recommendation becomes stale
    is_shown = models.BooleanField(default=False)  # Whether shown to user
    is_clicked = models.BooleanField(default=False)  # Whether user interacted with it
    related_bet = models.ForeignKey(Bet, on_delete=models.SET_NULL, null=True, blank=True)
    related_mission = models.ForeignKey(Mission, on_delete=models.SET_NULL, null=True, blank=True)
    related_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recommended_to')
    
    def __str__(self):
        return f"{self.user.username} - {self.recommendation_type} - {self.score}"
    
    class Meta:
        ordering = ['-score', '-created_at']


class AIModel(models.Model):
    """Tracks AI model versions and performance"""
    MODEL_TYPES = [
        ('recommendation', 'Recommendation Model'),
        ('personalization', 'Personalization Model'),
        ('engagement', 'Engagement Model'),
        ('social', 'Social Interaction Model'),
        ('moderation', 'Content Moderation Model'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_type = models.CharField(max_length=20, choices=MODEL_TYPES)
    version = models.CharField(max_length=20)
    accuracy = models.FloatField()  # Model accuracy metric
    created_at = models.DateTimeField(auto_now_add=True)
    last_trained = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    parameters = models.JSONField(default=dict)  # Model hyperparameters
    
    def __str__(self):
        return f"{self.model_type} - v{self.version} - {self.accuracy}"
    
    class Meta:
        ordering = ['-last_trained']
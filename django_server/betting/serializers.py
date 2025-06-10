from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import (
    User, Bet, BetPlacement, SocialPost, Comment, 
    Mission, UserMission, ImpactProject, Transaction,
    Notification, Friendship, Category, MediaFile, ConsentLog,
    UserBehavior, AIRecommendation, AIModel
)

class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = ['id', 'file', 'media_type', 'uploaded_at']


class UserSerializer(serializers.ModelSerializer):
    social_media = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'avatar', 'zest_balance', 
            'points', 'invite_code', 'biography', 'social_media',
            'agb_consent', 'privacy_consent', 'consent_date',
            'prefers_strategic', 'prefers_creative', 'prefers_social',
            'prefers_competitive', 'prefers_quick'
        ]
        read_only_fields = ['zest_balance', 'points', 'invite_code']
    
    def get_social_media(self, obj):
        return {
            'instagram': obj.instagram,
            'twitter': obj.twitter,
            'facebook': obj.facebook,
            'linkedin': obj.linkedin,
            'tiktok': obj.tiktok,
            'youtube': obj.youtube,
            'pinterest': obj.pinterest,
            'snapchat': obj.snapchat,
            'website': obj.website
        }


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'biography', 'instagram', 'twitter', 'facebook', 'linkedin', 
            'tiktok', 'youtube', 'pinterest', 'snapchat', 'website', 'avatar',
            'prefers_strategic', 'prefers_creative', 'prefers_social',
            'prefers_competitive', 'prefers_quick'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    agb_consent = serializers.BooleanField(required=True)
    privacy_consent = serializers.BooleanField(required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 
            'phone_number', 'biography', 'instagram', 'twitter', 
            'facebook', 'linkedin', 'tiktok', 'youtube', 
            'pinterest', 'snapchat', 'website', 'avatar',
            'agb_consent', 'privacy_consent'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'phone_number': {'required': False},
            'biography': {'required': False},
            'instagram': {'required': False},
            'twitter': {'required': False},
            'facebook': {'required': False},
            'linkedin': {'required': False},
            'tiktok': {'required': False},
            'youtube': {'required': False},
            'pinterest': {'required': False},
            'snapchat': {'required': False},
            'website': {'required': False},
            'avatar': {'required': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if not attrs.get('agb_consent'):
            raise serializers.ValidationError({"agb_consent": "You must accept the Terms and Conditions."})
        
        if not attrs.get('privacy_consent'):
            raise serializers.ValidationError({"privacy_consent": "You must accept the Privacy Policy."})
        
        return attrs
    
    def create(self, validated_data):
        agb_consent = validated_data.pop('agb_consent')
        privacy_consent = validated_data.pop('privacy_consent')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Set optional fields if provided
        optional_fields = [
            'phone_number', 'biography', 'instagram', 'twitter', 
            'facebook', 'linkedin', 'tiktok', 'youtube', 
            'pinterest', 'snapchat', 'website', 'avatar'
        ]
        
        for field in optional_fields:
            if field in validated_data:
                setattr(user, field, validated_data[field])
        
        # Set consent fields
        user.agb_consent = agb_consent
        user.privacy_consent = privacy_consent
        user.consent_date = timezone.now()
        
        user.save()
        
        # Create consent log
        request = self.context.get('request')
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT')
        
        ConsentLog.objects.create(
            user=user,
            agb_consent=agb_consent,
            privacy_consent=privacy_consent,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return user


class ConsentUpdateSerializer(serializers.Serializer):
    agb_consent = serializers.BooleanField(required=True)
    privacy_consent = serializers.BooleanField(required=True)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class BetSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    participants_count = serializers.IntegerField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    media_files = MediaFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bet
        fields = [
            'id', 'title', 'description', 'creator', 'creator_username',
            'likes_count', 'participants_count', 'total_pool', 'min_bet', 'max_bet',
            'created_at', 'end_date', 'category', 'category_name', 'image',
            'media_files', 'visibility', 'invited_friends', 'is_resolved', 'winning_prediction',
            'strategic_score', 'creative_score', 'social_score', 'competitive_score', 'quick_score'
        ]
        read_only_fields = ['creator', 'total_pool', 'is_resolved', 'winning_prediction']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['likes_count'] = instance.likes.count()
        representation['participants_count'] = instance.participants.count()
        return representation


class BetPlacementSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    bet_title = serializers.CharField(source='bet.title', read_only=True)
    
    class Meta:
        model = BetPlacement
        fields = [
            'id', 'user', 'username', 'bet', 'bet_title', 'amount',
            'prediction', 'platform_fee', 'charity_donation',
            'created_at', 'is_winner'
        ]
        read_only_fields = ['user', 'is_winner']


class SocialPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    media_files = MediaFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = SocialPost
        fields = [
            'id', 'user', 'username', 'avatar', 'content',
            'likes_count', 'comments_count', 'created_at', 'media_files'
        ]
        read_only_fields = ['user']
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['likes_count'] = instance.likes.count()
        representation['comments_count'] = instance.comments.count()
        return representation


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'username', 'avatar', 'content', 'created_at']
        read_only_fields = ['user']


class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = ['id', 'title', 'description', 'reward', 'created_at']


class UserMissionSerializer(serializers.ModelSerializer):
    mission_title = serializers.CharField(source='mission.title', read_only=True)
    mission_description = serializers.CharField(source='mission.description', read_only=True)
    mission_reward = serializers.IntegerField(source='mission.reward', read_only=True)
    
    class Meta:
        model = UserMission
        fields = [
            'id', 'user', 'mission', 'mission_title', 'mission_description',
            'mission_reward', 'status', 'completed_at'
        ]
        read_only_fields = ['user', 'mission', 'completed_at']


class ImpactProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImpactProject
        fields = [
            'id', 'name', 'description', 'amount', 'image',
            'featured', 'end_date', 'created_at'
        ]


class TransactionSerializer(serializers.ModelSerializer):
    bet_title = serializers.CharField(source='related_bet.title', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'amount', 'transaction_type',
            'description', 'created_at', 'related_bet', 'bet_title'
        ]
        read_only_fields = ['user']


class NotificationSerializer(serializers.ModelSerializer):
    bet_title = serializers.CharField(source='related_bet.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'notification_type',
            'is_read', 'created_at', 'related_bet', 'bet_title'
        ]
        read_only_fields = ['user']


class FriendshipSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    addressee_username = serializers.CharField(source='addressee.username', read_only=True)
    
    class Meta:
        model = Friendship
        fields = [
            'id', 'requester', 'requester_username', 'addressee',
            'addressee_username', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['requester', 'status', 'updated_at']


class InviteSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False)
    
    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone_number'):
            raise serializers.ValidationError("Either email or phone number is required")
        return attrs


class ConsentLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ConsentLog
        fields = [
            'id', 'user', 'username', 'agb_consent', 'privacy_consent',
            'consent_date', 'ip_address', 'user_agent'
        ]
        read_only_fields = ['user', 'consent_date', 'ip_address', 'user_agent']


class UserBehaviorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserBehavior
        fields = [
            'id', 'user', 'username', 'behavior_type', 'value',
            'created_at', 'related_bet', 'related_mission'
        ]
        read_only_fields = ['user', 'created_at']


class AIRecommendationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    bet_title = serializers.CharField(source='related_bet.title', read_only=True)
    mission_title = serializers.CharField(source='related_mission.title', read_only=True)
    recommended_user = serializers.CharField(source='related_user.username', read_only=True)
    
    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'user', 'username', 'recommendation_type', 'score',
            'created_at', 'expires_at', 'is_shown', 'is_clicked',
            'related_bet', 'bet_title', 'related_mission', 'mission_title',
            'related_user', 'recommended_user'
        ]
        read_only_fields = ['user', 'created_at', 'score']


class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = [
            'id', 'model_type', 'version', 'accuracy',
            'created_at', 'last_trained', 'is_active', 'parameters'
        ]
        read_only_fields = ['created_at']
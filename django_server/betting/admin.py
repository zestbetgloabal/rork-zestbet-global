from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Bet, BetPlacement, SocialPost, Comment, 
    Mission, UserMission, ImpactProject, Transaction,
    Notification, Friendship, Category, MediaFile
)

# Custom User Admin
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'zest_balance', 'points', 'invite_code', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('ZestBet Info', {'fields': (
            'avatar', 'zest_balance', 'points', 'invite_code', 
            'daily_bet_amount', 'last_bet_date', 'phone_number', 
            'is_phone_verified', 'biography', 'instagram', 
            'twitter', 'facebook', 'linkedin', 'website'
        )}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('ZestBet Info', {'fields': (
            'avatar', 'zest_balance', 'points', 'invite_code', 
            'phone_number', 'biography', 'instagram', 
            'twitter', 'facebook', 'linkedin', 'website'
        )}),
    )

admin.site.register(User, CustomUserAdmin)

# Media File Admin
@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'media_type', 'file', 'uploaded_at')
    list_filter = ('media_type', 'uploaded_at')
    search_fields = ('id', 'file')

# Bet Admin
class BetPlacementInline(admin.TabularInline):
    model = BetPlacement
    extra = 0

@admin.register(Bet)
class BetAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'category', 'total_pool', 'end_date', 'visibility', 'is_resolved')
    list_filter = ('category', 'visibility', 'is_resolved', 'created_at')
    search_fields = ('title', 'description', 'creator__username')
    inlines = [BetPlacementInline]
    filter_horizontal = ('media_files',)

@admin.register(BetPlacement)
class BetPlacementAdmin(admin.ModelAdmin):
    list_display = ('user', 'bet', 'amount', 'prediction', 'is_winner', 'created_at')
    list_filter = ('is_winner', 'created_at')
    search_fields = ('user__username', 'bet__title', 'prediction')

# Social Post Admin
class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0

@admin.register(SocialPost)
class SocialPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_preview', 'likes_count', 'comments_count', 'created_at')
    search_fields = ('user__username', 'content')
    inlines = [CommentInline]
    filter_horizontal = ('media_files',)
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    def likes_count(self, obj):
        return obj.likes.count()
    
    def comments_count(self, obj):
        return obj.comments.count()

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'post', 'content_preview', 'created_at')
    search_fields = ('user__username', 'content')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content

# Mission Admin
class UserMissionInline(admin.TabularInline):
    model = UserMission
    extra = 0

@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ('title', 'reward', 'created_at')
    search_fields = ('title', 'description')
    inlines = [UserMissionInline]

@admin.register(UserMission)
class UserMissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'mission', 'status', 'completed_at')
    list_filter = ('status', 'completed_at')
    search_fields = ('user__username', 'mission__title')

# Impact Project Admin
@admin.register(ImpactProject)
class ImpactProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'featured', 'end_date', 'created_at')
    list_filter = ('featured', 'created_at')
    search_fields = ('name', 'description')

# Transaction Admin
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'description', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'description')

# Notification Admin
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')

# Friendship Admin
@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ('requester', 'addressee', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('requester__username', 'addressee__username')

# Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
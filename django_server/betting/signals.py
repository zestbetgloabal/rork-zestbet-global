from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Bet, Notification, User, Mission, UserMission

@receiver(post_save, sender=Bet)
def create_bet_notifications(sender, instance, created, **kwargs):
    """Create notifications when a new bet is created"""
    if created:
        # Notify invited friends
        for friend in instance.invited_friends.all():
            Notification.objects.create(
                user=friend,
                title='New Bet Invitation',
                message=f'{instance.creator.username} invited you to bet on "{instance.title}"',
                notification_type='bet_invite',
                related_bet=instance
            )

@receiver(post_save, sender=User)
def create_user_missions(sender, instance, created, **kwargs):
    """Create initial missions for new users"""
    if created:
        missions = Mission.objects.all()
        for mission in missions:
            UserMission.objects.create(user=instance, mission=mission)
from django.core.management.base import BaseCommand
from betting.models import User
import os

class Command(BaseCommand):
    help = 'Creates a superuser for AWS Elastic Beanstalk deployment'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            admin_password = os.environ.get('DJANGO_ADMIN_PASSWORD', 'zestbetadmin')
            User.objects.create_superuser(
                username='admin',
                email='admin@zestbet.com',
                password=admin_password
            )
            self.stdout.write(self.style.SUCCESS('Superuser created successfully'))
        else:
            self.stdout.write(self.style.SUCCESS('Superuser already exists'))
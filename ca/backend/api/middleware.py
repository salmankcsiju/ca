import threading
from django.core.management import call_command
from django.db import connection

class StartupMiddleware:
    _lock = threading.Lock()
    _has_run = False

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not StartupMiddleware._has_run:
            with StartupMiddleware._lock:
                if not StartupMiddleware._has_run:
                    self.run_startup_tasks()
                    StartupMiddleware._has_run = True
        return self.get_response(request)

    def run_startup_tasks(self):
        try:
            # Close connection to prevent issues with thread sharing
            connection.close()

            # 1. Run migrations
            call_command('migrate', interactive=False)
            
            # 2. Seed database if empty
            from api.models import Product
            if Product.objects.count() == 0:
                call_command('seed')
                
            # 3. Create or update superuser
            from django.contrib.auth import get_user_model
            from django.conf import settings
            User = get_user_model()
            
            username = getattr(settings, 'SUPERUSER_USERNAME', 'salman')
            email = getattr(settings, 'SUPERUSER_EMAIL', 'salmankcsiju@gmail.com')
            password = getattr(settings, 'SUPERUSER_PASSWORD', 'sumi')
            phone_number = getattr(settings, 'SUPERUSER_PHONE', '7356198300')

            user = User.objects.filter(username=username).first()
            if not user:
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                    phone_number=phone_number
                )
            else:
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.save()
        except Exception as e:
            print(f"Error during startup tasks: {e}")

from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # 1. Run migrations and seed the database if it is empty (crucial for stateless SQLite on Render)
        try:
            from django.core.management import call_command
            call_command('migrate', interactive=False)
            
            # Check if we should seed the database
            from api.models import Product
            if Product.objects.count() == 0:
                call_command('seed')
        except Exception:
            pass

        # 2. Ensure superuser exists and has correct password/credentials
        try:
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
        except Exception:
            pass




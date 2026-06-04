from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
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



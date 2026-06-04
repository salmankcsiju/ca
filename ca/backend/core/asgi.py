"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_asgi_application()

try:
    from django.core.management import call_command
    call_command('migrate', interactive=False)
    
    from api.models import Product
    if Product.objects.count() == 0:
        call_command('seed')
except Exception as e:
    print(f"Error during ASGI startup migration/seed: {e}")


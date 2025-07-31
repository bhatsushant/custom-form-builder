# backend/asgi.py
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

# For now, just use the standard ASGI application
# WebSocket functionality can be added later
application = get_asgi_application()
# core/routing.py
from django.urls import path
from ..websockets import consumers

websocket_urlpatterns = [
    path("ws/form/<slug:slug>/", consumers.AnalyticsConsumer.as_asgi()),
]

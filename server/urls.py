# backend/urls.py
from django.urls import path, include

urlpatterns = [
    path('api/', include('form_builder.urls')),
    path('api/', include('analytics.urls')),
]
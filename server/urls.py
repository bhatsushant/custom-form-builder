# backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('form_builder.urls')),
    path('api/', include('analytics.urls')),
]
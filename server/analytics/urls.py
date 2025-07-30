# analytics/urls.py
from django.urls import path
from .views import AnalyticsView

urlpatterns = [
    path('analytics/', AnalyticsView.as_view(), name='global-analytics'),
    path('analytics/<str:form_id>/', AnalyticsView.as_view(), name='form-analytics'),
]
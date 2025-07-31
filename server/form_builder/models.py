# form_builder/models.py
from django.db import models
import uuid
from datetime import datetime

class FormField(models.Model):
    field_id = models.CharField(max_length=100)
    field_type = models.CharField(max_length=50)
    label = models.CharField(max_length=255)
    required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)
    validation = models.JSONField(default=dict, blank=True)
    
    class Meta:
        abstract = True

class Form(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    fields = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class FormResponse(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='responses')
    responses = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['form']),
            models.Index(fields=['submitted_at']),
        ]
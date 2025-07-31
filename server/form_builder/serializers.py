# form_builder/serializers.py
from rest_framework import serializers
from .models import Form, FormResponse

class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = ['id', 'title', 'description', 'fields', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class FormResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormResponse
        fields = ['id', 'form', 'responses', 'submitted_at', 'ip_address']
        read_only_fields = ['id', 'submitted_at', 'ip_address']
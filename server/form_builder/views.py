# form_builder/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from .models import Form, FormResponse
from .serializers import FormSerializer, FormResponseSerializer

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=True, methods=['post'])
    def responses(self, request, pk=None):
        form = get_object_or_404(Form, pk=pk)
        
        # Create response
        response_data = {
            'form_id': form.id,
            'responses': request.data.get('responses', {}),
            'ip_address': self.get_client_ip(request)
        }
        
        serializer = FormResponseSerializer(data=response_data)
        if serializer.is_valid():
            response_obj = serializer.save()
            
            # Send real-time notification
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'analytics',
                {
                    'type': 'new_response',
                    'message': {
                        'form_id': form.id,
                        'form_title': form.title,
                        'response_id': str(response_obj.id),
                        'submitted_at': response_obj.submitted_at.isoformat()
                    }
                }
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def get_responses(self, request, pk=None):
        form = get_object_or_404(Form, pk=pk)
        responses = FormResponse.objects.filter(form_id=form.id).order_by('-submitted_at')
        serializer = FormResponseSerializer(responses, many=True)
        return Response(serializer.data)
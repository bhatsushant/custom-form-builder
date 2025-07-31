# dual_backend_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from form_builder.models import Form, FormResponse
from form_builder.serializers import FormSerializer, FormResponseSerializer
import os

# Try to import MongoDB service
try:
    from mongodb_service import mongodb_service
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False

class DualBackendFormViewSet(viewsets.ModelViewSet):
    """
    A ViewSet that can work with either SQLite (Django ORM) or MongoDB
    depending on the USE_MONGODB setting
    """
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def use_mongodb(self):
        """Check if we should use MongoDB backend"""
        return getattr(settings, 'USE_MONGODB', False) and MONGODB_AVAILABLE
    
    def list(self, request):
        """List all forms"""
        if self.use_mongodb():
            forms = mongodb_service.get_all_forms()
            return Response(forms)
        else:
            # Use Django ORM
            return super().list(request)
    
    def create(self, request):
        """Create a new form"""
        if self.use_mongodb():
            form_id = mongodb_service.create_form(
                title=request.data.get('title'),
                description=request.data.get('description'),
                fields=request.data.get('fields', [])
            )
            form = mongodb_service.get_form(form_id)
            return Response(form, status=status.HTTP_201_CREATED)
        else:
            # Use Django ORM
            return super().create(request)
    
    def retrieve(self, request, pk=None):
        """Get a specific form"""
        if self.use_mongodb():
            form = mongodb_service.get_form(pk)
            if form:
                return Response(form)
            else:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Use Django ORM
            return super().retrieve(request, pk)
    
    def update(self, request, pk=None):
        """Update a form"""
        if self.use_mongodb():
            success = mongodb_service.update_form(
                form_id=pk,
                title=request.data.get('title'),
                description=request.data.get('description'),
                fields=request.data.get('fields')
            )
            if success:
                form = mongodb_service.get_form(pk)
                return Response(form)
            else:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Use Django ORM
            return super().update(request, pk)
    
    def destroy(self, request, pk=None):
        """Delete a form"""
        if self.use_mongodb():
            success = mongodb_service.delete_form(pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Use Django ORM
            return super().destroy(request, pk)
    
    @action(detail=True, methods=['post'])
    def responses(self, request, pk=None):
        """Submit a response to a form"""
        if self.use_mongodb():
            # Check if form exists
            form = mongodb_service.get_form(pk)
            if not form:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Create response
            response_id = mongodb_service.create_response(
                form_id=pk,
                responses=request.data.get('responses', {}),
                ip_address=self.get_client_ip(request)
            )
            
            if response_id:
                # Send real-time notification
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    'analytics',
                    {
                        'type': 'new_response',
                        'message': {
                            'form_id': pk,
                            'form_title': form['title'],
                            'response_id': response_id,
                            'submitted_at': form.get('submitted_at', '')
                        }
                    }
                )
                
                return Response({'id': response_id, 'message': 'Response submitted successfully'}, 
                              status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Failed to create response'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        else:
            # Use Django ORM
            form = get_object_or_404(Form, pk=pk)
            
            # Create response
            response_data = {
                'form': form,
                'responses': request.data.get('responses', {}),
                'ip_address': self.get_client_ip(request)
            }
            
            response_obj = FormResponse.objects.create(**response_data)
            
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
            
            serializer = FormResponseSerializer(response_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def get_responses(self, request, pk=None):
        """Get all responses for a form"""
        if self.use_mongodb():
            form = mongodb_service.get_form(pk)
            if not form:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
            
            responses = mongodb_service.get_form_responses(pk)
            return Response(responses)
        else:
            # Use Django ORM
            form = get_object_or_404(Form, pk=pk)
            responses = FormResponse.objects.filter(form=form).order_by('-submitted_at')
            serializer = FormResponseSerializer(responses, many=True)
            return Response(serializer.data)

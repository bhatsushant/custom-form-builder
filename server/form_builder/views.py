# form_builder/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from mongodb_service import mongodb_service

class FormViewSet(viewsets.ViewSet):
    """
    MongoDB-only ViewSet for Form operations
    """
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def list(self, request):
        """List all forms"""
        forms = mongodb_service.get_all_forms()
        return Response(forms)
    
    def create(self, request):
        """Create a new form"""
        try:
            form_id = mongodb_service.create_form(
                title=request.data.get('title'),
                description=request.data.get('description'),
                fields=request.data.get('fields', [])
            )
            form = mongodb_service.get_form(form_id)
            return Response(form, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Get a specific form"""
        form = mongodb_service.get_form(pk)
        if form:
            return Response(form)
        else:
            return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def update(self, request, pk=None):
        """Update a form"""
        try:
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
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, pk=None):
        """Delete a form"""
        try:
            success = mongodb_service.delete_form(pk)
            if success:
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def responses(self, request, pk=None):
        """Submit a response to a form"""
        try:
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
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        'analytics',
                        {
                            'type': 'new_response',
                            'message': {
                                'form_id': pk,
                                'form_title': form['title'],
                                'response_id': response_id,
                                'submitted_at': response_id  # Will be updated with proper timestamp
                            }
                        }
                    )
                
                return Response({
                    'id': response_id, 
                    'message': 'Response submitted successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Failed to create response'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def get_responses(self, request, pk=None):
        """Get all responses for a form"""
        try:
            form = mongodb_service.get_form(pk)
            if not form:
                return Response({'error': 'Form not found'}, status=status.HTTP_404_NOT_FOUND)
            
            responses = mongodb_service.get_form_responses(pk)
            return Response(responses)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
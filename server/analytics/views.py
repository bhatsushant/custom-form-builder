# analytics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from form_builder.models import Form, FormResponse
from django.db.models import Count
from collections import defaultdict, Counter
import json

class AnalyticsView(APIView):
    def get(self, request, form_id=None):
        if form_id:
            return self.get_form_analytics(form_id)
        else:
            return self.get_global_analytics()
    
    def get_global_analytics(self):
        total_forms = Form.objects.count()
        total_responses = FormResponse.objects.count()
        
        # Responses by form
        responses_by_form = []
        for form in Form.objects.all():
            response_count = FormResponse.objects.filter(form_id=form.id).count()
            responses_by_form.append({
                'formTitle': form.title,
                'responseCount': response_count
            })
        
        # Recent responses
        recent_responses = []
        for response in FormResponse.objects.select_related('form').order_by('-submitted_at')[:20]:
            recent_responses.append({
                'formTitle': response.form.title,
                'submittedAt': response.submitted_at.isoformat()
            })
        
        return Response({
            'totalForms': total_forms,
            'totalResponses': total_responses,
            'responsesByForm': responses_by_form,
            'fieldAnalytics': [],
            'recentResponses': recent_responses
        })
    
    def get_form_analytics(self, form_id):
        try:
            form = Form.objects.get(id=form_id)
        except Form.DoesNotExist:
            return Response({'error': 'Form not found'}, status=404)
        
        responses = FormResponse.objects.filter(form=form)
        total_responses = responses.count()
        
        # Field analytics
        field_analytics = []
        for field in form.fields:
            field_responses = []
            for response in responses:
                if field['id'] in response.responses:
                    field_responses.append(response.responses[field['id']])
            
            field_analytics.append({
                'fieldLabel': field['label'],
                'fieldType': field['type'],
                'responses': field_responses
            })

        recent_responses = [{
            'formTitle': form.title,
            'submittedAt': response.submitted_at.isoformat()
        } for response in responses.order_by('-submitted_at')[:10]]
        
        return Response({
            'totalForms': 1,
            'totalResponses': total_responses,
            'responsesByForm': [{
                'formTitle': form.title,
                'responseCount': total_responses
            }],
            'fieldAnalytics': field_analytics,
            'recentResponses': recent_responses
        })
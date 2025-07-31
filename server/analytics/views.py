# analytics/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from mongodb_service import mongodb_service

class AnalyticsView(APIView):
    def get(self, request, form_id=None):
        if form_id:
            return self.get_form_analytics(form_id)
        else:
            return self.get_global_analytics()
    
    def get_global_analytics(self):
        """Get global analytics from MongoDB"""
        try:
            analytics_data = mongodb_service.get_analytics_data()
            return Response(analytics_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def get_form_analytics(self, form_id):
        """Get analytics for a specific form from MongoDB"""
        try:
            analytics_data = mongodb_service.get_analytics_data(form_id=form_id)
            if analytics_data:
                return Response(analytics_data)
            else:
                return Response({'error': 'Form not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
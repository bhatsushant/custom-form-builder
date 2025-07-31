# form_builder/models.py
"""
MongoDB-only models using the mongodb_service
This file maintains Django's expected structure but delegates to MongoDB
"""

class Form:
    """MongoDB Form model interface"""
    
    @staticmethod
    def objects():
        from mongodb_service import mongodb_service
        return FormManager(mongodb_service)

class FormResponse:
    """MongoDB FormResponse model interface"""
    
    @staticmethod
    def objects():
        from mongodb_service import mongodb_service
        return FormResponseManager(mongodb_service)

class FormManager:
    """Manager for Form operations in MongoDB"""
    
    def __init__(self, mongodb_service):
        self.mongodb_service = mongodb_service
    
    def all(self):
        return self.mongodb_service.get_all_forms()
    
    def get(self, **kwargs):
        if 'pk' in kwargs:
            return self.mongodb_service.get_form(kwargs['pk'])
        elif '_id' in kwargs:
            return self.mongodb_service.get_form(kwargs['_id'])
        elif 'id' in kwargs:
            return self.mongodb_service.get_form(kwargs['id'])
        return None
    
    def create(self, **kwargs):
        form_id = self.mongodb_service.create_form(
            title=kwargs.get('title'),
            description=kwargs.get('description'),
            fields=kwargs.get('fields', [])
        )
        return self.mongodb_service.get_form(form_id)
    
    def filter(self, **kwargs):
        # For compatibility, return all forms for now
        return self.all()
    
    def count(self):
        return len(self.all())

class FormResponseManager:
    """Manager for FormResponse operations in MongoDB"""
    
    def __init__(self, mongodb_service):
        self.mongodb_service = mongodb_service
    
    def filter(self, **kwargs):
        if 'form_id' in kwargs:
            return self.mongodb_service.get_form_responses(kwargs['form_id'])
        return []
    
    def create(self, **kwargs):
        response_id = self.mongodb_service.create_response(
            form_id=kwargs.get('form_id'),
            responses=kwargs.get('responses', {}),
            ip_address=kwargs.get('ip_address')
        )
        return {'id': response_id}
    
    def count(self):
        # Get total count across all forms
        all_forms = self.mongodb_service.get_all_forms()
        total = 0
        for form in all_forms:
            total += len(self.mongodb_service.get_form_responses(form['id']))
        return total
    
    def order_by(self, field):
        return self  # For compatibility
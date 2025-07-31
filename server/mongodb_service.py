# mongodb_service.py
import pymongo
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
import json

class MongoDBService:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
        self.db = self.client['form_builder_db']
        self.forms_collection = self.db['forms']
        self.responses_collection = self.db['form_responses']
    
    def create_form(self, title, description, fields):
        """Create a new form in MongoDB"""
        form_data = {
            'title': title,
            'description': description,
            'fields': fields,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.forms_collection.insert_one(form_data)
        return str(result.inserted_id)
    
    def get_form(self, form_id):
        """Get a form by ID"""
        try:
            form = self.forms_collection.find_one({'_id': ObjectId(form_id)})
            if form:
                form['id'] = str(form['_id'])
                del form['_id']
                # Convert datetime objects to ISO format
                form['created_at'] = form['created_at'].isoformat() if form.get('created_at') else None
                form['updated_at'] = form['updated_at'].isoformat() if form.get('updated_at') else None
            return form
        except Exception as e:
            print(f"Error getting form: {e}")
            return None
    
    def get_all_forms(self):
        """Get all forms"""
        forms = []
        for form in self.forms_collection.find():
            form['id'] = str(form['_id'])
            del form['_id']
            # Convert datetime objects to ISO format
            form['created_at'] = form['created_at'].isoformat() if form.get('created_at') else None
            form['updated_at'] = form['updated_at'].isoformat() if form.get('updated_at') else None
            forms.append(form)
        return forms
    
    def update_form(self, form_id, title=None, description=None, fields=None):
        """Update a form"""
        try:
            update_data = {'updated_at': datetime.utcnow()}
            if title is not None:
                update_data['title'] = title
            if description is not None:
                update_data['description'] = description
            if fields is not None:
                update_data['fields'] = fields
            
            result = self.forms_collection.update_one(
                {'_id': ObjectId(form_id)},
                {'$set': update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            print(f"Error updating form: {e}")
            return False
    
    def delete_form(self, form_id):
        """Delete a form and all its responses"""
        try:
            # Delete all responses for this form first
            self.responses_collection.delete_many({'form_id': form_id})
            # Delete the form
            result = self.forms_collection.delete_one({'_id': ObjectId(form_id)})
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error deleting form: {e}")
            return False
    
    def create_response(self, form_id, responses, ip_address=None):
        """Create a new form response"""
        try:
            response_data = {
                'form_id': form_id,
                'responses': responses,
                'submitted_at': datetime.utcnow(),
                'ip_address': ip_address
            }
            result = self.responses_collection.insert_one(response_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error creating response: {e}")
            return None
    
    def get_form_responses(self, form_id):
        """Get all responses for a form"""
        responses = []
        for response in self.responses_collection.find({'form_id': form_id}).sort('submitted_at', -1):
            response['id'] = str(response['_id'])
            del response['_id']
            # Convert datetime to ISO format
            response['submitted_at'] = response['submitted_at'].isoformat() if response.get('submitted_at') else None
            responses.append(response)
        return responses
    
    def get_response_count(self, form_id):
        """Get the count of responses for a form"""
        return self.responses_collection.count_documents({'form_id': form_id})
    
    def get_all_responses(self):
        """Get all form responses with form information"""
        responses = []
        for response in self.responses_collection.find().sort('submitted_at', -1).limit(20):
            # Get form information
            form = self.forms_collection.find_one({'_id': ObjectId(response['form_id'])})
            response['id'] = str(response['_id'])
            del response['_id']
            response['form_title'] = form['title'] if form else 'Unknown Form'
            response['submitted_at'] = response['submitted_at'].isoformat() if response.get('submitted_at') else None
            responses.append(response)
        return responses
    
    def get_analytics_data(self, form_id=None):
        """Get analytics data for forms"""
        if form_id:
            # Form-specific analytics
            form = self.get_form(form_id)
            if not form:
                return None
            
            responses = self.get_form_responses(form_id)
            total_responses = len(responses)
            
            # Field analytics
            field_analytics = []
            for field in form.get('fields', []):
                field_responses = []
                for response in responses:
                    if field['id'] in response.get('responses', {}):
                        field_responses.append(response['responses'][field['id']])
                
                field_analytics.append({
                    'fieldLabel': field['label'],
                    'fieldType': field['type'],
                    'responses': field_responses
                })
            
            return {
                'totalForms': 1,
                'totalResponses': total_responses,
                'responsesByForm': [{
                    'formTitle': form['title'],
                    'responseCount': total_responses
                }],
                'fieldAnalytics': field_analytics,
                'recentResponses': responses[:10]
            }
        else:
            # Global analytics
            forms = self.get_all_forms()
            total_forms = len(forms)
            total_responses = self.responses_collection.count_documents({})
            
            responses_by_form = []
            for form in forms:
                response_count = self.get_response_count(form['id'])
                responses_by_form.append({
                    'formTitle': form['title'],
                    'responseCount': response_count
                })
            
            recent_responses = self.get_all_responses()
            
            return {
                'totalForms': total_forms,
                'totalResponses': total_responses,
                'responsesByForm': responses_by_form,
                'fieldAnalytics': [],
                'recentResponses': recent_responses
            }

# Singleton instance
mongodb_service = MongoDBService()

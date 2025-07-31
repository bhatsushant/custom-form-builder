# sync_to_mongodb.py
from django.core.management.base import BaseCommand
from form_builder.models import Form, FormResponse
import sys
import os

# Add the parent directory to the path to import mongodb_service
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

try:
    from mongodb_service import mongodb_service
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    print("MongoDB service not available. Install pymongo to use MongoDB features.")

class Command(BaseCommand):
    help = 'Sync data from SQLite to MongoDB'

    def add_arguments(self, parser):
        parser.add_argument(
            '--direction',
            type=str,
            choices=['to-mongo', 'from-mongo'],
            default='to-mongo',
            help='Direction to sync data (to-mongo or from-mongo)'
        )

    def handle(self, *args, **options):
        if not MONGODB_AVAILABLE:
            self.stdout.write(
                self.style.ERROR('MongoDB service not available. Install pymongo first.')
            )
            return

        direction = options['direction']

        if direction == 'to-mongo':
            self.sync_to_mongodb()
        elif direction == 'from-mongo':
            self.sync_from_mongodb()

    def sync_to_mongodb(self):
        """Sync data from SQLite to MongoDB"""
        self.stdout.write('Syncing data from SQLite to MongoDB...')
        
        # Sync forms
        forms = Form.objects.all()
        synced_forms = 0
        
        for form in forms:
            try:
                mongo_id = mongodb_service.create_form(
                    title=form.title,
                    description=form.description,
                    fields=form.fields
                )
                self.stdout.write(f'Synced form "{form.title}" to MongoDB with ID: {mongo_id}')
                synced_forms += 1
                
                # Sync responses for this form
                responses = FormResponse.objects.filter(form=form)
                synced_responses = 0
                
                for response in responses:
                    response_id = mongodb_service.create_response(
                        form_id=mongo_id,
                        responses=response.responses,
                        ip_address=response.ip_address
                    )
                    if response_id:
                        synced_responses += 1
                
                self.stdout.write(f'Synced {synced_responses} responses for form "{form.title}"')
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error syncing form "{form.title}": {e}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully synced {synced_forms} forms to MongoDB')
        )

    def sync_from_mongodb(self):
        """Sync data from MongoDB to SQLite"""
        self.stdout.write('Syncing data from MongoDB to SQLite...')
        
        # Get all forms from MongoDB
        mongo_forms = mongodb_service.get_all_forms()
        synced_forms = 0
        
        for mongo_form in mongo_forms:
            try:
                # Create or update form in SQLite
                form, created = Form.objects.get_or_create(
                    title=mongo_form['title'],
                    defaults={
                        'description': mongo_form['description'],
                        'fields': mongo_form['fields']
                    }
                )
                
                if created:
                    self.stdout.write(f'Created form "{form.title}" in SQLite')
                    synced_forms += 1
                else:
                    self.stdout.write(f'Form "{form.title}" already exists in SQLite')
                
                # Sync responses
                mongo_responses = mongodb_service.get_form_responses(mongo_form['id'])
                synced_responses = 0
                
                for mongo_response in mongo_responses:
                    # Check if response already exists (by comparing data)
                    existing = FormResponse.objects.filter(
                        form=form,
                        responses=mongo_response['responses']
                    ).first()
                    
                    if not existing:
                        FormResponse.objects.create(
                            form=form,
                            responses=mongo_response['responses'],
                            ip_address=mongo_response.get('ip_address')
                        )
                        synced_responses += 1
                
                self.stdout.write(f'Synced {synced_responses} new responses for form "{form.title}"')
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error syncing form from MongoDB: {e}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully synced {synced_forms} forms from MongoDB')
        )

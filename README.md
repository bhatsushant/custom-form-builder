# Custom Form Builder

## 🚀 Overview

This is a comprehensive full-stack custom form builder application built with **Next.js 15** (Frontend), **Django 5.2** (Backend), and **MongoDB** database. It features real-time analytics, custom form logic, drag-and-drop functionality, live data updates, and seamless API integration between frontend and backend.

## 🏗️ Architecture

### Full-Stack Technology Stack

**Frontend:**

- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS for styling
- Chart.js for analytics visualization
- Custom hooks for state management

**Backend:**

- Django 5.2 with Django REST Framework
- **MongoDB**: NoSQL document database with custom service layer
- CORS enabled for frontend communication
- RESTful API endpoints
- Real-time WebSocket infrastructure (ready for implementation)

**Database:**

- **MongoDB**: High-performance NoSQL document database
- Custom service layer for optimal MongoDB operations
- Scalable document-based data storage
- Built-in data validation and error handling

**Integration:**

- HTTP REST API communication
- Persistent data storage in MongoDB
- Error handling with localStorage fallback
- CORS configuration for cross-origin requests

## 🗄️ Database Setup

### MongoDB Installation & Configuration

1. **Install MongoDB Community Edition**:

   ```bash
   # Follow instructions at: https://docs.mongodb.com/manual/installation/
   # Or use Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Start MongoDB Service**:

   ```bash
   # On Windows
   net start MongoDB

   # On macOS/Linux
   sudo systemctl start mongod

   # Or using Docker
   docker start mongodb
   ```

3. **Install Python Dependencies**:

   ```bash
   cd server
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables** (Optional):
   Create a `.env` file in the server directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/
   MONGODB_DB_NAME=form_builder_db
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ```

5. **Start the Application**:

   ```bash
   # Backend (MongoDB + Django)
   cd server
   python manage.py runserver 8000

   # Frontend (Next.js)
   cd client
   npm run dev
   ```

### MongoDB Connection Details

- **Default URI**: `mongodb://localhost:27017/`
- **Database Name**: `form_builder_db`
- **Collections**: `forms`, `form_responses`
- **Automatic Setup**: Database and collections are created automatically

## ✨ Features Implemented

### 🎨 Form Builder

- **Drag-and-Drop Interface**: Reorder form fields with native HTML5 drag and drop
- **Field Types**: Text, Multiple Choice, Checkboxes, and Rating fields
- **Field Validation**: Custom validation rules including:
  - Required fields
  - Minimum/Maximum length for text fields
  - Pattern matching (regex support)
- **MongoDB Persistence**: Forms are saved to MongoDB via Django REST API
- **Document Storage**: Efficient NoSQL document-based storage
- **Auto-Fallback**: LocalStorage backup when API is unavailable
- **Save Drafts**: Auto-save and manual save functionality with backend integration
- **Live Preview**: Real-time preview of forms as you build them
- **Easy Navigation**: Back to home button and quick action buttons in header

### 📊 Analytics Dashboard

- **Real-Time Backend Data**: Charts powered by actual database responses
- **API Integration**: Live data fetched from Django REST endpoints
- **Visual Charts**: Built with Chart.js
  - Bar charts for multiple choice responses
  - Pie charts for checkbox distributions
  - Line charts for response trends over time
  - Star ratings with averages
- **Response Trends**: 7-day response trend visualization with real data
- **Summary Statistics**: Total responses, average ratings, latest response time
- **Recent Responses**: Live feed of actual form submissions from database
- **Quick Actions**: Direct access to form filling and form building

### 🔄 Backend Integration

- **Django REST API**: Full CRUD operations for forms and responses
- **Database Models**: Proper relational models for forms and responses
- **CORS Configuration**: Cross-origin resource sharing for frontend communication
- **Error Handling**: Graceful fallback to localStorage when backend unavailable
- **Data Validation**: Server-side validation with client-side feedback
- **Response Submission**: Form submissions persist to database via API

### 🧭 Navigation & UX

- **Clean Navigation**: Single, optimized navigation bar per page (no duplicates)
- **Smart Display**: Navigation only appears on pages that need it (not on home page)
- **Back to Home**: One-click return to homepage from any page
- **Contextual Actions**: Page-specific action buttons in the navigation
- **Responsive Design**: Mobile-friendly navigation and layouts
- **Loading States**: Proper loading indicators and error handling
- **Breadcrumb Context**: Clear page titles and navigation context

### 🔧 Custom Form Logic

- **No External Form Libraries**: Built from scratch without Formik or React Hook Form
- **Custom Validation Hook**: `useFormValidation` for field-level and form-level validation
- **State Management**: React hooks and Context API with backend synchronization
- **API Integration**: `FormContext` manages both local state and backend communication
- **Real-Time Hook**: `useRealTime` for simulating live updates with real data support

### 🌐 Full-Stack Architecture

- **RESTful API Design**: Django REST Framework endpoints for all operations
- **Database Integration**: SQLite with Django ORM (configurable for production databases)
- **CORS Handling**: Proper cross-origin configuration for development and production
- **Error Resilience**: Automatic fallback mechanisms for offline functionality
- **Data Persistence**: All forms and responses stored in relational database
- **API Documentation**: RESTful endpoints with proper HTTP methods and status codes

## 🏗️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Backend Setup (Django)

1. **Navigate to server directory:**

   ```bash
   cd server
   ```

2. **Install Python dependencies:**

   ```bash
   pip install Django djangorestframework django-cors-headers
   ```

3. **Run database migrations:**

   ```bash
   python manage.py migrate
   ```

4. **Create superuser (optional):**

   ```bash
   python manage.py createsuperuser
   ```

5. **Start Django development server:**
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup (Next.js)

1. **Navigate to client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start Next.js development server:**
   ```bash
   npm run dev
   # or specify port if 3000 is occupied
   npx next dev --port 4000
   ```

### Access the Application

- **Frontend**: http://localhost:3000 (or your specified port)
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 🏗️ Project Structure

### Directory Structure

```
custom-form-builder/
├── client/                  # Next.js Frontend
│   ├── app/
│   │   ├── builder/        # Form builder page
│   │   ├── dashboard/[slug]/   # Analytics dashboard (dynamic route)
│   │   ├── form/[slug]/    # Form submission page (dynamic route)
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── components/     # Reusable components
│   │   └── utils/          # API utilities and helpers
│   ├── package.json        # Frontend dependencies
│   └── next.config.ts      # Next.js configuration
├── server/                 # Django Backend
│   ├── form_builder/       # Django app for forms
│   │   ├── models.py      # Database models
│   │   ├── views.py       # API views
│   │   ├── serializers.py # DRF serializers
│   │   └── urls.py        # App URL patterns
│   ├── analytics/          # Analytics API endpoints
│   ├── websockets/         # WebSocket infrastructure (ready)
│   ├── manage.py          # Django management script
│   ├── settings.py        # Django configuration
│   └── requirements.txt   # Python dependencies
└── README.md              # This file
```

### Key Components

1. **Form Builder (`/builder`)**

   - Drag-and-drop field management
   - Field property editor with backend persistence
   - Form preview mode
   - Auto-save and manual save to Django API

2. **Form Renderer (`/form/[slug]`)**

   - Dynamic form rendering based on database configuration
   - Real-time validation with custom rules
   - Form submission to backend API
   - Success/error states with proper handling

3. **Analytics Dashboard (`/dashboard/[slug]`)**

   - Real-time charts populated from database
   - Response trend analysis from actual data
   - Field-specific analytics with proper aggregation
   - Recent response feed from Django API

4. **Backend API (`Django + DRF`)**

   - RESTful endpoints for form CRUD operations
   - Form response collection and storage
   - Analytics data aggregation and serving
   - CORS configuration for frontend communication

5. **Context & State Management**
   - `FormContext`: Global form state with API integration
   - `useFormValidation`: Custom validation logic
   - `useRealTime`: Real-time update simulation with backend support
   - Error handling and offline fallback mechanisms

## 🎯 Usage Instructions

### 1. Getting Started

1. **Start both servers** (see Development Setup above)
2. **Visit the frontend** at your configured port (e.g., http://localhost:4000)
3. **Sample forms** are automatically created on first API load
4. **Create new forms** or work with existing sample data

### 2. Creating a New Form

1. Click "Create New Form" or navigate to `/builder`
2. Add a title and slug (URL-friendly name)
3. Drag field types from the left panel
4. Configure field properties (click edit icon)
5. Set validation rules and required fields
6. Use "Preview" to test your form
7. Click "Save Form" - **data persists to Django database**

### 3. Filling Out Forms

1. Navigate to `/form/[slug]` or use the "Fill Form" button
2. Complete the form fields with validation feedback
3. Submit to see success confirmation
4. **Response is saved to database via API**
5. Automatic redirect to analytics dashboard

### 4. Viewing Analytics

1. Visit `/dashboard/[slug]` or use "View Analytics" button
2. See **real-time statistics from database**
3. Monitor response trends with actual data
4. View recent submissions fetched from API
5. Charts update automatically with new submissions

## 🔧 Technical Implementation

### API Endpoints

**Forms API:**

- `GET /api/forms/` - List all forms
- `POST /api/forms/` - Create new form
- `GET /api/forms/{id}/` - Get specific form
- `PUT /api/forms/{id}/` - Update form
- `DELETE /api/forms/{id}/` - Delete form
- `POST /api/forms/{id}/responses/` - Submit form response
- `GET /api/forms/{id}/get_responses/` - Get form responses

**Analytics API:**

- `GET /api/analytics/` - Global analytics
- `GET /api/analytics/{form_id}/` - Form-specific analytics

### Database Models

**Form Model:**

```python
class Form(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    fields = models.JSONField(default=list)  # Flexible field definitions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**FormResponse Model:**

```python
class FormResponse(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    responses = models.JSONField(default=dict)  # Flexible response data
    submitted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
```

### State Management Strategy

- **Frontend State**: React Context API with backend synchronization
- **Backend State**: Django ORM with SQLite database
- **Error Handling**: Graceful fallback to localStorage when API unavailable
- **Data Flow**: Frontend ↔ REST API ↔ Database
- **Validation**: Both client-side (immediate feedback) and server-side (data integrity)

### Validation System

- **Field-level validation** with immediate feedback (frontend)
- **Form-level validation** on submission (frontend + backend)
- **Server-side validation** for data integrity (Django)
- **Custom validation rules** per field type with regex support
- **Error state management** with user-friendly messages
- **API error handling** with proper HTTP status codes

### Real-Time Features & WebSocket Ready

- **Database-driven updates**: Analytics refresh with actual data changes
- **Mock real-time simulation**: Demo functionality for development
- **WebSocket infrastructure**: Django Channels ready for implementation
- **Live chart updates** using Chart.js with fresh data
- **Event-driven updates** between components via context

### Integration Architecture

- **REST API Communication**: JSON-based data exchange
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Resilience**: Automatic fallback mechanisms
- **Development Setup**: Hot reload for both frontend and backend
- **Production Ready**: Configurable for different environments

### Chart Integration

- Chart.js with React wrapper (`react-chartjs-2`)
- Responsive design with proper sizing
- Dynamic data binding from form responses
- Multiple chart types for different data visualization needs

## 🎨 Styling & UI

- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-friendly layouts
- **Interactive Elements**: Hover states, animations, and transitions
- **Consistent Design System**: Color scheme and typography

## 🚀 Sample Data & Testing

### Automatic Sample Data

The application includes intelligent sample data generation:

### Customer Feedback Form (Auto-created)

- Rating fields with 1-5 star ratings stored in database
- Service quality multiple choice responses
- Feature usage checkboxes with analytics
- Text comments with realistic feedback

### Event Registration Form (Auto-created)

- Participant names and experience levels
- Interest area selections with proper aggregation
- Expected value ratings with averages

### API Testing

You can test the API directly:

```bash
# Get all forms
curl http://localhost:8000/api/forms/

# Create a new form
curl -X POST http://localhost:8000/api/forms/ \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Form", "description": "Test", "fields": []}'

# Submit a response
curl -X POST http://localhost:8000/api/forms/1/responses/ \
  -H "Content-Type: application/json" \
  -d '{"responses": {"field1": "value1"}}'
```

## 🔄 Real-Time Features in Action

1. **Dashboard Updates**: Charts automatically refresh with new data
2. **Response Counter**: Live count of total submissions
3. **Trend Analysis**: 7-day response patterns
4. **Recent Activity**: Latest responses appear in real-time feed
5. **Visual Indicators**: Loading states and update notifications

## 🎯 Key Differentiators

1. **Next.js 15 App Router**: Latest Next.js features and performance optimizations
2. **Optimized Navigation**: Clean, single navigation bar per page with smart display logic
3. **No External Form Libraries**: Everything built from scratch
4. **Truly Real-Time**: Simulated WebSocket updates with visual feedback
5. **Comprehensive Analytics**: Multiple chart types and statistical insights
6. **Drag-and-Drop**: Native HTML5 implementation without external libraries
7. **Type Safety**: Full TypeScript implementation with proper interfaces
8. **Modern Architecture**: Latest React 19+ features and patterns

## 🔍 Testing the Application

### Test the Backend API:

1. **Check API endpoints**: Visit http://localhost:8000/api/forms/
2. **Test form creation**: Use Django admin or API directly
3. **Verify CORS**: Ensure frontend can communicate with backend
4. **Database verification**: Check that data persists in SQLite

### Test the Form Builder:

1. Create a new form with different field types
2. **Verify database persistence**: Check that forms save to backend
3. Test drag-and-drop reordering functionality
4. Configure validation rules and test API validation
5. Use preview mode to test form functionality
6. **Check error handling**: Test with backend offline

### Test Form Submission:

1. Fill out sample forms with various response types
2. **Verify API submission**: Check that responses save to database
3. Test validation errors and success states (both frontend and backend)
4. Submit forms and verify redirect behavior
5. **Test offline mode**: Submit when backend unavailable

### Test Real-Time Analytics:

1. Open dashboard and verify data loads from database
2. Submit new responses and see **real database updates**
3. Monitor response trends with actual stored data
4. Check recent responses feed from API
5. **Test API integration**: Verify charts update with fresh data
6. **Database consistency**: Check that frontend matches backend data

### Full-Stack Integration Testing:

1. **Create→Submit→Analyze cycle**: Complete end-to-end workflow
2. **API reliability**: Test with various network conditions
3. **Data persistence**: Verify data survives server restarts
4. **Cross-browser testing**: Test frontend compatibility
5. **Error scenarios**: Test API failures and recovery

The application demonstrates a complete full-stack solution with real database persistence, proper API design, and production-ready architecture with development-friendly fallback mechanisms.

## 🚀 Current Development Status

### ✅ Completed Features

- **Full-Stack Integration**: Next.js frontend communicating with Django backend
- **Database Models**: Form and FormResponse models with proper relationships
- **REST API**: Complete CRUD operations for forms and responses
- **Frontend State Management**: Context API integrated with backend APIs
- **Error Handling**: Graceful fallback to localStorage when API unavailable
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Development Environment**: Both servers running with hot reload
- **Dark Mode System**: Complete theming system working across all components

### 🔄 Development Servers

Currently running:

- **Django Backend**: http://localhost:8000 (API endpoints ready)
- **Next.js Frontend**: http://localhost:4000 (or your configured port)
- **Database**: SQLite with proper migrations applied
- **API Documentation**: RESTful endpoints following best practices

### 🔧 Quick Start Commands

```bash
# Start Backend (Terminal 1)
cd server
python manage.py runserver 8000

# Start Frontend (Terminal 2)
cd client
npx next dev --port 4000
```

### 📋 Next Implementation Steps

Ready for enhancement:

1. **Real-time WebSocket implementation** (infrastructure ready)
2. **User authentication system** (Django auth ready)
3. **Advanced form features** (file uploads, conditional logic)
4. **Response export functionality** (CSV/PDF)
5. **Email notifications** (Django email backend)
6. **Form templates and sharing**
7. **Advanced analytics and reporting**

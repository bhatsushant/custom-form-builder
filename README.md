# Custom Form Builder

## 🚀 Overview

A full-stack custom form builder application built with **Next.js 15**, **Django 5.2**, and **MongoDB**. Features drag-and-drop form creation, real-time analytics, custom validation, and seamless API integration.

## 🏗️ Technology Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Chart.js  
**Backend:** Django 5.2, Django REST Framework, MongoDB with custom service layer  
**Features:** Real-time analytics, drag-and-drop interface, form validation, responsive design

## 🗄️ Quick Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ and pip
- MongoDB (local or Docker)

### Installation

1. **Install MongoDB**:

   ```bash
   # Docker (recommended)
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or follow: https://docs.mongodb.com/manual/installation/
   ```

2. **Backend Setup**:

   ```bash
   cd server
   pip install -r requirements.txt
   python manage.py runserver 8000
   ```

3. **Frontend Setup**:

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access**: Frontend at http://localhost:3000, API at http://localhost:8000/api/

## ✨ Key Features

### 🎨 Form Builder

- **Drag-and-Drop Interface**: Reorder fields with HTML5 drag and drop
- **Field Types**: Text, Multiple Choice, Checkboxes, Rating fields
- **Validation**: Custom rules, required fields, pattern matching
- **Live Preview**: Real-time form preview and auto-save

### 📊 Analytics Dashboard

- **Real-Time Data**: Charts from actual database responses
- **Visual Charts**: Bar, pie, and line charts with Chart.js
- **Response Trends**: 7-day trend analysis
- **Live Feed**: Recent submissions and statistics

### 🔄 Backend Integration

- **Django REST API**: Full CRUD operations
- **MongoDB Storage**: Document-based data persistence
- **Error Handling**: Graceful fallback to localStorage
- **CORS Enabled**: Cross-origin resource sharing

## 🚀 Quick Setup

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd custom-form-builder
   ```

2. **Backend Setup**

   ```bash
   cd server
   pip install -r requirements.txt
   python manage.py runserver
   ```

3. **Frontend Setup**

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/

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

## 🔧 API Endpoints

**Forms API:**

- `GET /api/forms/` - List all forms
- `POST /api/forms/` - Create new form
- `GET /api/forms/{id}/` - Get specific form
- `PUT /api/forms/{id}/` - Update form
- `DELETE /api/forms/{id}/` - Delete form
- `POST /api/forms/{id}/responses/` - Submit response

**Analytics API:**

- `GET /api/analytics/{form_id}/` - Form analytics data

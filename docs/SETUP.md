# 🚀 Setup Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [First Run](#first-run)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| **Python** | 3.9+ | Backend runtime |
| **Node.js** | 18.0+ | Frontend build tool |
| **npm** | 9.0+ | Package manager |
| **Git** | 2.0+ | Version control |

### Optional Tools

- **VS Code** or preferred IDE
- **Postman** or **curl** for API testing
- **Python virtualenv** for isolation

### API Keys Required

1. **Browser Use API Key**
   - Sign up at: https://browser-use.com
   - Get API key from dashboard
   
2. **Google Gemini API Key** (for AI chat)
   - Sign up at: https://ai.google.dev
   - Create API key in Google AI Studio
   
3. **Vapi API Key** (optional, for voice calls)
   - Sign up at: https://vapi.ai
   - Get API key from dashboard

---

## Backend Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd watchdocs2/WatchDocBackend
```

### Step 2: Create Virtual Environment

#### Windows

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
```

#### macOS/Linux

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

**Verification**: Your terminal prompt should show `(venv)` prefix.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected output**:
```
Successfully installed beautifulsoup4-4.12.2 requests-2.32.5 django-4.2+ ...
```

### Step 4: Configure Django Settings

Edit `WatchDoc/WatchDoc/settings.py`:

```python
# Update with your Browser Use API key
BROWSER_USE_API_KEY = 'your_browser_use_api_key_here'

# Update CORS allowed origins if needed
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Frontend dev server
    "http://127.0.0.1:3000",
    # Add your production domain here
]
```

### Step 5: Initialize Database

```bash
# Navigate to Django project directory
cd WatchDoc

# Run migrations
python manage.py migrate
```

**Expected output**:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, main, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying main.0001_initial... OK
  ...
```

### Step 6: Create Admin User (Optional)

```bash
python manage.py createsuperuser
```

Follow prompts:
```
Username: admin
Email: admin@example.com
Password: ********
Password (again): ********
```

### Step 7: Start Backend Server

```bash
python manage.py runserver
```

**Expected output**:
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
December 04, 2025 - 10:00:00
Django version 4.2, using settings 'WatchDoc.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**Verify Backend**:
- Open browser: http://localhost:8000/admin
- Login with superuser credentials
- You should see the Django admin interface

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ../../WatchDocsFE
# Or from root: cd WatchDocsFE
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output**:
```
added 500+ packages in 30s
```

**Troubleshooting**:
- If you see warnings about peer dependencies, they're usually safe to ignore
- Run `npm audit fix` if there are security vulnerabilities

### Step 3: Configure Environment Variables

Create `.env` file in `WatchDocsFE/` directory:

```env
# Google Gemini API Key (for AI chat feature)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (default: http://localhost:8000)
VITE_API_URL=http://localhost:8000

# Optional: Vapi API Key (for voice calls)
VITE_VAPI_API_KEY=your_vapi_api_key_here
```

**Important**:
- Never commit `.env` to version control
- `.env` is already in `.gitignore`
- Use different keys for development and production

### Step 4: Start Frontend Dev Server

```bash
npm run dev
```

**Expected output**:
```
  VITE v5.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Verify Frontend**:
- Open browser: http://localhost:5173
- You should see the WatchDocs landing page

---

## Configuration

### Backend Configuration

**File**: `WatchDocBackend/WatchDoc/WatchDoc/settings.py`

#### Environment-Based Configuration (Recommended)

```python
import os

# Browser Use API
BROWSER_USE_API_KEY = os.getenv('BROWSER_USE_API_KEY', 'default_key')

# Database (for production)
if os.getenv('PRODUCTION'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
```

#### CORS Configuration

```python
# Allow frontend origin
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite dev server
    os.getenv('FRONTEND_URL', ''),  # Production frontend
]

# For development, you can use:
# CORS_ALLOW_ALL_ORIGINS = True  # WARNING: Only for development!
```

### Frontend Configuration

**File**: `WatchDocsFE/.env`

```env
# Required
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional (defaults shown)
VITE_API_URL=http://localhost:8000
VITE_VAPI_API_KEY=your_vapi_key
```

**Accessing in Code**:
```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## First Run

### Step 1: Start Backend

```bash
cd WatchDocBackend/WatchDoc
python manage.py runserver
```

Keep this terminal open.

### Step 2: Start Frontend (New Terminal)

```bash
cd WatchDocsFE
npm run dev
```

Keep this terminal open.

### Step 3: Access Application

Open browser: http://localhost:5173

### Step 4: Create First Watch

1. Click **"Start Monitoring"** or **"New Watch"**
2. Choose **URL Mode**
3. Enter a test URL (e.g., `https://example.com`)
4. Click **"Start Monitoring"**
5. Wait for initial scan to complete
6. View results on dashboard

### Step 5: Test AI Chat (Optional)

1. Click **"New Watch"**
2. Toggle to **"AI Chat"** mode
3. Type: "I want to monitor news about artificial intelligence"
4. AI will suggest relevant websites
5. Select a suggestion to monitor

### Step 6: Verify Database

```bash
# In backend directory
python manage.py shell
```

```python
from main.models import Document, DocumentScan

# Check documents
print(Document.objects.count())  # Should show 1+

# Check scans
print(DocumentScan.objects.count())  # Should show 1+

# View data
doc = Document.objects.first()
print(f"Title: {doc.title}")
print(f"URL: {doc.url}")
print(f"Scans: {doc.documentscan_set.count()}")
```

---

## Troubleshooting

### Backend Issues

#### "ModuleNotFoundError: No module named 'django'"

**Solution**: Activate virtual environment and install dependencies
```bash
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

#### "django.db.utils.OperationalError: no such table: main_document"

**Solution**: Run migrations
```bash
python manage.py migrate
```

#### "BrowserUseAPIError: Browser Use API key is not configured"

**Solution**: Set API key in `settings.py`
```python
BROWSER_USE_API_KEY = 'your_api_key_here'
```

#### Port 8000 Already in Use

**Solution**: Kill existing process or use different port
```bash
# Use different port
python manage.py runserver 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001
```

### Frontend Issues

#### "npm ERR! ENOENT: no such file or directory, open 'package.json'"

**Solution**: Ensure you're in the correct directory
```bash
cd WatchDocsFE
npm install
```

#### "Vite Error: Failed to resolve import"

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules
npm install
npm run dev
```

#### API Calls Failing with CORS Error

**Solution**: Check backend CORS configuration
```python
# In settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Add Vite dev server
]
```

#### "GoogleGenerativeAI is not defined"

**Solution**: Check if API key is set in `.env`
```env
VITE_GEMINI_API_KEY=your_actual_api_key
```

### Common Issues

#### Slow Initial Scan

**Cause**: Browser Use API processing time
**Solution**: This is normal. Initial scans can take 30-60 seconds.

#### Changes Not Detected

**Cause**: Website content didn't actually change, or change is too subtle
**Solution**: This is expected behavior. Try a site with frequent updates.

#### Connection Refused

**Cause**: Backend not running
**Solution**: Start backend server first, then frontend

---

## Next Steps

After successful setup:

1. **Read the [API Reference](API_REFERENCE.md)** to understand available endpoints
2. **Explore [Features Documentation](FEATURES.md)** to learn about all capabilities
3. **Check [Development Guide](DEVELOPMENT.md)** for development best practices
4. **Review [Deployment Guide](DEPLOYMENT.md)** for production deployment

---

## Quick Reference

### Start Development

```bash
# Terminal 1: Backend
cd WatchDocBackend/WatchDoc
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
python manage.py runserver

# Terminal 2: Frontend
cd WatchDocsFE
npm run dev
```

### Stop Development

- Press `Ctrl+C` in both terminals
- Deactivate virtual environment: `deactivate`

### Reset Database

```bash
cd WatchDocBackend/WatchDoc
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

**Last Updated**: December 2025  
**Version**: 1.0

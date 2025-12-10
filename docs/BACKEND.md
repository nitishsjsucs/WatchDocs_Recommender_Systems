# 🔧 Backend Documentation

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Browser Use Integration](#browser-use-integration)
- [Voice Call Integration](#voice-call-integration)
- [Configuration](#configuration)
- [Development](#development)

---

## Overview

The WatchDocs backend is a **Django REST API** that handles website monitoring, change detection, and AI-powered analysis. It integrates with the Browser Use Cloud API for intelligent web scraping and comparison.

### Key Responsibilities

1. **Document Management**: CRUD operations for monitored websites
2. **Scan Execution**: Automated and manual scan triggers
3. **Change Detection**: AI-powered comparison using Browser Use API
4. **Content Extraction**: Beautiful Soup for backup content retrieval
5. **Data Persistence**: SQLite database for documents and scan history
6. **Voice Notifications**: Integration with Vapi for voice calls

---

## Technology Stack

### Core Framework

```
Django 4.2+
├── Django REST Framework
├── Django CORS Headers
└── SQLite Database
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **Django** | 4.2+ | Web framework |
| **djangorestframework** | Latest | REST API framework |
| **django-cors-headers** | Latest | CORS middleware |
| **requests** | 2.32.5 | HTTP client for API calls |
| **beautifulsoup4** | 4.12.2 | HTML parsing & extraction |

### External Services

- **Browser Use Cloud API**: AI-powered web scraping and comparison
- **Vapi API**: Voice call notifications
- **Google Gemini 2.5 Pro**: AI model (via Browser Use)

---

## Project Structure

```
WatchDocBackend/
├── WatchDoc/                       # Django project root
│   ├── WatchDoc/                   # Project configuration
│   │   ├── __init__.py
│   │   ├── settings.py             # Django settings & configuration
│   │   ├── urls.py                 # Main URL routing
│   │   ├── wsgi.py                 # WSGI application
│   │   └── asgi.py                 # ASGI application (async support)
│   │
│   ├── main/                       # Main application
│   │   ├── migrations/             # Database migrations
│   │   │   ├── 0001_initial.py
│   │   │   └── ...
│   │   │
│   │   ├── __init__.py
│   │   ├── models.py               # Database models (Document, DocumentScan)
│   │   ├── views.py                # API endpoint handlers
│   │   ├── admin.py                # Django admin configuration
│   │   ├── apps.py                 # App configuration
│   │   ├── tests.py                # Unit tests
│   │   │
│   │   ├── browser_use_client.py   # Browser Use API client
│   │   ├── makeCriticalCall.py     # Critical alert voice calls
│   │   └── makeGeneralCall.py      # General update voice calls
│   │
│   ├── db.sqlite3                  # SQLite database file
│   └── manage.py                   # Django management script
│
├── requirements.txt                # Python dependencies
├── example_usage.py                # API usage examples
├── API_DOCUMENTATION.md            # API documentation
└── FRONTEND_INTEGRATION.md         # Frontend integration guide
```

---

## Database Models

### 1. Document Model (`main/models.py`)

Represents a monitored website.

```python
class Document(models.Model):
    title = models.CharField(max_length=200)
    desc = models.TextField()
    url = models.TextField()
    status = models.CharField(max_length=50, default='Healthy')
    date = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=100, null=True, default="General")

    def __str__(self):
        return self.title
```

**Fields**:
- `id` (auto): Primary key
- `title`: Document/website title
- `desc`: Description or notes
- `url`: Website URL to monitor
- `status`: Current health status (Healthy, Warning, Critical)
- `date`: Creation timestamp
- `category`: Document category (General, etc.)

### 2. DocumentScan Model (`main/models.py`)

Represents a single scan of a document.

```python
class DocumentScan(models.Model):
    CHANGE_LEVEL_CHOICES = [
        ('No Change', 'No Change'),
        ('Low', 'Low'),
        ('Major', 'Major'),
        ('Critical', 'Critical'),
    ]

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    changeLevel = models.CharField(
        max_length=50, 
        choices=CHANGE_LEVEL_CHOICES, 
        default='No Change'
    )
    changes = models.BooleanField(default=False)
    changeSummary = models.TextField(null=True, blank=True)
    currentSummary = models.TextField(null=True, blank=True)
    additions = models.TextField(null=True, blank=True)
    deletions = models.TextField(null=True, blank=True)
    modifications = models.TextField(null=True, blank=True)
    rawData = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Scan of {self.document.title} on {self.date}"
```

**Fields**:
- `id` (auto): Primary key
- `document`: Foreign key to Document
- `date`: Scan timestamp
- `changeLevel`: Severity of changes (No Change, Low, Major, Critical)
- `changes`: Boolean flag if changes detected
- `changeSummary`: AI-generated summary of changes
- `currentSummary`: Detailed summary of current document state
- `additions`: Newline-separated list of added content
- `deletions`: Newline-separated list of removed content
- `modifications`: Newline-separated list of modified content
- `rawData`: JSON payload with complete scan data

**rawData JSON Structure**:
```json
{
  "difference_detected": true,
  "difference_description": "Description of changes",
  "severity": "Major",
  "current_summary": "Detailed summary of current state",
  "raw_content": "Full page text content",
  "changes": {
    "added": ["item1", "item2"],
    "removed": ["item3"],
    "modified": ["item4", "item5"]
  }
}
```

---

## API Endpoints

### 1. GET `/documents/`

**Description**: Fetch all documents with their latest scan information.

**Method**: `GET`

**Response** (200 OK):
```json
{
  "documents": [
    {
      "id": 1,
      "title": "OpenAI Blog",
      "desc": "Monitor AI updates",
      "url": "https://openai.com/blog",
      "status": "Healthy",
      "created_date": "2025-12-04T10:00:00.000Z",
      "latest_scan": {
        "id": 5,
        "changes": true,
        "change_level": "Major",
        "change_summary": "New blog post about GPT-5",
        "current_summary": "Blog contains 15 posts...",
        "scan_date": "2025-12-04T15:30:00.000Z",
        "additions": ["New post: GPT-5 Announcement"],
        "deletions": [],
        "modifications": ["Homepage hero section"]
      }
    }
  ],
  "total_count": 1
}
```

### 2. POST `/createDocumentAndScan/`

**Description**: Create a new document and run initial baseline scan.

**Method**: `POST`

**Request Body**:
```json
{
  "title": "OpenAI Blog",
  "url": "https://openai.com/blog",
  "desc": "Monitor AI updates",
  "status": "Healthy"
}
```

**Response** (200 OK):
```json
{
  "message": "Document created and scanned successfully",
  "document": {
    "id": 1,
    "title": "OpenAI Blog",
    "desc": "Monitor AI updates",
    "url": "https://openai.com/blog",
    "status": "Healthy",
    "created_date": "2025-12-04T10:00:00.000Z"
  },
  "scan": {
    "id": 1,
    "changes": false,
    "change_level": "No Change",
    "change_summary": "Initial baseline scan.",
    "current_summary": "Detailed summary...",
    "scan_date": "2025-12-04T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Missing required fields or invalid JSON
- `500`: Browser Use API error or scan failure

### 3. POST `/runScans/`

**Description**: Run scans on all existing documents.

**Method**: `POST`

**Request Body**: None (empty POST)

**Response** (200 OK):
```json
{
  "results": [
    {
      "document_id": 1,
      "scan_id": 6,
      "changes": true,
      "change_level": "Major"
    },
    {
      "document_id": 2,
      "scan_id": 7,
      "changes": false,
      "change_level": "No Change"
    }
  ]
}
```

**Error Response**:
- `500`: Browser Use client initialization error

### 4. GET `/documents/{id}/`

**Description**: Get comprehensive details for a specific document including full scan history.

**Method**: `GET`

**URL Parameter**: `id` (integer) - Document ID

**Response** (200 OK):
```json
{
  "document": {
    "id": 1,
    "title": "OpenAI Blog",
    "desc": "Monitor AI updates",
    "url": "https://openai.com/blog",
    "status": "Healthy",
    "category": "General",
    "created_date": "2025-12-04T10:00:00.000Z",
    "scan_count": 5,
    "latest_scan": { /* ... */ },
    "scan_history": [
      {
        "id": 5,
        "date": "2025-12-04T15:30:00.000Z",
        "changes": true,
        "change_level": "Major",
        "change_summary": "New blog post",
        "current_summary": "Summary...",
        "raw_content_preview": "First 200 characters...",
        "additions": ["New post"],
        "deletions": [],
        "modifications": [],
        "changes_detail": {
          "added": ["New post"],
          "removed": [],
          "modified": []
        }
      }
    ]
  },
  "total_scans": 5
}
```

**Error Response**:
- `404`: Document not found

### 5. GET `/documents/{id}/timeline/`

**Description**: Get timeline view of all scans for a document.

**Method**: `GET`

**URL Parameter**: `id` (integer) - Document ID

**Response** (200 OK):
```json
{
  "document": {
    "id": 1,
    "title": "OpenAI Blog",
    "desc": "Monitor AI updates",
    "url": "https://openai.com/blog",
    "status": "Healthy",
    "created_date": "2025-12-04T10:00:00.000Z"
  },
  "timeline": [
    {
      "id": "5",
      "timestamp": "2025-12-04T15:30:00.000Z",
      "status": "changed",
      "title": "Major Changes Detected",
      "description": "New blog post about GPT-5",
      "change_level": "Major",
      "change_summary": "New blog post about GPT-5",
      "current_summary": "Full summary...",
      "raw_content": "Page content...",
      "changes": {
        "added": ["New post"],
        "removed": [],
        "modified": []
      }
    }
  ],
  "total_scans": 5
}
```

**Error Response**:
- `404`: Document not found

### 6. POST `/make_general_call/`

**Description**: Trigger a conversational update voice call (demo/testing).

**Method**: `POST`

**Request Body**: None

**Response** (200 OK):
```json
{
  "success": true,
  "message": "General call initiated successfully",
  "context_used": "Sample context...",
  "call_result": { /* Vapi call result */ }
}
```

**Error Response**:
- `500`: Failed to make call

---

## Browser Use Integration

### BrowserUseClient (`main/browser_use_client.py`)

**Purpose**: Thin client wrapper around Browser Use Cloud API for AI-powered web scraping and comparison.

### Class Structure

```python
class BrowserUseClient:
    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        poll_interval: Optional[float] = None,
        timeout: Optional[float] = None,
        session: Optional[requests.Session] = None,
    ) -> None:
        # Initialize client with API key and configuration
```

### Main Method: `compare_document()`

```python
def compare_document(
    self, 
    *, 
    url: str, 
    title: str, 
    previous_snapshot: Optional[Dict[str, Any]] = None
) -> BrowserUseResult:
    """
    Compare a document against its previous snapshot.
    
    Args:
        url: Website URL to scan
        title: Document title
        previous_snapshot: Previous scan data (None for baseline scan)
    
    Returns:
        BrowserUseResult with change detection data
    """
```

### BrowserUseResult Dataclass

```python
@dataclass
class BrowserUseResult:
    difference_detected: bool
    difference_description: str
    severity: str  # "No Change", "Low", "Major", "Critical"
    current_summary: str
    changes: Optional[Dict[str, list]] = None
    raw_response: Dict[str, Any] = None
```

**Changes Structure**:
```python
{
    "added": ["New item 1", "New item 2"],
    "removed": ["Removed item 1"],
    "modified": ["Modified item 1", "Modified item 2"]
}
```

### API Flow

1. **Build Payload**: Construct task instructions and schema
2. **Start Task**: Submit task to Browser Use API
3. **Wait for Completion**: Poll for task completion
4. **Parse Output**: Extract structured JSON response
5. **Validate**: Ensure all required fields present
6. **Return Result**: Return BrowserUseResult object

### Task Instructions

**For Baseline Scan** (no previous snapshot):
```
You are monitoring the document titled '{title}' at {url}.
No previous snapshot exists, so treat this scan as the baseline record.
1. Visit the URL and examine the document thoroughly.
2. Produce a meticulous, highly detailed summary of the current version.
3. Set 'difference_detected' to false and 'severity' to 'No Change'.
4. Set all change arrays (added, removed, modified) to empty arrays.
5. Respond strictly with a JSON object...
```

**For Comparison Scan** (with previous snapshot):
```
You are monitoring the document titled '{title}' at {url}.
Follow these steps carefully:
1. Visit the URL and review the current document thoroughly.
2. Produce a meticulous, highly detailed summary of the current version.
3. Compare with previous snapshot and catalogue every difference.
4. Determine if differences exist and choose appropriate severity.
5. Categorize changes into added, removed, and modified arrays.
6. Respond strictly with a JSON object...
```

### Error Handling

```python
class BrowserUseAPIError(Exception):
    """Custom exception for Browser Use API failures."""
```

**Handled Scenarios**:
- API key not configured
- Network errors
- Task failures
- Timeout errors
- JSON parsing errors
- Missing required fields

---

## Beautiful Soup Integration

### Function: `extract_page_content_with_soup()`

**Purpose**: Backup content extraction using Beautiful Soup in case Browser Use API fails or for additional data.

```python
def extract_page_content_with_soup(url: str) -> str:
    """
    Extract page content using Beautiful Soup.
    
    Args:
        url: URL to fetch and extract content from
    
    Returns:
        Extracted text content or error message
    """
```

**Features**:
- User-Agent header to avoid blocking
- Remove script, style, nav, footer, header elements
- Focus on main content area
- Clean up whitespace and formatting
- 50KB content limit to prevent excessive storage

**Usage in Scan Flow**:
```python
# Browser Use API for AI analysis
comparison = client.compare_document(url=url, title=title, previous_snapshot=snapshot)

# Beautiful Soup for raw content backup
raw_content = extract_page_content_with_soup(url)

# Store both in database
raw_payload = {
    "difference_detected": comparison.difference_detected,
    "raw_content": raw_content,  # Beautiful Soup content
    "changes": comparison.changes,
    # ...
}
```

---

## Voice Call Integration

### Critical Alert Calls (`main/makeCriticalCall.py`)

**Purpose**: Trigger urgent voice calls for critical changes.

```python
def makeCriticalAlertCall(change_summary: str) -> dict:
    """
    Make an urgent voice call to alert about critical changes.
    
    Args:
        change_summary: Summary of the critical changes
    
    Returns:
        Vapi call response
    """
```

**Trigger Conditions**:
- Change level is "Critical"
- Specific keywords detected (e.g., "policy", "terms", "urgent")
- User-configured thresholds

### General Update Calls (`main/makeGeneralCall.py`)

**Purpose**: Conversational update calls with aggregated changes.

```python
def makeConversationalUpdateCall(context: str) -> dict:
    """
    Make a conversational update call with change summary.
    
    Args:
        context: Aggregated context of changes
    
    Returns:
        Vapi call response
    """
```

**Trigger Conditions**:
- Daily/weekly scheduled updates
- User-requested manual updates
- Multiple non-critical changes accumulated

### Vapi Integration

Both functions use the Vapi API to initiate calls:

```python
# Vapi API endpoint
VAPI_API_URL = "https://api.vapi.ai/call"
VAPI_API_KEY = os.getenv("VAPI_API_KEY")

# Make API call
response = requests.post(
    VAPI_API_URL,
    headers={
        "Authorization": f"Bearer {VAPI_API_KEY}",
        "Content-Type": "application/json"
    },
    json=payload
)
```

---

## Configuration

### Django Settings (`WatchDoc/settings.py`)

#### Database Configuration

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-ngrok-url.ngrok-free.app"
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8000',
    'http://localhost:3000'
]
```

#### Browser Use API Configuration

```python
BROWSER_USE_API_BASE_URL = os.getenv(
    'BROWSER_USE_API_BASE_URL',
    'https://api.browser-use.com/api/v1'
)
BROWSER_USE_API_KEY = 'your_api_key_here'
BROWSER_USE_API_POLL_INTERVAL = float(os.getenv('BROWSER_USE_API_POLL_INTERVAL', '2.0'))
BROWSER_USE_API_TIMEOUT = float(os.getenv('BROWSER_USE_API_TIMEOUT', '120.0'))
```

#### Installed Apps

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'main',
]
```

#### Middleware

```python
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### URL Routing (`WatchDoc/urls.py`)

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('documents/', views.get_documents),
    path('documents/<int:document_id>/', views.get_document_details),
    path('documents/<int:document_id>/timeline/', views.get_document_timeline),
    path('createDocumentAndScan/', views.create_document_and_scan),
    path('runScans/', views.runScans),
    path('make_general_call/', views.make_general_call),
]
```

---

## Development

### Setup Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Create Superuser (Admin Access)

```bash
python manage.py createsuperuser
```

### Run Development Server

```bash
python manage.py runserver
```

Server runs at: `http://localhost:8000`

### Django Admin Interface

Access at: `http://localhost:8000/admin`

**Features**:
- View/edit documents
- View/edit scans
- User management
- Data inspection

### Database Shell

```bash
# Django shell
python manage.py shell

# Example queries
from main.models import Document, DocumentScan

# Get all documents
documents = Document.objects.all()

# Get scans for a document
doc = Document.objects.get(id=1)
scans = DocumentScan.objects.filter(document=doc)
```

### Logging

**Console Logging**:
```python
import logging
logger = logging.getLogger(__name__)

logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message")
```

**View Logs**:
- Development: Console output
- Production: Configure file logging or external service (Sentry, etc.)

---

## Testing

### Unit Tests

```bash
python manage.py test main
```

### Example Test

```python
from django.test import TestCase
from main.models import Document

class DocumentModelTest(TestCase):
    def setUp(self):
        Document.objects.create(
            title="Test Doc",
            url="https://example.com",
            desc="Test description"
        )
    
    def test_document_creation(self):
        doc = Document.objects.get(title="Test Doc")
        self.assertEqual(doc.url, "https://example.com")
```

### API Testing

Use `curl`, Postman, or Python `requests`:

```bash
# Get all documents
curl http://localhost:8000/documents/

# Create document and scan
curl -X POST http://localhost:8000/createDocumentAndScan/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","url":"https://example.com"}'
```

---

## Production Considerations

### Security

1. **Change SECRET_KEY**: Generate a new secure key
2. **Set DEBUG = False**: Disable debug mode
3. **Configure ALLOWED_HOSTS**: Restrict to your domain
4. **Use Environment Variables**: For sensitive config
5. **Enable HTTPS**: SSL/TLS certificates

### Database

- **Migrate to PostgreSQL**: For production workloads
- **Enable Connection Pooling**: Improve performance
- **Regular Backups**: Automated backup strategy

### Performance

- **Enable Caching**: Redis for API responses
- **Use Gunicorn**: WSGI server for production
- **Setup Celery**: Async task processing
- **Database Indexing**: Optimize queries

### Monitoring

- **Error Tracking**: Sentry integration
- **APM**: Application performance monitoring
- **Logging**: Centralized log aggregation

---

**Last Updated**: December 2025  
**Version**: 1.0

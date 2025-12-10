# 🔧 Troubleshooting Guide

## Table of Contents
- [Common Issues](#common-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [API Issues](#api-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tips](#debugging-tips)

---

## Common Issues

### Application Won't Start

**Symptoms**: Error when trying to start backend or frontend

**Possible Causes**:
1. Dependencies not installed
2. Wrong directory
3. Port already in use
4. Missing environment variables

**Solutions**:

**Backend**:
```bash
# Check you're in correct directory
cd WatchDocBackend/WatchDoc

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Reinstall dependencies
pip install -r requirements.txt

# Try different port
python manage.py runserver 8001
```

**Frontend**:
```bash
# Check directory
cd WatchDocsFE

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Try different port
npm run dev -- --port 5174
```

### Changes Not Detected

**Symptoms**: Scans run but no changes shown despite website updates

**Possible Causes**:
1. Website didn't actually change
2. Changes too subtle for AI to detect
3. Browser Use API cached result
4. Change in non-content areas (ads, etc.)

**Solutions**:
```bash
# Manual verification
1. Visit the website yourself
2. Check if content actually changed
3. Wait a few minutes and scan again
4. Try a website with obvious changes (e.g., news site)
```

**Workaround**:
- Choose websites with frequent, substantial updates
- Increase scan frequency
- Focus on content-heavy pages

---

## Backend Issues

### ModuleNotFoundError

**Error**:
```
ModuleNotFoundError: No module named 'django'
```

**Cause**: Virtual environment not activated or dependencies not installed

**Solution**:
```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Verify activation (should show venv path)
which python  # Mac/Linux
where python  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Database Migration Errors

**Error**:
```
django.db.utils.OperationalError: no such table: main_document
```

**Cause**: Migrations not run

**Solution**:
```bash
cd WatchDoc

# Run migrations
python manage.py migrate

# If error persists, reset database
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Browser Use API Errors

**Error**:
```
BrowserUseAPIError: Browser Use API key is not configured
```

**Cause**: Missing or invalid API key

**Solution**:
```python
# Edit WatchDoc/settings.py
BROWSER_USE_API_KEY = 'your_actual_api_key_here'

# Or set environment variable
export BROWSER_USE_API_KEY='your_key'  # Mac/Linux
set BROWSER_USE_API_KEY=your_key  # Windows
```

**Error**:
```
BrowserUseAPIError: Browser Use task timeout
```

**Cause**: Website taking too long to load or API overload

**Solutions**:
```python
# Increase timeout in settings.py
BROWSER_USE_API_TIMEOUT = 180.0  # 3 minutes

# Or wait and retry
# Try a simpler website first
```

### Port Already in Use

**Error**:
```
Error: That port is already in use.
```

**Solutions**:

**Option 1: Use Different Port**
```bash
python manage.py runserver 8001
```

**Option 2: Kill Existing Process**

**Windows**:
```bash
# Find process
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>
```

### CORS Errors

**Error** (in browser console):
```
Access to fetch at 'http://localhost:8000/documents/' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Cause**: Frontend origin not in CORS whitelist

**Solution**:
```python
# Edit WatchDoc/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",  # Add Vite dev server
    "http://127.0.0.1:5173",
]

# Or for development only (NOT for production!)
CORS_ALLOW_ALL_ORIGINS = True
```

---

## Frontend Issues

### npm Install Failures

**Error**:
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path /path/to/package.json
```

**Cause**: Not in correct directory

**Solution**:
```bash
cd WatchDocsFE
npm install
```

**Error**:
```
npm ERR! peer dependency warnings
```

**Solution**:
```bash
# Usually safe to ignore
# Or force install
npm install --legacy-peer-deps
```

### Build Errors

**Error**:
```
ERROR: Top-level await is not available in the configured target environment
```

**Solution**:
```javascript
// Update vite.config.js
export default {
  build: {
    target: 'esnext'
  }
}
```

### Vite Import Errors

**Error**:
```
Failed to resolve import "@/components/ui/button"
```

**Cause**: Path alias not configured

**Solution**:
```javascript
// Verify vite.config.js has:
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},

// And tsconfig.json has:
"paths": {
  "@/*": ["./src/*"]
}
```

### Environment Variables Not Loading

**Error**: API calls fail with undefined

**Cause**: .env file missing or incorrect

**Solution**:
```bash
# Create .env in WatchDocsFE/
VITE_GEMINI_API_KEY=your_key_here
VITE_API_URL=http://localhost:8000

# Restart dev server
npm run dev
```

**Important**: 
- Vite requires `VITE_` prefix
- Restart dev server after changing .env
- Never commit .env to git

### White Screen / Blank Page

**Symptoms**: Application loads but shows nothing

**Debugging**:
```bash
# Check browser console for errors
# Press F12 -> Console tab

# Common issues:
1. JavaScript error on load
2. API endpoint unreachable
3. Missing API key
4. CORS error
```

**Solutions**:
- Fix console errors
- Verify backend is running
- Check network tab for failed requests
- Verify .env variables

---

## API Issues

### 404 Not Found

**Error**:
```
GET /documents/ 404 Not Found
```

**Causes**:
1. Backend not running
2. Wrong URL
3. URL routing issue

**Solutions**:
```bash
# Verify backend is running
curl http://localhost:8000/documents/

# Check URL in code
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

# Verify Django URL patterns
# Should have path('documents/', views.get_documents)
```

### 500 Internal Server Error

**Symptoms**: API returns 500 error

**Debugging**:
```bash
# Check Django console for error traceback
# Look for Python exceptions

# Common causes:
1. Database error
2. Missing field in model
3. API key issue
4. Code exception
```

**Solutions**:
- Read error traceback carefully
- Check Django logs
- Verify database schema matches models
- Test API endpoint directly with curl

### Timeout Errors

**Error**:
```
Request timeout after 60s
```

**Cause**: Long-running operation (scan)

**Solutions**:
```python
# Increase timeout in settings
BROWSER_USE_API_TIMEOUT = 180.0

# Or implement async processing
# Use Celery for background tasks (future)
```

---

## Database Issues

### Database Locked

**Error**:
```
sqlite3.OperationalError: database is locked
```

**Cause**: SQLite concurrency limitation

**Solutions**:

**Short-term**:
```bash
# Close all connections
# Restart Django server
```

**Long-term**:
```bash
# Migrate to PostgreSQL
# See DEPLOYMENT.md for instructions
```

### Migration Conflicts

**Error**:
```
django.db.migrations.exceptions.InconsistentMigrationHistory
```

**Cause**: Migration history mismatch

**Solutions**:

**Option 1: Reset Migrations** (development only!)
```bash
# Delete database
rm db.sqlite3

# Delete migration files (keep __init__.py)
rm main/migrations/0*.py

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

**Option 2: Fake Migration**
```bash
python manage.py migrate --fake main
python manage.py migrate
```

### Data Integrity Errors

**Error**:
```
IntegrityError: NOT NULL constraint failed
```

**Cause**: Missing required field

**Solution**:
```python
# Add default value in model
field = models.CharField(max_length=100, default='default_value')

# Make migration
python manage.py makemigrations
python manage.py migrate
```

---

## Performance Issues

### Slow Scans

**Symptoms**: Scans take > 2 minutes

**Causes**:
1. Large/complex websites
2. Slow internet connection
3. Browser Use API load
4. Multiple scans running

**Solutions**:
- Increase timeout settings
- Scan fewer documents concurrently
- Choose faster websites for frequent scanning
- Implement caching (future)

### High Memory Usage

**Symptoms**: Backend consuming excessive RAM

**Causes**:
1. Large scan results stored in memory
2. No pagination
3. Memory leaks

**Solutions**:
```python
# Limit query results
documents = Document.objects.all()[:100]

# Use pagination
from django.core.paginator import Paginator

# Clear old scans periodically
old_scans = DocumentScan.objects.filter(
    date__lt=timezone.now() - timedelta(days=90)
).delete()
```

### Slow Frontend

**Symptoms**: UI laggy or unresponsive

**Causes**:
1. Large data rendering
2. No pagination
3. Unoptimized images

**Solutions**:
```typescript
// Implement pagination
const [page, setPage] = useState(1);
const limit = 20;

// Lazy load images
<img loading="lazy" src={url} />

// Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## Debugging Tips

### Enable Debug Mode

**Backend** (settings.py):
```python
DEBUG = True
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Frontend**:
```typescript
// Add console logs
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('API Response:', data);

// Use React DevTools
// Install browser extension
```

### Browser DevTools

**Network Tab**:
- View all API requests
- Check response status codes
- Inspect request/response payloads
- Check timing

**Console Tab**:
- View JavaScript errors
- See console.log output
- Test code in console

**Application Tab**:
- View localStorage data
- Inspect cookies
- Check service workers

### Django Shell

```bash
python manage.py shell
```

```python
# Test database queries
from main.models import Document, DocumentScan

# Get all documents
docs = Document.objects.all()
print(docs.count())

# Test specific document
doc = Document.objects.get(id=1)
print(doc.title)
print(doc.documentscan_set.count())

# Test API client
from main.browser_use_client import BrowserUseClient
client = BrowserUseClient()
result = client.compare_document(
    url='https://example.com',
    title='Test',
    previous_snapshot=None
)
print(result)
```

### API Testing

**Using curl**:
```bash
# Test GET endpoint
curl http://localhost:8000/documents/

# Test POST endpoint
curl -X POST http://localhost:8000/createDocumentAndScan/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","url":"https://example.com"}'

# View headers
curl -v http://localhost:8000/documents/
```

**Using Postman**:
1. Create new request
2. Set method (GET/POST)
3. Enter URL
4. Add headers if needed
5. Add JSON body for POST
6. Send and view response

### Log Analysis

**Backend Logs**:
```bash
# View Django console output
# Look for:
- Error tracebacks
- Browser Use API logs
- Database queries
```

**Frontend Logs**:
```bash
# Browser console
# Look for:
- Network errors
- JavaScript exceptions
- API response errors
```

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Read error messages carefully
3. ✅ Search for error message online
4. ✅ Check GitHub issues
5. ✅ Try debugging steps above

### When Asking for Help

**Include**:
- Exact error message
- Steps to reproduce
- Environment (OS, Python/Node version)
- What you've already tried
- Relevant code snippets
- Log output

**Example**:
```
Issue: Getting CORS error when fetching documents

Environment:
- Windows 11
- Python 3.11
- Node 18.0
- Backend running on localhost:8000
- Frontend running on localhost:5173

Error:
Access to fetch at 'http://localhost:8000/documents/' 
from origin 'http://localhost:5173' has been blocked by CORS policy

What I tried:
1. Added localhost:5173 to CORS_ALLOWED_ORIGINS
2. Restarted Django server
3. Cleared browser cache

Still getting the error.
```

### Resources

- **Documentation**: Read all docs thoroughly
- **GitHub Issues**: Search existing issues
- **Stack Overflow**: Search for similar errors
- **Django Docs**: https://docs.djangoproject.com
- **React Docs**: https://react.dev

---

**Last Updated**: December 2025  
**Version**: 1.0

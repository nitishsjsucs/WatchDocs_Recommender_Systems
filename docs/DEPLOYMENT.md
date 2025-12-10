# 🚀 Deployment Guide

## Table of Contents
- [Deployment Options](#deployment-options)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Production Checklist](#production-checklist)
- [Environment Variables](#environment-variables)
- [Database Migration](#database-migration)
- [Monitoring](#monitoring)

---

## Deployment Options

### Recommended Stack

| Component | Service | Why |
|-----------|---------|-----|
| **Frontend** | Vercel / Netlify | Easy static site deployment, CDN, automatic HTTPS |
| **Backend** | Railway / Render / Heroku | Easy Django deployment, automatic scaling |
| **Database** | Neon (PostgreSQL) | Serverless, auto-scaling, built-in backups |
| **Monitoring** | Sentry | Error tracking and performance monitoring |

### Alternative Options

- **All-in-One**: AWS (EC2, RDS, S3, CloudFront)
- **Container**: Docker + Kubernetes on any cloud provider
- **Serverless**: AWS Lambda (requires architecture changes)

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Steps**:

1. **Build the App**
```bash
cd WatchDocsFE
npm run build
```

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Deploy**
```bash
vercel deploy --prod
```

4. **Configure Environment Variables** in Vercel Dashboard:
```
VITE_GEMINI_API_KEY=your_key
VITE_API_URL=https://your-backend.com
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Option 2: Netlify

**Steps**:

1. **Build Settings** (Netlify Dashboard):
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Environment Variables**:
```
VITE_GEMINI_API_KEY=your_key
VITE_API_URL=https://your-backend.com
```

3. **Deploy**:
```bash
# Using Netlify CLI
netlify deploy --prod
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: GitHub Pages

**Steps**:

1. **Update `vite.config.js`**:
```javascript
export default {
  base: '/watchdocs/',  // Your repo name
  // ...
}
```

2. **Build and Deploy**:
```bash
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### Option 4: Docker

**Dockerfile**:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build and Run**:
```bash
docker build -t watchdocs-frontend .
docker run -p 80:80 watchdocs-frontend
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Steps**:

1. **Create `railway.json`**:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python manage.py migrate && gunicorn WatchDoc.wsgi:application --bind 0.0.0.0:$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Update `requirements.txt`**:
```txt
beautifulsoup4==4.12.2
requests==2.32.5
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.0
gunicorn==21.2.0
psycopg2-binary==2.9.9
whitenoise==6.6.0
```

3. **Update `settings.py`** for production:
```python
import os
import dj_database_url

DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600
    )
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
```

4. **Deploy**:
   - Connect GitHub repo to Railway
   - Set environment variables
   - Deploy automatically on push

### Option 2: Render

**Steps**:

1. **Create `render.yaml`**:
```yaml
services:
  - type: web
    name: watchdocs-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python manage.py migrate && gunicorn WatchDoc.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromDatabase:
          name: watchdocs-db
          property: connectionString
```

2. **Deploy** via Render Dashboard

### Option 3: Heroku

**Steps**:

1. **Create `Procfile`**:
```
web: python manage.py migrate && gunicorn WatchDoc.wsgi:application --log-file -
```

2. **Create `runtime.txt`**:
```
python-3.11.0
```

3. **Deploy**:
```bash
heroku login
heroku create watchdocs-backend
git push heroku main
heroku run python manage.py migrate
```

### Option 4: Docker

**Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY WatchDoc/ .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run migrations and start server
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate && gunicorn WatchDoc.wsgi:application --bind 0.0.0.0:8000"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: watchdocs
      POSTGRES_USER: watchdocs
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    command: sh -c "python manage.py migrate && gunicorn WatchDoc.wsgi:application --bind 0.0.0.0:8000"
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://watchdocs:${DB_PASSWORD}@db:5432/watchdocs
      - BROWSER_USE_API_KEY=${BROWSER_USE_API_KEY}
    depends_on:
      - db

volumes:
  postgres_data:
```

**Deploy**:
```bash
docker-compose up -d
```

---

## Production Checklist

### Security

- [ ] Set `DEBUG = False` in production
- [ ] Generate new `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Enable HTTPS only
- [ ] Use environment variables for secrets
- [ ] Enable CSRF protection
- [ ] Implement authentication
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use secure cookie settings

### Performance

- [ ] Enable database connection pooling
- [ ] Configure static file serving (WhiteNoise/CDN)
- [ ] Enable gzip compression
- [ ] Add caching (Redis)
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Configure CDN for frontend assets
- [ ] Enable browser caching

### Reliability

- [ ] Set up database backups
- [ ] Configure error logging (Sentry)
- [ ] Set up health check endpoints
- [ ] Configure auto-restart on failure
- [ ] Set up monitoring alerts
- [ ] Implement graceful shutdown
- [ ] Configure load balancing (if needed)

### Database

- [ ] Migrate from SQLite to PostgreSQL
- [ ] Run all migrations
- [ ] Create database backups
- [ ] Set up automated backup schedule
- [ ] Test restore procedure

---

## Environment Variables

### Backend (Production)

```bash
# Django Settings
SECRET_KEY=your_secure_random_key_here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# API Keys
BROWSER_USE_API_KEY=your_browser_use_api_key
VAPI_API_KEY=your_vapi_api_key

# Optional
BROWSER_USE_API_TIMEOUT=120.0
BROWSER_USE_API_POLL_INTERVAL=2.0
```

### Frontend (Production)

```bash
# API URL
VITE_API_URL=https://your-backend.com

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional
VITE_VAPI_API_KEY=your_vapi_api_key
```

---

## Database Migration

### Migrate from SQLite to PostgreSQL

**Step 1: Export Data**
```bash
python manage.py dumpdata > data.json
```

**Step 2: Update Database Settings**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'watchdocs',
        'USER': 'watchdocs_user',
        'PASSWORD': 'your_password',
        'HOST': 'your-neon-host.neon.tech',
        'PORT': '5432',
    }
}
```

**Step 3: Install PostgreSQL Adapter**
```bash
pip install psycopg2-binary
```

**Step 4: Run Migrations**
```bash
python manage.py migrate
```

**Step 5: Import Data**
```bash
python manage.py loaddata data.json
```

### Using Neon Database

**Get Connection String**:
```
postgresql://user:password@hostname.neon.tech/dbname?sslmode=require
```

**Configure Django**:
```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.parse(
        os.getenv('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True
    )
}
```

---

## Monitoring

### Sentry Integration

**Install**:
```bash
pip install sentry-sdk
```

**Configure** (settings.py):
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True,
    environment='production',
)
```

### Health Check Endpoint

**Create** (`views.py`):
```python
@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({"status": "healthy"})
```

**Add to URLs**:
```python
path('health/', views.health_check),
```

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/watchdocs/error.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

**Install Certbot**:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

**Get Certificate**:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Auto-Renewal**:
```bash
sudo certbot renew --dry-run
```

### Django HTTPS Settings

```python
# Force HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
```

---

## CI/CD Pipeline

### GitHub Actions Example

**`.github/workflows/deploy.yml`**:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          npm install -g vercel
          vercel --prod --token=$VERCEL_TOKEN
```

---

## Backup Strategy

### Database Backups

**Automated Daily Backup Script**:
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="watchdocs"

pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Cron Job**:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Performance Optimization

### Caching with Redis

**Install**:
```bash
pip install django-redis
```

**Configure**:
```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

**Use in Views**:
```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # Cache for 15 minutes
def get_documents(request):
    # ...
```

---

**Last Updated**: December 2025  
**Version**: 1.0

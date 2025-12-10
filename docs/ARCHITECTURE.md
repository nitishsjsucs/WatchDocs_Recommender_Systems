# 🏗️ System Architecture

## Table of Contents
- [Overview](#overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## Overview

WatchDocs follows a **client-server architecture** with a clear separation between the frontend (React SPA) and backend (Django REST API). The system integrates with external AI services for intelligent content analysis and voice notifications.

### Architecture Principles

1. **Separation of Concerns**: Frontend handles UI/UX, backend manages business logic and data
2. **API-First Design**: All functionality exposed through RESTful APIs
3. **AI-Powered Intelligence**: Leverages multiple AI services for enhanced functionality
4. **Modular Design**: Components are loosely coupled and highly cohesive
5. **Asynchronous Operations**: Long-running tasks handled asynchronously

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                          Client Layer                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              React Frontend (SPA)                             │ │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │ │
│  │  │  UI Layer  │  │  Business  │  │  State Management   │   │ │
│  │  │ Components │  │   Logic    │  │  (React Hooks)      │   │ │
│  │  └────────────┘  └────────────┘  └─────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │ │
│  │  │  Routing   │  │  API Layer │  │  Local Storage      │   │ │
│  │  │ (React     │  │  (Fetch)   │  │                     │   │ │
│  │  │  Router)   │  │            │  │                     │   │ │
│  │  └────────────┘  └────────────┘  └─────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               │                                    │
│                               │ HTTPS / REST API                   │
│                               ▼                                    │
└────────────────────────────────────────────────────────────────────┘
                                │
┌────────────────────────────────────────────────────────────────────┐
│                         Server Layer                                │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Django Backend (REST API)                        │ │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │ │
│  │  │   Views    │  │   Models   │  │    Middleware       │   │ │
│  │  │ (Endpoints)│  │  (ORM)     │  │  (CORS, Auth)       │   │ │
│  │  └────────────┘  └────────────┘  └─────────────────────┘   │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │ │
│  │  │  Services  │  │ Serializers│  │    URL Routing      │   │ │
│  │  │  (Business │  │            │  │                     │   │ │
│  │  │   Logic)   │  │            │  │                     │   │ │
│  │  └────────────┘  └────────────┘  └─────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                               │                                    │
│                               ▼                                    │
└────────────────────────────────────────────────────────────────────┘
                                │
┌────────────────────────────────────────────────────────────────────┐
│                       Data & Integration Layer                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │   SQLite     │  │  Browser Use │  │  Vapi Voice API      │    │
│  │   Database   │  │   Cloud API  │  │                      │    │
│  │              │  │              │  │                      │    │
│  │  ┌─────────┐ │  │ ┌──────────┐│  │  ┌─────────────────┐ │    │
│  │  │Document │ │  │ │ Gemini   ││  │  │  Voice Calls    │ │    │
│  │  │ Model   │ │  │ │ 2.5 Pro  ││  │  │  & Alerts       │ │    │
│  │  ├─────────┤ │  │ └──────────┘│  │  └─────────────────┘ │    │
│  │  │Document │ │  │              │  │                      │    │
│  │  │  Scan   │ │  │              │  │                      │    │
│  │  └─────────┘ │  │              │  │                      │    │
│  └──────────────┘  └──────────────┘  └──────────────────────┘    │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                      External Services                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │  Google Gemini   │  │  Monitored       │                       │
│  │  AI (Frontend)   │  │  Websites        │                       │
│  │                  │  │  (Target URLs)   │                       │
│  └──────────────────┘  └──────────────────┘                       │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── Layout.tsx              # App layout wrapper with navigation
│   ├── RecentWatches.tsx       # Dashboard component for recent scans
│   └── ui/                     # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── alert.tsx
│       └── ...
│
├── pages/
│   ├── NewWatch.tsx            # Create new watch (URL or AI Chat)
│   ├── WatchPage.tsx           # Dashboard/home page
│   ├── WatchDetail.tsx         # Detailed view of a specific watch
│   └── WatchTimeline.tsx       # Timeline view of scan history
│
├── lib/
│   ├── gemini.ts               # Google Gemini AI integration
│   ├── storage.ts              # Local storage utilities
│   ├── utils.ts                # General utilities
│   └── validation.ts           # URL validation
│
├── hooks/
│   └── use-toast.ts            # Toast notification hook
│
└── types/
    └── index.ts                # TypeScript type definitions
```

### Backend Components

```
WatchDoc/
├── main/                       # Main Django app
│   ├── models.py               # Data models (Document, DocumentScan)
│   ├── views.py                # API endpoint handlers
│   ├── browser_use_client.py   # Browser Use API client
│   ├── makeCriticalCall.py     # Critical alert call handler
│   ├── makeGeneralCall.py      # General update call handler
│   ├── admin.py                # Django admin configuration
│   └── migrations/             # Database migrations
│
└── WatchDoc/                   # Django project settings
    ├── settings.py             # Application configuration
    ├── urls.py                 # URL routing
    ├── wsgi.py                 # WSGI configuration
    └── asgi.py                 # ASGI configuration
```

---

## Data Flow

### 1. Document Creation Flow

```
User Input (Frontend)
    │
    ├─► URL Mode: Direct URL entry
    │       └─► Validation → Preview → Create
    │
    └─► AI Chat Mode: Conversational input
            └─► Gemini AI → URL Suggestion → Create
                    │
                    ▼
            POST /createDocumentAndScan/
                    │
                    ├─► Create Document in DB
                    │
                    ├─► Browser Use API Call
                    │   (Initial Baseline Scan)
                    │       │
                    │       ├─► Visit URL
                    │       ├─► Extract Content
                    │       ├─► Generate Summary
                    │       └─► Return Results
                    │
                    ├─► Beautiful Soup Extraction
                    │   (Raw Content Backup)
                    │
                    ├─► Create DocumentScan in DB
                    │   ├─► Store change data
                    │   ├─► Store summaries
                    │   └─► Store raw content
                    │
                    └─► Return Response to Frontend
                            │
                            └─► Navigate to Dashboard
```

### 2. Scan Execution Flow

```
Scheduled Scan / Manual Trigger
    │
    ▼
POST /runScans/
    │
    ├─► Fetch All Documents
    │
    ├─► For Each Document:
    │       │
    │       ├─► Get Latest Scan (Previous Snapshot)
    │       │
    │       ├─► Browser Use API Call
    │       │   (Compare Current vs Previous)
    │       │       │
    │       │       ├─► Visit URL
    │       │       ├─► Extract Current Content
    │       │       ├─► Compare with Previous
    │       │       ├─► Detect Changes
    │       │       ├─► Categorize Changes
    │       │       │   ├─► Additions
    │       │       │   ├─► Deletions
    │       │       │   └─► Modifications
    │       │       ├─► Calculate Severity
    │       │       └─► Generate Summary
    │       │
    │       ├─► Beautiful Soup Extraction
    │       │
    │       ├─► Create New DocumentScan
    │       │
    │       └─► If Critical Change:
    │               └─► Trigger Vapi Call
    │
    └─► Return Scan Results
```

### 3. Data Retrieval Flow

```
GET /documents/
    │
    ├─► Fetch All Documents (Ordered by Date)
    │
    ├─► For Each Document:
    │       └─► Get Latest Scan
    │
    └─► Return Document List with Latest Scan Data

GET /documents/{id}/
    │
    ├─► Fetch Specific Document
    │
    ├─► Fetch All Scans for Document
    │
    ├─► Parse Raw Data
    │
    └─► Return Complete Document + Scan History
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.2.2 | Type safety |
| **Vite** | 5.2.0 | Build tool & dev server |
| **TailwindCSS** | 3.3.6 | Utility-first styling |
| **Shadcn UI** | Latest | Component library |
| **React Router** | 6.20.1 | Client-side routing |
| **Lucide React** | 0.294.0 | Icon library |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **Google Gemini AI** | 0.24.1 | AI chat integration |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Django** | 4.2+ | Web framework |
| **SQLite** | 3 | Database |
| **Django REST Framework** | Latest | API framework |
| **Django CORS Headers** | Latest | CORS handling |
| **Requests** | 2.32.5 | HTTP client |
| **Beautiful Soup** | 4.12.2 | HTML parsing |

### External APIs

| Service | Purpose |
|---------|---------|
| **Browser Use Cloud API** | AI-powered web scraping & comparison |
| **Google Gemini 2.5 Pro** | AI chat & content analysis (Frontend) |
| **Vapi Voice AI** | Voice call notifications |

---

## Design Patterns

### 1. **Repository Pattern**
- `storage.ts`: Abstracts data persistence (localStorage)
- Future-ready for backend API migration

### 2. **Client Pattern**
- `browser_use_client.py`: Encapsulates Browser Use API interactions
- Handles authentication, retries, and error handling

### 3. **Service Layer Pattern**
- Views delegate to service functions
- Business logic separated from request handling

### 4. **Component Composition**
- Shadcn UI components composed for complex UIs
- Reusable, maintainable component hierarchy

### 5. **Hook Pattern**
- Custom hooks (`use-toast.ts`) for shared stateful logic
- Clean separation of concerns

### 6. **Presenter Pattern**
- Backend serializes data for API responses
- Frontend transforms API data for UI rendering

---

## Security Architecture

### Current Implementation

1. **CORS Configuration**
   - Whitelist allowed origins
   - Configured in Django settings

2. **CSRF Protection**
   - Django CSRF middleware enabled
   - Exempted for API endpoints (should use tokens in production)

3. **API Key Management**
   - Browser Use API key stored in Django settings
   - Frontend API keys in environment variables

4. **Input Validation**
   - URL validation on frontend and backend
   - JSON schema validation

### Production Recommendations

1. **Authentication & Authorization**
   - Implement JWT or session-based auth
   - Role-based access control (RBAC)

2. **API Security**
   - Rate limiting
   - API key rotation
   - Request signing

3. **Data Encryption**
   - HTTPS in production
   - Encrypt sensitive data at rest
   - Secure API key storage (AWS Secrets Manager, etc.)

4. **SQL Injection Prevention**
   - Django ORM provides protection
   - Never use raw SQL with user input

---

## Scalability Considerations

### Current Architecture Limitations

1. **Database**: SQLite (single-file, not suitable for high concurrency)
2. **Synchronous Scans**: Blocking operations during scans
3. **No Caching**: Repeated API calls for same data
4. **Local Storage**: Frontend data not synced across devices

### Scaling Strategies

#### Phase 1: Optimize Current Stack
- Add database indexing
- Implement API response caching (Redis)
- Use connection pooling

#### Phase 2: Asynchronous Processing
- Celery for background task processing
- Message queue (RabbitMQ/Redis) for scan jobs
- Separate worker processes for scans

#### Phase 3: Database Migration
- PostgreSQL for production (Neon serverless recommended)
- Read replicas for query optimization
- Implement database sharding if needed

#### Phase 4: Microservices (if needed)
- Separate scan service
- Separate notification service
- API gateway for routing

#### Phase 5: Infrastructure Scaling
- Load balancer (Nginx/HAProxy)
- Horizontal scaling with Docker/Kubernetes
- CDN for static assets
- Distributed caching

---

## Monitoring & Observability

### Current Logging
- Django logging to console
- Browser Use API debugging logs

### Recommended Additions
1. **Application Monitoring**: Sentry, Datadog, New Relic
2. **Performance Monitoring**: APM tools
3. **Log Aggregation**: ELK Stack, Splunk
4. **Metrics**: Prometheus + Grafana
5. **Alerting**: PagerDuty, Opsgenie

---

## Future Architecture Enhancements

1. **Real-time Updates**: WebSockets for live scan status
2. **Multi-tenant Support**: Separate data by user/organization
3. **Plugin System**: Extensible scan strategies
4. **API Versioning**: Backward compatibility
5. **Event-Driven Architecture**: Event sourcing for audit trails

---

**Last Updated**: December 2025  
**Version**: 1.0

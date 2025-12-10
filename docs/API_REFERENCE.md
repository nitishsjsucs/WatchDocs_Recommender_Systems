# 📡 API Reference

Complete reference for all WatchDocs API endpoints.

## Base URL

```
http://localhost:8000
```

For production, replace with your deployed backend URL.

---

## Authentication

Currently, the API does not require authentication. **This should be added for production use.**

### Future Authentication (Recommended)

```http
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/documents/` | Get all documents with latest scans |
| POST | `/createDocumentAndScan/` | Create document and run initial scan |
| POST | `/runScans/` | Run scans on all documents |
| GET | `/documents/{id}/` | Get document details with full history |
| GET | `/documents/{id}/timeline/` | Get timeline view of scans |
| POST | `/make_general_call/` | Trigger voice call (demo) |

---

## GET /documents/

Retrieve all documents with their latest scan information.

### Request

```http
GET /documents/ HTTP/1.1
Host: localhost:8000
```

### Response

**Status**: `200 OK`

```json
{
  "documents": [
    {
      "id": 1,
      "title": "OpenAI Blog",
      "desc": "Monitor AI developments",
      "url": "https://openai.com/blog",
      "status": "Healthy",
      "created_date": "2025-12-04T10:00:00.000Z",
      "latest_scan": {
        "id": 5,
        "changes": true,
        "change_level": "Major",
        "change_summary": "New blog post about GPT-5 released",
        "current_summary": "The blog now contains 15 posts including...",
        "scan_date": "2025-12-04T15:30:00.000Z",
        "additions": [
          "New post: Introducing GPT-5",
          "New author bio section"
        ],
        "deletions": [
          "Old promotional banner"
        ],
        "modifications": [
          "Updated homepage hero image",
          "Revised about page content"
        ]
      }
    },
    {
      "id": 2,
      "title": "GitHub Status",
      "desc": "Monitor service status",
      "url": "https://www.githubstatus.com",
      "status": "Healthy",
      "created_date": "2025-12-03T08:00:00.000Z",
      "latest_scan": null
    }
  ],
  "total_count": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `documents` | Array | List of document objects |
| `documents[].id` | Integer | Unique document ID |
| `documents[].title` | String | Document title |
| `documents[].desc` | String | Document description |
| `documents[].url` | String | Monitored URL |
| `documents[].status` | String | Health status (Healthy, Warning, Critical) |
| `documents[].created_date` | ISO 8601 | Document creation timestamp |
| `documents[].latest_scan` | Object/null | Latest scan data or null if no scans |
| `total_count` | Integer | Total number of documents |

### Latest Scan Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Scan ID |
| `changes` | Boolean | Whether changes were detected |
| `change_level` | String | Severity: "No Change", "Low", "Major", "Critical" |
| `change_summary` | String/null | AI-generated summary of changes |
| `current_summary` | String | Detailed summary of current document state |
| `scan_date` | ISO 8601 | When the scan was performed |
| `additions` | Array[String] | List of added content |
| `deletions` | Array[String] | List of removed content |
| `modifications` | Array[String] | List of modified content |

### Example (cURL)

```bash
curl http://localhost:8000/documents/
```

### Example (JavaScript)

```javascript
const response = await fetch('http://localhost:8000/documents/');
const data = await response.json();
console.log(data.documents);
```

### Example (Python)

```python
import requests

response = requests.get('http://localhost:8000/documents/')
data = response.json()
print(f"Found {data['total_count']} documents")
```

---

## POST /createDocumentAndScan/

Create a new document and immediately perform an initial baseline scan.

### Request

```http
POST /createDocumentAndScan/ HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "title": "OpenAI Blog",
  "url": "https://openai.com/blog",
  "desc": "Monitor AI developments",
  "status": "Healthy"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ Yes | Document title |
| `url` | String | ✅ Yes | URL to monitor (must be valid HTTP/HTTPS) |
| `desc` | String | ❌ No | Document description (default: "") |
| `status` | String | ❌ No | Initial status (default: "Healthy") |

### Response

**Status**: `200 OK`

```json
{
  "message": "Document created and scanned successfully",
  "document": {
    "id": 1,
    "title": "OpenAI Blog",
    "desc": "Monitor AI developments",
    "url": "https://openai.com/blog",
    "status": "Healthy",
    "created_date": "2025-12-04T10:00:00.000Z"
  },
  "scan": {
    "id": 1,
    "changes": false,
    "change_level": "No Change",
    "change_summary": "Initial baseline scan. Document captured successfully.",
    "current_summary": "The OpenAI blog features 15 posts covering topics including...",
    "scan_date": "2025-12-04T10:00:30.000Z"
  }
}
```

### Error Responses

**Status**: `400 Bad Request`

```json
{
  "error": "Missing required fields: title, url"
}
```

**Status**: `500 Internal Server Error`

```json
{
  "error": "Scan failed: Browser Use API timeout"
}
```

### Example (cURL)

```bash
curl -X POST http://localhost:8000/createDocumentAndScan/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OpenAI Blog",
    "url": "https://openai.com/blog",
    "desc": "Monitor AI updates"
  }'
```

### Example (JavaScript)

```javascript
const response = await fetch('http://localhost:8000/createDocumentAndScan/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    desc: 'Monitor AI updates'
  })
});

const data = await response.json();
console.log('Document created:', data.document.id);
```

### Example (Python)

```python
import requests

payload = {
    'title': 'OpenAI Blog',
    'url': 'https://openai.com/blog',
    'desc': 'Monitor AI updates'
}

response = requests.post(
    'http://localhost:8000/createDocumentAndScan/',
    json=payload
)

data = response.json()
print(f"Created document ID: {data['document']['id']}")
```

### Processing Time

Initial scans typically take **30-60 seconds** due to:
- Browser Use API processing
- AI content analysis
- Summary generation

---

## POST /runScans/

Run scans on all existing documents to detect changes.

### Request

```http
POST /runScans/ HTTP/1.1
Host: localhost:8000
```

**Note**: Empty POST request (no body required)

### Response

**Status**: `200 OK`

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `results` | Array | Scan results for each document |
| `results[].document_id` | Integer | Document that was scanned |
| `results[].scan_id` | Integer | New scan ID created |
| `results[].changes` | Boolean | Whether changes were detected |
| `results[].change_level` | String | Severity of changes |

### Error Response

**Status**: `500 Internal Server Error`

```json
{
  "error": "Browser Use API error: Invalid API key"
}
```

### Example (cURL)

```bash
curl -X POST http://localhost:8000/runScans/
```

### Example (JavaScript)

```javascript
const response = await fetch('http://localhost:8000/runScans/', {
  method: 'POST'
});

const data = await response.json();
console.log(`Scanned ${data.results.length} documents`);
```

### Example (Python)

```python
import requests

response = requests.post('http://localhost:8000/runScans/')
data = response.json()

for result in data['results']:
    print(f"Document {result['document_id']}: {result['change_level']}")
```

### Processing Time

Scans run sequentially for all documents. With N documents:
- **Time**: ~30-60 seconds per document
- **Total**: N × 30-60 seconds

---

## GET /documents/{id}/

Get comprehensive details for a specific document including full scan history.

### Request

```http
GET /documents/1/ HTTP/1.1
Host: localhost:8000
```

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Integer | Document ID |

### Response

**Status**: `200 OK`

```json
{
  "document": {
    "id": 1,
    "title": "OpenAI Blog",
    "desc": "Monitor AI developments",
    "url": "https://openai.com/blog",
    "status": "Healthy",
    "category": "General",
    "created_date": "2025-12-04T10:00:00.000Z",
    "scan_count": 5,
    "latest_scan": {
      "id": 5,
      "changes": true,
      "change_level": "Major",
      "change_summary": "New blog post released",
      "current_summary": "Detailed summary...",
      "scan_date": "2025-12-04T15:30:00.000Z",
      "additions": ["New post"],
      "deletions": [],
      "modifications": ["Homepage"]
    },
    "scan_history": [
      {
        "id": 5,
        "date": "2025-12-04T15:30:00.000Z",
        "changes": true,
        "change_level": "Major",
        "change_summary": "New blog post released",
        "current_summary": "Summary...",
        "raw_content_preview": "First 200 chars...",
        "additions": ["New post"],
        "deletions": [],
        "modifications": ["Homepage"],
        "changes_detail": {
          "added": ["New post"],
          "removed": [],
          "modified": ["Homepage"]
        }
      },
      {
        "id": 4,
        "date": "2025-12-04T10:30:00.000Z",
        "changes": false,
        "change_level": "No Change",
        "change_summary": null,
        "current_summary": "Summary...",
        "raw_content_preview": "First 200 chars...",
        "additions": [],
        "deletions": [],
        "modifications": []
      }
    ]
  },
  "total_scans": 5
}
```

### Error Response

**Status**: `404 Not Found`

```json
{
  "error": "Document not found"
}
```

### Example (cURL)

```bash
curl http://localhost:8000/documents/1/
```

### Example (JavaScript)

```javascript
const documentId = 1;
const response = await fetch(`http://localhost:8000/documents/${documentId}/`);
const data = await response.json();
console.log(`Document has ${data.total_scans} scans`);
```

---

## GET /documents/{id}/timeline/

Get timeline view of all scans for a document (optimized for timeline UI).

### Request

```http
GET /documents/1/timeline/ HTTP/1.1
Host: localhost:8000
```

### Response

**Status**: `200 OK`

```json
{
  "document": {
    "id": 1,
    "title": "OpenAI Blog",
    "desc": "Monitor AI developments",
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
      "description": "New blog post about GPT-5 released",
      "change_level": "Major",
      "change_summary": "New blog post about GPT-5",
      "current_summary": "Full summary...",
      "raw_content": "Page content...",
      "changes": {
        "added": ["New post"],
        "removed": [],
        "modified": ["Homepage"]
      }
    },
    {
      "id": "4",
      "timestamp": "2025-12-04T10:30:00.000Z",
      "status": "captured",
      "title": "Periodic Check",
      "description": "Routine monitoring scan completed",
      "change_level": "No Change",
      "change_summary": null,
      "current_summary": "Summary...",
      "raw_content": "Content...",
      "changes": null
    },
    {
      "id": "1",
      "timestamp": "2025-12-04T10:00:00.000Z",
      "status": "captured",
      "title": "Initial Capture",
      "description": "Initial baseline scan.",
      "change_level": "No Change",
      "change_summary": "Initial baseline scan.",
      "current_summary": "Summary...",
      "raw_content": "Content...",
      "changes": null
    }
  ],
  "total_scans": 5
}
```

### Timeline Entry Status

| Status | Description |
|--------|-------------|
| `captured` | No changes detected (baseline or periodic check) |
| `changed` | Changes detected |

### Error Response

**Status**: `404 Not Found`

```json
{
  "error": "Document not found"
}
```

---

## POST /make_general_call/

Trigger a voice call with sample update context (demo/testing endpoint).

### Request

```http
POST /make_general_call/ HTTP/1.1
Host: localhost:8000
```

**Note**: No request body required (uses sample context)

### Response

**Status**: `200 OK`

```json
{
  "success": true,
  "message": "General call initiated successfully",
  "context_used": "Sample update context...",
  "call_result": {
    "call_id": "abc123",
    "status": "initiated"
  }
}
```

### Error Response

**Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Failed to make general call: Vapi API error",
  "context_used": "Sample context..."
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid request data |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error or API failure |

### Common Errors

#### Browser Use API Errors

```json
{
  "error": "Browser Use API error: Invalid API key"
}
{
  "error": "Browser Use API timeout"
}
{
  "error": "Browser Use task failed: Network error"
}
```

#### Validation Errors

```json
{
  "error": "Missing required fields: title, url"
}
{
  "error": "Invalid JSON"
}
```

---

## Rate Limiting

Currently, there is **no rate limiting** implemented.

### Recommended Limits (for production)

- **Per User**: 100 requests/hour
- **Per IP**: 1000 requests/hour
- **Scan Operations**: 10/hour (expensive operations)

---

## Pagination

Currently, **no pagination** is implemented. All documents are returned in a single response.

### Future Pagination (Recommended)

```http
GET /documents/?page=1&limit=20
```

Response:
```json
{
  "documents": [...],
  "total_count": 100,
  "page": 1,
  "limit": 20,
  "total_pages": 5
}
```

---

## Filtering & Sorting

Not currently implemented.

### Future Filtering (Recommended)

```http
GET /documents/?status=Healthy
GET /documents/?category=Tech
GET /documents/?changes=true
```

### Future Sorting

```http
GET /documents/?sort_by=created_date&order=desc
GET /documents/?sort_by=title&order=asc
```

---

## Webhooks

Not currently implemented.

### Future Webhook Support

Register webhook URLs to receive notifications:

```http
POST /webhooks/
{
  "url": "https://your-app.com/webhook",
  "events": ["scan_completed", "changes_detected"]
}
```

---

## API Versioning

Current version: **v1** (implicit)

Future versions should use URL versioning:
```
/api/v1/documents/
/api/v2/documents/
```

---

**Last Updated**: December 2025  
**Version**: 1.0

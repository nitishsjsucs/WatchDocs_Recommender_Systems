# WatchDoc API Endpoints

## Overview
WatchDoc provides three main API endpoints for document monitoring:

1. **Get Documents** - Fetches all documents with their latest scan information
2. **Create Document and Scan** - Creates a new document and immediately runs an initial scan
3. **Run Scans** - Runs scans on all existing documents

## Endpoints

### 1. Get Documents
**URL:** `GET /documents/`

Fetches all documents ordered by creation date (newest first) with their latest scan information.

**Request Body:** None

**Response (Success - 200):**
```json
{
    "documents": [
        {
            "id": 1,
            "title": "Document Title",
            "desc": "Document description",
            "url": "https://example.com/document",
            "status": "Healthy",
            "created_date": "2025-09-27T10:30:00.000Z",
            "latest_scan": {
                "id": 5,
                "changes": true,
                "change_level": "Major",
                "change_summary": "Significant content changes detected...",
                "current_summary": "Current document summary...",
                "scan_date": "2025-09-27T15:45:00.000Z",
                "additions": ["New pricing section", "Customer testimonials"],
                "deletions": ["Old promotional banner"],
                "modifications": ["Navigation menu items", "Footer links"]
            }
        },
        {
            "id": 2,
            "title": "Another Document",
            "desc": "Another description",
            "url": "https://example2.com",
            "status": "Warning",
            "created_date": "2025-09-26T09:15:00.000Z",
            "latest_scan": null
        }
    ],
    "total_count": 2
}
```

**Notes:**
- Documents without any scans will have `latest_scan: null`
- Only the most recent scan per document is included
- Documents are ordered by creation date (newest first)

### 2. Create Document and Scan
**URL:** `POST /createDocumentAndScan/`

Creates a new document and immediately performs an initial baseline scan.

**Request Body:**
```json
{
    "title": "Document Title",
    "url": "https://example.com/document",
    "desc": "Optional description",
    "status": "Healthy"
}
```

**Required Fields:**
- `title`: Document title
- `url`: URL to monitor

**Optional Fields:**
- `desc`: Document description (default: empty string)
- `status`: Document status (default: "Healthy")

**Response (Success - 200):**
```json
{
    "message": "Document created and scanned successfully",
    "document": {
        "id": 1,
        "title": "Document Title",
        "desc": "Optional description",
        "url": "https://example.com/document",
        "status": "Healthy",
        "created_date": "2025-09-27T10:30:00.000Z"
    },
    "scan": {
        "id": 1,
        "changes": false,
        "change_level": "No Change",
        "change_summary": "Initial baseline scan.",
        "current_summary": "Detailed summary of the document...",
        "scan_date": "2025-09-27T10:30:00.000Z"
    }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid JSON
- `500 Internal Server Error` - Browser Use API error or scan failure

### 3. Run Scans
**URL:** `POST /runScans/`

Runs scans on all existing documents, comparing against their most recent scan.

**Request Body:** None (empty POST request)

**Response (Success - 200):**
```json
{
    "results": [
        {
            "document_id": 1,
            "scan_id": 2,
            "changes": true,
            "change_level": "Major"
        },
        {
            "document_id": 2,
            "scan_id": 3,
            "changes": false,
            "change_level": "No Change"
        }
    ]
}
```

**Error Response:**
- `500 Internal Server Error` - Browser Use client initialization error

## Usage Examples

### curl Examples

**Get Documents:**
```bash
curl -X GET http://localhost:8000/documents/
```

**Create Document and Scan:**
```bash
curl -X POST http://localhost:8000/createDocumentAndScan/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OpenAI Blog",
    "url": "https://openai.com/blog/",
    "desc": "Monitor OpenAI blog updates"
  }'
```

**Run Scans:**
```bash
curl -X POST http://localhost:8000/runScans/
```

### Python Example

See `example_usage.py` for a complete Python example using the requests library.

## Change Levels

The system categorizes document changes into four levels:

- **No Change**: Document content is identical to previous scan
- **Low**: Minor changes detected (typos, small text updates)
- **Major**: Significant changes detected (new sections, restructuring)
- **Critical**: Major structural changes or critical content updates

## Data Storage

Each scan stores:
- Change detection flag and severity level
- Detailed change summary
- Complete current document summary
- Raw page content for future comparisons
- Timestamp of scan execution

### 4. Get Document Details (Comprehensive Data)
**URL:** `GET /documents/{document_id}/`

Fetches comprehensive information about a specific document, including complete scan history and detailed change information.

**URL Parameter:**
- `document_id` (integer): The ID of the document to retrieve

**Request Body:** None

**Response (Success - 200):**
```json
{
    "document": {
        "id": 1,
        "title": "Document Title",
        "desc": "Document description", 
        "url": "https://example.com/document",
        "status": "Healthy",
        "category": "General",
        "created_date": "2025-09-27T10:30:00.000Z",
        "scan_count": 3,
        "latest_scan": {
            "id": 15,
            "changes": true,
            "change_level": "Major",
            "change_summary": "Significant content changes detected...",
            "current_summary": "Current document summary...",
            "scan_date": "2025-09-27T15:45:00.000Z",
            "additions": ["New pricing section", "Customer testimonials"],
            "deletions": ["Old promotional banner"],
            "modifications": ["Navigation menu items", "Footer links"]
        },
        "scan_history": [
            {
                "id": 15,
                "date": "2025-09-27T15:45:00.000Z",
                "changes": true,
                "change_level": "Major",
                "change_summary": "Significant content changes detected",
                "current_summary": "Current document summary...",
                "raw_content_preview": "First 200 characters of the page content...",
                "additions": ["New pricing section", "Customer testimonials"],
                "deletions": ["Old promotional banner"],
                "modifications": ["Navigation menu items", "Footer links"],
                "changes_detail": {
                    "added": ["New pricing section", "Customer testimonials"],
                    "removed": ["Old promotional banner"],
                    "modified": ["Navigation menu items", "Footer links"]
                }
            }
        ]
    },
    "total_scans": 3
}
```

**Response Fields:**
- `document`: Complete document information with scan history
- `total_scans`: Total number of scans for this document
- `scan_history`: Complete chronological scan history (newest first)
- `changes_detail`: Structured breakdown of specific changes
- `raw_content_preview`: First 200 characters of the raw page content

**Error Responses:**
- `404`: Document not found

## Environment Setup

Ensure the following environment variables are set:
- `BROWSER_USE_API_KEY`: Your Browser Use Cloud API key
- `BROWSER_USE_INCLUDE_SCHEMA`: Set to `true` if you want to include structured output schema (default: `false`)
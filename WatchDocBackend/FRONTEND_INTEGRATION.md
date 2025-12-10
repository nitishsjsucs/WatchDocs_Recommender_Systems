# Frontend Integration Guide

## Timeline API Endpoint

The new timeline endpoint provides structured change data that matches the format expected by your `WatchTimeline.tsx` component.

### Endpoint

```
GET /documents/{document_id}/timeline/
```

### Response Format

```json
{
  "document": {
    "id": 1,
    "title": "Example Website",
    "desc": "Website description",
    "url": "https://example.com",
    "status": "Healthy",
    "created_date": "2023-09-27T10:00:00Z"
  },
  "timeline": [
    {
      "id": "123",
      "timestamp": "2023-09-27T14:30:00Z",
      "status": "changed",
      "title": "Major Changes Detected",
      "description": "Significant content updates detected",
      "change_level": "Major",
      "change_summary": "Homepage updated with new pricing and testimonials",
      "current_summary": "Updated homepage with new features...",
      "raw_content": "Raw HTML content...",
      "changes": {
        "added": [
          "New pricing section", 
          "Customer testimonials"
        ],
        "removed": [
          "Old promotional banner"
        ],
        "modified": [
          "Navigation menu items",
          "Footer links"
        ]
      }
    },
    {
      "id": "122",
      "timestamp": "2023-09-27T12:00:00Z",
      "status": "captured",
      "title": "Periodic Check",
      "description": "Routine monitoring scan completed",
      "change_level": "No Change",
      "changes": {
        "added": [],
        "removed": [],
        "modified": []
      }
    }
  ],
  "total_scans": 2
}
```

### Integration with React Component

Update your `WatchTimeline.tsx` component to fetch real data:

```typescript
// In WatchTimeline.tsx
const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTimeline = async () => {
    try {
      const response = await fetch(`/api/documents/${id}/timeline/`);
      const data = await response.json();
      
      // Transform API response to match component format
      const entries = data.timeline.map(item => ({
        id: item.id,
        timestamp: new Date(item.timestamp),
        status: item.status,
        title: item.title,
        description: item.description,
        changes: item.changes,
        screenshotUrl: '/placeholder-screenshot.png' // You can add this later
      }));
      
      setTimelineEntries(entries);
      setWatch({
        id: data.document.id,
        title: data.document.title,
        url: data.document.url,
        // ... other fields
      });
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchTimeline();
  }
}, [id]);
```

### Change Types

The API returns changes in three categories that match your component's expected format:

- **added**: New content, sections, links, images, or features
- **removed**: Content that was present before but is now gone
- **modified**: Existing content that has been altered or updated

### Status Mapping

- `"captured"` - Successful scan with no changes or initial baseline
- `"changed"` - Changes detected in the document  
- `"error"` - Scan failed (you can add error handling for failed scans)

## Available Endpoints

1. **GET /documents/** - List all documents with latest scan info
2. **POST /createDocumentAndScan/** - Create new document and run initial scan
3. **POST /runScans/** - Run scans on all existing documents
4. **GET /documents/{id}/timeline/** - Get detailed timeline for specific document

## Change Detection

The system now uses Browser Use AI for intelligent change detection combined with Beautiful Soup for reliable content extraction, providing:

- Detailed change categorization (added/removed/modified)
- Severity assessment (No Change/Low/Major/Critical)
- Rich summaries of current document state
- Raw content preservation for backup/comparison

## Next Steps

1. Replace the mock data in your React component with API calls
2. Add error handling for API failures
3. Consider adding loading states and retry logic
4. Implement real-time updates or polling for new scans
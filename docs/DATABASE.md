# 🗄️ Database Documentation

## Table of Contents
- [Overview](#overview)
- [Database Schema](#database-schema)
- [Models](#models)
- [Relationships](#relationships)
- [Migrations](#migrations)
- [Queries](#queries)
- [Optimization](#optimization)

---

## Overview

### Current Database

**Type**: SQLite 3  
**File**: `WatchDocBackend/WatchDoc/db.sqlite3`  
**ORM**: Django ORM

**Advantages**:
- Zero configuration
- File-based (easy backup)
- Perfect for development
- No separate server needed

**Limitations**:
- Limited concurrency
- Not suitable for high traffic
- File locking issues
- Limited data types

### Production Recommendation

**Type**: PostgreSQL (Neon serverless recommended)

**Why PostgreSQL**:
- Better concurrency support
- Advanced data types (JSON, Arrays)
- Full-text search
- Better performance at scale
- Industry standard

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────┐
│         Document            │
├─────────────────────────────┤
│ id (PK)        INTEGER      │
│ title          VARCHAR(200) │
│ desc           TEXT         │
│ url            TEXT         │
│ status         VARCHAR(50)  │
│ date           DATETIME     │
│ category       VARCHAR(100) │
└─────────────────────────────┘
              │
              │ 1
              │
              │ has many
              │
              ▼ *
┌─────────────────────────────┐
│       DocumentScan          │
├─────────────────────────────┤
│ id (PK)        INTEGER      │
│ document_id(FK)INTEGER      │
│ date           DATETIME     │
│ changeLevel    VARCHAR(50)  │
│ changes        BOOLEAN      │
│ changeSummary  TEXT         │
│ currentSummary TEXT         │
│ additions      TEXT         │
│ deletions      TEXT         │
│ modifications  TEXT         │
│ rawData        TEXT         │
└─────────────────────────────┘
```

### Table: `main_document`

Stores information about monitored websites.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INTEGER | NO | Auto | Primary key |
| `title` | VARCHAR(200) | NO | - | Document title |
| `desc` | TEXT | NO | '' | Description |
| `url` | TEXT | NO | - | Website URL |
| `status` | VARCHAR(50) | NO | 'Healthy' | Health status |
| `date` | DATETIME | NO | Now | Created timestamp |
| `category` | VARCHAR(100) | YES | 'General' | Category |

**Indexes**:
- Primary key on `id`
- Index on `date` (for sorting)

**Sample Data**:
```sql
INSERT INTO main_document (title, url, desc, status, date, category)
VALUES (
  'OpenAI Blog',
  'https://openai.com/blog',
  'Monitor AI developments',
  'Healthy',
  '2025-12-04 10:00:00',
  'General'
);
```

### Table: `main_documentscan`

Stores scan results for each document.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | INTEGER | NO | Auto | Primary key |
| `document_id` | INTEGER | NO | - | Foreign key to document |
| `date` | DATETIME | NO | Now | Scan timestamp |
| `changeLevel` | VARCHAR(50) | NO | 'No Change' | Severity level |
| `changes` | BOOLEAN | NO | FALSE | Changes detected flag |
| `changeSummary` | TEXT | YES | NULL | AI summary of changes |
| `currentSummary` | TEXT | YES | NULL | Current doc summary |
| `additions` | TEXT | YES | NULL | Added content (newline-separated) |
| `deletions` | TEXT | YES | NULL | Removed content |
| `modifications` | TEXT | YES | NULL | Modified content |
| `rawData` | TEXT | YES | NULL | Complete JSON payload |

**Indexes**:
- Primary key on `id`
- Foreign key on `document_id`
- Index on `document_id, date` (for efficient queries)

**Constraints**:
```sql
FOREIGN KEY (document_id) REFERENCES main_document(id) ON DELETE CASCADE
CHECK (changeLevel IN ('No Change', 'Low', 'Major', 'Critical'))
```

**Sample Data**:
```sql
INSERT INTO main_documentscan (
  document_id, date, changeLevel, changes, 
  changeSummary, currentSummary, additions, deletions, modifications, rawData
)
VALUES (
  1,
  '2025-12-04 15:30:00',
  'Major',
  TRUE,
  'New blog post published',
  'OpenAI blog now features 15 posts...',
  'New post: Introducing GPT-5',
  NULL,
  'Homepage hero image',
  '{"difference_detected": true, ...}'
);
```

---

## Models

### Document Model

**File**: `WatchDocBackend/WatchDoc/main/models.py`

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
    
    class Meta:
        ordering = ['-date']  # Newest first
```

**Properties**:
- `title`: Human-readable name
- `desc`: Optional description
- `url`: Full URL to monitor
- `status`: Current health (Healthy, Warning, Critical)
- `date`: When document was added
- `category`: Classification tag

**Methods**:
```python
# Get latest scan
document.documentscan_set.order_by('-date').first()

# Get scan count
document.documentscan_set.count()

# Get all scans
document.documentscan_set.all()
```

### DocumentScan Model

**File**: `WatchDocBackend/WatchDoc/main/models.py`

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
    
    class Meta:
        ordering = ['-date']  # Newest first
```

**Properties**:
- `document`: Reference to monitored document
- `date`: When scan was performed
- `changeLevel`: Severity (constrained choices)
- `changes`: Boolean flag for quick filtering
- `changeSummary`: AI-generated change description
- `currentSummary`: Full current state description
- `additions/deletions/modifications`: Newline-separated lists
- `rawData`: JSON string with complete data

**JSON Structure in rawData**:
```python
{
    "difference_detected": bool,
    "difference_description": str,
    "severity": str,
    "current_summary": str,
    "raw_content": str,  # Full page text
    "changes": {
        "added": List[str],
        "removed": List[str],
        "modified": List[str]
    }
}
```

---

## Relationships

### One-to-Many: Document → DocumentScan

**Relationship**: One document has many scans

**Django ORM**:
```python
# From Document
document = Document.objects.get(id=1)
scans = document.documentscan_set.all()
latest_scan = document.documentscan_set.first()

# From DocumentScan
scan = DocumentScan.objects.get(id=5)
document = scan.document
```

**SQL**:
```sql
-- Get all scans for a document
SELECT * FROM main_documentscan 
WHERE document_id = 1 
ORDER BY date DESC;

-- Get document for a scan
SELECT d.* FROM main_document d
JOIN main_documentscan s ON d.id = s.document_id
WHERE s.id = 5;
```

**Cascade Delete**:
When a document is deleted, all its scans are automatically deleted.

```python
document.delete()  # Also deletes all associated scans
```

---

## Migrations

### Current Migrations

**File**: `WatchDocBackend/WatchDoc/main/migrations/0001_initial.py`

**What it creates**:
- `main_document` table
- `main_documentscan` table
- Foreign key relationship
- Indexes

### Creating New Migrations

**When to create**:
- Adding new field
- Changing field type
- Adding/removing model
- Changing relationships

**Process**:
```bash
# 1. Modify models.py
# 2. Generate migration
python manage.py makemigrations

# 3. Review migration file
cat main/migrations/0002_auto_20251204.py

# 4. Apply migration
python manage.py migrate

# 5. Verify
python manage.py showmigrations
```

### Example: Add New Field

```python
# 1. Edit models.py
class Document(models.Model):
    # ... existing fields ...
    priority = models.IntegerField(default=0)  # New field

# 2. Create migration
python manage.py makemigrations
# Creates: migrations/0002_document_priority.py

# 3. Apply migration
python manage.py migrate
```

### Migration Rollback

```bash
# Rollback to specific migration
python manage.py migrate main 0001_initial

# Rollback all migrations for an app
python manage.py migrate main zero
```

---

## Queries

### Common Queries

**Get All Documents**:
```python
documents = Document.objects.all()
documents = Document.objects.all().order_by('-date')  # Newest first
```

**Get Document by ID**:
```python
document = Document.objects.get(id=1)
# or with error handling
try:
    document = Document.objects.get(id=1)
except Document.DoesNotExist:
    document = None
```

**Filter Documents**:
```python
# By status
healthy = Document.objects.filter(status='Healthy')

# By category
tech_docs = Document.objects.filter(category='Tech')

# By date range
from django.utils import timezone
from datetime import timedelta

recent = Document.objects.filter(
    date__gte=timezone.now() - timedelta(days=7)
)
```

**Get Latest Scan**:
```python
document = Document.objects.get(id=1)
latest_scan = document.documentscan_set.order_by('-date').first()

# Or using prefetch for efficiency
documents = Document.objects.prefetch_related(
    'documentscan_set'
).all()
```

**Get Documents with Changes**:
```python
from django.db.models import Exists, OuterRef

has_changes = DocumentScan.objects.filter(
    document=OuterRef('pk'),
    changes=True
)

docs_with_changes = Document.objects.filter(
    Exists(has_changes)
)
```

**Aggregate Queries**:
```python
from django.db.models import Count

# Count scans per document
documents = Document.objects.annotate(
    scan_count=Count('documentscan')
)

for doc in documents:
    print(f"{doc.title}: {doc.scan_count} scans")
```

### Complex Queries

**Get Documents with Latest Scan**:
```python
from django.db.models import Prefetch

latest_scans = DocumentScan.objects.order_by('-date')[:1]

documents = Document.objects.prefetch_related(
    Prefetch('documentscan_set', queryset=latest_scans, to_attr='latest_scan')
).all()
```

**Full-Text Search** (PostgreSQL only):
```python
from django.contrib.postgres.search import SearchVector

documents = Document.objects.annotate(
    search=SearchVector('title', 'desc', 'url'),
).filter(search='AI')
```

---

## Optimization

### Database Indexing

**Current Indexes**:
- Primary keys (automatic)
- Foreign keys (automatic)

**Recommended Additional Indexes**:
```python
class Document(models.Model):
    # ... fields ...
    
    class Meta:
        indexes = [
            models.Index(fields=['-date']),  # For ordering
            models.Index(fields=['status']),  # For filtering
            models.Index(fields=['category']),  # For filtering
        ]

class DocumentScan(models.Model):
    # ... fields ...
    
    class Meta:
        indexes = [
            models.Index(fields=['document', '-date']),  # Composite
            models.Index(fields=['changes']),  # For filtering
            models.Index(fields=['changeLevel']),  # For filtering
        ]
```

### Query Optimization

**Use select_related for ForeignKey**:
```python
# Bad: N+1 queries
scans = DocumentScan.objects.all()
for scan in scans:
    print(scan.document.title)  # Hits DB each time

# Good: Single query with JOIN
scans = DocumentScan.objects.select_related('document').all()
for scan in scans:
    print(scan.document.title)  # No additional query
```

**Use prefetch_related for Reverse Relations**:
```python
# Bad: N+1 queries
documents = Document.objects.all()
for doc in documents:
    scans = doc.documentscan_set.all()  # Hits DB each time

# Good: Two queries total
documents = Document.objects.prefetch_related('documentscan_set').all()
for doc in documents:
    scans = doc.documentscan_set.all()  # Uses cached data
```

**Use only() to Limit Fields**:
```python
# Load only specific fields
documents = Document.objects.only('id', 'title', 'url')
```

**Use values() for Dictionaries**:
```python
# Get dictionaries instead of model instances (faster)
documents = Document.objects.values('id', 'title', 'url')
```

### Database Maintenance

**Vacuum Database** (SQLite):
```bash
sqlite3 db.sqlite3 "VACUUM;"
```

**Analyze Tables** (PostgreSQL):
```sql
ANALYZE main_document;
ANALYZE main_documentscan;
```

**Clean Old Data**:
```python
from django.utils import timezone
from datetime import timedelta

# Delete scans older than 90 days
cutoff = timezone.now() - timedelta(days=90)
DocumentScan.objects.filter(date__lt=cutoff).delete()
```

---

## Backup & Restore

### SQLite

**Backup**:
```bash
# Copy file
cp db.sqlite3 db.sqlite3.backup

# Or use SQLite dump
sqlite3 db.sqlite3 .dump > backup.sql
```

**Restore**:
```bash
# From file
cp db.sqlite3.backup db.sqlite3

# From dump
sqlite3 db.sqlite3 < backup.sql
```

### PostgreSQL

**Backup**:
```bash
pg_dump watchdocs > backup.sql
```

**Restore**:
```bash
psql watchdocs < backup.sql
```

---

**Last Updated**: December 2025  
**Version**: 1.0

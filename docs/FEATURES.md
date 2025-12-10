# ✨ Features Documentation

## Table of Contents
- [Core Features](#core-features)
- [Dual Input Modes](#dual-input-modes)
- [Change Detection](#change-detection)
- [AI Integration](#ai-integration)
- [Voice Notifications](#voice-notifications)
- [Dashboard](#dashboard)
- [Timeline View](#timeline-view)

---

## Core Features

### 1. Website Monitoring

**Description**: Monitor any public website for changes with AI-powered detection.

**Capabilities**:
- ✅ Monitor unlimited websites
- ✅ Automated scanning at configurable intervals
- ✅ Manual scan triggers
- ✅ Historical scan data preservation

**How It Works**:
1. User provides website URL
2. System creates initial baseline scan
3. Subsequent scans compare against baseline
4. AI detects and categorizes changes
5. Results stored with full history

**Use Cases**:
- Monitor competitor websites
- Track documentation updates
- Follow news sites
- Watch product pages for changes
- Monitor legal/policy updates

---

## Dual Input Modes

### URL Mode

**Description**: Direct URL input for quick monitoring setup.

**Features**:
- Real-time URL validation
- Live website preview (when available)
- Instant feedback on validity
- Support for HTTP and HTTPS

**Validation**:
```
✅ Valid: https://example.com
✅ Valid: http://subdomain.example.com/path
❌ Invalid: example.com (missing protocol)
❌ Invalid: ftp://example.com (not HTTP/HTTPS)
```

**User Flow**:
1. Navigate to "New Watch" page
2. Ensure "URL Mode" is selected
3. Paste URL into input field
4. See validation status (✓ or ✗)
5. Click "Start Monitoring"
6. Wait for initial scan (~30-60s)
7. View on dashboard

### AI Chat Mode

**Description**: Conversational interface to discover websites to monitor.

**Powered By**: Google Gemini 2.0 Flash with Google Search grounding

**Features**:
- Natural language understanding
- Context-aware suggestions
- Google Search integration for real-time results
- Multi-turn conversations
- URL extraction from suggestions

**Example Conversations**:

**User**: "I want to monitor AI news"

**AI**: "I can help you monitor AI news! Here are some popular AI news sources:

1. **OpenAI Blog** - https://openai.com/blog
   Latest updates from OpenAI

2. **Anthropic News** - https://www.anthropic.com/news
   Research and product updates

3. **TechCrunch AI** - https://techcrunch.com/category/artificial-intelligence/
   AI industry news and trends

Which would you like to monitor?"

**User**: "OpenAI Blog sounds good"

**AI**: "Great choice! I'll help you set up monitoring for the OpenAI Blog (https://openai.com/blog). Would you like me to add it?"

**Capabilities**:
- Topic-based suggestions
- Industry-specific recommendations
- Product monitoring
- News source discovery
- Competitor tracking suggestions

**How It Works**:
1. User describes what they want to monitor
2. AI understands intent using Gemini 2.0
3. Google Search provides current, relevant results
4. AI suggests specific websites with descriptions
5. User selects a suggestion
6. URL auto-filled and ready to monitor

---

## Change Detection

### AI-Powered Analysis

**Powered By**: Browser Use Cloud API + Google Gemini 2.5 Pro

**Process**:
1. **Content Extraction**: Browser Use visits URL and extracts content
2. **Comparison**: AI compares current vs. previous version
3. **Categorization**: Changes classified into added/removed/modified
4. **Severity Assessment**: Change level determined (No Change, Low, Major, Critical)
5. **Summary Generation**: Natural language explanation of changes

### Change Levels

#### No Change
**Description**: Document is identical to previous scan.

**Example**: Periodic check with no updates

**Actions**:
- Record scan timestamp
- Store current summary
- No notifications

#### Low
**Description**: Minor changes that don't affect core content.

**Examples**:
- Typo corrections
- Date/timestamp updates
- Minor text edits
- Formatting changes

**Actions**:
- Record changes
- Log for history
- No immediate alerts

#### Major
**Description**: Significant content changes.

**Examples**:
- New blog posts or articles
- New product features
- Menu/navigation changes
- Section reorganization
- Pricing updates

**Actions**:
- Record detailed changes
- Update dashboard status
- Optionally trigger notifications

#### Critical
**Description**: Major structural or urgent changes.

**Examples**:
- Complete redesign
- Policy/Terms of Service updates
- Service interruptions
- Security announcements
- Urgent notices

**Actions**:
- Record all changes
- Mark as high priority
- Trigger urgent voice call notification

### Change Categorization

#### Additions
**Definition**: New content that wasn't present before.

**Examples**:
- "New blog post: Introducing GPT-5"
- "Added pricing tier: Enterprise Plan"
- "New section: Customer Testimonials"
- "Added FAQ item: How to reset password"

#### Deletions
**Definition**: Content that existed before but is now removed.

**Examples**:
- "Removed: Outdated promotional banner"
- "Deleted product: Basic tier"
- "Removed section: Beta features"

#### Modifications
**Definition**: Existing content that has been altered.

**Examples**:
- "Updated: Pricing from $99 to $149"
- "Modified: Privacy policy section 4.2"
- "Changed: Contact email address"
- "Revised: Product description"

### Content Summaries

**Current Summary**:
- Detailed overview of current page state
- Key sections and content
- Important elements
- Overall structure

**Change Summary**:
- Natural language explanation of what changed
- Context about significance
- Comparison to previous version

**Example**:
```
Current Summary:
"The OpenAI blog now features 15 posts, with the latest being 
'Introducing GPT-5' published on Dec 4, 2025. The homepage 
highlights new capabilities including improved reasoning and 
multimodal understanding..."

Change Summary:
"A new blog post titled 'Introducing GPT-5' has been added to 
the homepage. The navigation menu has been updated to include 
a new 'Enterprise' section. The hero image has been replaced 
with GPT-5 branding."
```

---

## AI Integration

### Google Gemini AI (Frontend)

**Used For**:
- AI Chat Mode conversations
- URL suggestion and discovery
- Natural language understanding

**Model**: Gemini 2.0 Flash Experimental

**Features**:
- Google Search grounding for real-time data
- Multi-turn conversations
- Context retention
- Fast response times

**Configuration**:
```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  systemInstruction: "You are a helpful assistant...",
  tools: [{ googleSearch: {} }],
});
```

### Browser Use Cloud API (Backend)

**Used For**:
- Website content extraction
- Change detection and comparison
- AI-powered analysis

**Model**: Gemini 2.5 Pro (via Browser Use)

**Features**:
- Automated browser interaction
- JavaScript rendering
- Content extraction
- AI-powered comparison
- Structured output

**Process**:
1. Task submission with instructions
2. Browser automation (visit URL, extract content)
3. AI analysis and comparison
4. Structured JSON output
5. Change categorization

---

## Voice Notifications

### Vapi Integration

**Description**: AI-powered voice calls for updates and alerts.

**Call Types**:

#### 1. General Update Calls
**Purpose**: Daily/weekly summaries of changes

**Features**:
- Conversational tone
- Aggregated updates
- Multiple documents covered
- Scheduled delivery

**Voice Options**:
- 🌅 **Morning Dad**: Upbeat and encouraging
- 🌮 **Lunch Dad**: Chill and informative  
- 🌙 **Dinner Dad**: Warm and reflective
- 👴 **Boomer Dad**: Classic and authoritative

**Example Script**:
```
"Hey there! It's your Morning Dad with your daily updates!

I've got some news from the sites you're monitoring:

First up, OpenAI's blog just posted about GPT-5. 
Looks like some exciting new capabilities are coming!

Also, your competitor's pricing page changed - they 
dropped their premium tier from $199 to $149.

That's it for today! Stay awesome!"
```

#### 2. Critical Alert Calls
**Purpose**: Urgent notifications for critical changes

**Features**:
- Immediate delivery
- Focused on single critical update
- Urgent tone
- Actionable information

**Example Script**:
```
"URGENT UPDATE! This is your WatchDocs alert system.

Your insurance policy terms have been updated. 
Section 4.5 now requires additional coverage for 
remote workers. This affects your current plan.

Please review the changes as soon as possible."
```

### Configuration Options

**Frequency**:
- Daily (morning, afternoon, evening)
- Weekly (specific day/time)
- Monthly (specific date)
- On-demand (manual trigger)

**Detail Level**:
- **Low**: High-level overview only
- **Medium**: Summary with key changes
- **High**: Detailed breakdown of all changes

**Voice Personality**:
- Choose from 4 different voice styles
- Matches user preference and use case

---

## Dashboard

### Features

**Document Grid**:
- Card-based layout
- Responsive design (adapts to screen size)
- Quick actions on each card

**Status Indicators**:
- 🟢 **Stable**: No recent changes
- 🟡 **Minor Changes**: Low-level updates
- 🔴 **Major Changes**: Significant updates

**Quick Actions**:
- **View Details**: See full scan history
- **Open Site**: Visit monitored URL
- **Delete**: Remove from monitoring
- **Refresh**: Run new scan immediately

**Information Display**:
- Document title and description
- Latest scan date
- Change level badge
- Total scan count

**Filtering** (Future):
- By status
- By category
- By date range
- By change level

**Search** (Future):
- Search by title
- Search by URL
- Search by description

---

## Timeline View

### Features

**Visual Timeline**:
- Chronological display (newest first)
- Icons for different event types
- Color-coded status indicators

**Event Types**:
- 📸 **Initial Capture**: First baseline scan
- 🔍 **Periodic Check**: No changes detected
- 🔄 **Changes Detected**: Updates found

**Event Details**:
- Timestamp
- Change level
- Summary of changes
- Full change breakdown
- Raw content preview

**Interactive Elements**:
- Expandable sections
- View full summaries
- See raw content
- Compare versions (future)

**Use Cases**:
- Track change history
- Identify patterns
- Audit trail
- Historical analysis

---

## Data Storage

### Local Storage (Current)

**Purpose**: Browser-based persistence

**Data Stored**:
- Document metadata
- Scan results
- User preferences

**Limitations**:
- Not synchronized across devices
- Limited storage capacity
- Cleared if browser data cleared

### Database Integration (Backend)

**Database**: SQLite (development) / PostgreSQL (production)

**Models**:
- **Document**: Monitored websites
- **DocumentScan**: Scan results and history

**Data Persistence**:
- Full scan history
- Raw content backups
- Change categorization
- Timestamps

**Advantages**:
- Unlimited storage
- Multi-device access
- Advanced querying
- Backup capabilities

---

## Security Features

### Current Implementation

**Input Validation**:
- URL format validation
- HTTP/HTTPS protocol enforcement
- XSS prevention

**CORS Protection**:
- Whitelisted origins
- Controlled access

**API Security**:
- API key protection
- Request validation

### Future Enhancements

**Authentication**:
- User accounts
- JWT tokens
- Session management

**Authorization**:
- Role-based access control
- Document ownership
- Sharing permissions

**Data Encryption**:
- Encrypted storage
- Secure transmission
- API key rotation

---

## Upcoming Features

### Roadmap

**Phase 2**:
- [ ] Email notifications
- [ ] Slack/Discord integrations
- [ ] Advanced diff visualization
- [ ] Custom scan schedules per document
- [ ] Tag/category system

**Phase 3**:
- [ ] Browser extension
- [ ] Mobile app
- [ ] API webhooks
- [ ] Team collaboration
- [ ] Custom AI models

**Phase 4**:
- [ ] Automated response actions
- [ ] Machine learning predictions
- [ ] Multi-language support
- [ ] Enterprise features

---

**Last Updated**: December 2025  
**Version**: 1.0

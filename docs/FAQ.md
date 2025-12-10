# ❓ Frequently Asked Questions

## General Questions

### What is WatchDocs?

WatchDocs is an AI-powered website monitoring platform that tracks changes to websites you care about. It uses artificial intelligence to detect, analyze, and summarize changes, then optionally delivers updates via voice calls.

### Is it free?

The WatchDocs application itself is open-source and free. However, you need API keys for:
- **Browser Use Cloud API** (paid service for web scraping)
- **Google Gemini API** (has free tier)
- **Vapi** (optional, for voice calls - paid service)

### What can I monitor?

Any publicly accessible website with HTTP/HTTPS URLs. Examples:
- News sites and blogs
- Product pages
- Documentation sites
- Competitor websites
- Policy/terms of service pages
- Service status pages

### How often are scans performed?

Currently, scans are:
- **Automatic**: When you create a new watch (initial baseline)
- **Manual**: When you click "Refresh" or trigger `/runScans/` API
- **Future**: Scheduled scans (coming soon)

### What's the difference between URL Mode and AI Chat?

**URL Mode**: You directly paste a URL you want to monitor. Quick and straightforward.

**AI Chat Mode**: You describe what you want to monitor in natural language, and the AI suggests relevant websites using Google Search. Great for discovery.

---

## Technical Questions

### What technologies does WatchDocs use?

**Frontend**:
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Shadcn UI
- Google Gemini AI

**Backend**:
- Django (Python)
- SQLite (development) / PostgreSQL (production)
- Browser Use Cloud API
- Beautiful Soup

### Can I run this locally?

Yes! See the [Quick Start Guide](QUICKSTART.md) or [Setup Guide](SETUP.md) for instructions.

### Does it work on mobile?

The frontend is responsive and works on mobile browsers. A native mobile app is planned for future releases.

### Can I deploy this to production?

Yes! See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions on deploying to various platforms.

### What databases are supported?

- **SQLite**: Built-in, perfect for development
- **PostgreSQL**: Recommended for production
- **MySQL**: Possible with Django, but not tested

---

## Features & Functionality

### How does change detection work?

1. **Browser Use API** visits the URL and extracts content
2. **AI (Gemini 2.5 Pro)** analyzes and summarizes the page
3. **Comparison**: Current version compared to previous scan
4. **Categorization**: Changes classified as added/removed/modified
5. **Severity**: AI assigns change level (No Change, Low, Major, Critical)

### What is "change level"?

Change levels indicate the significance of detected changes:
- **No Change**: Identical to previous scan
- **Low**: Minor changes (typos, dates)
- **Major**: Significant content changes (new posts, sections)
- **Critical**: Urgent changes (policy updates, major redesigns)

### Can I get notifications?

Currently:
- ✅ Voice calls via Vapi (experimental)
- ❌ Email notifications (planned)
- ❌ Slack/Discord (planned)
- ❌ Webhooks (planned)

### Can I customize scan frequency?

Not yet in the UI, but you can:
- Manually trigger scans via API
- Set up a cron job to call `/runScans/` periodically
- Future versions will have configurable schedules

### Can I monitor password-protected sites?

Not currently. Browser Use API only supports publicly accessible URLs.

### How accurate is the change detection?

Very accurate for content changes. The AI may miss:
- Visual-only changes (CSS updates)
- Changes in ads or tracking scripts
- Very subtle wording changes
- Client-side JavaScript changes

### Can I see a diff of what changed?

Yes! The system provides:
- Lists of added content
- Lists of removed content
- Lists of modified content
- AI-generated summary of changes

Visual diff (side-by-side comparison) is planned for future releases.

---

## API Questions

### Is there an API?

Yes! WatchDocs backend exposes a REST API. See [API Reference](API_REFERENCE.md) for complete documentation.

### Can I use the API from other apps?

Yes, the API is public (though authentication should be added for production). You can integrate WatchDocs into other applications.

### Are there rate limits?

No rate limits currently, but recommended limits for production:
- 100 requests/hour per user
- 10 scan operations/hour (expensive)

### Can I get webhooks?

Not yet, but it's planned. You'll be able to register webhook URLs to receive notifications when changes are detected.

---

## Data & Privacy

### Where is my data stored?

**Development**: Local SQLite database file  
**Production**: Your chosen database (PostgreSQL recommended)

Frontend also uses browser localStorage for temporary data.

### Is my data secure?

Current implementation has basic security. For production, you should:
- Enable HTTPS
- Add authentication
- Encrypt sensitive data
- Use environment variables for secrets

See [Deployment Guide](DEPLOYMENT.md) for security recommendations.

### Can I export my data?

Yes, you can:

**Via Django**:
```bash
python manage.py dumpdata > data.json
```

**Via API**: Fetch all documents and scans via API endpoints

**Direct Database**: Access SQLite file or PostgreSQL database directly

### How long is data retained?

Forever by default. You can manually delete:
- Individual documents
- Old scans

Automated data retention policies are planned.

### Can I delete my data?

Yes:
- Delete individual watches via UI
- Delete documents via API
- Delete database file for complete wipe

---

## Troubleshooting

### Scans are taking forever

**Normal duration**: 30-60 seconds per scan

**If longer**:
- Check internet connection
- Verify Browser Use API status
- Try simpler websites first
- Increase timeout in settings

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more details.

### Changes not being detected

**Possible reasons**:
- Website actually didn't change
- Changes too subtle
- Changes in non-content areas
- Caching issues

**Try**:
- Visit website yourself to verify changes
- Wait and scan again
- Try a news site with frequent updates

### Getting CORS errors

**Solution**: Add your frontend URL to `CORS_ALLOWED_ORIGINS` in backend `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more.

### API key errors

**Check**:
1. API key is set correctly in settings/env
2. API key is valid and active
3. No extra spaces in the key
4. Backend restarted after changing key

---

## Cost Questions

### How much does it cost to run?

**Free**:
- WatchDocs code (open source)
- Hosting (if self-hosted)

**Paid**:
- Browser Use API: ~$10-50/month depending on usage
- Google Gemini API: Free tier available, then pay-as-you-go
- Vapi (voice calls): ~$0.10-0.30 per minute
- Hosting (if using cloud): $5-50/month

### Can I use free alternatives?

**Browser Use API**: No direct free alternative. You could:
- Build custom scraper with Playwright/Selenium
- Use other web scraping APIs

**Gemini API**: Free tier available (60 requests/minute)

**Vapi**: Could use Twilio or other voice APIs

### How to reduce costs?

- Scan less frequently
- Monitor fewer websites
- Use Gemini free tier
- Disable voice calls
- Self-host instead of cloud hosting

---

## Development Questions

### Can I contribute?

Yes! Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) (when created) for guidelines.

### How do I report bugs?

1. Check if bug already reported in GitHub Issues
2. If not, create new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Screenshots if applicable

### Can I request features?

Yes! Create a GitHub Issue with:
- Feature description
- Use case
- Why it would be valuable
- Optional: Implementation ideas

### How do I set up development environment?

See [DEVELOPMENT.md](DEVELOPMENT.md) (when created) or [Setup Guide](SETUP.md) for detailed instructions.

### Can I customize the UI?

Yes! The frontend uses React + TailwindCSS + Shadcn UI. You can:
- Modify existing components
- Create new components
- Change colors/theme in Tailwind config
- Add new pages

---

## Future Plans

### What features are coming?

**Phase 2**:
- Email notifications
- Scheduled scans
- Advanced diff visualization
- Tag/category system

**Phase 3**:
- Browser extension
- Mobile app
- Slack/Discord integrations
- Webhooks
- Team collaboration

**Phase 4**:
- Chrome extension
- Automated actions
- ML predictions
- Multi-language support

See [FEATURES.md](FEATURES.md) for complete roadmap.

### Will there be a hosted version?

Possibly! A SaaS version is being considered where you don't need to self-host or manage API keys.

### Will it stay open source?

Yes! The core functionality will remain open source.

---

## Support

### Where can I get help?

1. **Documentation**: Read all docs in `/docs` folder
2. **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. **GitHub Issues**: Search or create issue
4. **Community**: Join discussions (link TBD)

### How do I contact the developers?

- GitHub Issues (preferred)
- Email: (when available)
- Twitter: (when available)

### Is there a community?

Community channels are being set up:
- GitHub Discussions
- Discord server (planned)
- Twitter/X (planned)

---

**Last Updated**: December 2025  
**Version**: 1.0

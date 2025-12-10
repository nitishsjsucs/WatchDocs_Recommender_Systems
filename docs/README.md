# 📚 WatchDocs Documentation

Welcome to the comprehensive documentation for **WatchDocs** - an AI-powered website monitoring platform that keeps you informed about changes to the websites that matter most to you.

## 📖 Table of Contents

### Getting Started
- [Overview](#overview)
- [Quick Start Guide](QUICKSTART.md)
- [Installation & Setup](SETUP.md)
- [Environment Configuration](CONFIGURATION.md)

### Architecture & Design
- [System Architecture](ARCHITECTURE.md)
- [Frontend Architecture](FRONTEND.md)
- [Backend Architecture](BACKEND.md)
- [Database Schema](DATABASE.md)

### API Documentation
- [API Reference](API_REFERENCE.md)
- [API Examples](API_EXAMPLES.md)
- [Integration Guide](INTEGRATION.md)

### Development
- [Development Guide](DEVELOPMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code Standards](CODE_STANDARDS.md)
- [Testing Guide](TESTING.md)

### Deployment & Operations
- [Deployment Guide](DEPLOYMENT.md)
- [Production Checklist](PRODUCTION.md)
- [Monitoring & Logging](MONITORING.md)
- [Troubleshooting](TROUBLESHOOTING.md)

### Features & Usage
- [Feature Documentation](FEATURES.md)
- [AI Chat Integration](AI_CHAT.md)
- [Voice Calling (Vapi)](VOICE_CALLS.md)
- [Change Detection](CHANGE_DETECTION.md)

### Reference
- [Technology Stack](TECH_STACK.md)
- [FAQ](FAQ.md)
- [Glossary](GLOSSARY.md)
- [Changelog](CHANGELOG.md)

---

## Overview

**WatchDocs** is a full-stack web application that monitors websites for changes and provides intelligent summaries through AI. The system combines modern web technologies with AI-powered analysis to deliver a seamless monitoring experience.

### Key Features

🎯 **Intelligent Monitoring**
- Automated website scanning and change detection
- AI-powered content analysis using Browser Use API
- Detailed change categorization (additions, deletions, modifications)

🤖 **Dual Input Modes**
- **Direct URL Mode**: Paste any URL and start monitoring instantly
- **AI Chat Mode**: Conversational interface to discover relevant websites

☎️ **Voice Call Summaries** (via Vapi)
- Personalized voice call notifications
- Multiple voice personalities (Morning Dad, Lunch Dad, Dinner Dad, Boomer Dad)
- Configurable frequency and detail levels

📊 **Comprehensive Dashboard**
- Real-time status monitoring
- Change timeline visualization
- Health indicators and alerts

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        WatchDocs                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐              ┌────────────────┐       │
│  │    Frontend     │◄────────────►│    Backend     │       │
│  │   (React + TS)  │   REST API   │   (Django)     │       │
│  └─────────────────┘              └────────────────┘       │
│         │                                 │                 │
│         │                                 │                 │
│         ▼                                 ▼                 │
│  ┌─────────────────┐              ┌────────────────┐       │
│  │  Gemini AI      │              │  SQLite DB     │       │
│  │  (Chat & AI)    │              │                │       │
│  └─────────────────┘              └────────────────┘       │
│                                           │                 │
│                                           ▼                 │
│                                    ┌────────────────┐       │
│                                    │  Browser Use   │       │
│                                    │  API           │       │
│                                    └────────────────┘       │
│                                           │                 │
│                                           ▼                 │
│                                    ┌────────────────┐       │
│                                    │  Vapi Voice    │       │
│                                    │  Calls         │       │
│                                    └────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
watchdocs2/
├── WatchDocsFE/           # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility libraries
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── WatchDocBackend/       # Backend Django application
│   ├── WatchDoc/          # Django project
│   │   ├── main/          # Main Django app
│   │   │   ├── models.py  # Database models
│   │   │   ├── views.py   # API endpoints
│   │   │   ├── browser_use_client.py  # Browser Use integration
│   │   │   ├── makeCriticalCall.py    # Critical alert calls
│   │   │   └── makeGeneralCall.py     # General update calls
│   │   └── WatchDoc/      # Django settings
│   ├── requirements.txt   # Backend dependencies
│   └── manage.py          # Django management script
│
└── docs/                  # Documentation (you are here!)
    ├── README.md          # This file
    ├── ARCHITECTURE.md    # System architecture
    ├── FRONTEND.md        # Frontend documentation
    ├── BACKEND.md         # Backend documentation
    └── ...               # Additional documentation files
```

## Quick Links

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Shadcn UI
- **Backend**: Django + SQLite + Browser Use API
- **AI**: Google Gemini 2.5 Pro + Vapi Voice AI
- **Deployment**: Ngrok tunneling for development

## Getting Started

1. **Read the [Quick Start Guide](QUICKSTART.md)** for a rapid introduction
2. **Follow the [Setup Guide](SETUP.md)** for detailed installation instructions
3. **Explore the [API Reference](API_REFERENCE.md)** to understand available endpoints
4. **Check the [Frontend](FRONTEND.md) and [Backend](BACKEND.md) docs** for architecture details

## Support & Contributing

- **Issues**: Report bugs or request features in the GitHub Issues
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- **Questions**: Check the [FAQ](FAQ.md) or [Troubleshooting](TROUBLESHOOTING.md) guides

---

**Built with ❤️ for developers who care about staying informed**

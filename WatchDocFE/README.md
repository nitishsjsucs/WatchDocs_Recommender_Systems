# 🔍 Watch Docs

> **Your AI-Powered Website Monitoring Companion**  
> Stay ahead of changes, get intelligent summaries, and never miss critical updates on the websites that matter to you.

![Watch Docs Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 🌟 What is Watch Docs?

**Watch Docs** is an intelligent website monitoring platform that combines the power of AI with real-time web tracking. Whether you're a developer tracking documentation changes, a business owner monitoring policy updates, or an enthusiast staying on top of your favorite topics, Watch Docs keeps you informed with style.

Think of it as your personal web detective that not only watches websites for you but also **calls you** with personalized AI-generated summaries in a voice you choose!

---

## 🎯 Use Cases

### 🤓 For the Curious Mind
**Geek out about your passions:**
- Track your favorite open-source project's documentation
- Monitor release notes of tools and frameworks you love
- Stay updated on gaming wikis, fan theories, or hobby communities
- Get AI-powered summaries delivered via personalized voice calls

*"Hey, it's your Morning Dad here! The React docs just added a new section on Server Components. Want me to walk you through the highlights?"*

### 📰 For the Informed Professional
**Daily updates on topics that matter:**
- Monitor industry news sites and blogs
- Track competitor product pages and pricing
- Follow API documentation changes
- Receive daily briefings on market trends

*Perfect for staying ahead without drowning in browser tabs and RSS feeds.*

### 🚨 For Business-Critical Monitoring
**Get emergency calls for critical changes:**
- **Legal & Compliance**: Track changes to laws, regulations, and policies that affect your business
- **Insurance Policies**: Get instant alerts when your insurance provider updates terms
- **Government Portals**: Monitor permit requirements, tax law changes, or licensing updates
- **Service Level Agreements**: Track SLA changes from your critical vendors

*"URGENT: Your business insurance policy terms have been updated. Section 4.2 now requires additional coverage for remote workers. This affects your current plan."*

### 🏢 For Teams & Enterprises
- **Product Teams**: Monitor competitor feature releases
- **DevOps**: Track service status pages and changelog
- **Marketing**: Watch for brand mentions and content updates
- **Legal**: Monitor regulatory websites and compliance portals

---

## ✨ Key Features

### 🎨 Beautiful, Modern Interface
- Sleek glassmorphic design with animated gradients
- Responsive layout that works on any device
- Dark mode support (coming soon!)
- Smooth animations and intuitive UX

### 🤖 Dual Input Modes

#### 🔗 Direct URL Mode
Paste any website URL and start monitoring instantly:
- Live website preview
- Real-time validation
- Instant setup

#### 💬 AI Chat Mode
Not sure what to monitor? Chat with our AI:
```
You: "I want to stay updated on AI developments"
AI: "I'll help you find relevant sites! How about monitoring:
     - OpenAI's blog
     - Anthropic's research page
     - HuggingFace model releases"
```

### 📊 Intelligent Change Detection
- **Visual Diff Engine**: See exactly what changed
- **AI-Powered Summaries**: Understand the impact of changes
- **Change Classification**: Major, Moderate, or Minor updates
- **Timeline View**: Historical tracking of all changes

### ☎️ Voice Call Summaries (Powered by Vapi)
Configure your personalized summary calls:
- **Frequency**: Daily, Weekly, or Monthly
- **Voice Selection**: 
  - 🌅 Morning Dad (upbeat and encouraging)
  - 🌮 Lunch Dad (chill and informative)
  - 🌙 Dinner Dad (warm and reflective)
  - 👴 Boomer Dad (classic and authoritative)
- **Detail Level**: Low, Medium, or High depth

### 🎯 Smart Dashboard
- Grid view of all your monitored sites
- Health indicators (Stable, Minor Changes, Major Changes)
- Quick actions (View Live, Open Site, Delete)
- Status badges and last scan information

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful component library
- **Lucide React** - Icon system

### AI & Intelligence
- **Google Gemini AI** - Content analysis and summarization
- **Vapi** - Voice AI for phone call summaries
- **Browser Use** - Automated web scraping and monitoring

### Development Tools
- **Cline** - AI-powered coding assistant
- **CodeRabbit** - Intelligent code reviews
- **Traycer** - Advanced debugging and error tracking
- **Cursor** - AI-enhanced IDE

### Backend & Database
- **Neon** - Serverless Postgres database (coming soon)
- **LocalStorage** - Current data persistence (browser-based)

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.0.0
npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/watchdocs.git
cd watchdocs
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Add your API keys:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_VAPI_API_KEY=your_vapi_api_key
VITE_NEON_DATABASE_URL=your_neon_database_url
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 📖 How It Works

### 1️⃣ Add a Website
Choose your input method:
- **Direct URL**: Paste any HTTP/HTTPS URL
- **AI Chat**: Describe what you want to monitor and let AI suggest websites

### 2️⃣ Configure Monitoring
Set up your preferences:
- Scan frequency
- Change sensitivity
- Summary call settings
- Voice and detail level

### 3️⃣ Sit Back & Relax
Watch Docs will:
- 🔄 Scan websites at scheduled intervals
- 🧠 Analyze changes using AI
- 📊 Present changes in your dashboard
- ☎️ Call you with personalized summaries

### 4️⃣ Take Action
- Review change timelines
- View side-by-side diffs
- Get AI explanations
- Visit the live site

---

## 🎨 Screenshots

### Home Page
Beautiful hero section with dual input modes (URL or AI Chat)

### Dashboard
Track all your monitored sites with health indicators and quick actions

### Live Monitor
Real-time website monitoring with change detection

### Timeline View
Historical view of all changes with AI-generated summaries

---

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Basic website monitoring
- [x] Local storage persistence
- [x] Beautiful UI with Shadcn components
- [x] AI chat interface
- [x] Vapi integration for voice calls

### Phase 2 (In Progress)
- [ ] Neon database integration
- [ ] User authentication
- [ ] Multi-user support
- [ ] Email notifications
- [ ] Advanced diff visualization

### Phase 3 (Coming Soon)
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Slack/Discord integrations
- [ ] API webhooks
- [ ] Team collaboration features
- [ ] Custom AI models for specific industries

### Phase 4 (Future)
- [ ] Chrome extension for one-click monitoring
- [ ] Automated response actions
- [ ] Machine learning predictions
- [ ] Multi-language support
- [ ] Enterprise SSO

---

## 🤝 Contributing

We love contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature suggestions
- 📖 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage

### Development Setup
```bash
# Fork and clone the repo
git clone https://github.com/yourusername/watchdocs.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push and create a PR
git push origin feature/amazing-feature
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with love using:
- [Vapi](https://vapi.ai) - Voice AI Platform
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI Model
- [Neon](https://neon.tech) - Serverless Postgres
- [Shadcn UI](https://ui.shadcn.com) - Component Library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Browser Use](https://github.com/browser-use/browser-use) - Web Automation
- [Cline](https://github.com/cline/cline) - AI Coding Assistant
- [CodeRabbit](https://coderabbit.ai) - AI Code Reviews
- [Traycer](https://traycer.com) - Error Tracking

Special thanks to all the open-source contributors who make projects like this possible! 🚀

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/watchdocs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/watchdocs/discussions)
- **Twitter**: [@watchdocs](https://twitter.com/watchdocs)
- **Email**: hello@watchdocs.app

---

<div align="center">

**Made with ❤️ by developers, for developers**

⭐ Star us on GitHub if you find this useful!

[Website](https://watchdocs.app) • [Documentation](https://docs.watchdocs.app) • [Blog](https://blog.watchdocs.app)

</div>
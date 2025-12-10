# ⚡ Quick Start Guide

Get WatchDocs running in 5 minutes!

## 🎯 Prerequisites

- Python 3.9+
- Node.js 18+
- Browser Use API key ([Get one here](https://browser-use.com))
- Google Gemini API key ([Get one here](https://ai.google.dev))

---

## 🚀 Backend (2 minutes)

```bash
# 1. Navigate to backend
cd WatchDocBackend/WatchDoc

# 2. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set your API key in settings.py
# Edit WatchDoc/settings.py:
BROWSER_USE_API_KEY = 'your_browser_use_api_key'

# 5. Initialize database
python manage.py migrate

# 6. Start server
python manage.py runserver
```

✅ Backend running at http://localhost:8000

---

## 🎨 Frontend (2 minutes)

**Open a new terminal:**

```bash
# 1. Navigate to frontend
cd WatchDocsFE

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_GEMINI_API_KEY=your_gemini_api_key" > .env

# 4. Start dev server
npm run dev
```

✅ Frontend running at http://localhost:5173

---

## 🎉 First Watch (1 minute)

1. Open http://localhost:5173 in your browser
2. Click **"Start Monitoring"**
3. Enter a URL (try: `https://example.com`)
4. Click **"Start Monitoring"**
5. Wait ~30 seconds for the initial scan
6. View your dashboard! 🎊

---

## 🤖 Try AI Chat

1. Click **"New Watch"**
2. Toggle to **"AI Chat"** mode
3. Type: *"I want to monitor news about AI"*
4. Select a suggested website
5. Start monitoring!

---

## 📚 Next Steps

- **Full Setup**: See [SETUP.md](SETUP.md) for detailed instructions
- **Features**: Explore [FEATURES.md](FEATURES.md) to learn all capabilities
- **API**: Check [API_REFERENCE.md](API_REFERENCE.md) for API details

---

## ⚠️ Common Issues

**"ModuleNotFoundError"**: Activate virtual environment first
```bash
venv\Scripts\activate
```

**"CORS Error"**: Add `http://localhost:5173` to `CORS_ALLOWED_ORIGINS` in `settings.py`

**"API Key Error"**: Make sure API keys are set correctly in `settings.py` and `.env`

---

**Need Help?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

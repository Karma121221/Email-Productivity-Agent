# Vercel Deployment Guide - Ocean AI

## ✅ Pre-Deployment Checklist

Your project is now configured for Vercel deployment! Here's what has been set up:

### Backend (Python Flask - Serverless)
- ✅ Flask app at `api/index.py` with proper `app` export
- ✅ `requirements.txt` with all dependencies
- ✅ API routes prefixed with `/api/`
- ✅ CORS configured with `flask-cors`

### Frontend (React + Vite)
- ✅ Build output to `frontend/dist`
- ✅ Relative API paths (`/api/...`) for seamless routing
- ✅ pnpm configured as package manager

### Configuration
- ✅ `vercel.json` configured with:
  - Python runtime (`@vercel/python`) for backend
  - Static build for React frontend
  - Proper routing: `/api/*` → Flask, `/*` → React

---

## 🚀 Deployment Steps

### 1. Push Your Code to GitHub
```powershell
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel (Manual Method)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `Email-Productivity-Agent`

### 3. Configure Project Settings in Vercel Dashboard

#### **Framework Preset**
- Select: **Other** (or Vite if available)

#### **Root Directory**
- Leave blank (use root `/`) - Vercel will auto-detect the monorepo

#### **Build & Output Settings**
- **Install Command**: `cd frontend && pnpm install`
  - ⚠️ Make sure to enable pnpm in Vercel settings!
- **Build Command**: `cd frontend && pnpm run build`
- **Output Directory**: `frontend/dist`

#### **Node.js Version**
- Select: **18.x** or **20.x** (recommended)

#### **Python Version**
- Should auto-detect: **3.9** or **3.11**

### 4. Environment Variables (CRITICAL!)

Click on **"Environment Variables"** and add:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GEMINI_API_KEY` | `AIzaSyA2UH5KP-ZgZqndFSUo0D36tiehH7Gpxdw` | Production, Preview, Development |
| `MOCK_LLM` | `false` | Production, Preview, Development |

⚠️ **IMPORTANT**: Your API key is visible in your `.env` file. For production:
- Consider rotating this key and keeping it secure
- Never commit `.env` to public repositories (already in `.gitignore` ✓)

### 5. Deploy!

Click **"Deploy"** and wait for the build to complete.

---

## 🔍 Post-Deployment Verification

Once deployed, test these endpoints:

1. **Frontend**: `https://your-app.vercel.app/`
2. **Backend Status**: `https://your-app.vercel.app/api/status`
3. **Backend Hello**: `https://your-app.vercel.app/api/hello`
4. **Load Emails**: `https://your-app.vercel.app/api/emails/load`

---

## 🐛 Common Issues & Solutions

### Issue: "Build Failed - pnpm not found"
**Solution**: In Vercel Project Settings → General → Enable "pnpm" as package manager

### Issue: "Module not found" errors in Python
**Solution**: Check `api/requirements.txt` includes all dependencies

### Issue: API returns 500 errors
**Solution**: Check Environment Variables are set correctly in Vercel Dashboard

### Issue: Frontend shows blank page
**Solution**: 
- Check browser console for errors
- Verify `frontend/dist` is being built correctly
- Check that routes in `vercel.json` are correct

### Issue: API routes return 404
**Solution**: Verify `vercel.json` routing configuration:
```json
{
  "src": "/api/(.*)",
  "dest": "api/index.py"
}
```

---

## 📦 File Structure

```
Ocean AI/
├── api/
│   ├── index.py              # Flask app entry point ✓
│   ├── requirements.txt      # Python dependencies ✓
│   ├── data/                 # JSON data files
│   └── services/             # Backend services
├── frontend/
│   ├── src/                  # React source
│   ├── dist/                 # Build output (generated)
│   ├── package.json          # Node dependencies ✓
│   └── vite.config.js        # Vite config ✓
├── vercel.json               # Vercel configuration ✓
├── .env                      # Environment variables (local only)
└── .gitignore                # Excludes .env ✓
```

---

## 🔐 Security Notes

1. **API Key**: The `GEMINI_API_KEY` in your `.env` is exposed in this guide. 
   - Rotate it if this repo is public
   - Use Vercel's Environment Variables (encrypted at rest)

2. **CORS**: Currently set to allow all origins (`CORS(app)`). For production:
   ```python
   CORS(app, origins=["https://your-app.vercel.app"])
   ```

---

## 🎯 Next Steps After Deployment

1. ✅ Test all features (Inbox, Drafts, Chat, Prompts)
2. ✅ Verify LLM integration works with real API key
3. ✅ Set up custom domain (optional)
4. ✅ Configure production CORS restrictions
5. ✅ Monitor Vercel logs for errors
6. ✅ Set up Vercel Analytics (optional)

---

## 📚 Useful Commands

### Local Development
```powershell
# Frontend
cd frontend
pnpm install
pnpm run dev

# Backend
cd api
python index.py
```

### Vercel CLI (Alternative Deployment)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy from command line
vercel

# Deploy to production
vercel --prod
```

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Flask on Vercel**: https://vercel.com/docs/frameworks/backend/flask
- **Vercel Functions**: https://vercel.com/docs/functions

---

**Good luck with your deployment! 🚀**

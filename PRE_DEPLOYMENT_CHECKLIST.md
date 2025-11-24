# Pre-Deployment Verification Checklist

Run through this checklist before deploying to Vercel to ensure everything is configured correctly.

## ✅ File Structure Verification

- [ ] `api/index.py` exists and contains Flask app with `app = Flask(__name__)`
- [ ] `api/requirements.txt` exists with all dependencies
- [ ] `frontend/package.json` exists with build script
- [ ] `frontend/dist/` folder gets created when running `pnpm run build`
- [ ] `vercel.json` exists at root with proper configuration
- [ ] `.env` file exists (for local development only - never commit!)
- [ ] `.gitignore` includes `.env` and `.vercel`

## ✅ Dependencies Check

### Backend (Python)
```powershell
cd api
pip install -r requirements.txt
```
Should install:
- Flask==3.1.0
- flask-cors==5.0.0
- google-generativeai==0.8.3
- python-dotenv==1.0.1

### Frontend (Node/pnpm)
```powershell
cd frontend
pnpm install
```
Should complete without errors.

## ✅ Local Build Test

### Test Backend
```powershell
cd api
python index.py
```
Expected output:
```
 * Running on http://127.0.0.1:5000
```

Test endpoint:
```powershell
curl http://localhost:5000/api/hello
```
Expected: `{"message": "Hello from Ocean AI Backend!", "status": "success"}`

### Test Frontend Build
```powershell
cd frontend
pnpm run build
```
Expected output:
```
✓ built in XXXms
frontend/dist/index.html              X.XX kB
frontend/dist/assets/index-XXX.js     XXX kB
```

Verify `frontend/dist/` contains:
- `index.html`
- `assets/` folder with JS and CSS files

## ✅ Configuration Files

### `vercel.json` (Root)
Should contain:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ],
  "installCommand": "cd frontend && pnpm install",
  "buildCommand": "cd frontend && pnpm run build"
}
```

### `.env` (For reference - never commit!)
Should contain:
```env
GEMINI_API_KEY=your_actual_key_here
MOCK_LLM=false
```

## ✅ API Routes Check

Test all critical endpoints locally:

```powershell
# Terminal 1: Start backend
cd api ; python index.py

# Terminal 2: Test endpoints
curl http://localhost:5000/api/hello
curl http://localhost:5000/api/status
curl http://localhost:5000/api/emails/load
curl http://localhost:5000/api/data/default_prompts.json
```

All should return valid JSON responses without errors.

## ✅ Frontend API Integration

```powershell
# Terminal 1: Backend
cd api ; python index.py

# Terminal 2: Frontend
cd frontend ; pnpm run dev
```

Open http://localhost:3000 and verify:
- [ ] Inbox loads emails (should see 15 emails)
- [ ] Click "Process Inbox" - emails get categories
- [ ] Prompts tab loads default prompts
- [ ] Chat tab accepts queries
- [ ] Drafts tab loads (even if empty)

## ✅ Git Repository Status

Check what will be deployed:
```powershell
git status
```

Verify `.env` is NOT listed (should be in .gitignore).

Commit all changes:
```powershell
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

## ✅ Environment Variables Preparation

Have these ready for Vercel Dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | Your actual key | Get from https://makersuite.google.com/app/apikey |
| `MOCK_LLM` | `false` | Set to `true` for testing without API key |

## ✅ Vercel Dashboard Settings Checklist

When deploying on Vercel, configure:

### General Settings
- [ ] **Framework Preset:** Other (or Vite)
- [ ] **Root Directory:** Leave blank (/)
- [ ] **Node.js Version:** 18.x or 20.x
- [ ] **Install Command:** `cd frontend && pnpm install`
- [ ] **Build Command:** `cd frontend && pnpm run build`
- [ ] **Output Directory:** `frontend/dist`

### Environment Variables
- [ ] Add `GEMINI_API_KEY` for all environments
- [ ] Add `MOCK_LLM` = false (or true for testing)

### Settings → General
- [ ] Enable **pnpm** as package manager (if not auto-detected)

## ✅ Post-Deployment Verification

After deploying, test these URLs (replace with your actual domain):

```
https://your-app.vercel.app/
https://your-app.vercel.app/api/hello
https://your-app.vercel.app/api/status
https://your-app.vercel.app/api/emails/load
```

All should return valid responses.

### Full Application Test
1. [ ] Open app URL
2. [ ] Inbox tab loads emails
3. [ ] Click "Process Inbox" - categories appear
4. [ ] Prompts tab loads
5. [ ] Chat tab accepts queries
6. [ ] Drafts tab works

## 🎉 Ready to Deploy!

If all checkboxes above are marked, you're ready to deploy:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure settings as per checklist
4. Add environment variables
5. Click "Deploy"
6. Wait 2-3 minutes
7. Access your deployed app!

## 🆘 If Something Fails

- Check Vercel deployment logs (click on deployment → View Function Logs)
- Verify environment variables are set correctly
- Check that `vercel.json` is in the root directory
- Ensure pnpm is enabled in Vercel settings
- Review **DEPLOYMENT_GUIDE.md** for troubleshooting

---

**Last Updated:** November 24, 2025

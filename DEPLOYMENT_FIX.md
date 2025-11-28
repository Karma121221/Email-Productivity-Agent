# Vercel Deployment Fix - Changes Applied

## Issues Fixed

### 1. **404 NOT_FOUND Error**
**Root Cause:** The `vercel.json` configuration had a problematic rewrite rule that was interfering with Vercel's automatic handling of the `/api` folder.

**What was wrong:**
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api/index.py"  // ❌ This conflicts with Vercel's automatic API detection
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"
  }
]
```

**Fixed to:**
```json
"rewrites": [
  {
    "source": "/((?!api).*)",  // ✅ Only rewrite non-API routes to index.html
    "destination": "/index.html"
  }
]
```

**Why this works:**
- Vercel automatically detects and routes `/api/*` requests to Python serverless functions in the `/api` folder
- The new rewrite uses a negative lookahead regex `(?!api)` to match all routes EXCEPT those starting with `/api`
- This allows React Router to work (SPA routing) while keeping API routes functional

### 2. **Migration from pnpm to npm**
**Changed files:**
- ✅ `vercel.json` - Updated buildCommand and installCommand
- ✅ `package.json` - Updated all scripts
- ✅ `frontend/package.json` - Removed `packageManager` field
- ✅ `.vercelignore` - Removed `.pnpm-store/` reference
- ✅ Deleted `frontend/pnpm-lock.yaml`
- ✅ Generated `frontend/package-lock.json`

## Deployment Steps

### Option 1: Redeploy from Vercel Dashboard
1. Go to your Vercel project dashboard
2. Go to Settings → Git
3. Trigger a new deployment by clicking "Redeploy"
4. Select "Use existing Build Cache: No"

### Option 2: Deploy from Git
1. Commit all changes:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment: migrate to npm and fix API routing"
   git push origin main
   ```
2. Vercel will automatically detect the push and redeploy

### Option 3: Deploy with Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## What Changed in `vercel.json`

```json
{
  "buildCommand": "cd frontend && npm run build",      // Changed: pnpm → npm
  "outputDirectory": "frontend/dist",                  // Same: frontend build output
  "installCommand": "cd frontend && npm install",      // Changed: pnpm → npm
  "rewrites": [                                         // Fixed: simplified rewrites
    {
      "source": "/((?!api).*)",                        // New: negative lookahead for api
      "destination": "/index.html"
    }
  ]
}
```

### Key Changes:
1. **Removed** `PNPM_VERSION` environment variable
2. **Removed** explicit `/api/(.*)` rewrite (Vercel handles this automatically)
3. **Updated** catch-all rewrite to exclude API routes using regex negative lookahead
4. **Changed** all pnpm commands to npm commands

## How the Routing Works Now

```
User Request
    │
    ├─ /api/*           → Routed to /api/index.py (Flask app) [Automatic by Vercel]
    │                     ↓
    │                     Flask handles:
    │                     - /api/hello
    │                     - /api/emails/load
    │                     - /api/chat/query
    │                     - etc.
    │
    └─ /* (non-API)     → Routed to /index.html [Via rewrite rule]
                          ↓
                          React Router handles:
                          - /
                          - /inbox
                          - /chat
                          - etc.
```

## Verification Steps

After deployment, test these endpoints:

1. **Frontend:** `https://your-app.vercel.app/`
   - Should load the React app

2. **API Health Check:** `https://your-app.vercel.app/api/hello`
   - Should return: `{"message": "Hello from Ocean AI Backend!", "status": "success"}`

3. **API Status:** `https://your-app.vercel.app/api/status`
   - Should return: `{"status": "online", "version": "1.0.0"}`

4. **React Router:** `https://your-app.vercel.app/inbox` (or any route)
   - Should load the React app (not 404)

## Troubleshooting

If you still see errors:

1. **Check Vercel build logs:**
   - Go to Vercel Dashboard → Deployments → Click on latest deployment
   - Check "Building" and "Function Logs" tabs

2. **Common issues:**
   - **Build fails:** Make sure all dependencies in `frontend/package.json` are correct
   - **API 500 error:** Check that `api/requirements.txt` includes all needed packages
   - **Missing env vars:** Add `GEMINI_API_KEY` in Vercel Dashboard → Settings → Environment Variables

3. **Environment Variables:**
   Make sure you have set the following in Vercel:
   - `GEMINI_API_KEY` (required for AI features)

## Local Development

To run locally with the new npm setup:

```bash
# Install frontend dependencies
cd frontend
npm install

# Terminal 1: Run frontend dev server
npm run dev

# Terminal 2: Run backend (from root directory)
cd ../api
python -m venv venv
.\venv\Scripts\activate    # On Windows
pip install -r requirements.txt
python index.py
```

## Additional Notes

- The Flask app routes already have the `/api` prefix built-in (e.g., `@app.route('/api/hello')`)
- Vercel automatically wraps Flask apps in a WSGI handler
- The `outputDirectory: "frontend/dist"` tells Vercel to serve frontend files from the root path
- All frontend files are served via Vercel's CDN
- API routes become serverless functions with automatic scaling

## References

- [Vercel Flask Documentation](https://vercel.com/docs/frameworks/backend/flask)
- [Vercel Project Configuration](https://vercel.com/docs/project-configuration)
- [Vercel Rewrites](https://vercel.com/docs/edge-network/rewrites)

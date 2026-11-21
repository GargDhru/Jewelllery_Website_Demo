# 🚀 Deploying Aura Atelier on Render (Step-by-Step)

This project is 100% production-ready for deployment on [Render](https://render.com). It is structured to run as:
1. **Frontend**: Render Static Site (`frontend/`)
2. **Backend**: Render Web Service (`backend/`)

---

## Method 1: Instant Deployment via Blueprint (`render.yaml`) ⭐ (Recommended)

Render provides automatic multi-service provisioning using the root `render.yaml` blueprint included in this repository.

1. Push your repository to GitHub: `https://github.com/GargDhru/Jewelllery_Website_Demo`.
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub repository: `GargDhru/Jewelllery_Website_Demo`.
5. Render will automatically detect `render.yaml` and configure both services:
   - `aura-jewellery-api` (FastAPI Web Service)
   - `aura-jewellery-frontend` (React + Vite Static Site)
6. Review the generated parameters and click **Apply**.
7. Both services will build and deploy automatically, with the backend URL linked directly to the frontend's `VITE_API_URL`!

---

## Method 2: Manual Service Creation on Render

If you prefer to create the services individually on Render:

### Step A: Deploy the FastAPI Backend (Web Service)

1. On the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repo: `GargDhru/Jewelllery_Website_Demo`.
3. Fill in the service configuration:
   - **Name**: `aura-jewellery-api`
   - **Region**: Oregon (US West) or Singapore
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
4. Under **Environment Variables**, add:
   - `ADMIN_EMAIL` = `dhrugar@gmail.com`
   - `ADMIN_PASSWORD` = `Dragonp@72`
   - `SECRET_KEY` = *(click Generate or enter a strong secret)*
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `10080`
   - `DATABASE_URL` = *(Optional: paste your Render PostgreSQL or Supabase PostgreSQL connection string; otherwise persistent SQLite will be used)*
   - `FRONTEND_URL` = `https://aura-jewellery-frontend.onrender.com` *(your frontend URL from Step B)*
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g. `https://aura-jewellery-api.onrender.com`).

---

### Step B: Deploy the React + Vite Frontend (Static Site)

1. On the Render Dashboard, click **New +** → **Static Site**.
2. Connect your GitHub repo: `GargDhru/Jewelllery_Website_Demo`.
3. Fill in the service configuration:
   - **Name**: `aura-jewellery-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://aura-jewellery-api.onrender.com/api` *(use your backend URL from Step A, with `/api` at the end)*
5. Under **Redirects/Rewrites**:
   - `_redirects` in `frontend/public/_redirects` is already included to rewrite all routes `/*` to `/index.html` with status `200` for seamless React Router navigation on refresh.
6. Click **Create Static Site**.

---

## 💻 Local Development (Single Command)

To run the entire platform locally with both servers starting simultaneously:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Interactive Swagger Docs**: http://localhost:8000/docs
- **Admin Login**: http://localhost:5173/admin/login (`dhrugar@gmail.com` / `Dragonp@72`)


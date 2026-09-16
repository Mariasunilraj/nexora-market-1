# 🚀 NEXORA Automated Multi-Tier Deployment Guide
### Frontend on **Vercel** • Backend on **Render** • Database on **Supabase**

This guide provides the complete, automated process to deploy **NEXORA** across its 3 production tiers.

---

## 🏗️ Architecture Summary

```
                                  NEXORA ARCHITECTURE
 ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
 │         FRONTEND          │      │          BACKEND          │      │         DATABASE          │
 │          Vercel           │ ───► │          Render           │ ───► │         Supabase          │
 │ (React 19 + Edge Caching) │      │  (Express + Backtesting)  │      │  (PostgreSQL + RLS + Auth)│
 └───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

---

## 🗄️ Tier 1: Supabase (PostgreSQL Cloud Database)

1. Go to [**supabase.com**](https://supabase.com) and create a free account.
2. Click **New Project**, name it `nexora-trading`, and set your database password.
3. Once created, click **SQL Editor** on the left menu.
4. Open [`supabase/schema.sql`](supabase/schema.sql) from this repository, paste its contents into the SQL Editor, and click **Run**.
   - *This automatically provisions all tables (`profiles`, `holdings`, `orders`, `transactions`, `watchlists`, `price_alerts`), Row Level Security policies, and auth triggers.*
5. Go to **Project Settings** $\rightarrow$ **API** and copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **`anon` / `public` Key** (for Vercel Frontend)
   - **`service_role` Key** (for Render Backend)

---

## ⚙️ Tier 2: Render (High-Process Backend Microservice)

The repository includes a ready-to-deploy [`render.yaml`](render.yaml) Blueprint file:

### Option A: Using Render Blueprints (1-Click Automated)
1. Go to [**dashboard.render.com**](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your new GitHub repository (e.g., `YOUR_NEW_GITHUB_USERNAME/nexora-market`).
4. Render will automatically detect `render.yaml` and configure the Web Service with health checks at `/health`.
5. Under **Environment Variables**, add:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
6. Click **Apply**! Your backend will be live at `https://nexora-trading-backend.onrender.com`.

### Option B: Manual Web Service Setup
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Health Check Path**: `/health`

---

## 🌐 Tier 3: Vercel (Frontend Single Page Application)

1. Go to [**vercel.com/new**](https://vercel.com/new).
2. Select your new GitHub repository and click **Import**.
3. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your_supabase_anon_key`
   - `VITE_FINNHUB_API_KEY`: `da0l0ghr01qh1noo3kkgda0l0ghr01qh1noo3kl0`
   - `VITE_BACKEND_API_URL`: `https://nexora-trading-backend.onrender.com`
4. Click **Deploy**!

---

## 🔄 Automated CI/CD (GitHub Actions)

The repository includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
- Every `git push` to `main` automatically runs tests, compiles both frontend and backend, and synchronizes live deployments to Vercel and Render!

---

## 💻 Local Development Workflow

Run both Frontend and Backend concurrently on your local machine:

```powershell
# 1. Start Frontend (Port 5173)
npm run dev

# 2. Start Backend in a separate terminal (Port 4000)
cd server
npm install
npm run dev
```

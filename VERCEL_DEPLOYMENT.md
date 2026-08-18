# 🚀 Vercel Deployment Guide for NEXORA Trading Platform

This project is fully configured and ready for **1-click automated deployment on Vercel**.

---

## ⚡ Option 1: Instant 1-Command CLI Deployment (Recommended)

You can deploy directly to Vercel without setting up GitHub:

1. Open PowerShell or Command Prompt in the project folder:
   ```bash
   cd "C:\Users\SUNIL RAJ\.gemini\antigravity\scratch\nexora-trading"
   ```
2. Run the Vercel CLI deploy command:
   ```bash
   npx vercel
   ```
3. Follow the quick interactive prompts:
   - **Set up and deploy?**: `Y`
   - **Which scope?**: Press `Enter` (select your Vercel account)
   - **Link to existing project?**: `N`
   - **Project name?**: `nexora-trading` (or your preferred name)
   - **In which directory is your code located?**: `./` (Press `Enter`)
   - **Want to modify build settings?**: `N` (Vercel automatically detects `vercel.json` and Vite!)
4. Your website is built and live with a global production URL (e.g. `https://nexora-trading.vercel.app`) in under 60 seconds!

---

## 🌐 Option 2: Automatic GitHub Deployment (Continuous Delivery)

1. **Create a GitHub Repository**:
   - Go to [https://github.com/new](https://github.com/new) and create a new repository called `nexora-trading`.
2. **Push your code from PowerShell**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nexora-trading.git
   git branch -M main
   git push -u origin main
   ```
3. **Import to Vercel**:
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Click **Import** next to `nexora-trading`
   - Click **Deploy**!

---

## ⚙️ Automated Settings Included in `vercel.json`:
- **Framework**: `Vite`
- **Output Directory**: `dist`
- **SPA Rewrites**: `/* -> /index.html` (prevents 404 on subpages like `/portfolio`, `/technical-analysis`, `/account`, etc.)
- **Asset Caching**: High-speed CDN caching for scripts, CSS, SVGs, and images.

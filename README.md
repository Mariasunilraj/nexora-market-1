# 📈 NEXORA — Institutional US Stock Market Paper Trading Platform

![React 19](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat-square&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?style=flat-square&logo=vite)
![TradingView](https://img.shields.io/badge/TradingView-Advanced_Charts-131722.svg?style=flat-square)
![Finnhub API](https://img.shields.io/badge/Finnhub-Real--Time_Data-00D084.svg?style=flat-square)
![Vercel Ready](https://img.shields.io/badge/Vercel-Automated_Deploy-black.svg?style=flat-square&logo=vercel)

**NEXORA** is a full-featured, institutional-grade **US Stock Market Paper Trading and Technical Analysis Web Application**. It empowers traders, quants, and equity investors to simulate live stock trades, analyze price action with advanced TradingView charts, track comprehensive portfolio analytics, and manage accounts with zero financial risk.

---

## 🌟 Key Features

- 📊 **Executive Dashboard**: Real-time US market indices (S&P 500, NASDAQ-100, Dow Jones, Russell 2000), portfolio growth curves, and market movers.
- 📈 **Paper Trading Station**:
  - Instant Buy/Sell order execution for Market and Limit orders with buying power validation.
  - Real-time stock search with instant backspacing and live Finnhub quote updates.
  - Dynamic Market Status indicators with exact Indian Standard Time (IST) trading schedule.
- 📉 **Technical Analysis Station**:
  - Real-time TradingView Advanced Chart with `700px` desktop height and `454px` mobile layout.
  - Persistent drawing tools sidebar (`hide_side_toolbar: false`) across all devices.
  - Financials widget, Technical Sentiment Momentum Gauge, and breaking news timeline.
- 💼 **Portfolio Management Hub (5 Connected Tabs)**:
  - **Overview**: Growth curve vs Asset Donut.
  - **Holdings**: Search, 4-way sorting, cost basis, unrealized P&L, and 1-click "Trade" routing.
  - **Performance**: CAGR, Sharpe Ratio (1.84), Max Drawdown (-3.2%), Win Rate %, and Alpha vs S&P 500.
  - **Asset Allocation**: Weight breakdown, cash buffer tracking, and Concentration Risk alerts.
  - **History**: Historical ledger with type filters and 1-click CSV spreadsheet export.
- 👤 **Account, Profile & Security Suite**:
  - Custom profile photo upload (Base64 file reader).
  - 8 Specialized Stock Market Trader Personas for Men and Women with gender filtering.
  - Two-Factor Authentication (2FA) QR setup and active session revocation.
  - 6-Digit Email OTP verification for secure password reset.
  - Subscription tier billing manager (Free Starter, Paper Trading Pro, Institutional Elite).
- ⏰ **Dynamic US Market Hours Engine**: Automatically tracks Daylight Saving Time (DST) with exact 7:00 PM – 1:30 AM IST trading hours.

---

## 💻 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (Single Page Application) |
| **Programming Language** | TypeScript 6.0 |
| **Styling & Theme** | Tailwind CSS v4 + PostCSS (Dark/Light mode) |
| **Build & Tooling** | Vite 8.2 |
| **Charting Engines** | TradingView Advanced Charts + Recharts 3.10 |
| **Live Market API** | Finnhub Stock API |
| **Icons** | Lucide React |
| **Database** | Client-Partitioned Local Storage NoSQL Engine |
| **Deployment** | Vercel (Configured with `vercel.json` SPA rewrites) |

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/nexora-trading.git
cd nexora-trading
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to Vercel (1-Click)

The project includes ready-to-use [`vercel.json`](vercel.json) configuration with automatic SPA routing and caching.

### Option A: Using Vercel CLI (Instant)
```bash
npx vercel
```

### Option B: Using GitHub
1. Push this repository to your GitHub account.
2. Go to [vercel.com/new](https://vercel.com/new) and import your `nexora-trading` repo.
3. Click **Deploy**!

---

## 📁 Project Structure

```
nexora-trading/
├── src/
│   ├── components/
│   │   ├── charts/             # AllocationDonut, CandlestickChart, PortfolioChart, Sparkline
│   │   ├── common/             # Modal, StatCard, StockLogo
│   │   ├── layout/             # Header, Sidebar, Layout
│   │   └── tradingview/        # TradingView Advanced Chart, Gauge, Financials, Timeline
│   ├── context/
│   │   ├── ThemeContext.tsx    # Dark/Light theme provider
│   │   └── TradingContext.tsx  # Centralized trading state & holdings
│   ├── data/
│   │   └── stockMarketAvatars.ts # 8 Men & Women Stock Market Persona SVGs
│   ├── pages/
│   │   ├── AccountPage.tsx     # Photo upload, avatars, plans, 2FA security
│   │   ├── AuthPage.tsx        # Login, Register, 6-Digit OTP Password Reset
│   │   ├── DashboardPage.tsx   # Dashboard & market indices summary
│   │   ├── OrdersPage.tsx       # Open, filled & cancelled orders
│   │   ├── PaperTradingPage.tsx # Order execution station & live search
│   │   ├── PortfolioPage.tsx   # 5 Connected tabs (Overview, Holdings, Performance, Allocation, History)
│   │   ├── TechnicalAnalysisPage.tsx # 700px/454px TradingView chart with drawing tools
│   │   ├── TransactionsPage.tsx # Transaction ledger & CSV export
│   │   └── WatchlistPage.tsx   # Watchlist management
│   ├── services/
│   │   ├── finnhubService.ts   # Finnhub API integration
│   │   └── userService.ts      # Local partitioned database engine & OTP
│   ├── utils/
│   │   ├── formatters.ts       # Currency and percentage formatters
│   │   └── marketHours.ts      # Dynamic US Market Hours engine
│   ├── App.tsx                 # Root application router
│   ├── main.tsx                # Entrypoint
│   └── index.css               # Tailwind tokens & global CSS
├── vercel.json                 # Vercel deployment configuration
└── package.json                # Project dependencies
```

---

## 📄 License
This project is licensed under the MIT License.

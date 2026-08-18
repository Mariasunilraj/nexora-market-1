# 📊 NEXORA - Institutional US Stock Market Paper Trading Platform
## Complete Technical Specification, Architecture & Feature Report

---

## 1. 🌟 Executive Summary
**NEXORA** is a full-featured, institutional-grade **US Stock Market Paper Trading and Technical Analysis Web Application**. It empowers traders, quants, and equity investors to simulate live stock trades, analyze price action with advanced candlestick charts, track comprehensive portfolio analytics, and manage account security with zero financial risk.

---

## 2. 💻 Programming Languages & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Core Language** | **TypeScript 6.0** | Strongly typed JavaScript ensuring type safety, modular data models, and zero runtime type errors. |
| **Markup & Structure** | **HTML5** | Modern, accessible semantic markup adhering to SEO and accessibility best practices. |
| **Styling & Design System** | **Tailwind CSS v4 + PostCSS** | Custom ultra-modern financial UI theme with dark/light mode tokens, smooth transitions, and glassmorphic elevation. |
| **Frontend Framework** | **React 19** | Component-based modern SPA with hooks, context API, and optimized virtual DOM rendering. |
| **Build & Dev Tooling** | **Vite 8.2** | Next-generation frontend build tool with instantaneous Hot Module Replacement (HMR) and optimized Rollup bundling. |
| **Charts & Visualization** | **TradingView Advanced Real-Time Charts & Recharts 3.10** | High-performance Canvas/SVG charting, interactive Candlestick charts, Portfolio Growth Curves, and Asset Allocation Donut charts. |
| **Icons & Visuals** | **Lucide React** | Cohesive, sharp vector icon suite representing financial indicators, trading tools, and navigation elements. |
| **External APIs** | **Finnhub Stock API** | Real-time US stock quotes, market indices, candle history, and company profiles (*Finnhub Key: `da0l0ghr01qh1noo3kkgda0l0ghr01qh1noo3kl0`*). |

---

## 3. 🗄️ Database & Storage Architecture

NEXORA implements a robust, client-partitioned database engine (`userService.ts`) designed for local offline resilience, instant querying, and data isolation:

- **Database Engine**: Persistent Local Storage Engine with JSON Serialization & Partitioning.
- **User Authentication Partition**: `nexora_registered_users` stores user credentials, encrypted passwords, 2FA status, and registered email addresses.
- **User Data Partitioning**: `nexora_user_data_<userId>` isolates each user's virtual equity, cash balance, holdings portfolio, watchlists, trade orders, and transaction history.
- **Active Session State**: `nexora_active_user` tracks logged-in user tokens and active device sessions.
- **Security & Encryption**: SHA-256 password salting simulation and 6-digit OTP verification codes with 10-minute expiry timestamps.

---

## 4. 🚀 Comprehensive Feature Breakdown

### 🔐 1. Authentication & Security Station
- **Login & Registration**: User validation, email format checking, and password confirmation.
- **Forgot Password with 6-Digit Email OTP**:
  - Step 1: User enters their registered email address.
  - Step 2: 6-digit verification OTP dispatched with countdown timer and simulated email dispatch notification.
  - Step 3: Enter new password with live strength verification and instant auto-login.
- **Two-Factor Authentication (2FA)**: QR code Authenticator setup (`NX-8834-A79B`) with 6-digit code verification.
- **Active Device Sessions**: Track IP, device type (Desktop/Mobile), location, and 1-click remote session revocation.

---

### 📊 2. Dashboard Station
- **Summary Metric Cards**: Real-time Total Portfolio Value, Available Buying Power, Total Realized/Unrealized P&L ($ and %), and Today's Daily P&L.
- **Live US Market Ticker**: Real-time prices and percentage changes for S&P 500, NASDAQ-100, Dow Jones, and Russell 2000.
- **Interactive Portfolio Growth Chart**: Switch between Candlestick and Area views across 1D, 1W, 1M, 3M, 1Y, and ALL timeframes.
- **Market Movers & Watchlist Preview**: Quick overview of top gaining, top losing, and most active US equities.

---

### 💼 3. Portfolio Management Hub (5 Connected Views)
1. **📑 Overview Tab**: Executive performance chart and asset allocation donut side-by-side with active holdings summary.
2. **💼 Holdings Manager Tab**:
   - Filter by search query (symbol or company name).
   - 4-Way Sorting: Highest Total Value, Highest P&L ($), Most Shares, or Alphabetical.
   - Cost basis, average purchase price, current live price, total market valuation, weight %, and unrealized gain/loss.
   - 1-Click **"Trade"** button routing directly to Paper Trading.
3. **📈 Performance Deep-Dive Tab**:
   - Full-width portfolio growth chart with historical equity valuation.
   - 6 Institutional Metrics: Total Return (ROI %), Win Rate (% Profitable Positions), Sharpe Ratio (1.84), Max Drawdown (-3.20%), Top Performing Asset, and Alpha vs S&P 500 (+4.12%).
4. **🍩 Asset Allocation & Weighting Tab**:
   - Large interactive `AllocationDonut` chart.
   - Breakdown ledger with exact dollar valuation, portfolio weight %, sector tags, and **Concentration Risk Alerts** (*Normal* vs *Heavy >30%*).
   - Liquid cash reserve buffer tracking.
5. **🕒 Transaction Ledger Tab**:
   - Filter by transaction type: `All`, `Buy`, `Sell`, `Deposit`, `Dividend`.
   - Search by keyword or timestamp.
   - 1-Click **"Export CSV"** spreadsheet download.

---

### 📈 4. Paper Trading Station
- **Smart Symbol Search**: Allows backspacing and typing any stock ticker without auto-restoring to `AAPL`, complete with an instant `✕` clear button and click-outside dismissal.
- **Order Execution Suite**:
  - Buy & Sell actions with dynamic color coding (Emerald Green for Buy, Crimson Red for Sell).
  - Market Orders (instant execution at live bid/ask) and Limit Orders (set custom target price).
  - Quantity quick modifiers (`+1`, `+5`, `+10`, `+25`, `+50`, `+100`).
  - Automatic buying power verification, commission calculation, and transaction logging.
- **Dynamic Market Overview Card**: Live Open/Closed indicator and exact regular trading schedule.

---

### 📉 5. Technical Analysis Station
- **TradingView Advanced Real-Time Chart**:
  - Desktop height: `700px` for institutional charting.
  - Mobile height: `454px` custom responsive layout.
  - **Persistent Drawing Tools**: Trendlines, Fibonacci retracements, pitchforks, brushes, text annotations, and ruler sidebar permanently enabled (`hide_side_toolbar: false`).
  - Dark / Light theme synchronization.
- **Financials Widget**: Valuation metrics, enterprise value, price-to-earnings (P/E), and balance sheet data.
- **Technical Momentum Gauge**: Oscillators, Moving Averages, and overall sentiment (*Strong Buy, Buy, Neutral, Sell, Strong Sell*).
- **Market Timeline Widget**: Real-time breaking news feed for the selected stock.

---

### 👤 6. Account, Billing & Profile Customization
- **Profile Photo Upload**: Custom file upload (`PNG`, `JPEG`, `WEBP`) with Base64 encoding and database persistence.
- **8 Stock Market-Themed Avatars**:
  - 👨 **Men**: *Wall Street Bull Titan, Tactical Short Specialist, Diamond Hands Investor, Technical Chartist Pro*.
  - 👩 **Women**: *Growth Equities Director, Algorithmic Quant Lead, Institutional Fund Director, Macro Options Specialist*.
  - Filter by All, Men, or Women with 1-click application.
- **Plan & Billing**:
  - Monthly vs Annual toggle (-20% discount).
  - 3 subscription tiers: *Free Starter ($0)*, *Paper Trading Pro ($29/mo)*, and *Institutional Elite ($79/mo)*.
  - Visa payment card manager and invoice receipts ledger.
- **Virtual Funds Manager**: Deposit and withdraw simulated USD cash, reset account to initial $50,000, and download formal account statements (.txt).

---

### ⏰ 7. Real-Time US Market Hours Engine (`marketHours.ts`)
- Dynamically recalculates every 10 seconds:
  - 🟢 **OPEN**: During Daylight Saving Time (DST, March–Nov): **7:00 PM – 1:30 AM IST** (*9:30 AM – 4:00 PM ET*); during Standard Time: **8:00 PM – 2:30 AM IST**.
  - 🔴 **CLOSED**: Weekends (Sat/Sun) and outside regular market hours with next opening countdown.
  - 🟡 **PRE-MARKET & AFTER-HOURS**: Displays active extended trading sessions.

---

### 🚀 8. Vercel Deployment & DevOps Automation
- **`vercel.json`**: Configured with Single Page Application rewrites (`/(.*) -> /index.html`) and CDN asset cache-control.
- **`.vercelignore`**: Excludes local dev logs, node_modules, and git folders.
- **Git Version Control**: Full repository initialized with all features committed.

---

## 5. 📁 Project Structure

```
nexora-trading/
├── public/                     # Static icons and assets
├── src/
│   ├── assets/                 # SVGs and UI graphics
│   ├── components/
│   │   ├── charts/             # AllocationDonut, CandlestickChart, PortfolioChart, Sparkline
│   │   ├── common/             # Modal, StatCard, StockLogo
│   │   ├── layout/             # Header (with live avatar & ticker), Sidebar (with market status), Layout
│   │   └── tradingview/        # TradingViewAdvancedChart (700px/454px), Financials, Gauge, Timeline
│   ├── context/
│   │   ├── ThemeContext.tsx    # Dark/Light theme provider
│   │   └── TradingContext.tsx  # Centralized trading state, holdings, orders & P&L calculator
│   ├── data/
│   │   └── stockMarketAvatars.ts # 8 Men & Women Stock Market Persona SVGs
│   ├── pages/
│   │   ├── AccountPage.tsx     # Profile photo upload, avatars, billing plans, 2FA security
│   │   ├── AuthPage.tsx        # Login, Register, 6-Digit OTP Password Reset
│   │   ├── DashboardPage.tsx   # Executive dashboard & market summary
│   │   ├── OrdersPage.tsx       # Open, filled & cancelled orders
│   │   ├── PaperTradingPage.tsx # Order execution station & live search
│   │   ├── PortfolioPage.tsx   # 5 Connected tabs (Overview, Holdings, Performance, Allocation, History)
│   │   ├── SettingsPage.tsx    # Preferences, theme, sound & notification toggles
│   │   ├── TechnicalAnalysisPage.tsx # 700px/454px chart with drawing tools
│   │   ├── TransactionsPage.tsx # Complete transaction log & statement export
│   │   └── WatchlistPage.tsx   # Watchlist management
│   ├── services/
│   │   ├── finnhubService.ts   # Finnhub live quotes & WebSocket integration
│   │   ├── marketDataService.ts # Historical candles & market data
│   │   └── userService.ts      # User database, OTP generation & partition storage
│   ├── types/
│   │   └── trading.ts          # TypeScript interfaces & models
│   ├── utils/
│   │   ├── formatters.ts       # Currency, percent & date formatting
│   │   └── marketHours.ts      # Real-time US NYSE/NASDAQ IST hours engine
│   ├── App.tsx                 # Root router & page controller
│   ├── index.css               # Design system & Tailwind styling tokens
│   └── main.tsx                # React application entrypoint
├── package.json                # Dependencies & build scripts
├── vercel.json                 # Vercel SPA routing & CDN cache config
├── .vercelignore               # Vercel upload exclusions
├── VERCEL_DEPLOYMENT.md        # Step-by-step deployment guide
└── vite.config.ts              # Vite build configuration
```

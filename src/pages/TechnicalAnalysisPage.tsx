import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  ChevronRight,
  Zap,
  ArrowRight,
  Building2,
  DollarSign,
  BarChart3,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';
import { StockLogo } from '../components/common/StockLogo';
import { TradingViewAdvancedChart } from '../components/tradingview/TradingViewAdvancedChart';
import { StockQuote } from '../types/trading';

interface TechnicalAnalysisPageProps {
  onNavigateToTrade?: (symbol: string) => void;
  defaultSymbol?: string;
}

export const TechnicalAnalysisPage: React.FC<TechnicalAnalysisPageProps> = ({
  onNavigateToTrade,
  defaultSymbol = 'AAPL',
}) => {
  const { stocks, toggleFavorite } = useTrading();
  const { theme } = useTheme();
  const [currentSymbol, setCurrentSymbol] = useState<string>(defaultSymbol);
  const [activeStatementTab, setActiveStatementTab] = useState<'income' | 'balance' | 'cashflow'>('income');

  // Match current stock quote or fallback
  const currentStock: StockQuote = stocks.find(
    s => s.symbol.toUpperCase() === currentSymbol.toUpperCase()
  ) || {
    symbol: currentSymbol.toUpperCase(),
    name: `${currentSymbol.toUpperCase()} Inc.`,
    price: 195.34,
    change: 2.45,
    changePercent: 1.27,
    marketCap: '$3.01T',
    high: 195.63,
    low: 192.89,
    open: 193.50,
    previousClose: 192.89,
    volume: '52.31M',
    sparkline: [192, 193, 194, 195.34],
    isFavorite: true,
  };

  const isFavorite = currentStock.isFavorite;
  const isUp = currentStock.change >= 0;

  const quickWatchlist = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 195.34, change: 2.45, changePercent: 1.27 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.28, change: 3.21, changePercent: 0.78 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.67, change: 4.32, changePercent: 1.77 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 128.50, change: 3.45, changePercent: 2.76 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans w-full max-w-full">
      {/* 1. Top Breadcrumb & Symbol Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-700 dark:text-slate-300">Technical Analysis</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
          <span className="text-blue-600 dark:text-blue-400 font-bold">{currentStock.symbol}</span>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'AMZN', 'META'].map((sym) => (
            <button
              key={sym}
              onClick={() => setCurrentSymbol(sym)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currentSymbol.toUpperCase() === sym
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white dark:bg-[#0B132B] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1C2951]'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Stock Header Card */}
      <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-xl w-full transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Company Identity & Live Price */}
          <div className="flex items-center gap-4">
            <StockLogo symbol={currentStock.symbol} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentStock.name}
                </h1>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#111C3A] px-2 py-0.5 rounded border border-slate-200 dark:border-[#1C2951]">
                  {currentStock.symbol} • NASDAQ
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                  <Zap className="w-3 h-3 fill-current animate-pulse" />
                  TradingView Live
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  ${currentStock.price.toFixed(2)}
                </span>
                <span className={`flex items-center text-sm font-bold ${
                  isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {isUp ? '+' : ''}{currentStock.change.toFixed(2)} ({isUp ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Market Open • Real-Time Interactive US Market Feed
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToTrade && onNavigateToTrade(currentStock.symbol)}
              className="px-6 py-2.5 bg-[#00C076] hover:bg-[#00A868] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00C076]/20 transition-all flex items-center gap-1.5"
            >
              <span>Buy</span>
            </button>

            <button
              onClick={() => onNavigateToTrade && onNavigateToTrade(currentStock.symbol)}
              className="px-6 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#EF4444]/20 transition-all flex items-center gap-1.5"
            >
              <span>Sell</span>
            </button>

            <button
              onClick={() => toggleFavorite(currentStock.symbol)}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl border transition-all flex items-center gap-2 ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400'
                  : 'bg-slate-50 dark:bg-[#111C3A] border-slate-200 dark:border-[#1C2951] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 mt-5 border-t border-slate-100 dark:border-[#152042]">
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Open</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">${currentStock.open.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">High</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">${currentStock.high.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Low</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">${currentStock.low.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Prev Close</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">${currentStock.previousClose.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Volume</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{currentStock.volume}</span>
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">Market Cap</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">{currentStock.marketCap}</span>
          </div>
        </div>
      </div>

      {/* 3. WIDE FULL-WIDTH TRADINGVIEW ADVANCED CHART SECTION */}
      <div className="w-full shadow-md dark:shadow-2xl rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#1C2951]">
        <TradingViewAdvancedChart
          symbol={`NASDAQ:${currentStock.symbol}`}
          theme={theme}
          width="100%"
          height={700}
        />
      </div>

      {/* 4. UNDER-CHART SECTION: ROW 1 (Fundamental Analysis, Technical Analysis, Quick Watchlist) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Fundamental Analysis Card */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                Fundamental Analysis
              </h3>
              <button className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                View Full Report
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Market Cap', val: '$3.01 Trillion', label2: 'EPS (TTM)', val2: '$6.02' },
                { label: 'Enterprise Value', val: '$3.21 Trillion', label2: 'Revenue (TTM)', val2: '$394.33B' },
                { label: 'P/E Ratio (TTM)', val: '32.45', label2: 'Net Income (TTM)', val2: '$99.80B' },
                { label: 'PEG Ratio', val: '2.35', label2: 'Gross Margin', val2: '45.91%' },
                { label: 'Price to Sales', val: '7.45', label2: 'Operating Margin', val2: '30.20%' },
                { label: 'Price to Book', val: '48.12', label2: 'ROE (TTM)', val2: '160.21%' },
                { label: 'Dividend Yield', val: '0.51%', label2: 'ROA (TTM)', val2: '28.31%' },
                { label: 'Beta (5Y)', val: '1.24', label2: 'Debt to Equity', val2: '1.73' },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 py-1.5 border-b border-slate-100 dark:border-[#152042]/50 last:border-none">
                  <div className="flex justify-between items-center pr-2">
                    <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{row.val}</span>
                  </div>
                  <div className="flex justify-between items-center pl-2 border-l border-slate-100 dark:border-[#152042]/50">
                    <span className="text-slate-500 dark:text-slate-400">{row.label2}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{row.val2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Analysis Signals Card */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Technical Analysis
              </h3>
              <button className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                View Full Analysis
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { name: 'RSI (14)', val: '58.42', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
                { name: 'MACD', val: '1.26', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'SMA (50)', val: '192.40', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'EMA (20)', val: '194.76', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'Bollinger Bands', val: '195.76', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'VWAP', val: '194.32', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'ATR', val: '2.41', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
                { name: 'Stochastic', val: '67.21', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
                { name: 'ADX', val: '24.67', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#152042]/50 last:border-none">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{item.val}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${item.badge}`}>
                      {item.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Watchlist Card */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Quick Watchlist
              </h3>
              <button className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-semibold text-slate-400 dark:text-slate-500 pb-1.5 border-b border-slate-100 dark:border-[#152042]">
                <span>Symbol</span>
                <span className="text-right">Price</span>
                <span className="text-right">Change</span>
                <span className="text-right">% Change</span>
              </div>

              {quickWatchlist.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => setCurrentSymbol(item.symbol)}
                  className={`grid grid-cols-4 items-center py-2.5 px-2 rounded-xl transition-all cursor-pointer text-xs ${
                    currentSymbol.toUpperCase() === item.symbol
                      ? 'bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-[#111C3A] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StockLogo symbol={item.symbol} size="sm" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.symbol}</span>
                  </div>
                  <span className="text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    +{item.change.toFixed(2)}
                  </span>
                  <span className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    +{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#152042]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any stock to load its full chart & financials.
            </span>
          </div>
        </div>
      </div>

      {/* 5. UNDER-CHART SECTION: ROW 2 (Company Overview, Financial Statements, Key Statistics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Company Overview Card */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Company Overview
            </h3>

            <div className="flex items-start gap-3 mb-3">
              <StockLogo symbol={currentStock.symbol} size="sm" />
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {currentStock.name} designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories worldwide.
              </p>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-[#152042] pt-3 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sector</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">Technology</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Industry</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">Consumer Electronics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Founded</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">April 1, 1976</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">CEO</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">Tim Cook</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Employees</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">164,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Headquarters</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">Cupertino, California</span>
              </div>
            </div>
          </div>

          <a
            href="https://www.apple.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold mt-3 flex items-center gap-1"
          >
            <span>www.apple.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Financial Statements Card */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Financial Statements
            </h3>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#111C3A] p-1 rounded-xl border border-slate-200 dark:border-[#1C2951] mb-3 text-[11px]">
              {(['income', 'balance', 'cashflow'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveStatementTab(tab)}
                  className={`flex-1 py-1 px-1 font-bold rounded-lg capitalize transition-all ${
                    activeStatementTab === tab
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'income' ? 'Income Statement' : tab === 'balance' ? 'Balance Sheet' : 'Cash Flow'}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-100 dark:border-[#152042]">
              <span>(USD Billion)</span>
              <div className="flex gap-4">
                <span>2024</span>
                <span>2023</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Revenue</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-slate-800 dark:text-slate-200">394.33</span>
                  <span className="text-slate-500 dark:text-slate-400">383.29</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Gross Profit</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-slate-800 dark:text-slate-200">181.07</span>
                  <span className="text-slate-500 dark:text-slate-400">178.87</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Operating Income</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-slate-800 dark:text-slate-200">119.44</span>
                  <span className="text-slate-500 dark:text-slate-400">118.01</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Net Income</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">99.80</span>
                  <span className="text-emerald-600/70 dark:text-emerald-500/70">97.00</span>
                </div>
              </div>
            </div>
          </div>

          <button className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold mt-3 text-left">
            View Full Financials &rarr;
          </button>
        </div>

        {/* Key Statistics Card */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Key Statistics
            </h3>

            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-[#152042]/50">
                <span className="text-slate-500 dark:text-slate-400">52 Week High</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">$199.62</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-[#152042]/50">
                <span className="text-slate-500 dark:text-slate-400">52 Week Low</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">$164.07</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-[#152042]/50">
                <span className="text-slate-500 dark:text-slate-400">Average Volume (3M)</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">58.32M</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-[#152042]/50">
                <span className="text-slate-500 dark:text-slate-400">Shares Outstanding</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">15.43B</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-[#152042]/50">
                <span className="text-slate-500 dark:text-slate-400">Free Float</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold font-mono">14.91B</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Next Earnings</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">Jul 31, 2025</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-[11px] text-purple-700 dark:text-purple-300 font-semibold text-center mt-3">
            Q3 Earnings Release Confirmed
          </div>
        </div>
      </div>

      {/* 6. UNDER-CHART SECTION: ROW 3 (Technical Indicators Summary Bar + News & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Technical Indicators Summary Bar (2 Cols Span) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Technical Indicators Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { name: 'RSI (14)', val: '58.42', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
                { name: 'MACD', val: '1.26', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'SMA (50)', val: '192.40', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'EMA (20)', val: '194.76', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'VWAP', val: '194.32', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
                { name: 'ATR', val: '2.41', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-[#1C2951] flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.name}</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white my-1 font-mono">{item.val}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${item.badge} mx-auto`}>
                    {item.signal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News & Insights Card (1 Col Span) */}
        <div className="bg-white dark:bg-[#0B132B] border border-slate-200/80 dark:border-[#1C2951] rounded-2xl p-5 shadow-sm dark:shadow-xl flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">News & Insights</h3>
              <button className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Apple shares rise 1.27% as markets rally',
                  time: 'May 20, 2025 • Reuters',
                },
                {
                  title: 'Apple unveils new AI features for iOS 19',
                  time: 'May 19, 2025 • Bloomberg',
                },
                {
                  title: 'Analysts raise price target for Apple',
                  time: 'May 18, 2025 • CNBC',
                },
              ].map((news, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#111C3A] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <StockLogo symbol={currentStock.symbol} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {news.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                        {news.time}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

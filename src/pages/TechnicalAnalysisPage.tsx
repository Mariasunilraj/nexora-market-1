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
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-700 dark:text-zinc-300">Analysis</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{currentStock.symbol}</span>
        </div>

        {/* Quick Ticker Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'AMZN', 'META'].map((sym) => (
            <button
              key={sym}
              onClick={() => setCurrentSymbol(sym)}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                currentSymbol.toUpperCase() === sym
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-[#18181B] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero Stock Header Card */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 w-full transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Company Identity & Live Price */}
          <div className="flex items-center gap-4">
            <StockLogo symbol={currentStock.symbol} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {currentStock.name}
                </h1>
                <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                  {currentStock.symbol} • NASDAQ
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800">
                  <Zap className="w-3 h-3 fill-current text-emerald-500 animate-pulse" />
                  Live Feed
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight">
                  ${currentStock.price.toFixed(2)}
                </span>
                <span className={`flex items-center font-mono text-sm font-bold ${
                  isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {isUp ? '+' : ''}{currentStock.change.toFixed(2)} ({isUp ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                Market Open • Real-Time Interactive US Market Stream
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateToTrade && onNavigateToTrade(currentStock.symbol)}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Buy
            </button>

            <button
              onClick={() => onNavigateToTrade && onNavigateToTrade(currentStock.symbol)}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Sell
            </button>

            <button
              onClick={() => toggleFavorite(currentStock.symbol)}
              className={`px-4 py-2 font-bold text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${
                isFavorite
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'Watchlist' : 'Add Watchlist'}</span>
            </button>
          </div>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Open</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">${currentStock.open.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">High</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">${currentStock.high.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Low</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">${currentStock.low.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Prev Close</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">${currentStock.previousClose.toFixed(2)}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Volume</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">{currentStock.volume}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Market Cap</span>
            <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5 block">{currentStock.marketCap}</span>
          </div>
        </div>
      </div>

      {/* 3. WIDE FULL-WIDTH TRADINGVIEW ADVANCED CHART SECTION */}
      <div className="w-full border border-zinc-200 dark:border-zinc-800">
        <TradingViewAdvancedChart
          symbol={currentStock.symbol}
          theme={theme}
          width="100%"
          height={650}
          currentPrice={currentStock.price}
          priceChange={currentStock.change}
          priceChangePercent={currentStock.changePercent}
        />
      </div>

      {/* 4. UNDER-CHART SECTION: ROW 1 (Fundamental Analysis, Technical Analysis, Quick Watchlist) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Fundamental Analysis Card */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                Fundamental Analysis
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Market Cap', val: '$3.01T', label2: 'EPS (TTM)', val2: '$6.02' },
                { label: 'Enterprise Value', val: '$3.21T', label2: 'Revenue (TTM)', val2: '$394.33B' },
                { label: 'P/E Ratio (TTM)', val: '32.45', label2: 'Net Income (TTM)', val2: '$99.80B' },
                { label: 'PEG Ratio', val: '2.35', label2: 'Gross Margin', val2: '45.91%' },
                { label: 'Price to Sales', val: '7.45', label2: 'Operating Margin', val2: '30.20%' },
                { label: 'Price to Book', val: '48.12', label2: 'ROE (TTM)', val2: '160.21%' },
                { label: 'Dividend Yield', val: '0.51%', label2: 'ROA (TTM)', val2: '28.31%' },
                { label: 'Beta (5Y)', val: '1.24', label2: 'Debt to Equity', val2: '1.73' },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-none">
                  <div className="flex justify-between items-center pr-2">
                    <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{row.val}</span>
                  </div>
                  <div className="flex justify-between items-center pl-2 border-l border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-500 dark:text-zinc-400">{row.label2}</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{row.val2}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Analysis Signals Card */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Technical Analysis Signals
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'RSI (14)', val: '58.42', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' },
                { name: 'MACD (12, 26)', val: '1.26', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' },
                { name: 'SMA (50)', val: '192.40', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' },
                { name: 'EMA (20)', val: '194.76', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' },
                { name: 'Bollinger Bands', val: '195.76', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' },
                { name: 'VWAP', val: '194.32', signal: 'Buy', badge: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800' },
                { name: 'ATR', val: '2.41', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' },
                { name: 'Stochastic', val: '67.21', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' },
                { name: 'ADX', val: '24.67', signal: 'Neutral', badge: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/80 last:border-none">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">{item.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">{item.val}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${item.badge}`}>
                      {item.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Watchlist Card */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Quick Watchlist
              </h3>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span>Symbol</span>
                <span className="text-right">Price</span>
                <span className="text-right">Change</span>
                <span className="text-right">% Change</span>
              </div>

              {quickWatchlist.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => setCurrentSymbol(item.symbol)}
                  className={`grid grid-cols-4 items-center py-2.5 px-2 border transition-all cursor-pointer text-xs ${
                    currentSymbol.toUpperCase() === item.symbol
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-white'
                      : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StockLogo symbol={item.symbol} size="sm" />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.symbol}</span>
                  </div>
                  <span className="text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">
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

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-3">
            <span className="text-[10px] font-mono text-zinc-400">
              Click any ticker chip to update the interactive chart.
            </span>
          </div>
        </div>
      </div>

      {/* 5. UNDER-CHART SECTION: ROW 2 (Company Overview, Financial Statements, Key Statistics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Company Overview Card */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Company Profile
            </h3>

            <div className="flex items-start gap-3 mb-3">
              <StockLogo symbol={currentStock.symbol} size="sm" />
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                {currentStock.name} designs, manufactures and markets mobile devices, computers, enterprise cloud infrastructure, software and accessories worldwide.
              </p>
            </div>

            <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3 font-medium">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Sector</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">Technology</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Industry</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">Consumer Tech</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Exchange</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">NASDAQ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Headquarters</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold">United States</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Statements Card */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Financial Statements
            </h3>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 mb-3 text-[10px] uppercase tracking-wider">
              {(['income', 'balance', 'cashflow'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveStatementTab(tab)}
                  className={`flex-1 py-1 px-1 font-bold transition-all ${
                    activeStatementTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab === 'income' ? 'Income' : tab === 'balance' ? 'Balance' : 'Cash Flow'}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-zinc-400 pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <span>(USD Billion)</span>
              <div className="flex gap-4">
                <span>2024</span>
                <span>2023</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 font-medium">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Revenue</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-zinc-800 dark:text-zinc-200">$394.33B</span>
                  <span className="text-zinc-400">$383.29B</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Gross Profit</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-zinc-800 dark:text-zinc-200">$181.07B</span>
                  <span className="text-zinc-400">$178.87B</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Operating Income</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-zinc-800 dark:text-zinc-200">$119.44B</span>
                  <span className="text-zinc-400">$118.01B</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Net Income</span>
                <div className="flex gap-4 font-mono font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400">$99.80B</span>
                  <span className="text-emerald-600/70">$97.00B</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Statistics Card */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Key Statistics
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500 dark:text-zinc-400">52 Week High</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">$199.62</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500 dark:text-zinc-400">52 Week Low</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">$164.07</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500 dark:text-zinc-400">Average Volume (3M)</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">58.32M</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-zinc-500 dark:text-zinc-400">Shares Outstanding</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">15.43B</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500 dark:text-zinc-400">Free Float</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-bold font-mono">14.91B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

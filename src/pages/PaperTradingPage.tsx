import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Search, TrendingUp, TrendingDown, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { StatCard } from '../components/common/StatCard';
import { StockLogo } from '../components/common/StockLogo';
import { Sparkline } from '../components/charts/Sparkline';
import { OrderActionType, OrderExecutionType, StockQuote } from '../types/trading';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getMarketStatus } from '../utils/marketHours';

interface PaperTradingPageProps {
  initialSymbol?: string;
}

export const PaperTradingPage: React.FC<PaperTradingPageProps> = ({ initialSymbol }) => {
  const {
    stocks,
    holdings,
    indices,
    totalPortfolioValue,
    buyingPower,
    todaysPnL,
    todaysPnLPercent,
    totalPnL,
    totalPnLPercent,
    executeOrder,
  } = useTrading();

  const [marketStatus, setMarketStatus] = useState(() => getMarketStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [orderAction, setOrderAction] = useState<OrderActionType>('Buy');
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(() => {
    if (initialSymbol) {
      const match = stocks.find(s => s.symbol.toUpperCase() === initialSymbol.toUpperCase());
      if (match) return match;
    }
    return stocks[0] || null;
  });

  const [searchInputValue, setSearchInputValue] = useState<string>(() => {
    if (initialSymbol) {
      const match = stocks.find(s => s.symbol.toUpperCase() === initialSymbol.toUpperCase());
      if (match) return `${match.symbol} - ${match.name}`;
    }
    return stocks[0] ? `${stocks[0].symbol} - ${stocks[0].name}` : '';
  });

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(10);
  const [orderType, setOrderType] = useState<OrderExecutionType>('Market');
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock ? selectedStock.price : 0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync initialSymbol if passed from parent
  useEffect(() => {
    if (initialSymbol) {
      const match = stocks.find(s => s.symbol.toUpperCase() === initialSymbol.toUpperCase());
      if (match) {
        setSelectedStock(match);
        setLimitPrice(match.price);
        setSearchInputValue(`${match.symbol} - ${match.name}`);
      }
    }
  }, [initialSymbol, stocks]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStockSelect = (stock: StockQuote) => {
    setSelectedStock(stock);
    setLimitPrice(stock.price);
    setSearchInputValue(`${stock.symbol} - ${stock.name}`);
    setShowDropdown(false);
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    setShowDropdown(true);
  };

  const currentPrice = selectedStock ? selectedStock.price : 0;
  const executionPrice = orderType === 'Limit' ? limitPrice : currentPrice;
  const estimatedCost = +(quantity * executionPrice).toFixed(2);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) {
      setFeedback({ type: 'error', message: 'Please select a stock first.' });
      return;
    }

    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'Quantity must be at least 1.' });
      return;
    }

    const res = executeOrder({
      symbol: selectedStock.symbol,
      type: orderAction,
      quantity,
      orderType,
      limitPrice: orderType === 'Limit' ? limitPrice : undefined,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleQuickSell = (symbol: string) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) {
      setSelectedStock(stock);
      setLimitPrice(stock.price);
      setSearchInputValue(`${stock.symbol} - ${stock.name}`);
      setOrderAction('Sell');
      const holding = holdings.find(h => h.symbol === symbol);
      if (holding) {
        setQuantity(holding.shares);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cleanQuery = searchInputValue.toLowerCase().trim();
  const filteredStocks = stocks.filter(
    s => s.symbol.toLowerCase().includes(cleanQuery) ||
         s.name.toLowerCase().includes(cleanQuery)
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 4 Summary Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Virtual Equity"
          value={formatCurrency(totalPortfolioValue)}
          subValue="+ $2,348.75 (4.63%)"
          subValueType="positive"
        />
        <StatCard
          title="Buying Power"
          value={formatCurrency(buyingPower)}
          subValue="Available Cash"
          subValueType="neutral"
        />
        <StatCard
          title="Today's P&L"
          value={formatCurrency(todaysPnL, true)}
          subValue={formatPercent(todaysPnLPercent)}
          subValueType={todaysPnL >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Total P&L"
          value={formatCurrency(totalPnL, true)}
          subValue={formatPercent(totalPnLPercent)}
          subValueType={totalPnL >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Main Trade Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Placement Card matching Mockup 4 */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          {/* Buy / Sell Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
            <button
              onClick={() => setOrderAction('Buy')}
              className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all ${
                orderAction === 'Buy'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderAction('Sell')}
              className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all ${
                orderAction === 'Sell'
                  ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Sell
            </button>
          </div>

          {feedback && (
            <div className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleExecute} className="space-y-4">
            {/* Symbol Search Input with Ref and Clear Button */}
            <div ref={searchContainerRef}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Symbol / Ticker
              </label>
              <div className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search stock by symbol or name (e.g. NVDA, MSFT, TSLA...)"
                    value={searchInputValue}
                    onChange={(e) => {
                      setSearchInputValue(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-16 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <div className="absolute right-3 flex items-center gap-1.5">
                    {searchInputValue && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Search className="w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Dropdown Results */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0E172E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in duration-150">
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          onClick={() => handleStockSelect(stock)}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <StockLogo symbol={stock.symbol} size="sm" />
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{stock.symbol}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{stock.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">${stock.price.toFixed(2)}</p>
                            <p className={`text-[10px] font-semibold ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.changePercent}%
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No stocks found matching "{searchInputValue}". Try typing another symbol.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity & Order Type in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Quantity (Shares)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Market', 'Limit'] as OrderExecutionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        orderType === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Limit Price Input if Limit Order */}
            {orderType === 'Limit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Limit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            {/* Estimated Cost Breakdown matching Mockup 4 */}
            <div className="bg-slate-50 dark:bg-[#111C3A] rounded-xl p-4 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Execution Price</span>
                <span className="text-slate-900 dark:text-white">${executionPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Commission Fee</span>
                <span className="text-emerald-500 font-bold">$0.00 (Free)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                <span>Estimated Total</span>
                <span className="text-base font-black">${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-black text-sm text-white shadow-lg transition-all ${
                orderAction === 'Buy'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
              }`}
            >
              {orderAction} {quantity} Shares of {selectedStock ? selectedStock.symbol : ''}
            </button>
          </form>
        </div>

        {/* Right 1 Col: Market Overview Card matching Mockup 4 */}
        <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Market Overview
              </h4>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                marketStatus.isOpen
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : marketStatus.session === 'Pre-Market' || marketStatus.session === 'After-Hours'
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}>
                {marketStatus.statusText}
              </span>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {indices.map((idx) => (
                <div key={idx.name} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{idx.name}</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold flex items-center justify-end gap-1 ${
                      idx.change >= 0 ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {idx.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">NYSE/NASDAQ Hours:</span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{marketStatus.nextEventText}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Regular Hours: <strong className="text-slate-700 dark:text-slate-300">{marketStatus.formattedScheduleIST}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Your Current Holdings Table matching Mockup 4 */}
      <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Your Current Holdings
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-semibold">Asset</th>
                <th className="pb-3 font-semibold text-right">Shares</th>
                <th className="pb-3 font-semibold text-right">Avg Price</th>
                <th className="pb-3 font-semibold text-right">Current Price</th>
                <th className="pb-3 font-semibold text-right">Total Value</th>
                <th className="pb-3 font-semibold text-right">P&L</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {holdings.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={h.symbol} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{h.symbol}</p>
                        <p className="text-[10px] text-slate-400">{h.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">{h.shares}</td>
                  <td className="py-3 text-right font-medium text-slate-500 dark:text-slate-400">${h.avgPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">${h.currentPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-black text-slate-900 dark:text-white">${h.totalValue.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <span className={`font-bold ${h.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)} ({h.pnlPercent}%)
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleQuickSell(h.symbol)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold rounded-lg text-[11px] transition-colors"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

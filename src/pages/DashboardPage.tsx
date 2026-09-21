import React from 'react';
import { ChevronRight, Zap, ArrowUpRight } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { StatCard } from '../components/common/StatCard';
import { StockLogo } from '../components/common/StockLogo';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { PageId } from '../components/layout/Sidebar';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface DashboardPageProps {
  onNavigate: (page: PageId, symbol?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    stocks,
    holdings,
    totalPortfolioValue,
    buyingPower,
    totalPnL,
    totalPnLPercent,
    todaysPnL,
    todaysPnLPercent,
    userProfile,
  } = useTrading();

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner - Minimalist Fintech Header */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              PAPER TRADING PRO
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3 h-3 fill-current text-emerald-500" /> LIVE US FEED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome back, {userProfile.name}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xl">
            Simulate live US equity trades in real-time. Zero financial risk with instant market order execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('paper-trading')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Execute Trade
          </button>
          <button
            onClick={() => onNavigate('portfolio')}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Portfolio
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          subValue="+ $2,348.75 (4.63%)"
          subValueType="positive"
        />
        <StatCard
          title="Buying Power"
          value={formatCurrency(buyingPower)}
          subValue="Ready to Deploy"
          subValueType="neutral"
        />
        <StatCard
          title="Total P&L"
          value={formatCurrency(totalPnL, true)}
          subValue={formatPercent(totalPnLPercent)}
          subValueType={totalPnL >= 0 ? 'positive' : 'negative'}
        />
        <StatCard
          title="Today's P&L"
          value={formatCurrency(todaysPnL, true)}
          subValue={formatPercent(todaysPnLPercent)}
          subValueType={todaysPnL >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Charts & Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>

        {/* Top Movers */}
        <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Top Market Movers
              </h4>
              <button
                onClick={() => onNavigate('watchlist')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                <span>Watchlist</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {topGainers.map((s) => {
                const isUp = s.change >= 0;
                return (
                  <div
                    key={s.symbol}
                    onClick={() => onNavigate('paper-trading', s.symbol)}
                    className="p-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between cursor-pointer hover:border-blue-600 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{s.symbol}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{s.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-zinc-900 dark:text-white">${s.price.toFixed(2)}</p>
                      <p className={`text-[11px] font-mono font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isUp ? '+' : ''}{s.changePercent}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-4">
            <button
              onClick={() => onNavigate('paper-trading')}
              className="w-full py-2 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider transition-colors border border-blue-200 dark:border-blue-800"
            >
              Open Trade Station
            </button>
          </div>
        </div>
      </div>

      {/* Quick Positions Preview */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
            Active Portfolio Positions
          </h4>
          <button
            onClick={() => onNavigate('portfolio')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 uppercase tracking-wider flex items-center gap-1 group"
          >
            <span>Full Holdings</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <th className="py-2 pl-2 font-semibold">Symbol</th>
                <th className="py-2 font-semibold">Company</th>
                <th className="py-2 font-semibold text-right">Shares</th>
                <th className="py-2 font-semibold text-right">Current Price</th>
                <th className="py-2 font-semibold text-right">Total Value</th>
                <th className="py-2 font-semibold text-right pr-2">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {holdings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-400">
                    No active positions. Execute your first paper trade.
                  </td>
                </tr>
              ) : (
                holdings.slice(0, 4).map((h) => {
                  const isProfit = h.pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 pl-2 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <StockLogo symbol={h.symbol} size="sm" />
                        <span>{h.symbol}</span>
                      </td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400 text-xs">
                        {h.company}
                      </td>
                      <td className="py-3 text-right text-zinc-900 dark:text-white font-mono font-semibold">
                        {h.shares}
                      </td>
                      <td className="py-3 text-right text-zinc-900 dark:text-white font-mono font-semibold">
                        ${h.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3 text-right text-zinc-900 dark:text-white font-mono font-bold">
                        ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 text-right pr-2 font-mono font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isProfit ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Zap,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { StatCard } from '../components/common/StatCard';
import { StockLogo } from '../components/common/StockLogo';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { Sparkline } from '../components/charts/Sparkline';
import { PageId } from '../components/layout/Sidebar';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface DashboardPageProps {
  onNavigate: (page: PageId, symbol?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    stocks,
    holdings,
    indices,
    totalPortfolioValue,
    buyingPower,
    totalPnL,
    totalPnLPercent,
    todaysPnL,
    todaysPnLPercent,
    transactions,
    userProfile,
  } = useTrading();

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-sm">
              PAPER TRADING PLATFORM
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
              <Zap className="w-3 h-3 fill-current" /> Live Real-Time Feed
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Welcome back, {userProfile.name}
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Simulate live US stock market trades in real-time. Test your strategies with zero financial risk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('paper-trading')}
            className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            Start Trading Now
          </button>
          <button
            onClick={() => onNavigate('portfolio')}
            className="px-5 py-2.5 bg-blue-700/60 hover:bg-blue-700 text-white font-bold text-xs rounded-xl border border-white/20 transition-all whitespace-nowrap"
          >
            View Portfolio
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
        <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Top Movers Today
              </h4>
              <button
                onClick={() => onNavigate('watchlist')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Watchlist
              </button>
            </div>

            <div className="space-y-3">
              {topGainers.map((s) => {
                const isUp = s.change >= 0;
                return (
                  <div
                    key={s.symbol}
                    onClick={() => onNavigate('paper-trading', s.symbol)}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#111C3A]/40 flex items-center justify-between cursor-pointer hover:border-blue-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{s.symbol}</p>
                        <p className="text-[11px] text-slate-400">{s.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">${s.price.toFixed(2)}</p>
                      <p className={`text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUp ? '+' : ''}{s.changePercent}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              onClick={() => onNavigate('paper-trading')}
              className="w-full py-2.5 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl transition-colors"
            >
              Open Trade Station
            </button>
          </div>
        </div>
      </div>

      {/* Quick Positions Preview */}
      <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Active Holdings Preview
          </h4>
          <button
            onClick={() => onNavigate('portfolio')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Full Portfolio</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 pl-2 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium text-right">Shares</th>
                <th className="pb-3 font-medium text-right">Current Price</th>
                <th className="pb-3 font-medium text-right">Total Value</th>
                <th className="pb-3 font-medium text-right pr-2">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {holdings.slice(0, 4).map((h) => {
                const isProfit = h.pnl >= 0;
                return (
                  <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <StockLogo symbol={h.symbol} size="sm" />
                      <span>{h.symbol}</span>
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300 text-xs">
                      {h.company}
                    </td>
                    <td className="py-3.5 text-right text-slate-900 dark:text-white font-semibold">
                      {h.shares}
                    </td>
                    <td className="py-3.5 text-right text-slate-900 dark:text-white font-semibold">
                      ${h.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right text-slate-900 dark:text-white font-bold">
                      ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3.5 text-right pr-2 font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isProfit ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

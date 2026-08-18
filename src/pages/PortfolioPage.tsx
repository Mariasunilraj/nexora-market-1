import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { StatCard } from '../components/common/StatCard';
import { StockLogo } from '../components/common/StockLogo';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface PortfolioPageProps {
  onNavigateToTrade?: (symbol: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onNavigateToTrade }) => {
  const {
    holdings,
    totalPortfolioValue,
    totalInvested,
    totalPnL,
    totalPnLPercent,
    todaysPnL,
    todaysPnLPercent,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Holdings' | 'Performance' | 'Asset Allocation' | 'History'>('Overview');

  const tabs: Array<'Overview' | 'Holdings' | 'Performance' | 'Asset Allocation' | 'History'> = [
    'Overview',
    'Holdings',
    'Performance',
    'Asset Allocation',
    'History',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Tab Navigation matching mockup */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={formatCurrency(totalPortfolioValue)}
          subValue="+ $2,348.75 (4.63%)"
          subValueType="positive"
        />
        <StatCard
          title="Total Invested"
          value={formatCurrency(totalInvested)}
          subValue="Initial Principal Capital"
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PortfolioChart />
        </div>
        <div>
          <AllocationDonut />
        </div>
      </div>

      {/* Holdings Table matching mockup */}
      <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Holdings ({holdings.length})
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 pl-2 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium text-right">Shares</th>
                <th className="pb-3 font-medium text-right">Avg Price</th>
                <th className="pb-3 font-medium text-right">Current Price</th>
                <th className="pb-3 font-medium text-right">Total Value</th>
                <th className="pb-3 font-medium text-right">P&L</th>
                <th className="pb-3 font-medium text-right pr-2">P&L %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {holdings.map((h) => {
                const isProfit = h.pnl >= 0;
                return (
                  <tr
                    key={h.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onNavigateToTrade && onNavigateToTrade(h.symbol)}
                  >
                    <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <StockLogo symbol={h.symbol} size="sm" />
                      <span>{h.symbol}</span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {h.company}
                    </td>
                    <td className="py-4 text-right text-slate-900 dark:text-white font-semibold">
                      {h.shares}
                    </td>
                    <td className="py-4 text-right text-slate-600 dark:text-slate-300">
                      ${h.avgPrice.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-slate-900 dark:text-white font-semibold">
                      ${h.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-slate-900 dark:text-white font-bold">
                      ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-4 text-right font-semibold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isProfit ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                    </td>
                    <td className={`py-4 text-right pr-2 font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isProfit ? `+${h.pnlPercent.toFixed(2)}%` : `${h.pnlPercent.toFixed(2)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
          <button
            onClick={() => setActiveTab('Holdings')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All Holdings</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

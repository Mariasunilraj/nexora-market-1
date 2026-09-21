import React, { useState } from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  BarChart3,
  Layers,
  Clock,
  Search,
  SlidersHorizontal,
  Download,
  ArrowRight,
} from 'lucide-react';
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
    virtualCash,
    transactions,
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Holdings' | 'Performance' | 'Asset Allocation' | 'History'>('Overview');

  // Holdings Tab States
  const [holdingSearch, setHoldingSearch] = useState('');
  const [holdingSort, setHoldingSort] = useState<'value' | 'pnl' | 'shares' | 'symbol'>('value');

  // History Tab States
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Buy' | 'Sell' | 'Deposit' | 'Dividend'>('All');
  const [historySearch, setHistorySearch] = useState('');

  const tabs: Array<{ id: 'Overview' | 'Holdings' | 'Performance' | 'Asset Allocation' | 'History'; label: string; icon: any }> = [
    { id: 'Overview', label: 'Overview', icon: Layers },
    { id: 'Holdings', label: `Holdings (${holdings.length})`, icon: BarChart3 },
    { id: 'Performance', label: 'Performance', icon: TrendingUp },
    { id: 'Asset Allocation', label: 'Asset Allocation', icon: PieChartIcon },
    { id: 'History', label: 'History', icon: Clock },
  ];

  // Filter & Sort Holdings
  const filteredHoldings = holdings
    .filter(
      h => h.symbol.toLowerCase().includes(holdingSearch.toLowerCase()) ||
           h.company.toLowerCase().includes(holdingSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (holdingSort === 'value') return b.totalValue - a.totalValue;
      if (holdingSort === 'pnl') return b.pnl - a.pnl;
      if (holdingSort === 'shares') return b.shares - a.shares;
      return a.symbol.localeCompare(b.symbol);
    });

  // Filter Transactions for History Tab
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = historyFilter === 'All' || t.type.toLowerCase() === historyFilter.toLowerCase();
    const matchesSearch =
      t.description.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.type.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.date.toLowerCase().includes(historySearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Performance calculations
  const profitableHoldingsCount = holdings.filter(h => h.pnl > 0).length;
  const winRate = holdings.length > 0 ? (profitableHoldingsCount / holdings.length) * 100 : 100;
  const bestPerformer = [...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent)[0];

  const handleExportCSV = () => {
    const headers = 'ID,Date,Type,Description,Amount,Balance\n';
    const rows = transactions
      .map(t => `"${t.id}","${t.date}","${t.type}","${t.description.replace(/"/g, '""')}",${t.amount},${t.balance}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_portfolio_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 font-bold text-xs uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-zinc-800/60'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
          title="Total Invested"
          value={formatCurrency(totalInvested)}
          subValue="Principal Capital"
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

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioChart />
            </div>
            <div>
              <AllocationDonut />
            </div>
          </div>

          <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Active Positions ({holdings.length})
              </h4>
              <button
                onClick={() => setActiveTab('Holdings')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                <span>Full Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <th className="py-2 pl-2 font-semibold">Symbol</th>
                    <th className="py-2 font-semibold">Company</th>
                    <th className="py-2 font-semibold text-right">Shares</th>
                    <th className="py-2 font-semibold text-right">Avg Price</th>
                    <th className="py-2 font-semibold text-right">Current Price</th>
                    <th className="py-2 font-semibold text-right">Total Value</th>
                    <th className="py-2 font-semibold text-right">P&L</th>
                    <th className="py-2 font-semibold text-right pr-2">P&L %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {holdings.slice(0, 5).map((h) => {
                    const isProfit = h.pnl >= 0;
                    return (
                      <tr
                        key={h.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => onNavigateToTrade && onNavigateToTrade(h.symbol)}
                      >
                        <td className="py-3.5 pl-2 font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                          <StockLogo symbol={h.symbol} size="sm" />
                          <span>{h.symbol}</span>
                        </td>
                        <td className="py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                          {h.company}
                        </td>
                        <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                          {h.shares}
                        </td>
                        <td className="py-3.5 text-right font-mono text-zinc-500 dark:text-zinc-400">
                          ${h.avgPrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                          ${h.currentPrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-3.5 text-right font-mono font-semibold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isProfit ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                        </td>
                        <td className={`py-3.5 text-right pr-2 font-mono font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {isProfit ? `+${h.pnlPercent.toFixed(2)}%` : `${h.pnlPercent.toFixed(2)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOLDINGS TAB */}
      {activeTab === 'Holdings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Holdings Manager ({filteredHoldings.length} Assets)
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter ticker or name..."
                    value={holdingSearch}
                    onChange={(e) => setHoldingSearch(e.target.value)}
                    className="bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 pl-9 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                  <select
                    value={holdingSort}
                    onChange={(e) => setHoldingSort(e.target.value as any)}
                    className="bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="value">Highest Total Value</option>
                    <option value="pnl">Highest P&L ($)</option>
                    <option value="shares">Most Shares</option>
                    <option value="symbol">Ticker (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <th className="py-2 pl-2 font-semibold">Asset</th>
                    <th className="py-2 font-semibold text-right">Shares</th>
                    <th className="py-2 font-semibold text-right">Avg Cost</th>
                    <th className="py-2 font-semibold text-right">Market Price</th>
                    <th className="py-2 font-semibold text-right">Market Value</th>
                    <th className="py-2 font-semibold text-right">Weight</th>
                    <th className="py-2 font-semibold text-right">Unrealized P&L</th>
                    <th className="py-2 font-semibold text-right">P&L %</th>
                    <th className="py-2 font-semibold text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredHoldings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-zinc-400">
                        No holdings found matching "{holdingSearch}".
                      </td>
                    </tr>
                  ) : (
                    filteredHoldings.map((h) => {
                      const isProfit = h.pnl >= 0;
                      const weightPct = totalPortfolioValue > 0 ? ((h.totalValue / totalPortfolioValue) * 100).toFixed(1) : '0.0';
                      return (
                        <tr
                          key={h.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="py-3.5 pl-2 font-bold text-zinc-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <StockLogo symbol={h.symbol} size="sm" />
                              <div>
                                <p className="font-bold text-zinc-900 dark:text-white">{h.symbol}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{h.company}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                            {h.shares}
                          </td>
                          <td className="py-3.5 text-right font-mono text-zinc-500 dark:text-zinc-400">
                            ${h.avgPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                            ${h.currentPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                            ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
                            {weightPct}%
                          </td>
                          <td className={`py-3.5 text-right font-mono font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                          </td>
                          <td className={`py-3.5 text-right font-mono font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? `+${h.pnlPercent.toFixed(2)}%` : `${h.pnlPercent.toFixed(2)}%`}
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <button
                              onClick={() => onNavigateToTrade && onNavigateToTrade(h.symbol)}
                              className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors"
                            >
                              Trade
                            </button>
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
      )}

      {/* 3. PERFORMANCE TAB */}
      {activeTab === 'Performance' && (
        <div className="space-y-6">
          <PortfolioChart />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Return (ROI)</span>
              <p className={`text-2xl font-mono font-bold ${totalPnL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </p>
              <p className="text-[11px] font-mono text-zinc-400">Net Dollar Profit: {formatCurrency(totalPnL, true)}</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Win Rate (% Profitable)</span>
              <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
                {winRate.toFixed(1)}%
              </p>
              <p className="text-[11px] text-zinc-400">{profitableHoldingsCount} of {holdings.length} positions in profit</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Sharpe Ratio</span>
              <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-white">
                1.84 <span className="text-xs font-normal text-zinc-400">(Optimal)</span>
              </p>
              <p className="text-[11px] text-zinc-400">Risk-adjusted return vs benchmark</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. ASSET ALLOCATION TAB */}
      {activeTab === 'Asset Allocation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AllocationDonut />
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800">
                Asset Allocation Ledger
              </h4>

              <div className="space-y-3">
                {/* Cash Entry */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 text-white flex items-center justify-center font-bold text-xs font-mono">
                      USD
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">Available Cash</p>
                      <p className="text-[10px] text-zinc-400">Buying Power</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      {totalPortfolioValue > 0 ? ((virtualCash / totalPortfolioValue) * 100).toFixed(1) : '100'}%
                    </p>
                  </div>
                </div>

                {/* Holdings Breakdown */}
                {holdings.map((h) => {
                  const weightPct = totalPortfolioValue > 0 ? +((h.totalValue / totalPortfolioValue) * 100).toFixed(1) : 0;
                  return (
                    <div
                      key={h.id}
                      className="p-3.5 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={h.symbol} size="md" />
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">{h.symbol}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{h.company} • {h.shares} Shares</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">
                          ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {weightPct}% Weight
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. HISTORY TAB */}
      {activeTab === 'History' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Transaction Ledger ({filteredTransactions.length})
              </h4>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-zinc-700 px-3.5 py-1.5 pl-9 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'Buy', 'Sell', 'Deposit', 'Dividend'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setHistoryFilter(type)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border transition-all ${
                    historyFilter === type
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <th className="py-2 pl-2 font-semibold">Date & Time</th>
                    <th className="py-2 font-semibold">Type</th>
                    <th className="py-2 font-semibold">Description</th>
                    <th className="py-2 font-semibold text-right">Amount</th>
                    <th className="py-2 font-semibold text-right pr-2">Cash Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">
                        No transactions found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const isPositive = t.amount > 0;
                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="py-3 pl-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {t.date}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                              t.type === 'Buy'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : t.type === 'Sell'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-zinc-900 dark:text-white">
                            {t.description}
                          </td>
                          <td className={`py-3 text-right font-mono font-bold ${
                            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                          }`}>
                            {isPositive ? `+$${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-$${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="py-3 text-right pr-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            ${t.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
      )}
    </div>
  );
};

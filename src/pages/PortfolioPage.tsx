import React, { useState } from 'react';
import {
  ChevronRight,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Download,
  CheckCircle2,
  FileSpreadsheet,
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
  const worstPerformer = [...holdings].sort((a, b) => a.pnlPercent - b.pnlPercent)[0];

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
      <div className="border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Summary Stat Cards (Visible on all tabs for quick reference) */}
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

      {/* ======================================================== */}
      {/* 1. OVERVIEW TAB                                          */}
      {/* ======================================================== */}
      {activeTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PortfolioChart />
            </div>
            <div>
              <AllocationDonut />
            </div>
          </div>

          {/* Quick Holdings Preview Table */}
          <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Active Positions ({holdings.length})
              </h4>
              <button
                onClick={() => setActiveTab('Holdings')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Holdings Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
                  {holdings.slice(0, 5).map((h) => {
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
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HOLDINGS TAB                                          */}
      {/* ======================================================== */}
      {activeTab === 'Holdings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Search, Sort & Filters Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Holdings Portfolio ({filteredHoldings.length} Assets)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed cost basis, market valuation, and unrealized profit/loss across all positions
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by ticker or name..."
                    value={holdingSearch}
                    onChange={(e) => setHoldingSearch(e.target.value)}
                    className="bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={holdingSort}
                    onChange={(e) => setHoldingSort(e.target.value as any)}
                    className="bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="value">Highest Total Value</option>
                    <option value="pnl">Highest P&L ($)</option>
                    <option value="shares">Most Shares</option>
                    <option value="symbol">Ticker (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Holdings Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                    <th className="pb-3 pl-2 font-medium">Asset</th>
                    <th className="pb-3 font-medium text-right">Shares</th>
                    <th className="pb-3 font-medium text-right">Avg Cost</th>
                    <th className="pb-3 font-medium text-right">Market Price</th>
                    <th className="pb-3 font-medium text-right">Market Value</th>
                    <th className="pb-3 font-medium text-right">Weight</th>
                    <th className="pb-3 font-medium text-right">Unrealized P&L</th>
                    <th className="pb-3 font-medium text-right">P&L %</th>
                    <th className="pb-3 font-medium text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredHoldings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
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
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <StockLogo symbol={h.symbol} size="sm" />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{h.symbol}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{h.company}</p>
                              </div>
                            </div>
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
                          <td className="py-4 text-right font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {weightPct}%
                          </td>
                          <td className={`py-4 text-right font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? `+$${h.pnl.toFixed(2)}` : `-$${Math.abs(h.pnl).toFixed(2)}`}
                          </td>
                          <td className={`py-4 text-right font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isProfit ? `+${h.pnlPercent.toFixed(2)}%` : `${h.pnlPercent.toFixed(2)}%`}
                          </td>
                          <td className="py-4 text-right pr-2">
                            <button
                              onClick={() => onNavigateToTrade && onNavigateToTrade(h.symbol)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-400 transition-colors"
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

      {/* ======================================================== */}
      {/* 3. PERFORMANCE TAB                                       */}
      {/* ======================================================== */}
      {activeTab === 'Performance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Full-Width Performance Chart */}
          <PortfolioChart />

          {/* Performance Deep-Dive Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Return (ROI)</span>
              <p className={`text-2xl font-black ${totalPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </p>
              <p className="text-[11px] text-slate-400">Net dollar profit: {formatCurrency(totalPnL, true)}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Win Rate (% Profitable Positions)</span>
              <p className="text-2xl font-black text-blue-500">
                {winRate.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-400">{profitableHoldingsCount} of {holdings.length} holdings in green profit</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Estimated Sharpe Ratio</span>
              <p className="text-2xl font-black text-purple-500">
                1.84 <span className="text-xs font-bold text-slate-400">(Strong)</span>
              </p>
              <p className="text-[11px] text-slate-400">Risk-adjusted return vs benchmark risk-free rate</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Max Portfolio Drawdown</span>
              <p className="text-2xl font-black text-emerald-500">
                -3.20% <span className="text-xs font-bold text-slate-400">(Low Risk)</span>
              </p>
              <p className="text-[11px] text-slate-400">Peak-to-trough maximum paper decline</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Top Performing Asset</span>
              <p className="text-2xl font-black text-emerald-500">
                {bestPerformer ? `${bestPerformer.symbol} (+${bestPerformer.pnlPercent.toFixed(2)}%)` : 'N/A'}
              </p>
              <p className="text-[11px] text-slate-400">{bestPerformer ? bestPerformer.company : 'No active holdings'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Alpha vs S&P 500</span>
              <p className="text-2xl font-black text-cyan-500">
                +4.12%
              </p>
              <p className="text-[11px] text-slate-400">Outperforming SPY over current simulation period</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ASSET ALLOCATION TAB                                  */}
      {/* ======================================================== */}
      {activeTab === 'Asset Allocation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Donut Chart */}
            <div className="lg:col-span-1">
              <AllocationDonut />
            </div>

            {/* Right: Allocation Breakdown Ledger */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Portfolio Allocation & Weight Breakdown
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Asset weighting, sector diversification, and concentration risk metrics
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Cash Allocation Entry */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      USD
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Available Virtual Cash</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Liquid Buying Power</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900 dark:text-white">${virtualCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[11px] font-bold text-amber-500">
                      {totalPortfolioValue > 0 ? ((virtualCash / totalPortfolioValue) * 100).toFixed(1) : '100'}% of Portfolio
                    </p>
                  </div>
                </div>

                {/* Holdings Breakdown */}
                {holdings.map((h) => {
                  const weightPct = totalPortfolioValue > 0 ? +((h.totalValue / totalPortfolioValue) * 100).toFixed(1) : 0;
                  const isHighConcentration = weightPct > 30;
                  return (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700/60 flex items-center justify-between hover:border-blue-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={h.symbol} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{h.symbol}</p>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {h.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{h.company} • {h.shares} Shares</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            {weightPct}% Weight
                          </span>
                          {isHighConcentration && (
                            <span className="text-[9px] font-bold px-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              Heavy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. HISTORY TAB                                           */}
      {/* ======================================================== */}
      {activeTab === 'History' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Portfolio Transaction Ledger ({filteredTransactions.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete historical record of all executed buy/sell trades, virtual deposits, and adjustments
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 pl-9 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>

                {/* Export CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Transaction Type Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'Buy', 'Sell', 'Deposit', 'Dividend'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setHistoryFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    historyFilter === type
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 dark:bg-[#111C3A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Transaction History Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                    <th className="pb-3 pl-2 font-medium">Date & Time</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-right">Net Amount</th>
                    <th className="pb-3 font-medium text-right pr-2">Cash Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const isPositive = t.amount > 0;
                      return (
                        <tr
                          key={t.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-4 pl-2 text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {t.date}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              t.type === 'Buy'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : t.type === 'Sell'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : t.type === 'Deposit'
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-slate-900 dark:text-white">
                            {t.description}
                          </td>
                          <td className={`py-4 text-right font-black ${
                            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {isPositive ? `+$${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-$${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="py-4 text-right pr-2 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
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

import React, { useState } from 'react';
import { ChevronRight, Download } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { TransactionType } from '../types/trading';

export const TransactionsPage: React.FC = () => {
  const { transactions } = useTrading();
  const [filter, setFilter] = useState<'All' | 'Deposits' | 'Withdrawals' | 'Trades' | 'Dividends' | 'Adjustments'>('All');

  const filterTabs: Array<'All' | 'Deposits' | 'Withdrawals' | 'Trades' | 'Dividends' | 'Adjustments'> = [
    'All',
    'Deposits',
    'Withdrawals',
    'Trades',
    'Dividends',
    'Adjustments',
  ];

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Deposits') return t.type === 'Deposit';
    if (filter === 'Withdrawals') return t.type === 'Withdrawal';
    if (filter === 'Trades') return t.type === 'Buy' || t.type === 'Sell';
    if (filter === 'Dividends') return t.type === 'Dividend';
    if (filter === 'Adjustments') return t.type === 'Adjust';
    return true;
  });

  const getTypeStyle = (type: TransactionType) => {
    switch (type) {
      case 'Buy':
        return 'text-emerald-600 dark:text-emerald-400 font-bold';
      case 'Sell':
        return 'text-rose-600 dark:text-rose-400 font-bold';
      case 'Deposit':
        return 'text-emerald-600 dark:text-emerald-400 font-bold';
      case 'Withdrawal':
        return 'text-amber-600 dark:text-amber-400 font-bold';
      case 'Dividend':
        return 'text-blue-600 dark:text-blue-400 font-bold';
      case 'Adjust':
        return 'text-purple-600 dark:text-purple-400 font-bold';
      default:
        return 'text-slate-600 dark:text-slate-400 font-bold';
    }
  };

  const exportCSV = () => {
    const headers = ['Date,Type,Description,Amount,Balance\n'];
    const rows = filteredTransactions.map(t => 
      `"${t.date}","${t.type}","${t.description}","${t.amount}","${t.balance}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_transactions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Category Filter Tabs */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-4 shadow-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`py-1.5 px-3 font-semibold text-xs uppercase tracking-wider whitespace-nowrap transition-colors border ${
                  filter === tab
                    ? 'border-blue-600 dark:border-[#3B82F6] bg-blue-50/50 dark:bg-[#3B82F6]/10 text-blue-600 dark:text-[#3B82F6]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Transactions Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 dark:text-zinc-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-3">
                <th className="pb-3 pl-2 font-medium">Date</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-right pr-2">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-zinc-500 text-sm">
                    No transactions found in this category
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors border-b border-slate-100 dark:border-zinc-800/40 last:border-0">
                      <td className="py-3.5 pl-2 text-slate-600 dark:text-zinc-400 text-xs font-mono whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3.5">
                        <span className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 border ${
                          tx.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                          tx.type === 'Sell' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                          tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                          tx.type === 'Withdrawal' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-600 dark:text-[#3B82F6] border-blue-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-900 dark:text-zinc-100 font-medium text-sm">
                        {tx.description}
                      </td>
                      <td className={`py-3.5 text-right font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isPositive ? `+$${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="py-3.5 text-right pr-2 text-slate-900 dark:text-white font-mono font-bold text-sm">
                        ${tx.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => setFilter('All')}
            className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-[#3B82F6] hover:underline flex items-center gap-1 group"
          >
            <span>View All Transactions</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

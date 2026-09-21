import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { useTrading } from '../../context/TradingContext';

interface AllocationData {
  name: string;
  fullName: string;
  value: number;
  color: string;
  percentage: number;
}

export const AllocationDonut: React.FC = () => {
  const { holdings, virtualCash, totalPortfolioValue } = useTrading();

  const PALETTE = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
  ];

  // Calculate actual holding values dynamically
  const holdingItems: AllocationData[] = holdings.map((h, i) => {
    const val = +(h.shares * h.currentPrice).toFixed(2);
    const pct = totalPortfolioValue > 0 ? +((val / totalPortfolioValue) * 100).toFixed(1) : 0;
    return {
      name: h.symbol,
      fullName: h.company,
      value: val,
      percentage: pct,
      color: PALETTE[i % PALETTE.length],
    };
  });

  // Calculate cash slice
  const cashPct = totalPortfolioValue > 0 ? +((virtualCash / totalPortfolioValue) * 100).toFixed(1) : 100;
  const cashItem: AllocationData = {
    name: 'Cash',
    fullName: 'Available Virtual Cash',
    value: +virtualCash.toFixed(2),
    percentage: cashPct,
    color: '#F59E0B', // Amber
  };

  // Combine and sort by value descending
  const data: AllocationData[] = [...holdingItems, cashItem]
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-zinc-800 p-5 shadow-none flex flex-col justify-between font-sans">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Asset Allocation
        </h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Dynamic distribution calculated from your live holdings & cash
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between my-2 gap-4">
        {/* Donut Chart with Center Text */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as AllocationData;
                    return (
                      <div className="bg-[#18181B] text-white text-xs py-1.5 px-2.5 border border-zinc-700">
                        <p className="font-semibold uppercase tracking-wider">{item.fullName || item.name}</p>
                        <p className="text-emerald-400 font-mono font-bold mt-0.5">
                          ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({item.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={data.length > 1 ? 2 : 0}
                dataKey="percentage"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate max-w-[90px]">
              ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[9px] text-slate-500 dark:text-zinc-400 uppercase tracking-widest font-semibold">
              Portfolio
            </span>
          </div>
        </div>

        {/* Legend calculated directly from holdings */}
        <div className="flex flex-col gap-2 w-full sm:w-auto flex-1 pl-2 max-h-48 overflow-y-auto pr-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800/60 last:border-none">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-zinc-300 font-medium">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                  ${item.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
        <span>Active Holdings: {holdings.length} Assets</span>
        <span className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">100% Calculated Live</span>
      </div>
    </div>
  );
};

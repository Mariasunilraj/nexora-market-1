import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { OrderStatus } from '../types/trading';

export const OrdersPage: React.FC = () => {
  const { orders, cancelOrder } = useTrading();
  const [activeTab, setActiveTab] = useState<OrderStatus>('Open');

  const openOrders = orders.filter(o => o.status === 'Open');
  const filledOrders = orders.filter(o => o.status === 'Filled');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Tabs */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-2">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('Open')}
            className={`py-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'Open'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-zinc-800/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            Open Orders ({openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('Filled')}
            className={`py-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'Filled'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-zinc-800/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            Filled Orders ({filledOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('Cancelled')}
            className={`py-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'Cancelled'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-zinc-800/60'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            Cancelled Orders ({cancelledOrders.length})
          </button>
        </div>

        {/* Selected Tab Table */}
        <div className="p-4 overflow-x-auto">
          {activeTab === 'Open' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <th className="py-2 pl-2 font-semibold">Symbol</th>
                  <th className="py-2 font-semibold">Type</th>
                  <th className="py-2 font-semibold text-right">Quantity</th>
                  <th className="py-2 font-semibold text-right">Price</th>
                  <th className="py-2 font-semibold">Order Type</th>
                  <th className="py-2 font-semibold">Time</th>
                  <th className="py-2 font-semibold text-center pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {openOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                      No open pending orders.
                    </td>
                  </tr>
                ) : (
                  openOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{ord.symbol}</span>
                          <span className="text-xs text-zinc-400 font-normal">{ord.company}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          ord.type === 'Buy'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}>
                          {ord.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                        {ord.quantity}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        ${ord.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                        {ord.orderType}
                      </td>
                      <td className="py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                        {ord.createdAt}
                      </td>
                      <td className="py-3.5 text-center pr-2">
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'Filled' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <th className="py-2 pl-2 font-semibold">Symbol</th>
                  <th className="py-2 font-semibold">Type</th>
                  <th className="py-2 font-semibold text-right">Quantity</th>
                  <th className="py-2 font-semibold text-right">Price</th>
                  <th className="py-2 font-semibold">Order Type</th>
                  <th className="py-2 font-semibold">Filled On</th>
                  <th className="py-2 font-semibold text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filledOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3.5 pl-2 font-bold text-zinc-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{ord.symbol}</span>
                        <span className="text-xs text-zinc-400 font-normal">{ord.company}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        ord.type === 'Buy'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}>
                        {ord.type}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                      {ord.quantity}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      ${ord.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                      {ord.orderType}
                    </td>
                    <td className="py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                      {ord.filledAt || ord.createdAt}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                        Filled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Cancelled' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <th className="py-2 pl-2 font-semibold">Symbol</th>
                  <th className="py-2 font-semibold">Type</th>
                  <th className="py-2 font-semibold text-right">Quantity</th>
                  <th className="py-2 font-semibold text-right">Price</th>
                  <th className="py-2 font-semibold">Order Type</th>
                  <th className="py-2 font-semibold">Time</th>
                  <th className="py-2 font-semibold text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {cancelledOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                      No cancelled orders.
                    </td>
                  </tr>
                ) : (
                  cancelledOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-zinc-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{ord.symbol}</span>
                          <span className="text-xs text-zinc-400 font-normal">{ord.company}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                          {ord.type}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                        {ord.quantity}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        ${ord.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-zinc-600 dark:text-zinc-400">
                        {ord.orderType}
                      </td>
                      <td className="py-3.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                        {ord.createdAt}
                      </td>
                      <td className="py-3.5 text-right pr-2 text-rose-500 font-bold text-xs">
                        Cancelled
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

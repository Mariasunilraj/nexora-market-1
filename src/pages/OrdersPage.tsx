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
      {/* Top Tabs matching Mockup 1 */}
      <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 shadow-sm">
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('Open')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'Open'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Open Orders ({openOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('Filled')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'Filled'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Filled Orders ({filledOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('Cancelled')}
            className={`py-3 px-6 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'Cancelled'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Cancelled Orders ({cancelledOrders.length})
          </button>
        </div>

        {/* Selected Tab Table */}
        <div className="p-4 overflow-x-auto">
          {activeTab === 'Open' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <th className="pb-3 pl-2 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium text-right">Quantity</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium">Order Type</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium text-center pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {openOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No open orders at this time
                    </td>
                  </tr>
                ) : (
                  openOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{ord.symbol}</span>
                          <span className="text-xs text-slate-400 font-normal">{ord.company}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          ord.type === 'Buy'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {ord.type}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-900 dark:text-white font-semibold">
                        {ord.quantity}
                      </td>
                      <td className="py-4 text-right text-slate-900 dark:text-white font-bold">
                        ${ord.price.toFixed(2)}
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-300">
                        {ord.orderType}
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {ord.createdAt}
                      </td>
                      <td className="py-4 text-center pr-2">
                        <button
                          onClick={() => cancelOrder(ord.id)}
                          className="px-3.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <th className="pb-3 pl-2 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium text-right">Quantity</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium">Order Type</th>
                  <th className="pb-3 font-medium">Filled On</th>
                  <th className="pb-3 font-medium text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filledOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{ord.symbol}</span>
                        <span className="text-xs text-slate-400 font-normal">{ord.company}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        ord.type === 'Buy'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {ord.type}
                      </span>
                    </td>
                    <td className="py-4 text-right text-slate-900 dark:text-white font-semibold">
                      {ord.quantity}
                    </td>
                    <td className="py-4 text-right text-slate-900 dark:text-white font-bold">
                      ${ord.price.toFixed(2)}
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {ord.orderType}
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {ord.filledAt || ord.createdAt}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        Filled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'Cancelled' && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                  <th className="pb-3 pl-2 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium text-right">Quantity</th>
                  <th className="pb-3 font-medium text-right">Price</th>
                  <th className="pb-3 font-medium">Order Type</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium text-right pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {cancelledOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No cancelled orders
                    </td>
                  </tr>
                ) : (
                  cancelledOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{ord.symbol}</span>
                          <span className="text-xs text-slate-400 font-normal">{ord.company}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {ord.type}
                        </span>
                      </td>
                      <td className="py-4 text-right text-slate-900 dark:text-white font-semibold">
                        {ord.quantity}
                      </td>
                      <td className="py-4 text-right text-slate-900 dark:text-white font-bold">
                        ${ord.price.toFixed(2)}
                      </td>
                      <td className="py-4 text-slate-600 dark:text-slate-300">
                        {ord.orderType}
                      </td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {ord.createdAt}
                      </td>
                      <td className="py-4 text-right pr-2 text-rose-500 font-bold text-xs">
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

      {/* Section 2: Recent Filled Orders Card matching Mockup 1 */}
      <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Recent Filled Orders
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 pl-2 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Quantity</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium">Order Type</th>
                <th className="pb-3 font-medium">Filled On</th>
                <th className="pb-3 font-medium text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filledOrders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span>{ord.symbol}</span>
                      <span className="text-xs text-slate-400 font-normal">{ord.company}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      ord.type === 'Buy'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                      {ord.type}
                    </span>
                  </td>
                  <td className="py-4 text-right text-slate-900 dark:text-white font-semibold">
                    {ord.quantity}
                  </td>
                  <td className="py-4 text-right text-slate-900 dark:text-white font-bold">
                    ${ord.price.toFixed(2)}
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-300">
                    {ord.orderType}
                  </td>
                  <td className="py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {ord.filledAt || ord.createdAt}
                  </td>
                  <td className="py-4 text-right pr-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      Filled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
          <button
            onClick={() => setActiveTab('Filled')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All Orders</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

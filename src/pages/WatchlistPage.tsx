import React, { useState } from 'react';
import { Plus, Search, Star, Zap, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { StockLogo } from '../components/common/StockLogo';
import { Modal } from '../components/common/Modal';
import { StockQuote } from '../types/trading';

interface WatchlistPageProps {
  onTradeClick?: (symbol: string) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({ onTradeClick }) => {
  const { stocks, toggleFavorite, addCustomStock, fetchLiveQuote } = useTrading();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTickerInput, setAddTickerInput] = useState('');
  const [searchingLive, setSearchingLive] = useState(false);
  const [searchedQuote, setSearchedQuote] = useState<StockQuote | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Filter stocks according to query
  const filteredStocks = stocks.filter(
    s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchLiveTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTickerInput.trim()) return;
    setSearchingLive(true);
    setSearchError(null);
    setSearchedQuote(null);

    const quote = await fetchLiveQuote(addTickerInput.trim().toUpperCase());
    setSearchingLive(false);
    if (quote) {
      setSearchedQuote(quote);
    } else {
      setSearchError(`Ticker ${addTickerInput.toUpperCase()} not found or limit reached.`);
    }
  };

  const handleAddStockToWatchlist = () => {
    if (searchedQuote) {
      addCustomStock(searchedQuote);
      setIsAddModalOpen(false);
      setAddTickerInput('');
      setSearchedQuote(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar matching Mockup 5 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Symbol</span>
        </button>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search in watchlist"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0E172E] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Watchlist Table matching Mockup 5 */}
      <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 dark:text-slate-500 font-semibold text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 pl-2 font-medium">Symbol</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">Change</th>
                <th className="pb-3 font-medium text-right">Change %</th>
                <th className="pb-3 font-medium text-right">Market Cap</th>
                <th className="pb-3 font-medium text-center pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredStocks.map((s) => {
                const isUp = s.change >= 0;
                return (
                  <tr
                    key={s.symbol}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <span>{s.symbol}</span>
                    </td>
                    <td className="py-4 text-slate-600 dark:text-slate-300">
                      {s.name}
                    </td>
                    <td className="py-4 text-right text-slate-900 dark:text-white font-bold">
                      ${s.price.toFixed(2)}
                    </td>
                    <td className={`py-4 text-right font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isUp ? `+${s.change.toFixed(2)}` : s.change.toFixed(2)}
                    </td>
                    <td className={`py-4 text-right font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isUp ? `+${s.changePercent.toFixed(2)}%` : `${s.changePercent.toFixed(2)}%`}
                    </td>
                    <td className="py-4 text-right text-slate-600 dark:text-slate-300 font-semibold">
                      {s.marketCap}
                    </td>
                    <td className="py-4 text-center pr-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleFavorite(s.symbol)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.isFavorite
                              ? 'text-amber-400 hover:text-amber-500'
                              : 'text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${s.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => onTradeClick && onTradeClick(s.symbol)}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Real-Time Notice matching Mockup 5 */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Real-time data powered by Finnhub US Market API</span>
        </div>
      </div>

      {/* Add Symbol Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSearchedQuote(null);
          setSearchError(null);
        }}
        title="Add Symbol to Watchlist"
      >
        <div className="space-y-4">
          <form onSubmit={handleSearchLiveTicker} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter ticker (e.g. AMD, PLTR, SPY)"
              value={addTickerInput}
              onChange={(e) => setAddTickerInput(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={searchingLive}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {searchingLive ? 'Searching...' : 'Lookup'}
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-500 font-semibold">{searchError}</p>
          )}

          {searchedQuote && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#111C3A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StockLogo symbol={searchedQuote.symbol} size="md" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{searchedQuote.symbol}</h5>
                    <p className="text-xs text-slate-500">{searchedQuote.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900 dark:text-white">${searchedQuote.price.toFixed(2)}</p>
                  <p className={`text-xs font-semibold ${searchedQuote.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {searchedQuote.change >= 0 ? '+' : ''}{searchedQuote.changePercent}%
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddStockToWatchlist}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                + Add to Watchlist
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

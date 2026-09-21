import React, { useState } from 'react';
import { Plus, Search, Star, Zap } from 'lucide-react';
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Symbol</span>
        </button>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Filter stocks in watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-zinc-700 pl-10 pr-4 py-2 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <th className="py-2 pl-2 font-semibold">Symbol</th>
                <th className="py-2 font-semibold">Company</th>
                <th className="py-2 font-semibold text-right">Price</th>
                <th className="py-2 font-semibold text-right">Change</th>
                <th className="py-2 font-semibold text-right">Change %</th>
                <th className="py-2 font-semibold text-right">Market Cap</th>
                <th className="py-2 font-semibold text-center pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredStocks.map((s) => {
                const isUp = s.change >= 0;
                return (
                  <tr
                    key={s.symbol}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3.5 pl-2 font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <span>{s.symbol}</span>
                    </td>
                    <td className="py-3.5 text-zinc-600 dark:text-zinc-400 text-xs">
                      {s.name}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      ${s.price.toFixed(2)}
                    </td>
                    <td className={`py-3.5 text-right font-mono font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isUp ? `+${s.change.toFixed(2)}` : s.change.toFixed(2)}
                    </td>
                    <td className={`py-3.5 text-right font-mono font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isUp ? `+${s.changePercent.toFixed(2)}%` : `${s.changePercent.toFixed(2)}%`}
                    </td>
                    <td className="py-3.5 text-right font-mono text-zinc-500 dark:text-zinc-400">
                      {s.marketCap}
                    </td>
                    <td className="py-3.5 text-center pr-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleFavorite(s.symbol)}
                          className={`p-1.5 border transition-colors ${
                            s.isFavorite
                              ? 'text-amber-500 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20'
                              : 'text-zinc-400 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${s.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => onTradeClick && onTradeClick(s.symbol)}
                          className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors"
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

        {/* Footer Real-Time Notice */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Real-time US equity prices streamed via Finnhub REST / WS Engine</span>
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
              className="flex-1 bg-white dark:bg-[#27272A] border border-zinc-300 dark:border-zinc-700 px-3.5 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={searchingLive}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {searchingLive ? 'Searching...' : 'Lookup'}
            </button>
          </form>

          {searchError && (
            <p className="text-xs text-rose-600 font-semibold">{searchError}</p>
          )}

          {searchedQuote && (
            <div className="p-4 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-[#121214] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StockLogo symbol={searchedQuote.symbol} size="md" />
                  <div>
                    <h5 className="font-bold text-zinc-900 dark:text-white">{searchedQuote.symbol}</h5>
                    <p className="text-xs text-zinc-500">{searchedQuote.name}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <p className="text-base font-bold text-zinc-900 dark:text-white">${searchedQuote.price.toFixed(2)}</p>
                  <p className={`text-xs font-semibold ${searchedQuote.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {searchedQuote.change >= 0 ? '+' : ''}{searchedQuote.changePercent}%
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddStockToWatchlist}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
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

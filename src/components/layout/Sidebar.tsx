import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  Activity,
  Bookmark,
  FileText,
  Clock,
  User,
  Settings,
  Sparkles,
  LogOut,
  X,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';
import { getMarketStatus } from '../../utils/marketHours';

export type PageId =
  | 'dashboard'
  | 'portfolio'
  | 'paper-trading'
  | 'technical-analysis'
  | 'watchlist'
  | 'orders'
  | 'transactions'
  | 'account'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onLogoutClick?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  onLogoutClick,
  isOpen,
  onClose,
}) => {
  const { buyingPower } = useTrading();
  const [marketStatus, setMarketStatus] = useState(() => getMarketStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketStatus(getMarketStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio' as PageId, label: 'Portfolio', icon: PieChart },
    { id: 'paper-trading' as PageId, label: 'Paper Trading', icon: TrendingUp },
    { id: 'technical-analysis' as PageId, label: 'Technical Analysis', icon: Activity },
    { id: 'watchlist' as PageId, label: 'Watchlist', icon: Bookmark },
    { id: 'orders' as PageId, label: 'Orders', icon: FileText },
    { id: 'transactions' as PageId, label: 'Transactions', icon: Clock },
    { id: 'account' as PageId, label: 'Account', icon: User },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (pageId: PageId) => {
    onSelectPage(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:sticky lg:top-0 w-64 bg-white dark:bg-[#18181B] text-zinc-700 dark:text-zinc-300 flex flex-col flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 select-none h-screen transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-sm">
              <span>N</span>
            </div>
            <div>
              <h1 className="text-base font-black tracking-widest text-zinc-900 dark:text-white uppercase">
                NEXORA
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block -mt-1">
                MARKET PRO
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150 border-l-2 ${
                  isActive
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-white font-bold'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={() => {
              onClose();
              if (onLogoutClick) onLogoutClick();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-l-2 border-transparent transition-all duration-150 mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Bottom Status Cards */}
        <div className="p-3.5 space-y-2.5 bg-zinc-50 dark:bg-[#121214] border-t border-zinc-200 dark:border-zinc-800">
          {/* Buying Power Widget */}
          <div className="bg-white dark:bg-[#18181B] p-3 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Buying Power
            </p>
            <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">
              ${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Account Type Card */}
          <div className="bg-white dark:bg-[#18181B] p-3 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Tier Plan
              </p>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase mt-0.5">
                PAPER TRADING PRO
              </p>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          </div>

          {/* Market Status Card */}
          <div
            title={`US Hours: ${marketStatus.formattedScheduleIST}\nNY Time: ${marketStatus.currentTimeNY}\nIST Time: ${marketStatus.currentTimeIST}`}
            className="bg-white dark:bg-[#18181B] p-2.5 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 ${
                marketStatus.isOpen
                  ? 'bg-emerald-500 animate-pulse'
                  : marketStatus.session === 'Pre-Market' || marketStatus.session === 'After-Hours'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`} />
              <div>
                <p className={`text-[11px] font-bold tracking-tight ${
                  marketStatus.isOpen
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : marketStatus.session === 'Pre-Market' || marketStatus.session === 'After-Hours'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {marketStatus.statusText}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-zinc-400">
              {marketStatus.nextEventText}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

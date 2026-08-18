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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 lg:sticky lg:top-0 w-64 bg-white dark:bg-[#0B132B] text-slate-700 dark:text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-200/80 dark:border-[#152042] select-none h-screen transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-[#0B132B] rounded-[10px] flex items-center justify-center">
                <span className="text-emerald-400 font-extrabold text-lg tracking-tighter">
                  m
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
                NEXORA
              </h1>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
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
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Bottom Status Cards matching mockups */}
        <div className="p-4 space-y-3 bg-slate-50/80 dark:bg-[#070D1F]/60 border-t border-slate-200/80 dark:border-[#152042]">
          {/* Buying Power Widget */}
          <div className="bg-white dark:bg-[#111C3A] rounded-xl p-3.5 border border-slate-200/80 dark:border-[#1C2951] shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Buying Power
            </p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">
              ${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Account Type Card */}
          <div className="bg-white dark:bg-[#111C3A] rounded-xl p-3.5 border border-slate-200/80 dark:border-[#1C2951] flex flex-col justify-center shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Account Type
            </p>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              PAPER TRADING
            </p>
          </div>

          {/* Market Status Card matching real US NYSE/NASDAQ trading hours */}
          <div
            title={`US Hours: ${marketStatus.formattedScheduleIST}\nNY Time: ${marketStatus.currentTimeNY}\nIST Time: ${marketStatus.currentTimeIST}`}
            className="bg-white dark:bg-[#111C3A] rounded-xl p-3 border border-slate-200/80 dark:border-[#1C2951] flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                marketStatus.isOpen
                  ? 'bg-emerald-500 animate-pulse'
                  : marketStatus.session === 'Pre-Market' || marketStatus.session === 'After-Hours'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`} />
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Market Status
                </p>
                <p className={`text-xs font-black ${
                  marketStatus.isOpen
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : marketStatus.session === 'Pre-Market' || marketStatus.session === 'After-Hours'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {marketStatus.statusText}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">• US Market</span>
                </p>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
              {marketStatus.nextEventText}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

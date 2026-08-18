import React, { useState } from 'react';
import { Moon, Sun, Bell, TrendingUp, TrendingDown, Zap, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTrading } from '../../context/TradingContext';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { indices, notifications, markNotificationRead, clearNotifications, userProfile } = useTrading();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-[#0B132B] border-b border-slate-200/80 dark:border-[#152042] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Hamburger Button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
          {title}
        </h2>
      </div>

      {/* Center/Right: Live Indices Ticker Banner */}
      <div className="hidden xl:flex items-center gap-4 text-xs font-semibold">
        {indices.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div key={idx.symbol} className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#111C3A] px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-[#1C2951]">
              <span className="text-slate-500 dark:text-slate-400 font-bold">{idx.symbol}</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">
                {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center font-bold text-[11px] ${
                isUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
              }`}>
                {isUp ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {isUp ? '+' : ''}{idx.changePercent}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Finnhub API Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60" title="Connected to Finnhub Real-Time API (da0l0ghr01qh1noo3kkgda0l0ghr01qh1noo3kl0)">
          <Zap className="w-3 h-3 fill-current animate-pulse" />
          <span>Finnhub Live</span>
        </div>

        {/* Dark/Light Mode Switch */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-600 hover:text-slate-900" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#0E172E] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Notifications ({unreadCount} new)
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 transition-colors ${
                        !notif.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div
          title={userProfile.name}
          className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md ml-1 border border-slate-200 dark:border-slate-700 flex-shrink-0"
        >
          {userProfile.avatarUrl ? (
            <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-full h-full object-cover" />
          ) : (
            <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</span>
          )}
        </div>
      </div>
    </header>
  );
};

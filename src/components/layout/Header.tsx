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
    <header className="h-16 bg-white dark:bg-[#18181B] border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile Menu Hamburger Button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight truncate">
          {title}
        </h2>
      </div>

      {/* Center/Right: Live Indices Ticker Banner */}
      <div className="hidden xl:flex items-center gap-3 text-xs">
        {indices.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="flex items-center gap-2 bg-zinc-50 dark:bg-[#27272A] px-3 py-1.5 border border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-zinc-500 dark:text-zinc-400 font-bold tracking-wider">{idx.symbol}</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center font-mono font-bold text-[11px] ${
                isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
          title="Connected to Finnhub Real-Time API"
        >
          <Zap className="w-3 h-3 fill-current animate-pulse text-emerald-500" />
          <span className="uppercase tracking-wider">Finnhub Live</span>
        </div>

        {/* Dark/Light Mode Switch */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-zinc-700 hover:text-blue-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
                  Notifications ({unreadCount})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400 font-medium">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`py-2.5 px-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${
                        !notif.read ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-blue-600 dark:border-blue-400' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar (Sharp square) */}
        <div
          title={userProfile.name}
          className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold text-xs border border-blue-700 dark:border-blue-500 flex-shrink-0"
        >
          {userProfile.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span>{userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}</span>
          )}
        </div>
      </div>
    </header>
  );
};

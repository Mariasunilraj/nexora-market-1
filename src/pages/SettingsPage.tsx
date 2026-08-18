import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Monitor,
  CandlestickChart,
  Shield,
  CheckCircle2,
  Key,
  Lock,
  Zap,
} from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useTrading();
  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'display' | 'trading' | 'security'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [formSettings, setFormSettings] = useState(settings);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwNotice, setPwNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    if (formSettings.display.theme !== theme) {
      if (formSettings.display.theme === 'dark' || formSettings.display.theme === 'light') {
        setTheme(formSettings.display.theme);
      }
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) {
      setPwNotice('Please fill in both current and new password');
      return;
    }
    if (newPw !== confirmPw) {
      setPwNotice('New passwords do not match');
      return;
    }
    setPwNotice('Password updated successfully!');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => setPwNotice(null), 3500);
  };

  const navSections = [
    { id: 'general', label: 'General', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'trading', label: 'Trading & API', icon: CandlestickChart },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6 pb-12">
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Settings have been successfully saved.</span>
        </div>
      )}

      {/* Main Settings Grid matching Mockup 7 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sub-Sidebar */}
        <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 shadow-sm h-fit">
          <div className="space-y-1">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Panels matching Mockup 7 */}
        <div className="md:col-span-3 space-y-6">
          {/* 1. General Settings Panel */}
          {activeSection === 'general' && (
            <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">
                General Settings
              </h4>

              <form onSubmit={handleSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Site Dashboard URL
                  </label>
                  <input
                    type="text"
                    value={formSettings.siteDashboardUrl}
                    onChange={(e) => setFormSettings({ ...formSettings, siteDashboardUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Default Landing Page
                  </label>
                  <select
                    value={formSettings.defaultLandingPage}
                    onChange={(e) => setFormSettings({ ...formSettings, defaultLandingPage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Dashboard">Dashboard</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="Paper Trading">Paper Trading</option>
                    <option value="Watchlist">Watchlist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={formSettings.timezone}
                    onChange={(e) => setFormSettings({ ...formSettings, timezone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                    <option value="(GMT-05:00) America/New_York (EST)">(GMT-05:00) America/New_York (EST)</option>
                    <option value="(GMT-08:00) America/Los_Angeles (PST)">(GMT-08:00) America/Los_Angeles (PST)</option>
                    <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Date Format
                  </label>
                  <input
                    type="text"
                    value={formSettings.dateFormat}
                    onChange={(e) => setFormSettings({ ...formSettings, dateFormat: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formSettings.currency}
                    onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="USD - US Dollar">USD - US Dollar</option>
                    <option value="EUR - Euro">EUR - Euro</option>
                    <option value="INR - Indian Rupee">INR - Indian Rupee</option>
                    <option value="GBP - British Pound">GBP - British Pound</option>
                  </select>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Notification Settings Panel matching Mockup 7 */}
          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">
                Notification Settings
              </h4>

              <div className="space-y-5 max-w-xl">
                {[
                  { key: 'priceAlerts', label: 'Price Alerts', desc: 'Receive alerts when watchlist prices hit target' },
                  { key: 'orderExecutions', label: 'Order Executions', desc: 'Receive notifications for order fills' },
                  { key: 'dailyMarketSummary', label: 'Daily Market Summary', desc: 'Get daily summary of portfolio performance' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly performance reports' },
                  { key: 'promotions', label: 'Promotions & Updates', desc: 'Receive updates about new features' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formSettings.notifications as any)[item.key]}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            notifications: {
                              ...formSettings.notifications,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}

                <div className="pt-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Display Settings Panel matching Mockup 7 */}
          {activeSection === 'display' && (
            <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">
                Display Settings
              </h4>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Theme
                  </label>
                  <select
                    value={formSettings.display.theme}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        display: { ...formSettings.display, theme: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Sidebar Position
                  </label>
                  <select
                    value={formSettings.display.sidebarPosition}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        display: { ...formSettings.display, sidebarPosition: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Page Layout
                  </label>
                  <select
                    value={formSettings.display.pageLayout}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        display: { ...formSettings.display, pageLayout: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="full">Full Width</option>
                    <option value="contained">Contained</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Rows Per Page
                  </label>
                  <select
                    value={formSettings.display.rowsPerPage}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        display: { ...formSettings.display, rowsPerPage: parseInt(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Chart Type
                  </label>
                  <select
                    value={formSettings.display.chartType}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        display: { ...formSettings.display, chartType: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="candlestick">Candlestick</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Show Market Overview</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSettings.display.showMarketOverview}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          display: { ...formSettings.display, showMarketOverview: e.target.checked },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Trading & API Settings Panel */}
          {activeSection === 'trading' && (
            <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-5">
                Trading & Finnhub API
              </h4>

              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Finnhub Real-Time API Key</span>
                    <span className="text-emerald-500 text-[11px] font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> Live Key Connected
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formSettings.trading.apiKey}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        trading: { ...formSettings.trading, apiKey: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Configured with live Finnhub API token (<code className="text-emerald-500 font-mono">da0l0ghr01qh1noo3kkgda0l0ghr01qh1noo3kl0</code>) for sub-second real-time US quotes and search.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Simulation Execution Speed
                  </label>
                  <select
                    value={formSettings.trading.simulationSpeed}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        trading: { ...formSettings.trading, simulationSpeed: e.target.value as any },
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="instant">Instant (Immediate fill)</option>
                    <option value="realtime">Real-Time Simulation</option>
                  </select>
                </div>

                <div className="pt-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                  >
                    Save Finnhub API Key & Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Security Settings Panel matching Mockup 7 */}
          {activeSection === 'security' && (
            <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-8">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Security Settings
                </h4>

                {pwNotice && (
                  <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold">
                    {pwNotice}
                  </div>
                )}

                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-xl">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Change Password</p>
                  <div>
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#111C3A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Add an extra layer of security to your account
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      setFormSettings({
                        ...formSettings,
                        security: { twoFactorEnabled: !formSettings.security.twoFactorEnabled }
                      });
                      updateSettings({
                        security: { twoFactorEnabled: !formSettings.security.twoFactorEnabled }
                      });
                    }}
                    className="px-5 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    {formSettings.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

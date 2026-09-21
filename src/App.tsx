import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TradingProvider, useTrading } from './context/TradingContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { PageId } from './components/layout/Sidebar';
import { PortfolioPage } from './pages/PortfolioPage';
import { PaperTradingPage } from './pages/PaperTradingPage';
import { TechnicalAnalysisPage } from './pages/TechnicalAnalysisPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { OrdersPage } from './pages/OrdersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AccountPage } from './pages/AccountPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { userDB, UserAccount } from './services/userService';
import { supabase } from './services/supabaseClient';
import { cloudTradingService } from './services/cloudTradingService';

const resolveLandingPage = (landingName?: string): PageId => {
  const clean = (landingName || '').toLowerCase().trim();
  if (clean === 'dashboard') return 'dashboard';
  if (clean === 'paper trading' || clean === 'paper-trading' || clean === 'trade') return 'paper-trading';
  if (clean === 'watchlist') return 'watchlist';
  if (clean === 'orders') return 'orders';
  if (clean === 'transactions' || clean === 'history') return 'transactions';
  if (clean === 'account' || clean === 'profile') return 'account';
  if (clean === 'settings') return 'settings';
  if (clean === 'technical analysis' || clean === 'technical-analysis') return 'technical-analysis';
  return 'portfolio'; // Default landing page is Portfolio
};

export function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return userDB.getActiveUserId() !== null;
  });

  const [authView, setAuthView] = useState<'login' | 'register' | 'signed-out'>('login');
  const [activePage, setActivePage] = useState<PageId>(() => {
    const activeUser = userDB.getActiveUser();
    return resolveLandingPage(activeUser?.data?.settings?.defaultLandingPage);
  });
  const [selectedTradeSymbol, setSelectedTradeSymbol] = useState<string | undefined>('AAPL');
  const { loadUserSession, refreshCloudData } = useTrading();

  // Multi-device Cloud Session Listener: Auto-syncs when logging in on Phone or Laptop
  useEffect(() => {
    if (!supabase) return;

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const activeLocal = userDB.getActiveUser();

      if (session?.user) {
        const cloudData = await cloudTradingService.fetchCloudUserData(session.user.id);
        const userAccount: UserAccount = {
          id: session.user.id,
          username: session.user.user_metadata?.username || (activeLocal?.id === session.user.id ? activeLocal.username : null) || session.user.email?.split('@')[0] || 'Trader',
          email: session.user.email || activeLocal?.email || '',
          createdAt: new Date(session.user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          profile: cloudData?.profile || (activeLocal?.id === session.user.id ? activeLocal.profile : null) || {
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Trader',
            email: session.user.email || '',
            memberSince: '2025',
            plan: 'Paper Trading Pro',
          },
          data: {
            cash: cloudData?.cash ?? (activeLocal?.id === session.user.id ? activeLocal.data.cash : 10000),
            buyingPower: cloudData?.buyingPower ?? (activeLocal?.id === session.user.id ? activeLocal.data.buyingPower : 10000),
            holdings: (cloudData?.holdings && cloudData.holdings.length > 0) ? cloudData.holdings : (activeLocal?.id === session.user.id ? activeLocal.data.holdings : []),
            orders: (cloudData?.orders && cloudData.orders.length > 0) ? cloudData.orders : (activeLocal?.id === session.user.id ? activeLocal.data.orders : []),
            transactions: (cloudData?.transactions && cloudData.transactions.length > 0) ? cloudData.transactions : (activeLocal?.id === session.user.id ? activeLocal.data.transactions : []),
            settings: activeLocal?.data.settings || {
              siteDashboardUrl: 'https://nexora.com/dashboard',
              defaultLandingPage: 'Portfolio',
              timezone: '(GMT+05:30) Asia/Kolkata',
              dateFormat: 'Jul 20, 2025',
              currency: 'USD - US Dollar',
              notifications: {
                priceAlerts: true,
                orderExecutions: true,
                dailyMarketSummary: true,
                weeklyReports: true,
                promotions: true,
              },
              display: {
                theme: 'dark',
                sidebarPosition: 'left',
                pageLayout: 'full',
                rowsPerPage: 10,
                chartType: 'line',
                showMarketOverview: true,
              },
              trading: {
                apiKey: 'da0l0ghr01qh1noo3kkgda0l0ghr01qh1noo3kl0',
                simulationSpeed: 'realtime',
                commission: 0,
              },
              security: {
                twoFactorEnabled: false,
              }
            },
            notifications: activeLocal?.data.notifications || [],
          }
        };

        userDB.setActiveUser(userAccount);
        loadUserSession(userAccount);
        setIsAuthenticated(true);
      } else if (activeLocal) {
        loadUserSession(activeLocal);
        setIsAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const activeLocal = userDB.getActiveUser();

      if (event === 'SIGNED_IN' && session?.user) {
        const cloudData = await cloudTradingService.fetchCloudUserData(session.user.id);
        const userAccount: UserAccount = {
          id: session.user.id,
          username: session.user.user_metadata?.username || (activeLocal?.id === session.user.id ? activeLocal.username : null) || session.user.email?.split('@')[0] || 'Trader',
          email: session.user.email || activeLocal?.email || '',
          createdAt: new Date().toLocaleDateString('en-US'),
          profile: cloudData?.profile || (activeLocal?.id === session.user.id ? activeLocal.profile : null) || {
            name: session.user.user_metadata?.full_name || 'Trader',
            email: session.user.email || '',
            memberSince: '2025',
            plan: 'Paper Trading Pro',
          },
          data: {
            cash: cloudData?.cash ?? (activeLocal?.id === session.user.id ? activeLocal.data.cash : 10000),
            buyingPower: cloudData?.buyingPower ?? (activeLocal?.id === session.user.id ? activeLocal.data.buyingPower : 10000),
            holdings: (cloudData?.holdings && cloudData.holdings.length > 0) ? cloudData.holdings : (activeLocal?.id === session.user.id ? activeLocal.data.holdings : []),
            orders: (cloudData?.orders && cloudData.orders.length > 0) ? cloudData.orders : (activeLocal?.id === session.user.id ? activeLocal.data.orders : []),
            transactions: (cloudData?.transactions && cloudData.transactions.length > 0) ? cloudData.transactions : (activeLocal?.id === session.user.id ? activeLocal.data.transactions : []),
            settings: activeLocal?.data.settings || {
              siteDashboardUrl: 'https://nexora.com/dashboard',
              defaultLandingPage: 'Portfolio',
              timezone: '(GMT+05:30) Asia/Kolkata',
              dateFormat: 'Jul 20, 2025',
              currency: 'USD - US Dollar',
              notifications: {
                priceAlerts: true,
                orderExecutions: true,
                dailyMarketSummary: true,
                weeklyReports: true,
                promotions: true,
              },
              display: {
                theme: 'dark',
                sidebarPosition: 'left',
                pageLayout: 'full',
                rowsPerPage: 10,
                chartType: 'line',
                showMarketOverview: true,
              },
              trading: {
                apiKey: 'da0l0ghr01qh1noo3kkgda0l0ghr01qh1noo3kl0',
                simulationSpeed: 'realtime',
                commission: 0,
              },
              security: {
                twoFactorEnabled: false,
              }
            },
            notifications: [],
          }
        };

        userDB.setActiveUser(userAccount);
        loadUserSession(userAccount);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        userDB.setActiveUser(null);
        setIsAuthenticated(false);
        setAuthView('signed-out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserSession]);

  const handleNavigate = (page: PageId, symbol?: string) => {
    if (symbol) {
      setSelectedTradeSymbol(symbol);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await userDB.logout();
    setIsAuthenticated(false);
    setAuthView('signed-out');
  };

  const handleAuthSuccess = (user: UserAccount) => {
    loadUserSession(user);
    setIsAuthenticated(true);
    const targetPage = resolveLandingPage(user.data?.settings?.defaultLandingPage);
    setActivePage(targetPage);
    refreshCloudData();
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        initialView={authView}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  return (
    <Layout
      activePage={activePage}
      onSelectPage={(page) => handleNavigate(page)}
      onLogout={handleLogout}
    >
      {activePage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {activePage === 'portfolio' && (
        <PortfolioPage onNavigateToTrade={(sym) => handleNavigate('paper-trading', sym)} />
      )}
      {activePage === 'paper-trading' && (
        <PaperTradingPage initialSymbol={selectedTradeSymbol} />
      )}
      {activePage === 'technical-analysis' && (
        <TechnicalAnalysisPage
          defaultSymbol={selectedTradeSymbol || 'AAPL'}
          onNavigateToTrade={(sym) => handleNavigate('paper-trading', sym)}
        />
      )}
      {activePage === 'watchlist' && (
        <WatchlistPage onTradeClick={(sym) => handleNavigate('paper-trading', sym)} />
      )}
      {activePage === 'orders' && <OrdersPage />}
      {activePage === 'transactions' && <TransactionsPage />}
      {activePage === 'account' && (
        <AccountPage
          onNavigateToSettings={() => handleNavigate('settings')}
          onLogout={handleLogout}
        />
      )}
      {activePage === 'settings' && <SettingsPage />}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TradingProvider>
          <AppContent />
        </TradingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

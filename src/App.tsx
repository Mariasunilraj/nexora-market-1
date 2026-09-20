import React, { useState } from 'react';
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
  const { loadUserSession } = useTrading();

  const handleNavigate = (page: PageId, symbol?: string) => {
    if (symbol) {
      setSelectedTradeSymbol(symbol);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    userDB.logout();
    setIsAuthenticated(false);
    setAuthView('signed-out');
  };

  const handleAuthSuccess = (user: UserAccount) => {
    loadUserSession(user);
    setIsAuthenticated(true);
    const targetPage = resolveLandingPage(user.data?.settings?.defaultLandingPage);
    setActivePage(targetPage);
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

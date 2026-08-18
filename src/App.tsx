import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TradingProvider, useTrading } from './context/TradingContext';
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

export function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return userDB.getActiveUserId() !== null;
  });

  const [authView, setAuthView] = useState<'login' | 'register' | 'signed-out'>('login');
  const [activePage, setActivePage] = useState<PageId>('portfolio');
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
    setActivePage('dashboard');
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
    <ThemeProvider>
      <TradingProvider>
        <AppContent />
      </TradingProvider>
    </ThemeProvider>
  );
}

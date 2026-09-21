import React, { useState } from 'react';
import { Sidebar, PageId } from './Sidebar';
import { Header } from './Header';
import { Modal } from '../common/Modal';

interface LayoutProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activePage,
  onSelectPage,
  onLogout,
  children,
}) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getPageTitle = (page: PageId): string => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'portfolio':
        return 'Portfolio';
      case 'paper-trading':
        return 'Paper Trading';
      case 'technical-analysis':
        return 'Technical Analysis';
      case 'watchlist':
        return 'Watchlist';
      case 'orders':
        return 'Orders';
      case 'transactions':
        return 'Transactions';
      case 'account':
        return 'Account';
      case 'settings':
        return 'Settings';
      default:
        return 'Nexora';
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 transition-colors duration-150 relative">
      {/* Mobile Drawer & Desktop Sidebar */}
      <Sidebar
        activePage={activePage}
        onSelectPage={onSelectPage}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden w-full">
        <Header
          title={getPageTitle(activePage)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Are you sure you want to sign out? Your simulated trading portfolio and positions are safely saved in the database.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

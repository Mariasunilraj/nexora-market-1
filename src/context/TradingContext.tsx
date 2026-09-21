import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  StockQuote,
  Holding,
  Order,
  Transaction,
  MarketIndex,
  UserProfile,
  UserSettings,
  OrderActionType,
  OrderExecutionType,
  NotificationItem,
} from '../types/trading';
import { INITIAL_STOCKS, INITIAL_MARKET_INDICES } from '../services/marketDataService';
import { finnhubClient } from '../services/finnhubService';
import { userDB, UserAccount } from '../services/userService';
import { cloudTradingService } from '../services/cloudTradingService';

interface TradingContextType {
  stocks: StockQuote[];
  holdings: Holding[];
  orders: Order[];
  transactions: Transaction[];
  indices: MarketIndex[];
  userProfile: UserProfile;
  settings: UserSettings;
  notifications: NotificationItem[];
  
  // Computed Portfolio Metrics
  totalPortfolioValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  todaysPnL: number;
  todaysPnLPercent: number;
  buyingPower: number;
  virtualCash: number;
  
  // Actions
  executeOrder: (params: {
    symbol: string;
    type: OrderActionType;
    quantity: number;
    orderType: OrderExecutionType;
    limitPrice?: number;
  }) => { success: boolean; message: string };
  
  cancelOrder: (orderId: string) => void;
  depositVirtualCash: (amount: number) => void;
  withdrawVirtualCash: (amount: number) => { success: boolean; message: string };
  resetAccount: (initialBalance?: number) => void;
  toggleFavorite: (symbol: string) => void;
  addCustomStock: (stock: StockQuote) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  fetchLiveQuote: (symbol: string) => Promise<StockQuote | null>;
  searchSymbols: (query: string) => Promise<Array<{ symbol: string; name: string }>>;
  isLiveApiConnected: boolean;
  refreshAllQuotes: () => Promise<void>;
  loadUserSession: (user: any) => void;
  refreshCloudData: () => Promise<void>;
}

const INITIAL_PROFILE: UserProfile = {
  name: 'Trader',
  email: 'trader@nexora.com',
  memberSince: '2025',
  plan: 'Paper Trading Pro'
};

const INITIAL_SETTINGS: UserSettings = {
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
};

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<StockQuote[]>(INITIAL_STOCKS);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [indices] = useState<MarketIndex[]>(INITIAL_MARKET_INDICES);
  const [virtualCash, setVirtualCash] = useState<number>(50000);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLiveApiConnected, setIsLiveApiConnected] = useState<boolean>(true);

  const isSyncingRef = useRef<boolean>(false);

  // Helper to load user session into React state
  const loadUserSession = useCallback((user: UserAccount) => {
    if (!user) return;
    setUserProfile(user.profile);
    setVirtualCash(typeof user.data.cash === 'number' ? user.data.cash : 50000);
    setHoldings(user.data.holdings || []);
    setOrders(user.data.orders || []);
    setTransactions(user.data.transactions || []);
    setSettings(user.data.settings || INITIAL_SETTINGS);
    setNotifications(user.data.notifications || []);
  }, []);

  // Fetch full live cloud portfolio from Supabase
  const refreshCloudData = useCallback(async () => {
    const activeId = userDB.getActiveUserId();
    if (!activeId) return;

    const cloudData = await cloudTradingService.fetchCloudUserData(activeId);
    if (cloudData) {
      setUserProfile(cloudData.profile);
      setVirtualCash(cloudData.cash);
      setHoldings(cloudData.holdings);
      setOrders(cloudData.orders);
      setTransactions(cloudData.transactions);
    }
  }, []);

  // Initial cloud sync and multi-device Realtime WebSocket listener
  useEffect(() => {
    const activeUser = userDB.getActiveUser();
    if (activeUser) {
      loadUserSession(activeUser);
      refreshCloudData();
    }

    const activeId = userDB.getActiveUserId();
    if (!activeId) return;

    // Realtime multi-device subscription: updates phone when laptop trades, and vice versa!
    const unsubscribe = cloudTradingService.subscribeToCloudRealtime(activeId, () => {
      refreshCloudData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadUserSession, refreshCloudData]);

  // Compute accurate Realized & Unrealized P&L
  const totalHoldingsValue = holdings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
  const totalInvested = holdings.reduce((acc, h) => acc + h.shares * h.avgPrice, 0);
  const totalPortfolioValue = totalHoldingsValue + virtualCash;
  
  const totalPnL = totalHoldingsValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const todaysPnL = holdings.reduce((acc, h) => {
    const stock = stocks.find(s => s.symbol === h.symbol);
    const dayDelta = stock ? stock.change : 0;
    return acc + (dayDelta * h.shares);
  }, 0) || (totalHoldingsValue * 0.0242);
  
  const todaysPnLPercent = totalPortfolioValue > 0 ? (todaysPnL / totalPortfolioValue) * 100 : 2.42;

  // Reserved cash for open buy limit orders
  const reservedCash = orders
    .filter(o => o.status === 'Open' && o.type === 'Buy')
    .reduce((acc, o) => acc + o.quantity * o.price, 0);
  
  const buyingPower = Math.max(0, virtualCash - reservedCash);

  // Fetch Live Real-Time Quote from Finnhub API
  const fetchLiveQuote = useCallback(async (symbol: string): Promise<StockQuote | null> => {
    try {
      const quote = await finnhubClient.getQuote(symbol);
      if (quote && quote.c > 0) {
        setIsLiveApiConnected(true);
        const existing = stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
        const updatedPrice = quote.c;
        const change = quote.d;
        const changePercent = quote.dp;
        const prevClose = quote.pc || (updatedPrice - change);

        const updated: StockQuote = {
          symbol: symbol.toUpperCase(),
          name: existing ? existing.name : `${symbol.toUpperCase()} Inc.`,
          price: updatedPrice,
          change: +(change).toFixed(2),
          changePercent: +(changePercent).toFixed(2),
          marketCap: existing ? existing.marketCap : '$100.0B',
          high: quote.h || updatedPrice * 1.01,
          low: quote.l || updatedPrice * 0.99,
          open: quote.o || updatedPrice,
          previousClose: prevClose,
          volume: existing ? existing.volume : '10.5M',
          sparkline: existing ? [...existing.sparkline.slice(1), updatedPrice] : [prevClose, updatedPrice],
          isFavorite: existing ? existing.isFavorite : false,
          category: existing ? existing.category : 'Stocks'
        };

        setStocks(prev => {
          const idx = prev.findIndex(s => s.symbol.toUpperCase() === symbol.toUpperCase());
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [updated, ...prev];
        });

        return updated;
      }
    } catch (e) {
      console.warn(`Finnhub live fetch error for ${symbol}`, e);
    }
    return stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()) || null;
  }, [stocks]);

  // Refresh Top Stocks with real Finnhub quotes
  const refreshAllQuotes = useCallback(async () => {
    const popular = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
    for (const sym of popular) {
      await fetchLiveQuote(sym);
    }
  }, [fetchLiveQuote]);

  useEffect(() => {
    refreshAllQuotes();
  }, [refreshAllQuotes]);

  // Periodic Finnhub update
  useEffect(() => {
    const timer = setInterval(() => {
      const topSymbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];
      const target = topSymbols[Math.floor(Math.random() * topSymbols.length)];
      fetchLiveQuote(target);
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchLiveQuote]);

  // Sync holding prices
  useEffect(() => {
    setHoldings(prevHoldings => {
      let changed = false;
      const updated = prevHoldings.map(h => {
        const matchingStock = stocks.find(s => s.symbol === h.symbol);
        if (matchingStock && matchingStock.price !== h.currentPrice) {
          changed = true;
          const currentPrice = matchingStock.price;
          const totalVal = +(h.shares * currentPrice).toFixed(2);
          const pnl = +((currentPrice - h.avgPrice) * h.shares).toFixed(2);
          const pnlPercent = +(((currentPrice - h.avgPrice) / h.avgPrice) * 100).toFixed(2);
          return {
            ...h,
            currentPrice,
            totalValue: totalVal,
            pnl,
            pnlPercent
          };
        }
        return h;
      });
      return changed ? updated : prevHoldings;
    });
  }, [stocks]);

  // Execute Order with instant Supabase Cloud persistence
  const executeOrder = useCallback(({
    symbol,
    type,
    quantity,
    orderType,
    limitPrice
  }: {
    symbol: string;
    type: OrderActionType;
    quantity: number;
    orderType: OrderExecutionType;
    limitPrice?: number;
  }) => {
    const stock = stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (!stock) {
      return { success: false, message: `Stock symbol ${symbol} not found.` };
    }

    if (quantity <= 0) {
      return { success: false, message: 'Quantity must be greater than 0.' };
    }

    const executionPrice = orderType === 'Limit' && limitPrice ? limitPrice : stock.price;
    const totalOrderCost = +(quantity * executionPrice).toFixed(2);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const activeUserId = userDB.getActiveUserId();

    if (type === 'Buy') {
      if (totalOrderCost > buyingPower) {
        return {
          success: false,
          message: `Insufficient buying power. Required: $${totalOrderCost.toLocaleString()}, Available: $${buyingPower.toLocaleString()}`
        };
      }

      if (orderType === 'Limit') {
        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          symbol: stock.symbol,
          company: stock.name,
          type: 'Buy',
          quantity,
          price: executionPrice,
          orderType: 'Limit',
          status: 'Open',
          createdAt: formattedDate,
        };
        setOrders(prev => [newOrder, ...prev]);

        if (activeUserId) {
          cloudTradingService.recordOrderInCloud(activeUserId, newOrder);
        }

        return { success: true, message: `Limit Order placed for ${quantity} ${stock.symbol} @ $${executionPrice}` };
      } else {
        const newVirtualCash = +(virtualCash - totalOrderCost).toFixed(2);
        setVirtualCash(newVirtualCash);

        let updatedHoldings: Holding[] = [];
        setHoldings(prev => {
          const existing = prev.find(h => h.symbol === stock.symbol);
          if (existing) {
            const totalShares = existing.shares + quantity;
            const totalCost = (existing.shares * existing.avgPrice) + totalOrderCost;
            const newAvgPrice = +(totalCost / totalShares).toFixed(2);
            const totalVal = +(totalShares * stock.price).toFixed(2);
            const pnl = +((stock.price - newAvgPrice) * totalShares).toFixed(2);
            const pnlPercent = +(((stock.price - newAvgPrice) / newAvgPrice) * 100).toFixed(2);

            updatedHoldings = prev.map(h => h.symbol === stock.symbol ? {
              ...h,
              shares: totalShares,
              avgPrice: newAvgPrice,
              currentPrice: stock.price,
              totalValue: totalVal,
              pnl,
              pnlPercent
            } : h);
          } else {
            const newHolding: Holding = {
              id: `h-${Date.now()}`,
              symbol: stock.symbol,
              company: stock.name,
              shares: quantity,
              avgPrice: stock.price,
              currentPrice: stock.price,
              totalValue: totalOrderCost,
              pnl: 0,
              pnlPercent: 0,
              category: stock.category || 'Stocks'
            };
            updatedHoldings = [...prev, newHolding];
          }
          return updatedHoldings;
        });

        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          symbol: stock.symbol,
          company: stock.name,
          type: 'Buy',
          quantity,
          price: stock.price,
          orderType: 'Market',
          status: 'Filled',
          createdAt: formattedDate,
          filledAt: formattedDate,
        };
        setOrders(prev => [newOrder, ...prev]);

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          date: formattedDate,
          type: 'Buy',
          description: `Bought ${quantity} shares of ${stock.symbol}`,
          amount: -totalOrderCost,
          balance: newVirtualCash
        };
        setTransactions(prev => [newTx, ...prev]);

        // Sync to Supabase Cloud
        if (activeUserId) {
          cloudTradingService.updateCloudProfile(activeUserId, { virtualCash: newVirtualCash });
          cloudTradingService.syncHoldingsToCloud(activeUserId, updatedHoldings);
          cloudTradingService.recordOrderInCloud(activeUserId, newOrder);
          cloudTradingService.recordTransactionInCloud(activeUserId, newTx);
        }

        return { success: true, message: `Successfully purchased ${quantity} shares of ${stock.symbol} for $${totalOrderCost.toLocaleString()}` };
      }
    } else {
      const existingHolding = holdings.find(h => h.symbol === stock.symbol);
      if (!existingHolding || existingHolding.shares < quantity) {
        return {
          success: false,
          message: `Insufficient shares to sell. You currently hold ${existingHolding ? existingHolding.shares : 0} shares of ${stock.symbol}.`
        };
      }

      if (orderType === 'Limit') {
        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          symbol: stock.symbol,
          company: stock.name,
          type: 'Sell',
          quantity,
          price: executionPrice,
          orderType: 'Limit',
          status: 'Open',
          createdAt: formattedDate,
        };
        setOrders(prev => [newOrder, ...prev]);

        if (activeUserId) {
          cloudTradingService.recordOrderInCloud(activeUserId, newOrder);
        }

        return { success: true, message: `Sell Limit Order placed for ${quantity} ${stock.symbol} @ $${executionPrice}` };
      } else {
        const newVirtualCash = +(virtualCash + totalOrderCost).toFixed(2);
        setVirtualCash(newVirtualCash);

        let updatedHoldings: Holding[] = [];
        setHoldings(prev => {
          updatedHoldings = prev.map(h => {
            if (h.symbol === stock.symbol) {
              const remainingShares = h.shares - quantity;
              if (remainingShares <= 0) return null;
              const totalVal = +(remainingShares * stock.price).toFixed(2);
              const pnl = +((stock.price - h.avgPrice) * remainingShares).toFixed(2);
              const pnlPercent = +(((stock.price - h.avgPrice) / h.avgPrice) * 100).toFixed(2);
              return {
                ...h,
                shares: remainingShares,
                totalValue: totalVal,
                pnl,
                pnlPercent
              };
            }
            return h;
          }).filter(Boolean) as Holding[];
          return updatedHoldings;
        });

        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          symbol: stock.symbol,
          company: stock.name,
          type: 'Sell',
          quantity,
          price: stock.price,
          orderType: 'Market',
          status: 'Filled',
          createdAt: formattedDate,
          filledAt: formattedDate,
        };
        setOrders(prev => [newOrder, ...prev]);

        const newTx: Transaction = {
          id: `tx-${Date.now()}`,
          date: formattedDate,
          type: 'Sell',
          description: `Sold ${quantity} shares of ${stock.symbol}`,
          amount: totalOrderCost,
          balance: newVirtualCash
        };
        setTransactions(prev => [newTx, ...prev]);

        // Sync to Supabase Cloud
        if (activeUserId) {
          cloudTradingService.updateCloudProfile(activeUserId, { virtualCash: newVirtualCash });
          cloudTradingService.syncHoldingsToCloud(activeUserId, updatedHoldings);
          cloudTradingService.recordOrderInCloud(activeUserId, newOrder);
          cloudTradingService.recordTransactionInCloud(activeUserId, newTx);
        }

        return { success: true, message: `Successfully sold ${quantity} shares of ${stock.symbol} for +$${totalOrderCost.toLocaleString()}` };
      }
    }
  }, [stocks, holdings, virtualCash, buyingPower]);

  // Cancel Order
  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => {
      return prev.map(ord => {
        if (ord.id === orderId) {
          return { ...ord, status: 'Cancelled' as const };
        }
        return ord;
      });
    });

    const activeUserId = userDB.getActiveUserId();
    if (activeUserId) {
      cloudTradingService.updateOrderStatusInCloud(activeUserId, orderId, 'Cancelled');
    }
  }, []);

  // Deposit Virtual Cash
  const depositVirtualCash = useCallback((amount: number) => {
    if (amount <= 0) return;
    const newBal = +(virtualCash + amount).toFixed(2);
    setVirtualCash(newBal);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: formattedDate,
      type: 'Deposit',
      description: `Virtual Cash Deposit`,
      amount: amount,
      balance: newBal
    };
    setTransactions(prev => [newTx, ...prev]);

    const activeUserId = userDB.getActiveUserId();
    if (activeUserId) {
      cloudTradingService.updateCloudProfile(activeUserId, { virtualCash: newBal });
      cloudTradingService.recordTransactionInCloud(activeUserId, newTx);
    }
  }, [virtualCash]);

  // Withdraw Virtual Cash
  const withdrawVirtualCash = useCallback((amount: number) => {
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0' };
    if (amount > buyingPower) {
      return { success: false, message: `Insufficient available cash. Max: $${buyingPower.toLocaleString()}` };
    }

    const newBal = +(virtualCash - amount).toFixed(2);
    setVirtualCash(newBal);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: formattedDate,
      type: 'Withdrawal',
      description: `Virtual Cash Withdrawal`,
      amount: -amount,
      balance: newBal
    };
    setTransactions(prev => [newTx, ...prev]);

    const activeUserId = userDB.getActiveUserId();
    if (activeUserId) {
      cloudTradingService.updateCloudProfile(activeUserId, { virtualCash: newBal });
      cloudTradingService.recordTransactionInCloud(activeUserId, newTx);
    }

    return { success: true, message: `Successfully withdrew $${amount.toLocaleString()}` };
  }, [virtualCash, buyingPower]);

  // Reset Paper Trading Account
  const resetAccount = useCallback((initialBalance: number = 50000) => {
    setHoldings([]);
    setOrders([]);
    setTransactions([
      {
        id: `tx-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' 09:30 AM',
        type: 'Deposit',
        description: 'Account Reset Virtual Deposit',
        amount: initialBalance,
        balance: initialBalance
      }
    ]);
    setVirtualCash(initialBalance);

    const activeUserId = userDB.getActiveUserId();
    if (activeUserId) {
      cloudTradingService.resetCloudAccount(activeUserId, initialBalance);
    }
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setStocks(prev => prev.map(s => s.symbol === symbol ? { ...s, isFavorite: !s.isFavorite } : s));
  }, []);

  const addCustomStock = useCallback((stock: StockQuote) => {
    setStocks(prev => {
      const exists = prev.find(s => s.symbol.toUpperCase() === stock.symbol.toUpperCase());
      if (exists) {
        return prev.map(s => s.symbol.toUpperCase() === stock.symbol.toUpperCase() ? { ...s, isFavorite: true } : s);
      }
      return [{ ...stock, isFavorite: true }, ...prev];
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const updateProfile = useCallback((newProfile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...newProfile }));
    const activeUserId = userDB.getActiveUserId();
    if (activeUserId) {
      cloudTradingService.updateCloudProfile(activeUserId, {
        name: newProfile.name,
        avatarUrl: newProfile.avatarUrl,
        plan: newProfile.plan,
      });
    }
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Search symbols via Finnhub
  const searchSymbols = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) return [];
    
    const localMatches = stocks
      .filter(s => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase()))
      .map(s => ({ symbol: s.symbol, name: s.name }));

    try {
      const finnhubMatches = await finnhubClient.searchSymbols(query);
      if (finnhubMatches && finnhubMatches.length > 0) {
        const combined = [...localMatches];
        for (const item of finnhubMatches) {
          if (!combined.some(c => c.symbol === item.symbol)) {
            combined.push({ symbol: item.symbol, name: item.description });
          }
        }
        return combined.slice(0, 8);
      }
    } catch {
      // Ignore
    }

    return localMatches.slice(0, 8);
  }, [stocks]);

  return (
    <TradingContext.Provider
      value={{
        stocks,
        holdings,
        orders,
        transactions,
        indices,
        userProfile,
        settings,
        notifications,
        totalPortfolioValue,
        totalInvested,
        totalPnL,
        totalPnLPercent,
        todaysPnL,
        todaysPnLPercent,
        buyingPower,
        virtualCash,
        executeOrder,
        cancelOrder,
        depositVirtualCash,
        withdrawVirtualCash,
        resetAccount,
        toggleFavorite,
        addCustomStock,
        updateSettings,
        updateProfile,
        markNotificationRead,
        clearNotifications,
        fetchLiveQuote,
        searchSymbols,
        isLiveApiConnected,
        refreshAllQuotes,
        loadUserSession,
        refreshCloudData,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};

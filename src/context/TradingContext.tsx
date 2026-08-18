import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
}

const INITIAL_HOLDINGS: Holding[] = [
  {
    id: 'h-1',
    symbol: 'AAPL',
    company: 'Apple Inc.',
    shares: 25,
    avgPrice: 172.50,
    currentPrice: 195.34,
    totalValue: 4883.50,
    pnl: 570.98,
    pnlPercent: 13.34,
    category: 'Stocks'
  },
  {
    id: 'h-2',
    symbol: 'MSFT',
    company: 'Microsoft Corp.',
    shares: 15,
    avgPrice: 378.85,
    currentPrice: 415.28,
    totalValue: 6229.20,
    pnl: 546.45,
    pnlPercent: 9.61,
    category: 'Stocks'
  },
  {
    id: 'h-3',
    symbol: 'GOOGL',
    company: 'Alphabet Inc.',
    shares: 90,
    avgPrice: 152.40,
    currentPrice: 181.50,
    totalValue: 16335.00,
    pnl: 2619.00,
    pnlPercent: 19.09,
    category: 'Stocks'
  },
  {
    id: 'h-4',
    symbol: 'AMZN',
    company: 'Amazon.com Inc.',
    shares: 80,
    avgPrice: 155.20,
    currentPrice: 186.40,
    totalValue: 14912.00,
    pnl: 2496.00,
    pnlPercent: 20.10,
    category: 'Stocks'
  },
  {
    id: 'h-5',
    symbol: 'TSLA',
    company: 'Tesla Inc.',
    shares: 20,
    avgPrice: 198.30,
    currentPrice: 248.43,
    totalValue: 4968.60,
    pnl: 1002.60,
    pnlPercent: 25.28,
    category: 'Stocks'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    symbol: 'AAPL',
    company: 'Apple Inc.',
    type: 'Buy',
    quantity: 10,
    price: 195.00,
    orderType: 'Limit',
    status: 'Open',
    createdAt: 'Jul 20, 2025 10:30 AM'
  },
  {
    id: 'ord-2',
    symbol: 'TSLA',
    company: 'Tesla Inc.',
    type: 'Sell',
    quantity: 5,
    price: 245.00,
    orderType: 'Limit',
    status: 'Open',
    createdAt: 'Jul 20, 2025 10:25 AM'
  },
  {
    id: 'ord-3',
    symbol: 'MSFT',
    company: 'Microsoft Corp.',
    type: 'Buy',
    quantity: 5,
    price: 412.50,
    orderType: 'Market',
    status: 'Filled',
    createdAt: 'Jul 20, 2025 09:40 AM',
    filledAt: 'Jul 20, 2025 09:45 AM'
  },
  {
    id: 'ord-4',
    symbol: 'GOOGL',
    company: 'Alphabet Inc.',
    type: 'Buy',
    quantity: 2,
    price: 180.00,
    orderType: 'Limit',
    status: 'Filled',
    createdAt: 'Jul 19, 2025 02:00 PM',
    filledAt: 'Jul 19, 2025 02:15 PM'
  },
  {
    id: 'ord-5',
    symbol: 'AMZN',
    company: 'Amazon.com Inc.',
    type: 'Sell',
    quantity: 3,
    price: 185.00,
    orderType: 'Limit',
    status: 'Filled',
    createdAt: 'Jul 19, 2025 10:45 AM',
    filledAt: 'Jul 19, 2025 11:05 AM'
  },
  {
    id: 'ord-6',
    symbol: 'AAPL',
    company: 'Apple Inc.',
    type: 'Buy',
    quantity: 15,
    price: 192.80,
    orderType: 'Market',
    status: 'Filled',
    createdAt: 'Jul 18, 2025 03:20 PM',
    filledAt: 'Jul 18, 2025 03:22 PM'
  },
  {
    id: 'ord-7',
    symbol: 'TSLA',
    company: 'Tesla Inc.',
    type: 'Buy',
    quantity: 8,
    price: 237.45,
    orderType: 'Limit',
    status: 'Filled',
    createdAt: 'Jul 18, 2025 10:00 AM',
    filledAt: 'Jul 18, 2025 10:12 AM'
  },
  {
    id: 'ord-8',
    symbol: 'NVDA',
    company: 'NVIDIA Corp.',
    type: 'Buy',
    quantity: 10,
    price: 120.00,
    orderType: 'Limit',
    status: 'Cancelled',
    createdAt: 'Jul 17, 2025 01:10 PM'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: 'Jul 20, 2025 10:30 AM',
    type: 'Buy',
    description: 'Bought 10 shares of AAPL',
    amount: -1950.00,
    balance: 10246.75
  },
  {
    id: 'tx-2',
    date: 'Jul 19, 2025 02:15 PM',
    type: 'Buy',
    description: 'Bought 2 shares of GOOGL',
    amount: -360.00,
    balance: 12196.75
  },
  {
    id: 'tx-3',
    date: 'Jul 18, 2025 03:22 PM',
    type: 'Buy',
    description: 'Bought 15 shares of AAPL',
    amount: -2892.00,
    balance: 17476.75
  },
  {
    id: 'tx-4',
    date: 'Jul 17, 2025 11:05 AM',
    type: 'Sell',
    description: 'Sold 3 shares of AMZN',
    amount: 555.00,
    balance: 20368.75
  },
  {
    id: 'tx-5',
    date: 'Jul 16, 2025 09:30 AM',
    type: 'Deposit',
    description: 'Initial Virtual Deposit',
    amount: 30000.00,
    balance: 10438.75
  },
  {
    id: 'tx-6',
    date: 'Jul 15, 2025 04:10 PM',
    type: 'Dividend',
    description: 'Dividend from MSFT',
    amount: 12.45,
    balance: 438.75
  },
  {
    id: 'tx-7',
    date: 'Jul 14, 2025 01:25 PM',
    type: 'Adjust',
    description: 'Interest Adjustment',
    amount: 5.60,
    balance: 426.30
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Sunil Raj',
  email: 'sunilraj@example.com',
  memberSince: 'July 2025',
  plan: 'Premium Plan'
};

const INITIAL_SETTINGS: UserSettings = {
  siteDashboardUrl: 'https://nexora.com/dashboard',
  defaultLandingPage: 'Dashboard',
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
    theme: 'dark', // Keep user dark/light preference
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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Order Executed',
    message: 'Bought 5 shares of MSFT at $412.50',
    time: 'Jul 20, 09:45 AM',
    type: 'order',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Price Target Alert',
    message: 'TSLA has crossed $245.00 (+2.61%)',
    time: 'Jul 20, 10:15 AM',
    type: 'price',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Dividend Received',
    message: '$12.45 dividend deposited from MSFT',
    time: 'Jul 15, 04:10 PM',
    type: 'account',
    read: true
  }
];

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<StockQuote[]>(() => {
    const saved = localStorage.getItem('nexora_stocks_v3');
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const initialUser = userDB.getActiveUser();

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    const user = userDB.getActiveUser();
    return user ? user.data.holdings : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const user = userDB.getActiveUser();
    return user ? user.data.orders : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const user = userDB.getActiveUser();
    return user ? user.data.transactions : [];
  });

  const [indices, setIndices] = useState<MarketIndex[]>(INITIAL_MARKET_INDICES);

  const [virtualCash, setVirtualCash] = useState<number>(() => {
    const user = userDB.getActiveUser();
    return user && typeof user.data.cash === 'number' ? user.data.cash : 50000;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const user = userDB.getActiveUser();
    return user ? user.profile : INITIAL_PROFILE;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const user = userDB.getActiveUser();
    return user ? user.data.settings : INITIAL_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const user = userDB.getActiveUser();
    return user ? user.data.notifications : [];
  });

  const [isLiveApiConnected, setIsLiveApiConnected] = useState<boolean>(true);

  // Sync state changes to Database & LocalStorage
  useEffect(() => {
    const currentId = userDB.getActiveUserId();
    if (!currentId) return;

    userDB.updateActiveUserData({
      cash: virtualCash,
      holdings,
      orders,
      transactions,
      settings,
      notifications,
      profile: userProfile,
    });
  }, [virtualCash, holdings, orders, transactions, settings, notifications, userProfile]);

  const loadUserSession = useCallback((user: UserAccount) => {
    setUserProfile(user.profile);
    setVirtualCash(user.data.cash);
    setHoldings(user.data.holdings || []);
    setOrders(user.data.orders || []);
    setTransactions(user.data.transactions || []);
    setSettings(user.data.settings || INITIAL_SETTINGS);
    setNotifications(user.data.notifications || []);
  }, []);

  // Compute accurate Realized & Unrealized P&L
  const totalHoldingsValue = holdings.reduce((acc, h) => acc + h.shares * h.currentPrice, 0);
  const totalInvested = holdings.reduce((acc, h) => acc + h.shares * h.avgPrice, 0);
  const totalPortfolioValue = totalHoldingsValue + virtualCash;
  
  // Total P&L is the exact gain from all current positions
  const totalPnL = totalHoldingsValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Today's P&L based on day's price movements
  const todaysPnL = holdings.reduce((acc, h) => {
    const stock = stocks.find(s => s.symbol === h.symbol);
    const dayDelta = stock ? stock.change : 0;
    return acc + (dayDelta * h.shares);
  }, 0) || (totalHoldingsValue * 0.0242);
  
  const todaysPnLPercent = totalPortfolioValue > 0 ? (todaysPnL / totalPortfolioValue) * 100 : 2.42;

  // Open buy limit orders reserve buying power
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

  // Fetch real Finnhub quotes on initial load
  useEffect(() => {
    refreshAllQuotes();
  }, []);

  // Periodic Finnhub update (every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      const topSymbols = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'];
      const target = topSymbols[Math.floor(Math.random() * topSymbols.length)];
      fetchLiveQuote(target);
    }, 10000);

    return () => clearInterval(timer);
  }, [fetchLiveQuote]);

  // Synchronize holding current prices with stocks list
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

  // Execute Order
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

        setNotifications(prev => [{
          id: `notif-${Date.now()}`,
          title: 'Limit Order Placed',
          message: `Buy Limit order for ${quantity} shares of ${stock.symbol} at $${executionPrice}`,
          time: formattedDate,
          type: 'order',
          read: false
        }, ...prev]);

        return { success: true, message: `Limit Order placed for ${quantity} ${stock.symbol} @ $${executionPrice}` };
      } else {
        const newVirtualCash = +(virtualCash - totalOrderCost).toFixed(2);
        setVirtualCash(newVirtualCash);

        setHoldings(prev => {
          const existing = prev.find(h => h.symbol === stock.symbol);
          if (existing) {
            const totalShares = existing.shares + quantity;
            const totalCost = (existing.shares * existing.avgPrice) + totalOrderCost;
            const newAvgPrice = +(totalCost / totalShares).toFixed(2);
            const totalVal = +(totalShares * stock.price).toFixed(2);
            const pnl = +((stock.price - newAvgPrice) * totalShares).toFixed(2);
            const pnlPercent = +(((stock.price - newAvgPrice) / newAvgPrice) * 100).toFixed(2);

            return prev.map(h => h.symbol === stock.symbol ? {
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
            return [...prev, newHolding];
          }
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

        setNotifications(prev => [{
          id: `notif-${Date.now()}`,
          title: 'Order Filled',
          message: `Bought ${quantity} shares of ${stock.symbol} at $${stock.price}`,
          time: formattedDate,
          type: 'order',
          read: false
        }, ...prev]);

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
        return { success: true, message: `Sell Limit Order placed for ${quantity} ${stock.symbol} @ $${executionPrice}` };
      } else {
        const newVirtualCash = +(virtualCash + totalOrderCost).toFixed(2);
        setVirtualCash(newVirtualCash);

        setHoldings(prev => {
          return prev.map(h => {
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

    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: 'Deposit Successful',
      message: `+$${amount.toLocaleString()} added to your virtual cash balance.`,
      time: formattedDate,
      type: 'account',
      read: false
    }, ...prev]);
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

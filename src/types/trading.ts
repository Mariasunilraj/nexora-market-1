export type OrderActionType = 'Buy' | 'Sell';
export type OrderExecutionType = 'Market' | 'Limit' | 'Stop Loss';
export type OrderStatus = 'Open' | 'Filled' | 'Cancelled';
export type TransactionType = 'Buy' | 'Sell' | 'Deposit' | 'Withdrawal' | 'Dividend' | 'Adjust';
export type AssetCategory = 'Stocks' | 'ETFs' | 'Cash' | 'Others';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: string;
  sparkline: number[];
  isFavorite?: boolean;
  category?: AssetCategory;
  logoBg?: string;
}

export interface Holding {
  id: string;
  symbol: string;
  company: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  category: AssetCategory;
}

export interface Order {
  id: string;
  symbol: string;
  company: string;
  type: OrderActionType;
  quantity: number;
  price: number;
  orderType: OrderExecutionType;
  status: OrderStatus;
  createdAt: string;
  filledAt?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
  balance: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  plan: string;
  avatarUrl?: string;
}

export interface UserSettings {
  siteDashboardUrl: string;
  defaultLandingPage: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    priceAlerts: boolean;
    orderExecutions: boolean;
    dailyMarketSummary: boolean;
    weeklyReports: boolean;
    promotions: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    sidebarPosition: 'left' | 'right';
    pageLayout: 'full' | 'contained';
    rowsPerPage: number;
    chartType: 'line' | 'candlestick' | 'area';
    showMarketOverview: boolean;
  };
  trading: {
    apiKey: string;
    simulationSpeed: 'realtime' | 'fast' | 'instant';
    commission: number;
  };
  security: {
    twoFactorEnabled: boolean;
  };
}

export interface PortfolioHistoryPoint {
  date: string;
  value: number;
  invested: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'price' | 'system' | 'account';
  read: boolean;
}

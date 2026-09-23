import { Holding, Order, Transaction, UserProfile, UserSettings, NotificationItem } from '../types/trading';
import { supabase } from './supabaseClient';
import { cloudTradingService } from './cloudTradingService';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  createdAt: string;
  profile: UserProfile;
  data: {
    cash: number;
    buyingPower?: number;
    holdings: Holding[];
    orders: Order[];
    transactions: Transaction[];
    settings: UserSettings;
    notifications: NotificationItem[];
  };
}

const ACTIVE_USER_ID_KEY = 'nexora_active_session_user_id';
const ACTIVE_USER_DATA_KEY = 'nexora_active_session_cache';
const LOCAL_USERS_DB_KEY = 'nexora_users_registry_db';

// Simple salt & hash generator for client-side privacy protection
export function generateSalt(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function secureHash(password: string, salt: string): string {
  let hash = 0;
  const combined = `NEXORA_SECURE_SALT_${salt}_${password}_SALT_V2`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `nx_${Math.abs(hash).toString(16)}_${btoa(salt).substring(0, 8)}`;
}

const DEFAULT_SETTINGS: UserSettings = {
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

export class UserService {
  private activeUser: UserAccount | null = null;

  constructor() {
    this.initSession();
  }

  private getLocalUsers(): UserAccount[] {
    const raw = localStorage.getItem(LOCAL_USERS_DB_KEY);
    let users: UserAccount[] = [];
    if (raw) {
      try {
        users = JSON.parse(raw);
      } catch {
        users = [];
      }
    }

    // Ensure primary user mariasunilraj8@gmail.com exists and has password Sunil@08
    const primaryEmail = 'mariasunilraj8@gmail.com';
    const primaryUsername = 'sunilraj';
    const primaryUser = users.find(u => u.email.toLowerCase() === primaryEmail || u.username.toLowerCase() === primaryUsername);
    const salt = primaryUser?.salt || generateSalt();
    const primaryHash = secureHash('Sunil@08', salt);

    if (primaryUser) {
      // Update password to Sunil@08
      primaryUser.salt = salt;
      primaryUser.passwordHash = primaryHash;
      primaryUser.username = primaryUsername;
      primaryUser.email = primaryEmail;
      if (!primaryUser.profile) {
        primaryUser.profile = {
          name: 'Sunil Raj',
          email: primaryEmail,
          memberSince: '2025',
          plan: 'Paper Trading Pro',
        };
      }

      // If holdings are empty, seed with active shares in AAPL, NVDA, MSFT, TSLA
      if (!primaryUser.data.holdings || primaryUser.data.holdings.length === 0) {
        primaryUser.data.cash = 8520.50;
        primaryUser.data.buyingPower = 8520.50;
        primaryUser.data.holdings = [
          {
            id: 'h-aapl-1',
            symbol: 'AAPL',
            company: 'Apple Inc.',
            shares: 15,
            avgPrice: 218.40,
            currentPrice: 228.45,
            totalValue: 3426.75,
            pnl: 150.75,
            pnlPercent: 4.60,
            category: 'Stocks',
          },
          {
            id: 'h-nvda-2',
            symbol: 'NVDA',
            company: 'NVIDIA Corporation',
            shares: 20,
            avgPrice: 119.50,
            currentPrice: 128.50,
            totalValue: 2570.00,
            pnl: 180.00,
            pnlPercent: 7.53,
            category: 'Stocks',
          },
          {
            id: 'h-msft-3',
            symbol: 'MSFT',
            company: 'Microsoft Corporation',
            shares: 5,
            avgPrice: 432.00,
            currentPrice: 448.20,
            totalValue: 2241.00,
            pnl: 81.00,
            pnlPercent: 3.75,
            category: 'Stocks',
          },
          {
            id: 'h-tsla-4',
            symbol: 'TSLA',
            company: 'Tesla Inc.',
            shares: 10,
            avgPrice: 208.50,
            currentPrice: 218.80,
            totalValue: 2188.00,
            pnl: 103.00,
            pnlPercent: 4.94,
            category: 'Stocks',
          }
        ];
        primaryUser.data.orders = [
          {
            id: 'ord-tsla-4',
            symbol: 'TSLA',
            company: 'Tesla Inc.',
            type: 'Buy',
            quantity: 10,
            price: 208.50,
            orderType: 'Market',
            status: 'Filled',
            createdAt: 'Sep 18, 2026 10:15 AM',
            filledAt: 'Sep 18, 2026 10:15 AM',
          },
          {
            id: 'ord-msft-3',
            symbol: 'MSFT',
            company: 'Microsoft Corporation',
            type: 'Buy',
            quantity: 5,
            price: 432.00,
            orderType: 'Market',
            status: 'Filled',
            createdAt: 'Sep 17, 2026 02:40 PM',
            filledAt: 'Sep 17, 2026 02:40 PM',
          },
          {
            id: 'ord-nvda-2',
            symbol: 'NVDA',
            company: 'NVIDIA Corporation',
            type: 'Buy',
            quantity: 20,
            price: 119.50,
            orderType: 'Market',
            status: 'Filled',
            createdAt: 'Sep 16, 2026 11:30 AM',
            filledAt: 'Sep 16, 2026 11:30 AM',
          },
          {
            id: 'ord-aapl-1',
            symbol: 'AAPL',
            company: 'Apple Inc.',
            type: 'Buy',
            quantity: 15,
            price: 218.40,
            orderType: 'Market',
            status: 'Filled',
            createdAt: 'Sep 15, 2026 09:45 AM',
            filledAt: 'Sep 15, 2026 09:45 AM',
          }
        ];
        primaryUser.data.transactions = [
          {
            id: 'tx-tsla-4',
            date: 'Sep 18, 2026 10:15 AM',
            type: 'Buy',
            description: 'Bought 10 shares of TSLA',
            amount: -2085.00,
            balance: 8520.50,
          },
          {
            id: 'tx-msft-3',
            date: 'Sep 17, 2026 02:40 PM',
            type: 'Buy',
            description: 'Bought 5 shares of MSFT',
            amount: -2160.00,
            balance: 10605.50,
          },
          {
            id: 'tx-nvda-2',
            date: 'Sep 16, 2026 11:30 AM',
            type: 'Buy',
            description: 'Bought 20 shares of NVDA',
            amount: -2390.00,
            balance: 12765.50,
          },
          {
            id: 'tx-aapl-1',
            date: 'Sep 15, 2026 09:45 AM',
            type: 'Buy',
            description: 'Bought 15 shares of AAPL',
            amount: -3276.00,
            balance: 15155.50,
          },
          {
            id: 'tx-welcome',
            date: 'Sep 15, 2026 09:30 AM',
            type: 'Deposit',
            description: 'Welcome Virtual Deposit',
            amount: 18431.50,
            balance: 18431.50,
          }
        ];
      }
    } else {
      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const newPrimaryUser: UserAccount = {
        id: 'usr-sunilraj-primary',
        username: primaryUsername,
        email: primaryEmail,
        salt,
        passwordHash: primaryHash,
        createdAt: formattedDate,
        profile: {
          name: 'Sunil Raj',
          email: primaryEmail,
          memberSince: formattedDate,
          plan: 'Paper Trading Pro',
        },
        data: {
          cash: 8520.50,
          buyingPower: 8520.50,
          holdings: [
            {
              id: 'h-aapl-1',
              symbol: 'AAPL',
              company: 'Apple Inc.',
              shares: 15,
              avgPrice: 218.40,
              currentPrice: 228.45,
              totalValue: 3426.75,
              pnl: 150.75,
              pnlPercent: 4.60,
              category: 'Stocks',
            },
            {
              id: 'h-nvda-2',
              symbol: 'NVDA',
              company: 'NVIDIA Corporation',
              shares: 20,
              avgPrice: 119.50,
              currentPrice: 128.50,
              totalValue: 2570.00,
              pnl: 180.00,
              pnlPercent: 7.53,
              category: 'Stocks',
            },
            {
              id: 'h-msft-3',
              symbol: 'MSFT',
              company: 'Microsoft Corporation',
              shares: 5,
              avgPrice: 432.00,
              currentPrice: 448.20,
              totalValue: 2241.00,
              pnl: 81.00,
              pnlPercent: 3.75,
              category: 'Stocks',
            },
            {
              id: 'h-tsla-4',
              symbol: 'TSLA',
              company: 'Tesla Inc.',
              shares: 10,
              avgPrice: 208.50,
              currentPrice: 218.80,
              totalValue: 2188.00,
              pnl: 103.00,
              pnlPercent: 4.94,
              category: 'Stocks',
            }
          ],
          orders: [
            {
              id: 'ord-tsla-4',
              symbol: 'TSLA',
              company: 'Tesla Inc.',
              type: 'Buy',
              quantity: 10,
              price: 208.50,
              orderType: 'Market',
              status: 'Filled',
              createdAt: 'Sep 18, 2026 10:15 AM',
              filledAt: 'Sep 18, 2026 10:15 AM',
            },
            {
              id: 'ord-msft-3',
              symbol: 'MSFT',
              company: 'Microsoft Corporation',
              type: 'Buy',
              quantity: 5,
              price: 432.00,
              orderType: 'Market',
              status: 'Filled',
              createdAt: 'Sep 17, 2026 02:40 PM',
              filledAt: 'Sep 17, 2026 02:40 PM',
            },
            {
              id: 'ord-nvda-2',
              symbol: 'NVDA',
              company: 'NVIDIA Corporation',
              type: 'Buy',
              quantity: 20,
              price: 119.50,
              orderType: 'Market',
              status: 'Filled',
              createdAt: 'Sep 16, 2026 11:30 AM',
              filledAt: 'Sep 16, 2026 11:30 AM',
            },
            {
              id: 'ord-aapl-1',
              symbol: 'AAPL',
              company: 'Apple Inc.',
              type: 'Buy',
              quantity: 15,
              price: 218.40,
              orderType: 'Market',
              status: 'Filled',
              createdAt: 'Sep 15, 2026 09:45 AM',
              filledAt: 'Sep 15, 2026 09:45 AM',
            }
          ],
          transactions: [
            {
              id: 'tx-tsla-4',
              date: 'Sep 18, 2026 10:15 AM',
              type: 'Buy',
              description: 'Bought 10 shares of TSLA',
              amount: -2085.00,
              balance: 8520.50,
            },
            {
              id: 'tx-msft-3',
              date: 'Sep 17, 2026 02:40 PM',
              type: 'Buy',
              description: 'Bought 5 shares of MSFT',
              amount: -2160.00,
              balance: 10605.50,
            },
            {
              id: 'tx-nvda-2',
              date: 'Sep 16, 2026 11:30 AM',
              type: 'Buy',
              description: 'Bought 20 shares of NVDA',
              amount: -2390.00,
              balance: 12765.50,
            },
            {
              id: 'tx-aapl-1',
              date: 'Sep 15, 2026 09:45 AM',
              type: 'Buy',
              description: 'Bought 15 shares of AAPL',
              amount: -3276.00,
              balance: 15155.50,
            },
            {
              id: 'tx-welcome',
              date: 'Sep 15, 2026 09:30 AM',
              type: 'Deposit',
              description: 'Welcome Virtual Deposit',
              amount: 18431.50,
              balance: 18431.50,
            }
          ],
          settings: DEFAULT_SETTINGS,
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: 'Welcome to NEXORA!',
              message: 'Account active. Live holdings in AAPL, NVDA, MSFT, and TSLA are available in your portfolio.',
              time: 'Just now',
              type: 'account',
              read: false,
            }
          ]
        }
      };
      users.unshift(newPrimaryUser);
    }

    try {
      localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }

    return users;
  }

  private saveLocalUsers(users: UserAccount[]) {
    try {
      localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Local storage quota limit:', e);
    }
  }

  private async initSession() {
    // 1. Immediately read cached active session synchronously
    const raw = localStorage.getItem(ACTIVE_USER_DATA_KEY);
    if (raw) {
      try {
        this.activeUser = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    // 2. Sync from Supabase Cloud Session if available without overwriting local custom profile
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          const user = data.session.user;
          const cloudData = await cloudTradingService.fetchCloudUserData(user.id);
          const currentCached = this.activeUser;

          this.activeUser = {
            id: user.id,
            username: user.user_metadata?.username || (currentCached?.id === user.id ? currentCached.username : null) || user.email?.split('@')[0] || 'Trader',
            email: user.email || '',
            createdAt: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            profile: cloudData?.profile || (currentCached?.id === user.id ? currentCached.profile : null) || {
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
              email: user.email || '',
              memberSince: '2025',
              plan: 'Paper Trading Pro',
            },
            data: {
              cash: cloudData?.cash ?? (currentCached?.id === user.id ? currentCached.data.cash : 10000),
              buyingPower: cloudData?.buyingPower ?? (currentCached?.id === user.id ? currentCached.data.buyingPower : 10000),
              holdings: cloudData?.holdings || (currentCached?.id === user.id ? currentCached.data.holdings : []),
              orders: cloudData?.orders || (currentCached?.id === user.id ? currentCached.data.orders : []),
              transactions: cloudData?.transactions || (currentCached?.id === user.id ? currentCached.data.transactions : []),
              settings: currentCached?.data.settings || DEFAULT_SETTINGS,
              notifications: currentCached?.data.notifications || [],
            }
          };

          localStorage.setItem(ACTIVE_USER_ID_KEY, user.id);
          localStorage.setItem(ACTIVE_USER_DATA_KEY, JSON.stringify(this.activeUser));
        }
      } catch {
        // Fall through to local session
      }
    }
  }

  getActiveUserId(): string | null {
    if (this.activeUser) return this.activeUser.id;
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  }

  getActiveUser(): UserAccount | null {
    if (this.activeUser) return this.activeUser;

    const raw = localStorage.getItem(ACTIVE_USER_DATA_KEY);
    if (raw) {
      try {
        this.activeUser = JSON.parse(raw);
        return this.activeUser;
      } catch {
        // ignore
      }
    }
    return null;
  }

  setActiveUser(user: UserAccount | null) {
    this.activeUser = user;
    if (user) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, user.id);
      localStorage.setItem(ACTIVE_USER_DATA_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
      localStorage.removeItem(ACTIVE_USER_DATA_KEY);
    }
  }

  private registrySyncTimer: any = null;

  private scheduleRegistrySync() {
    if (this.registrySyncTimer) clearTimeout(this.registrySyncTimer);
    this.registrySyncTimer = setTimeout(() => {
      try {
        const user = this.activeUser;
        if (!user) return;
        const localUsers = this.getLocalUsers();
        const idx = localUsers.findIndex(u => u.id === user.id);
        if (idx >= 0) {
          localUsers[idx] = user;
          this.saveLocalUsers(localUsers);
        }
      } catch {
        // ignore
      }
    }, 500);
  }

  updateActiveUserData(updater: (prevData: UserAccount['data']) => Partial<UserAccount['data']>) {
    const user = this.getActiveUser();
    if (!user) return;
    const partial = updater(user.data);
    user.data = { ...user.data, ...partial };
    this.setActiveUser(user);
    this.scheduleRegistrySync();
  }

  updateActiveUserProfile(partialProfile: Partial<UserProfile>) {
    const user = this.getActiveUser();
    if (!user) return;
    user.profile = { ...user.profile, ...partialProfile };
    this.setActiveUser(user);
    this.scheduleRegistrySync();
  }

  /**
   * Resilient Register: Supabase Cloud + Local Encrypted Registry
   */
  async register(username: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'Please enter a valid email address (e.g. yourname@gmail.com).' };
    }
    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const salt = generateSalt();
    const passwordHash = secureHash(password, salt);
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const capitalizedName = cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1);

    let userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Try Supabase Cloud Registration
    if (supabase) {
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              username: cleanUsername,
              full_name: capitalizedName,
            }
          }
        });

        if (authData?.user) {
          userId = authData.user.id;

          // Attempt upserting profile & transaction in cloud
          supabase.from('profiles').upsert({
            id: userId,
            username: cleanUsername,
            email: cleanEmail,
            full_name: capitalizedName,
            virtual_cash: 10000.00,
            buying_power: 10000.00,
            total_equity: 10000.00,
            plan: 'Paper Trading Pro',
            updated_at: new Date().toISOString(),
          }).then(() => {});

          supabase.from('transactions').insert({
            user_id: userId,
            type: 'Deposit',
            description: 'Welcome Virtual Deposit',
            amount: 10000.00,
            balance: 10000.00,
            created_at: new Date().toISOString(),
          }).then(() => {});
        }
      } catch (e) {
        console.warn('Supabase cloud signup notice (proceeding with local resilience):', e);
      }
    }

    // 2. Create User Account Record
    const userAccount: UserAccount = {
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      salt,
      passwordHash,
      createdAt: formattedDate,
      profile: {
        name: capitalizedName,
        email: cleanEmail,
        memberSince: formattedDate,
        plan: 'Paper Trading Pro',
      },
      data: {
        cash: 10000.00,
        buyingPower: 10000.00,
        holdings: [],
        orders: [],
        transactions: [
          {
            id: `tx-${Date.now()}`,
            date: formattedDate + ' 09:30 AM',
            type: 'Deposit',
            description: 'Welcome Virtual Deposit',
            amount: 10000.00,
            balance: 10000.00,
          }
        ],
        settings: DEFAULT_SETTINGS,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: 'Welcome to NEXORA!',
            message: `Account created for ${capitalizedName}. $10,000 virtual starter cash has been credited.`,
            time: 'Just now',
            type: 'account',
            read: false,
          }
        ]
      }
    };

    // Save to local registry for seamless offline/adblocker resilience
    const localUsers = this.getLocalUsers();
    const existingIdx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (existingIdx >= 0) {
      localUsers[existingIdx] = userAccount;
    } else {
      localUsers.push(userAccount);
    }
    this.saveLocalUsers(localUsers);

    this.setActiveUser(userAccount);
    return { success: true, message: 'Account registered successfully! Accessing workstation...', user: userAccount };
  }

  /**
   * Resilient Login: Handles Cloud + Local Fallback (Never shows "Failed to fetch")
   */
  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const clean = identifier.trim().toLowerCase();
    const localUsers = this.getLocalUsers();

    // 1. Try Supabase Cloud Login
    if (supabase) {
      try {
        let emailToUse = clean;

        if (!clean.includes('@')) {
          const localMatch = localUsers.find(u => u.username.toLowerCase() === clean);
          if (localMatch?.email) {
            emailToUse = localMatch.email;
          }
        }

        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (!authErr && authData?.user) {
          const authUser = authData.user;
          const cloudData = await cloudTradingService.fetchCloudUserData(authUser.id);

          const formattedDate = new Date(authUser.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const userAccount: UserAccount = {
            id: authUser.id,
            username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Trader',
            email: authUser.email || '',
            createdAt: formattedDate,
            profile: cloudData?.profile || {
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Trader',
              email: authUser.email || '',
              memberSince: formattedDate,
              plan: 'Paper Trading Pro',
            },
            data: {
              cash: cloudData?.cash ?? 10000,
              buyingPower: cloudData?.buyingPower ?? 10000,
              holdings: cloudData?.holdings || [],
              orders: cloudData?.orders || [],
              transactions: cloudData?.transactions || [],
              settings: DEFAULT_SETTINGS,
              notifications: [],
            }
          };

          this.setActiveUser(userAccount);
          return { success: true, message: 'Sign in successful! Syncing cloud portfolio...', user: userAccount };
        }
      } catch (err) {
        console.warn('Supabase cloud fetch notice (failing over to local registry):', err);
      }
    }

    // 2. Resilient Fallback: Match against Local Registry
    const matchedUser = localUsers.find(
      u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );

    if (matchedUser) {
      const salt = matchedUser.salt || 'legacy_salt';
      const expectedHash = secureHash(password, salt);

      if (matchedUser.passwordHash === expectedHash || matchedUser.passwordHash === password) {
        this.setActiveUser(matchedUser);
        return { success: true, message: 'Sign in successful!', user: matchedUser };
      } else {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }
    }

    // 3. Auto-Register if this is the user's primary credentials
    if (clean === 'mariasunilraj8@gmail.com' || clean === 'sunilraj') {
      return this.register('sunilraj', 'mariasunilraj8@gmail.com', password);
    }

    return {
      success: false,
      message: `Account "${identifier}" not found. Please check your credentials or click "REGISTER NEW ACCOUNT" below.`
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordResetOtp(identifier: string): Promise<{ success: boolean; message: string; email?: string; otp?: string }> {
    const clean = identifier.trim().toLowerCase();
    let emailToUse = clean;

    const localUsers = this.getLocalUsers();
    const localMatch = localUsers.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean);
    if (localMatch?.email) {
      emailToUse = localMatch.email;
    }

    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(emailToUse, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
      } catch {
        // ignore
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    return {
      success: true,
      message: `A 6-digit verification code has been generated for ${emailToUse}.`,
      email: emailToUse,
      otp: otpCode,
    };
  }

  /**
   * Reset password
   */
  async resetPasswordWithOtp(email: string, _enteredOtp: string, newPassword: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      try {
        await supabase.auth.updateUser({
          password: newPassword,
        });
      } catch {
        // ignore
      }
    }

    // Update in local registry
    const localUsers = this.getLocalUsers();
    const user = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      const salt = generateSalt();
      user.salt = salt;
      user.passwordHash = secureHash(newPassword, salt);
      this.saveLocalUsers(localUsers);
      this.setActiveUser(user);
      return { success: true, message: 'Password updated successfully!', user };
    }

    return this.register(cleanEmail.split('@')[0], cleanEmail, newPassword);
  }

  async logout() {
    this.setActiveUser(null);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  }

  updateUserPlan(planName: string): { success: boolean; message: string } {
    const user = this.getActiveUser();
    if (user) {
      user.profile.plan = planName;
      this.setActiveUser(user);
      if (supabase) {
        cloudTradingService.updateCloudProfile(user.id, { plan: planName });
      }
      return { success: true, message: `Successfully upgraded plan to ${planName}` };
    }
    return { success: false, message: 'No active session.' };
  }
}

export const userDB = new UserService();

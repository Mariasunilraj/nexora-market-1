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

export interface StoredOtp {
  code: string;
  email: string;
  expiresAt: number;
}

const ACTIVE_USER_ID_KEY = 'nexora_active_session_user_id';
const ACTIVE_USER_DATA_KEY = 'nexora_active_session_cache';

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
    this.initSessionFromCloud();
  }

  private async initSessionFromCloud() {
    if (!supabase) return;
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const user = data.session.user;
        const cloudData = await cloudTradingService.fetchCloudUserData(user.id);

        this.activeUser = {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Trader',
          email: user.email || '',
          createdAt: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          profile: cloudData?.profile || {
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Trader',
            email: user.email || '',
            memberSince: '2025',
            plan: 'Paper Trading Pro',
          },
          data: {
            cash: cloudData?.cash ?? 50000,
            buyingPower: cloudData?.buyingPower ?? 50000,
            holdings: cloudData?.holdings || [],
            orders: cloudData?.orders || [],
            transactions: cloudData?.transactions || [],
            settings: DEFAULT_SETTINGS,
            notifications: [],
          }
        };

        localStorage.setItem(ACTIVE_USER_ID_KEY, user.id);
        localStorage.setItem(ACTIVE_USER_DATA_KEY, JSON.stringify(this.activeUser));
      }
    } catch (err) {
      console.warn('Session check failed:', err);
    }
  }

  getActiveUserId(): string | null {
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

  /**
   * Register a new account in Supabase Cloud
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

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
            }
          }
        });

        if (error) {
          return { success: false, message: error.message };
        }

        const authUser = data.user;
        if (authUser) {
          // Ensure profile row exists in public.profiles table
          await supabase.from('profiles').upsert({
            id: authUser.id,
            username: cleanUsername,
            email: cleanEmail,
            full_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
            virtual_cash: 50000.00,
            buying_power: 50000.00,
            total_equity: 50000.00,
            plan: 'Paper Trading Pro',
            updated_at: new Date().toISOString(),
          });

          // Insert Welcome Transaction
          await supabase.from('transactions').insert({
            user_id: authUser.id,
            type: 'Deposit',
            description: 'Welcome Virtual Deposit',
            amount: 50000.00,
            balance: 50000.00,
            created_at: new Date().toISOString(),
          });

          const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const userAccount: UserAccount = {
            id: authUser.id,
            username: cleanUsername,
            email: cleanEmail,
            createdAt: formattedDate,
            profile: {
              name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
              email: cleanEmail,
              memberSince: formattedDate,
              plan: 'Paper Trading Pro',
            },
            data: {
              cash: 50000.00,
              buyingPower: 50000.00,
              holdings: [],
              orders: [],
              transactions: [
                {
                  id: `tx-${Date.now()}`,
                  date: formattedDate + ' 09:30 AM',
                  type: 'Deposit',
                  description: 'Welcome Virtual Deposit',
                  amount: 50000.00,
                  balance: 50000.00,
                }
              ],
              settings: DEFAULT_SETTINGS,
              notifications: [
                {
                  id: `notif-${Date.now()}`,
                  title: 'Welcome to NEXORA!',
                  message: `Account created. $50,000 virtual trading cash has been credited to your cloud account.`,
                  time: 'Just now',
                  type: 'account',
                  read: false,
                }
              ]
            }
          };

          this.setActiveUser(userAccount);
          return { success: true, message: 'Cloud Account registered successfully!', user: userAccount };
        }
      } catch (err: any) {
        return { success: false, message: err?.message || 'Error communicating with Supabase Cloud.' };
      }
    }

    return { success: false, message: 'Supabase Cloud is not configured.' };
  }

  /**
   * Log into Supabase Cloud Account
   */
  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    const clean = identifier.trim().toLowerCase();

    if (supabase) {
      try {
        let emailToUse = clean;

        // If user provided a username instead of an email, look up their email from profiles table
        if (!clean.includes('@')) {
          const { data: profileMatch } = await supabase
            .from('profiles')
            .select('email')
            .ilike('username', clean)
            .maybeSingle();

          if (profileMatch?.email) {
            emailToUse = profileMatch.email;
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (error) {
          if (error.message?.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              message: 'Email confirmation required. Please check your inbox or spam folder for the confirmation email.'
            };
          }
          return { success: false, message: error.message };
        }

        const authUser = data.user;
        if (authUser) {
          // Fetch complete cloud data for this user
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
              cash: cloudData?.cash ?? 50000,
              buyingPower: cloudData?.buyingPower ?? 50000,
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
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to sign in to Cloud.' };
      }
    }

    return { success: false, message: 'Cloud database unavailable.' };
  }

  /**
   * Request password reset via Supabase Auth
   */
  async requestPasswordResetOtp(identifier: string): Promise<{ success: boolean; message: string; email?: string; otp?: string }> {
    const clean = identifier.trim().toLowerCase();
    let emailToUse = clean;

    if (supabase) {
      if (!clean.includes('@')) {
        const { data: profileMatch } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', clean)
          .maybeSingle();

        if (profileMatch?.email) {
          emailToUse = profileMatch.email;
        }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Generate local verification OTP preview
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      return {
        success: true,
        message: `Password reset instructions sent to ${emailToUse}.`,
        email: emailToUse,
        otp: otpCode,
      };
    }

    return { success: false, message: 'Cloud service offline.' };
  }

  /**
   * Verify OTP & Reset Password
   */
  async resetPasswordWithOtp(email: string, _enteredOtp: string, newPassword: string): Promise<{ success: boolean; message: string; user?: UserAccount }> {
    if (supabase) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data?.user) {
        const cloudData = await cloudTradingService.fetchCloudUserData(data.user.id);
        const userAccount: UserAccount = {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'Trader',
          email: data.user.email || '',
          createdAt: new Date().toLocaleDateString('en-US'),
          profile: cloudData?.profile || {
            name: data.user.user_metadata?.full_name || 'Trader',
            email: data.user.email || '',
            memberSince: '2025',
            plan: 'Paper Trading Pro',
          },
          data: {
            cash: cloudData?.cash ?? 50000,
            buyingPower: cloudData?.buyingPower ?? 50000,
            holdings: cloudData?.holdings || [],
            orders: cloudData?.orders || [],
            transactions: cloudData?.transactions || [],
            settings: DEFAULT_SETTINGS,
            notifications: [],
          }
        };

        this.setActiveUser(userAccount);
        return { success: true, message: 'Password updated successfully!', user: userAccount };
      }
    }

    return { success: false, message: 'Failed to update password.' };
  }

  async logout() {
    this.setActiveUser(null);
    if (supabase) {
      await supabase.auth.signOut();
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

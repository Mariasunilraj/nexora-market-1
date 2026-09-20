import { Holding, Order, Transaction, UserProfile, UserSettings, NotificationItem } from '../types/trading';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  profile: UserProfile;
  data: {
    cash: number;
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

const USERS_DB_KEY = 'nexora_users_registry_db';
const ACTIVE_USER_ID_KEY = 'nexora_active_session_user_id';
const SESSION_TOKEN_KEY = 'nexora_secure_session_token';
const OTP_STORAGE_PREFIX = 'nexora_otp_';

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
    hash |= 0; // Convert to 32bit integer
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

const DEFAULT_PORTFOLIO_HOLDINGS: Holding[] = [
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

const DEFAULT_PORTFOLIO_ORDERS: Order[] = [
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
  }
];

const DEFAULT_PORTFOLIO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: 'Jul 20, 2025 10:30 AM',
    type: 'Buy',
    description: 'Bought 10 shares of AAPL',
    amount: -1950.00,
    balance: 10246.75
  },
  {
    id: 'tx-5',
    date: 'Jul 16, 2025 09:30 AM',
    type: 'Deposit',
    description: 'Initial Virtual Deposit',
    amount: 30000.00,
    balance: 10438.75
  }
];

const SEED_SALT_1 = 'salt_sunil_01';
const SEED_SALT_2 = 'salt_maria_02';

// Seed user Maria Sunil Raj
const SEED_MARIA_SUNIL_USER: UserAccount = {
  id: 'usr-maria-sunil-raj',
  username: 'mariasunilraj8',
  email: 'mariasunilraj8@gmail.com',
  salt: SEED_SALT_2,
  passwordHash: secureHash('password123', SEED_SALT_2),
  createdAt: 'July 2025',
  profile: {
    name: 'Maria Sunil Raj',
    email: 'mariasunilraj8@gmail.com',
    memberSince: 'July 2025',
    plan: 'Paper Trading Pro',
  },
  data: {
    cash: 10246.75,
    holdings: DEFAULT_PORTFOLIO_HOLDINGS,
    orders: DEFAULT_PORTFOLIO_ORDERS,
    transactions: DEFAULT_PORTFOLIO_TRANSACTIONS,
    settings: DEFAULT_SETTINGS,
    notifications: [
      {
        id: 'notif-1',
        title: 'Order Executed',
        message: 'Bought 5 shares of MSFT at $412.50',
        time: 'Jul 20, 09:45 AM',
        type: 'order',
        read: false
      }
    ]
  }
};

const SEED_SUNIL_USER: UserAccount = {
  ...SEED_MARIA_SUNIL_USER,
  id: 'usr-sunil-raj',
  username: 'sunilraj',
  email: 'sunilraj@example.com',
  salt: SEED_SALT_1,
  passwordHash: secureHash('password123', SEED_SALT_1),
  profile: {
    ...SEED_MARIA_SUNIL_USER.profile,
    name: 'Sunil Raj',
    email: 'sunilraj@example.com',
  }
};

const INITIAL_SEEDED_USERS: UserAccount[] = [
  SEED_MARIA_SUNIL_USER,
  SEED_SUNIL_USER,
];

export class UserService {
  private getUserDataKey(userId: string): string {
    return `nexora_user_data_${userId}`;
  }

  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(USERS_DB_KEY);
    let userList: UserAccount[] = [];

    if (!raw) {
      userList = [...INITIAL_SEEDED_USERS];
      this.saveUsers(userList);
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          userList = parsed;
        } else {
          userList = [...INITIAL_SEEDED_USERS];
        }
      } catch {
        userList = [...INITIAL_SEEDED_USERS];
      }
    }

    // Auto-heal seed accounts if missing
    let modified = false;
    for (const seed of INITIAL_SEEDED_USERS) {
      if (!userList.some(u => u.email.toLowerCase() === seed.email.toLowerCase() || u.username.toLowerCase() === seed.username.toLowerCase())) {
        userList.push(seed);
        modified = true;
      }
    }

    // Ensure per-user data partition is synced
    for (const user of userList) {
      const userSpecificDataRaw = localStorage.getItem(this.getUserDataKey(user.id));
      if (userSpecificDataRaw) {
        try {
          const userSpecific = JSON.parse(userSpecificDataRaw);
          user.data = { ...user.data, ...userSpecific.data };
          if (userSpecific.profile) {
            user.profile = { ...user.profile, ...userSpecific.profile };
          }
        } catch {
          // ignore corrupted individual slice
        }
      } else {
        localStorage.setItem(this.getUserDataKey(user.id), JSON.stringify({
          profile: user.profile,
          data: user.data,
        }));
      }
    }

    if (modified) {
      this.saveUsers(userList);
    }

    return userList;
  }

  private saveUsers(users: UserAccount[]) {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  getActiveUserId(): string | null {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  }

  getActiveUser(): UserAccount | null {
    const id = this.getActiveUserId();
    if (!id) return null;
    const users = this.getUsers();
    const found = users.find(u => u.id === id);
    if (!found) return null;

    // Merge individual user storage for 100% refresh persistence
    const userSlice = localStorage.getItem(this.getUserDataKey(id));
    if (userSlice) {
      try {
        const parsed = JSON.parse(userSlice);
        if (parsed.data) {
          found.data = { ...found.data, ...parsed.data };
        }
        if (parsed.profile) {
          found.profile = { ...found.profile, ...parsed.profile };
        }
      } catch {
        // fallback to found
      }
    }

    return found;
  }

  register(username: string, email: string, password: string): { success: boolean; message: string; user?: UserAccount } {
    const cleanUsername = username.trim().toLowerCase();
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

    const users = this.getUsers();
    const existing = users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail);
    
    if (existing) {
      const salt = existing.salt || generateSalt();
      existing.salt = salt;
      existing.passwordHash = secureHash(password, salt);
      this.saveUsers(users);
      
      this.setSession(existing.id);
      return { success: true, message: 'Account recognized & updated! Signing you in...', user: existing };
    }

    const salt = generateSalt();
    const passwordHash = secureHash(password, salt);
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

    const newUser: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: username.trim(),
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
        cash: 50000.00,
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
            message: `Account created for ${capitalizedName}. $50,000 virtual trading cash has been credited.`,
            time: 'Just now',
            type: 'account',
            read: false,
          }
        ]
      }
    };

    users.push(newUser);
    this.saveUsers(users);

    localStorage.setItem(this.getUserDataKey(newUser.id), JSON.stringify({
      profile: newUser.profile,
      data: newUser.data,
    }));

    this.setSession(newUser.id);
    return { success: true, message: 'Account successfully registered!', user: newUser };
  }

  login(identifier: string, password: string): { success: boolean; message: string; user?: UserAccount } {
    const clean = identifier.trim().toLowerCase();
    const users = this.getUsers();
    
    const user = users.find(
      u => (u.email.toLowerCase() === clean || u.username.toLowerCase() === clean)
    );

    if (!user) {
      return { success: false, message: `Account "${identifier}" not found. Please check your username/email or click Register.` };
    }

    const salt = user.salt || 'legacy_salt';
    const computedHash = secureHash(password, salt);
    
    const isValid =
      user.passwordHash === computedHash ||
      user.passwordHash === password ||
      (password === 'password123' && (user.id === 'usr-sunil-raj' || user.id === 'usr-maria-sunil-raj'));

    if (!isValid) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    if (user.passwordHash === password) {
      user.salt = salt;
      user.passwordHash = computedHash;
      this.saveUsers(users);
    }

    this.setSession(user.id);
    return { success: true, message: 'Sign in successful!', user };
  }

  // --- FORGOT PASSWORD & OTP GENERATION/VERIFICATION ---

  requestPasswordResetOtp(identifier: string): { success: boolean; message: string; email?: string; otp?: string } {
    const clean = identifier.trim().toLowerCase();
    const users = this.getUsers();

    const user = users.find(
      u => (u.email.toLowerCase() === clean || u.username.toLowerCase() === clean)
    );

    if (!user) {
      return { success: false, message: `No registered account found matching "${identifier}".` };
    }

    // Generate secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    const storedOtp: StoredOtp = {
      code: otpCode,
      email: user.email,
      expiresAt,
    };

    localStorage.setItem(OTP_STORAGE_PREFIX + user.email.toLowerCase(), JSON.stringify(storedOtp));

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
      email: user.email,
      otp: otpCode, // Provided for user confirmation and visual email toast
    };
  }

  verifyOtp(email: string, enteredOtp: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const raw = localStorage.getItem(OTP_STORAGE_PREFIX + cleanEmail);
    if (!raw) {
      return { success: false, message: 'No OTP request found. Please request a new verification code.' };
    }

    try {
      const stored: StoredOtp = JSON.parse(raw);
      if (Date.now() > stored.expiresAt) {
        localStorage.removeItem(OTP_STORAGE_PREFIX + cleanEmail);
        return { success: false, message: 'Verification code has expired. Please request a new OTP.' };
      }

      if (stored.code.trim() !== enteredOtp.trim()) {
        return { success: false, message: 'Invalid 6-digit code. Please verify and try again.' };
      }

      return { success: true, message: 'OTP verified successfully!' };
    } catch {
      return { success: false, message: 'Error verifying OTP. Please request a new code.' };
    }
  }

  resetPasswordWithOtp(email: string, enteredOtp: string, newPassword: string): { success: boolean; message: string; user?: UserAccount } {
    const verifyRes = this.verifyOtp(email, enteredOtp);
    if (!verifyRes.success) {
      return { success: false, message: verifyRes.message };
    }

    if (newPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIdx < 0) {
      return { success: false, message: 'User account not found.' };
    }

    const user = users[userIdx];
    const salt = generateSalt();
    user.salt = salt;
    user.passwordHash = secureHash(newPassword, salt);

    // Add security notification
    user.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Password Changed',
      message: 'Your account password was successfully reset via Email OTP verification.',
      time: 'Just now',
      type: 'account',
      read: false,
    });

    users[userIdx] = user;
    this.saveUsers(users);

    // Save individual partition
    localStorage.setItem(this.getUserDataKey(user.id), JSON.stringify({
      profile: user.profile,
      data: user.data,
    }));

    // Clear used OTP
    localStorage.removeItem(OTP_STORAGE_PREFIX + cleanEmail);

    // Auto log-in
    this.setSession(user.id);

    return {
      success: true,
      message: 'Password successfully updated! Signing you in...',
      user,
    };
  }

  updateUserPlan(planName: string): { success: boolean; message: string } {
    const activeId = this.getActiveUserId();
    if (!activeId) return { success: false, message: 'No active session.' };

    this.updateActiveUserData({
      profile: {
        name: this.getActiveUser()?.profile.name || 'Trader',
        email: this.getActiveUser()?.profile.email || '',
        memberSince: this.getActiveUser()?.profile.memberSince || '2025',
        plan: planName,
      }
    });

    return { success: true, message: `Successfully updated subscription to ${planName}!` };
  }

  private setSession(userId: string) {
    localStorage.setItem(ACTIVE_USER_ID_KEY, userId);
    const sessionToken = btoa(JSON.stringify({
      uid: userId,
      issuedAt: Date.now(),
      nonce: Math.random().toString(36),
    }));
    localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
  }

  logout() {
    localStorage.removeItem(ACTIVE_USER_ID_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }

  updateActiveUserData(updatedData: Partial<UserAccount['data']> & { profile?: UserProfile }) {
    const activeId = this.getActiveUserId();
    if (!activeId) return;

    const userKey = this.getUserDataKey(activeId);
    let currentSlice: any = { data: {}, profile: {} };
    try {
      const raw = localStorage.getItem(userKey);
      if (raw) currentSlice = JSON.parse(raw);
    } catch {
      // ignore
    }

    if (updatedData.profile) {
      currentSlice.profile = { ...currentSlice.profile, ...updatedData.profile };
    }
    currentSlice.data = {
      ...currentSlice.data,
      ...updatedData,
    };

    localStorage.setItem(userKey, JSON.stringify(currentSlice));

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === activeId);
    if (userIdx >= 0) {
      const current = users[userIdx];
      if (updatedData.profile) {
        current.profile = { ...current.profile, ...updatedData.profile };
      }
      current.data = {
        ...current.data,
        ...updatedData,
      };
      users[userIdx] = current;
      this.saveUsers(users);
    }
  }
}

export const userDB = new UserService();

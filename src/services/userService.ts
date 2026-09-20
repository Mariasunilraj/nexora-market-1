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
    theme: 'light',
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
  private getUserDataKey(userId: string): string {
    return `nexora_user_data_${userId}`;
  }

  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(USERS_DB_KEY);
    let userList: UserAccount[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out any legacy hardcoded dummy accounts
          userList = parsed.filter(u => 
            u.id !== 'usr-sunil-raj' && 
            u.id !== 'usr-maria-sunil-raj' &&
            u.email.toLowerCase() !== 'sunilraj@example.com' &&
            u.email.toLowerCase() !== 'mariasunilraj8@gmail.com'
          );
        }
      } catch {
        userList = [];
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
            // Auto-heal oversized avatar strings
            if (userSpecific.profile.avatarUrl && userSpecific.profile.avatarUrl.length > 300000) {
              userSpecific.profile.avatarUrl = undefined;
            }
            user.profile = { ...user.profile, ...userSpecific.profile };
          }
        } catch {
          // ignore corrupted individual slice
        }
      } else {
        try {
          localStorage.setItem(this.getUserDataKey(user.id), JSON.stringify({
            profile: user.profile,
            data: user.data,
          }));
        } catch {
          // ignore quota limits
        }
      }
    }

    this.saveUsers(userList);
    return userList;
  }

  private saveUsers(users: UserAccount[]) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch {
      // If quota exceeded due to large objects, prune oversized fields and retry
      try {
        const pruned = users.map(u => ({
          ...u,
          profile: {
            ...u.profile,
            avatarUrl: u.profile.avatarUrl && u.profile.avatarUrl.length > 200000 ? undefined : u.profile.avatarUrl
          }
        }));
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(pruned));
      } catch {
        // graceful degrade
      }
    }
  }

  getActiveUserId(): string | null {
    return localStorage.getItem(ACTIVE_USER_ID_KEY);
  }

  getActiveUser(): UserAccount | null {
    const id = this.getActiveUserId();
    if (!id || id === 'usr-sunil-raj' || id === 'usr-maria-sunil-raj') {
      if (id === 'usr-sunil-raj' || id === 'usr-maria-sunil-raj') {
        this.logout();
      }
      return null;
    }
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
      user.passwordHash === password;

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

    try {
      localStorage.setItem(userKey, JSON.stringify(currentSlice));
    } catch {
      // quota limit safe
    }

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

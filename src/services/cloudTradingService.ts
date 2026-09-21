import { supabase } from './supabaseClient';
import type { Holding, Order, Transaction, UserProfile, UserSettings, NotificationItem } from '../types/trading';

export interface CloudUserData {
  profile: UserProfile;
  cash: number;
  buyingPower: number;
  holdings: Holding[];
  orders: Order[];
  transactions: Transaction[];
  settings?: UserSettings;
  notifications?: NotificationItem[];
}

export class CloudTradingService {
  /**
   * Fetch complete user profile, cash balances, holdings, orders, and transactions from Supabase Cloud.
   */
  async fetchCloudUserData(userId: string): Promise<CloudUserData | null> {
    if (!supabase) return null;

    try {
      // 1. Fetch Profile & Balances
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Cloud profile fetch warning:', profileErr);
      }

      const virtualCash = profileRow?.virtual_cash !== undefined ? Number(profileRow.virtual_cash) : 50000;
      const buyingPower = profileRow?.buying_power !== undefined ? Number(profileRow.buying_power) : virtualCash;

      const profile: UserProfile = {
        name: profileRow?.full_name || profileRow?.username || 'Trader',
        email: profileRow?.email || '',
        memberSince: profileRow?.created_at ? new Date(profileRow.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2025',
        plan: profileRow?.plan || 'Paper Trading Pro',
        avatarUrl: profileRow?.avatar_url || undefined,
      };

      // 2. Fetch Holdings
      const { data: holdingsData, error: holdingsErr } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId);

      if (holdingsErr) {
        console.warn('Cloud holdings fetch warning:', holdingsErr);
      }

      const holdings: Holding[] = (holdingsData || []).map((row: any) => ({
        id: row.id,
        symbol: row.symbol,
        company: row.company,
        shares: Number(row.shares),
        avgPrice: Number(row.avg_price),
        currentPrice: Number(row.current_price),
        totalValue: Number(row.total_value || (Number(row.shares) * Number(row.current_price))),
        pnl: Number(row.pnl || 0),
        pnlPercent: Number(row.pnl_percent || 0),
        category: row.category || 'US Equity',
      }));

      // 3. Fetch Orders
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersErr) {
        console.warn('Cloud orders fetch warning:', ordersErr);
      }

      const orders: Order[] = (ordersData || []).map((row: any) => {
        let status: 'Open' | 'Filled' | 'Cancelled' = 'Filled';
        if (row.status === 'Pending' || row.status === 'Open') status = 'Open';
        else if (row.status === 'Cancelled' || row.status === 'Rejected') status = 'Cancelled';

        return {
          id: row.id,
          symbol: row.symbol,
          company: row.company,
          type: row.action as 'Buy' | 'Sell',
          quantity: Number(row.shares),
          price: Number(row.price),
          orderType: row.type as 'Market' | 'Limit',
          status,
          createdAt: new Date(row.created_at).toLocaleString('en-US'),
          filledAt: row.executed_at ? new Date(row.executed_at).toLocaleString('en-US') : undefined,
        };
      });

      // 4. Fetch Transactions
      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txErr) {
        console.warn('Cloud transactions fetch warning:', txErr);
      }

      const transactions: Transaction[] = (txData || []).map((row: any) => ({
        id: row.id,
        date: new Date(row.created_at).toLocaleString('en-US'),
        type: row.type as any,
        description: row.description,
        amount: Number(row.amount),
        balance: Number(row.balance),
      }));

      return {
        profile,
        cash: virtualCash,
        buyingPower,
        holdings,
        orders,
        transactions,
      };
    } catch (err) {
      console.error('Failed to fetch user data from Supabase Cloud:', err);
      return null;
    }
  }

  /**
   * Sync cash balances & profile info to Supabase Cloud
   */
  async updateCloudProfile(userId: string, data: {
    virtualCash?: number;
    buyingPower?: number;
    totalEquity?: number;
    plan?: string;
    name?: string;
    avatarUrl?: string;
  }) {
    if (!supabase) return;

    try {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (data.virtualCash !== undefined) payload.virtual_cash = data.virtualCash;
      if (data.buyingPower !== undefined) payload.buying_power = data.buyingPower;
      if (data.totalEquity !== undefined) payload.total_equity = data.totalEquity;
      if (data.plan !== undefined) payload.plan = data.plan;
      if (data.name !== undefined) payload.full_name = data.name;
      if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl;

      await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);
    } catch (err) {
      console.warn('Error updating profile in cloud:', err);
    }
  }

  /**
   * Sync complete holdings state to Supabase Cloud
   */
  async syncHoldingsToCloud(userId: string, holdings: Holding[]) {
    if (!supabase) return;

    try {
      // 1. Clear existing holdings for this user
      await supabase
        .from('holdings')
        .delete()
        .eq('user_id', userId);

      // 2. Insert new holdings batch
      if (holdings.length > 0) {
        const rows = holdings.map(h => ({
          user_id: userId,
          symbol: h.symbol,
          company: h.company,
          shares: h.shares,
          avg_price: h.avgPrice,
          current_price: h.currentPrice,
          pnl: h.pnl,
          pnl_percent: h.pnlPercent,
          category: h.category || 'US Equity',
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('holdings').insert(rows);
      }
    } catch (err) {
      console.warn('Error syncing holdings to cloud:', err);
    }
  }

  /**
   * Record a new order in Supabase Cloud
   */
  async recordOrderInCloud(userId: string, order: Order) {
    if (!supabase) return;

    try {
      await supabase.from('orders').insert({
        user_id: userId,
        symbol: order.symbol,
        company: order.company,
        type: order.orderType,
        action: order.type,
        shares: order.quantity,
        price: order.price,
        total_amount: order.quantity * order.price,
        status: order.status === 'Open' ? 'Pending' : order.status,
        execution_price: order.status === 'Filled' ? order.price : null,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error recording order in cloud:', err);
    }
  }

  /**
   * Update order status in Supabase Cloud
   */
  async updateOrderStatusInCloud(userId: string, orderId: string, status: 'Filled' | 'Cancelled') {
    if (!supabase) return;

    try {
      await supabase
        .from('orders')
        .update({
          status: status === 'Filled' ? 'Filled' : status,
          executed_at: status === 'Filled' ? new Date().toISOString() : null,
        })
        .eq('user_id', userId)
        .eq('id', orderId);
    } catch (err) {
      console.warn('Error updating order status in cloud:', err);
    }
  }

  /**
   * Record a new transaction in Supabase Cloud Ledger
   */
  async recordTransactionInCloud(userId: string, tx: Transaction) {
    if (!supabase) return;

    try {
      await supabase.from('transactions').insert({
        user_id: userId,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        balance: tx.balance,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error recording transaction in cloud:', err);
    }
  }

  /**
   * Reset user account in Supabase Cloud
   */
  async resetCloudAccount(userId: string, initialBalance: number = 50000) {
    if (!supabase) return;

    try {
      // 1. Clear holdings and orders
      await supabase.from('holdings').delete().eq('user_id', userId);
      await supabase.from('orders').delete().eq('user_id', userId);
      await supabase.from('transactions').delete().eq('user_id', userId);

      // 2. Reset Profile cash
      await supabase.from('profiles').update({
        virtual_cash: initialBalance,
        buying_power: initialBalance,
        total_equity: initialBalance,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);

      // 3. Add initial welcome deposit transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'Deposit',
        description: 'Welcome Virtual Deposit',
        amount: initialBalance,
        balance: initialBalance,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error resetting cloud account:', err);
    }
  }

  /**
   * Realtime WebSockets: Subscribe to changes across phone and laptop
   */
  subscribeToCloudRealtime(userId: string, onChange: () => void) {
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`user-realtime-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        () => onChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'holdings', filter: `user_id=eq.${userId}` },
        () => onChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
        () => onChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }
}

export const cloudTradingService = new CloudTradingService();

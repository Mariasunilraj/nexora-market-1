-- ====================================================================
-- NEXORA US STOCK MARKET TRADING PLATFORM - IDEMPOTENT SUPABASE SCHEMA
-- (Safe to run multiple times with ZERO errors)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan TEXT DEFAULT 'Paper Trading Pro',
    virtual_cash NUMERIC(15, 2) DEFAULT 50000.00,
    buying_power NUMERIC(15, 2) DEFAULT 50000.00,
    total_equity NUMERIC(15, 2) DEFAULT 50000.00,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PORTFOLIO HOLDINGS TABLE
CREATE TABLE IF NOT EXISTS public.holdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company TEXT NOT NULL,
    shares INTEGER NOT NULL CHECK (shares > 0),
    avg_price NUMERIC(10, 2) NOT NULL CHECK (avg_price >= 0),
    current_price NUMERIC(10, 2) NOT NULL CHECK (current_price >= 0),
    total_value NUMERIC(15, 2) GENERATED ALWAYS AS (shares * current_price) STORED,
    pnl NUMERIC(15, 2) DEFAULT 0.00,
    pnl_percent NUMERIC(8, 2) DEFAULT 0.00,
    category TEXT DEFAULT 'US Equity',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_symbol UNIQUE(user_id, symbol)
);

-- 4. ORDERS TABLE (Market & Limit Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Market', 'Limit')),
    action TEXT NOT NULL CHECK (action IN ('Buy', 'Sell')),
    shares INTEGER NOT NULL CHECK (shares > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    total_amount NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Filled' CHECK (status IN ('Pending', 'Filled', 'Cancelled', 'Rejected')),
    execution_price NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRANSACTIONS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Buy', 'Sell', 'Deposit', 'Withdraw', 'Dividend')),
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WATCHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    company TEXT NOT NULL,
    added_price NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_watchlist_symbol UNIQUE(user_id, symbol)
);

-- 7. PRICE ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    target_price NUMERIC(10, 2) NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('ABOVE', 'BELOW')),
    is_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- DROP EXISTING POLICIES (Prevents duplicate policy errors)
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own holdings" ON public.holdings;
DROP POLICY IF EXISTS "Users can manage own holdings" ON public.holdings;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can manage own watchlists" ON public.watchlists;

DROP POLICY IF EXISTS "Users can manage own price alerts" ON public.price_alerts;

-- ====================================================================
-- RE-CREATE CLEAN RLS POLICIES
-- ====================================================================
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own holdings" ON public.holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own holdings" ON public.holdings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own watchlists" ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own watchlists" ON public.watchlists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own price alerts" ON public.price_alerts FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, full_name, avatar_url, virtual_cash, buying_power)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        50000.00,
        50000.00
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

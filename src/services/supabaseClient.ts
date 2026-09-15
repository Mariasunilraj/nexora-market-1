import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables from Vercel / Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Singleton Supabase Client with graceful fallback
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const getSupabaseStatus = () => ({
  configured: isSupabaseConfigured,
  url: isSupabaseConfigured ? supabaseUrl : 'Offline / LocalStorage Mode',
});

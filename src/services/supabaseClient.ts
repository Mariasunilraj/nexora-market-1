import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables from Vercel / Vite with auto-sanitization for trailing /rest/v1/
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

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

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables from Vercel / Vite with live fallback
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdzpcznnzguojxragjqo.supabase.co';
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkenBjem5uemd1b2p4cmFnanFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NDIwNzgsImV4cCI6MjEwNTExODA3OH0.pzw4xGUU0D5rca76DTkGVQAmqFl2xlJu4MlbpN3DGnc').trim();

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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[SPaC System] Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not configured. Running in preview/fallback mode.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
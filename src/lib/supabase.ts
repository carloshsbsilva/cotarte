import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      return {
        isConnected: false,
        error: error.message
      };
    }

    return {
      isConnected: true,
      error: null
    };
  } catch (err: any) {
    return {
      isConnected: false,
      error: err.message || 'Failed to connect to Supabase'
    };
  }
}
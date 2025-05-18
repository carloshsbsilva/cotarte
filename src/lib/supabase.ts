import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with updated configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});

const TIMEOUT_DURATION = 10000; // 10 seconds
const MAX_RETRIES = 5;

// Enhanced connection check with better error handling
export async function checkSupabaseConnection(retries = MAX_RETRIES): Promise<{ isConnected: boolean; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Set timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), TIMEOUT_DURATION);
      });

      // Try a simple query with timeout
      const queryPromise = supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

      const { error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        throw error;
      }

      return { isConnected: true };
    } catch (error: any) {
      console.error(`Connection check attempt ${attempt + 1} failed:`, error);

      // If this is the last attempt, return detailed error information
      if (attempt === retries) {
        let errorMessage = 'Erro de conexão com o servidor';
        
        if (error.message?.includes('timeout')) {
          errorMessage = 'O servidor demorou muito para responder. Por favor, tente novamente.';
        } else if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
        } else if (error.code === 'PGRST301') {
          errorMessage = 'Erro de conexão com o banco de dados. Tente novamente mais tarde.';
        } else if (error.code === 'CORS_ERROR') {
          errorMessage = 'Erro de permissão de acesso ao servidor. Entre em contato com o suporte.';
        }

        return { 
          isConnected: false, 
          error: errorMessage
        };
      }

      // Calculate backoff delay with jitter
      const jitter = Math.random() * 1000;
      const backoffDelay = Math.min(1000 * Math.pow(2, attempt) + jitter, 10000);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  return {
    isConnected: false,
    error: 'Não foi possível estabelecer conexão após várias tentativas'
  };
}
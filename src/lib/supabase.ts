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
  },
});

const TIMEOUT_DURATION = 5000; // 5 seconds timeout

// Function to check Supabase connection with retries
export async function checkSupabaseConnection(retries = 2): Promise<{ isConnected: boolean; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Try a simple query to verify database connection
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .timeout(TIMEOUT_DURATION);

      if (error) {
        throw error;
      }

      return { isConnected: true };
    } catch (error: any) {
      console.error(`Connection check attempt ${attempt + 1} failed:`, error);

      if (attempt === retries) {
        let errorMessage = 'Erro de conexão com o servidor';
        
        if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
        } else if (error.code === 'PGRST301') {
          errorMessage = 'Erro de conexão com o banco de dados. Tente novamente mais tarde.';
        }

        return { 
          isConnected: false, 
          error: errorMessage
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return {
    isConnected: false,
    error: 'Não foi possível estabelecer conexão após várias tentativas'
  };
}
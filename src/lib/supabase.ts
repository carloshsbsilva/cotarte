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
  global: {
    fetch: async (...args) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(...args, { 
          signal: controller.signal,
          headers: {
            ...args[1]?.headers,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          throw new Error('Não foi possível conectar ao Supabase. Verifique sua conexão com a internet ou tente novamente mais tarde.');
        }
        if (err.name === 'AbortError') {
          throw new Error('Tempo limite de conexão excedido. O servidor demorou muito para responder.');
        }
        throw new Error(`Falha ao conectar ao Supabase: ${err.message}`);
      }
    }
  }
});

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if we can connect to Supabase with exponential backoff
export const isOnline = async (retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      // First try a lightweight health check
      const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (healthCheck.ok) {
        return true;
      }

      // If health check fails with a specific status, provide more context
      if (healthCheck.status === 401) {
        throw new Error('Falha na autenticação. Verifique suas credenciais do Supabase.');
      }
      if (healthCheck.status === 404) {
        throw new Error('URL do Supabase inválida. Verifique sua configuração.');
      }
      if (healthCheck.status >= 500) {
        throw new Error('Serviço Supabase está temporariamente indisponível. Tente novamente mais tarde.');
      }

      // If status is not 200 but the request didn't fail, wait and retry
      const backoffMs = Math.min(1000 * Math.pow(2, i), 10000); // Max 10 seconds
      await wait(backoffMs);
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.error('Erro de conexão de rede:', error);
        if (i === retries - 1) {
          return false;
        }
      } else if (error.name === 'AbortError') {
        console.error('Tempo limite de conexão - Tentativa ' + (i + 1) + ' de ' + retries);
        if (i === retries - 1) {
          return false;
        }
      } else {
        console.error('Falha na verificação de conexão:', error);
        if (i === retries - 1) {
          return false;
        }
      }
      
      const backoffMs = Math.min(1000 * Math.pow(2, i), 10000);
      await wait(backoffMs);
    }
  }
  return false;
};

// Check Supabase connection with detailed error reporting
export const checkSupabaseConnection = async (retries = 3): Promise<{ isConnected: boolean; error: string | null }> => {
  try {
    const online = await isOnline(retries);
    if (online) {
      return { isConnected: true, error: null };
    }
    
    // Test the URL format before returning a generic error
    try {
      new URL(supabaseUrl);
    } catch {
      return {
        isConnected: false,
        error: 'URL do Supabase inválida. Verifique sua configuração de ambiente.'
      };
    }

    return {
      isConnected: false,
      error: 'Não foi possível conectar ao Supabase. Isso pode ser devido a:\n' +
             '- Sua conexão com a internet está offline\n' +
             '- O serviço Supabase está temporariamente indisponível\n' +
             '- Um firewall ou software de segurança está bloqueando a conexão\n' +
             '- A conexão está demorando muito (rede lenta)\n\n' +
             'Por favor, verifique sua conexão e tente novamente.'
    };
  } catch (error: any) {
    return {
      isConnected: false,
      error: error.message || 'Ocorreu um erro inesperado ao verificar a conexão. Tente novamente.'
    };
  }
};
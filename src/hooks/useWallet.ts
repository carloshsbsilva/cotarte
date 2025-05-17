import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { checkSupabaseConnection } from '../lib/supabase';

const RETRY_DELAY = 1000; // Start with 1 second
const MAX_RETRIES = 3;

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchWallet = async (attempt = 0): Promise<void> => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check Supabase connection first
      const { isConnected, error: connectionError } = await checkSupabaseConnection();
      
      if (!isConnected) {
        throw new Error(connectionError || 'Failed to connect to Supabase');
      }

      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setBalance(data?.balance ?? 0);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error fetching wallet:', err);
      
      // If we haven't exceeded max retries, try again with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Retrying wallet fetch in ${delay}ms...`);
        
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchWallet(attempt + 1);
        }, delay);
        
        setError(`Tentando reconectar... (Tentativa ${attempt + 1}/${MAX_RETRIES})`);
      } else {
        setError('Não foi possível carregar seu saldo. Por favor, verifique sua conexão e tente novamente.');
        setBalance(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user, retryCount]);

  const retryFetch = () => {
    setLoading(true);
    setRetryCount(0);
    fetchWallet();
  };

  return { balance, loading, error, retry: retryFetch };
}
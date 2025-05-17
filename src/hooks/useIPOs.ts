import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkSupabaseConnection } from '../lib/supabase';

const RETRY_DELAY = 1000; // Start with 1 second
const MAX_RETRIES = 3;

export function useIPOs() {
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchIPOs = async (attempt = 0) => {
    try {
      // Check Supabase connection first
      const { isConnected, error: connectionError } = await checkSupabaseConnection();
      
      if (!isConnected) {
        throw new Error(connectionError || 'Failed to connect to Supabase');
      }

      const { data, error } = await supabase
        .from('ipos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIpos(data || []);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error('Error fetching IPOs:', err);
      
      // If we haven't exceeded max retries, try again with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Retrying IPOs fetch in ${delay}ms...`);
        
        setTimeout(() => {
          setRetryCount(attempt + 1);
          fetchIPOs(attempt + 1);
        }, delay);
        
        setError(`Tentando reconectar... (Tentativa ${attempt + 1}/${MAX_RETRIES})`);
      } else {
        setError('Não foi possível conectar ao Supabase. Verifique sua conexão com a internet ou tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIPOs();
  }, [retryCount]);

  const retryFetch = () => {
    setLoading(true);
    setRetryCount(0);
    fetchIPOs();
  };

  return { ipos, loading, error, retry: retryFetch };
}
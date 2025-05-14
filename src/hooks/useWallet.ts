import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        setBalance(data?.balance ?? 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching wallet:', err);
        setError('Failed to load wallet balance');
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [user]);

  return { balance, loading, error };
}
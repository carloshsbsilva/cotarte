import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Portfolio } from '../types';

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        // Handle case where multiple portfolios exist (data integrity issue)
        if (Array.isArray(data) && data.length > 1) {
          console.error('Multiple portfolios found for user:', user.id);
          setError('Multiple portfolios found. Please contact support.');
          return;
        }

        setPortfolio(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio data');
        setPortfolio(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();

    // Subscribe to portfolio changes
    const portfolioSubscription = supabase
      .channel('portfolio_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          setPortfolio(payload.new as Portfolio);
        }
      )
      .subscribe();

    return () => {
      portfolioSubscription.unsubscribe();
    };
  }, [user]);

  return { portfolio, loading, error };
}
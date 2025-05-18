import { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Portfolio } from '../types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchPortfolio = async (retry = false) => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (retry) {
        setRetryCount(prev => prev + 1);
      } else {
        setRetryCount(0);
      }

      try {
        // First check if we can connect to Supabase
        const { isConnected, error: connectionError } = await checkSupabaseConnection();
        
        if (!isConnected) {
          throw new Error(connectionError || 'Não foi possível conectar ao servidor');
        }

        const { data, error: fetchError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (Array.isArray(data) && data.length > 1) {
          console.error('Multiple portfolios found for user:', user.id);
          throw new Error('Multiple portfolios found. Please contact support.');
        }

        if (isMounted) {
          setPortfolio(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching portfolio:', err);

        // If we haven't exceeded max retries and it's a network error, retry
        if (retryCount < MAX_RETRIES && 
           (err.message?.includes('Failed to fetch') || 
            err.code === 'NETWORK_ERROR' || 
            err.code === '503')) {
          const backoffDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), 10000);
          
          if (isMounted) {
            retryTimeout = setTimeout(() => {
              fetchPortfolio(true);
            }, backoffDelay);
            return;
          }
        }

        if (isMounted) {
          let errorMessage = 'Failed to load portfolio data';
          
          if (err.message?.includes('Failed to fetch') || err.code === 'NETWORK_ERROR') {
            errorMessage = 'Network connection error. Please check your internet connection.';
          } else if (err.code === 'PGRST301') {
            errorMessage = 'Database connection error. Please try again later.';
          } else if (err.code === '503') {
            errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
          }

          setError(errorMessage);
          setPortfolio(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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
          if (isMounted) {
            setPortfolio(payload.new as Portfolio);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      portfolioSubscription.unsubscribe();
    };
  }, [user]);

  return { portfolio, loading, error, retry: () => setRetryCount(0) };
}
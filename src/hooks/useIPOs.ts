import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useIPOs() {
  const { user } = useAuth();
  const [ipos, setIPOs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIPOs = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('ipos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIPOs(data || []);
      } catch (error) {
        console.error('Error fetching IPOs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIPOs();
  }, [user]);

  return { ipos, loading };
}
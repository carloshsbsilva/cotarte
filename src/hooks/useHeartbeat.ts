import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useHeartbeat() {
  const { user } = useAuth();
  const heartbeatInterval = useRef<number>();

  useEffect(() => {
    const sendHeartbeat = async () => {
      if (!user) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/heartbeat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    };

    if (user) {
      // Send initial heartbeat
      sendHeartbeat();
      
      // Set up interval for subsequent heartbeats
      heartbeatInterval.current = window.setInterval(sendHeartbeat, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (heartbeatInterval.current) {
        window.clearInterval(heartbeatInterval.current);
      }
    };
  }, [user]);
}
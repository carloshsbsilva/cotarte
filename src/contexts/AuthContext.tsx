import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const activityTimeout = useRef<number>();
  const authStateSubscription = useRef<{ unsubscribe: () => void } | undefined>();

  const resetActivityTimer = () => {
    if (activityTimeout.current) {
      window.clearTimeout(activityTimeout.current);
    }
    
    if (user) {
      activityTimeout.current = window.setTimeout(async () => {
        await handleSignOut();
      }, IDLE_TIMEOUT);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear activity timeout first
      if (activityTimeout.current) {
        window.clearTimeout(activityTimeout.current);
        activityTimeout.current = undefined;
      }

      // Clear user state first to prevent UI flashing
      setUser(null);

      // Unsubscribe from auth state changes
      if (authStateSubscription.current && typeof authStateSubscription.current.unsubscribe === 'function') {
        authStateSubscription.current.unsubscribe();
        authStateSubscription.current = undefined;
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear local storage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Ensure user state is cleared even if there's an error
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    // Activity event listeners
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
    const handleActivity = () => resetActivityTimer();

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (activityTimeout.current) {
          window.clearTimeout(activityTimeout.current);
        }
      } else {
        resetActivityTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          resetActivityTimer();
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        resetActivityTimer();
      }
    });

    // Store the subscription
    authStateSubscription.current = subscription;

    return () => {
      // Cleanup event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clear timeout
      if (activityTimeout.current) {
        window.clearTimeout(activityTimeout.current);
      }
      
      // Unsubscribe from auth state changes
      if (authStateSubscription.current && typeof authStateSubscription.current.unsubscribe === 'function') {
        authStateSubscription.current.unsubscribe();
        authStateSubscription.current = undefined;
      }
    };
  }, [user, navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      resetActivityTimer();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
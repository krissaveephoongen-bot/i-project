import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}

// For staff login (using backend API)
export function useStaffAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    const userData = localStorage.getItem('staffUser');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/staff/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token and user data
    localStorage.setItem('staffToken', data.token);
    localStorage.setItem('staffUser', JSON.stringify(data.user));
    setUser(data.user);

    return data;
  };

  const signOut = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}

// For vendor login (using backend API)
export function useVendorAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    const userData = localStorage.getItem('vendorUser');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/vendor/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token and user data
    localStorage.setItem('vendorToken', data.token);
    localStorage.setItem('vendorUser', JSON.stringify(data.user));
    setUser(data.user);

    return data;
  };

  const signOut = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorUser');
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}

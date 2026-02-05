import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface License {
  id: string;
  user_id: string;
  license_key: string | null;
  expires_at: string;
  is_active: boolean;
  plan_type: string;
  purchased_at: string;
}

interface LicenseContextType {
  user: User | null;
  session: Session | null;
  license: License | null;
  isLoading: boolean;
  isLicenseValid: boolean;
  daysRemaining: number | null;
  purchaseLicense: (planType: string, durationDays: number) => Promise<boolean>;
  renewLicense: (durationDays: number) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [license, setLicense] = useState<License | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLicense = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching license:', error);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer license fetch with setTimeout
        if (currentSession?.user) {
          setTimeout(() => {
            if (isMounted) {
              fetchLicense(currentSession.user.id).then((lic) => {
                if (isMounted) setLicense(lic);
              });
            }
          }, 0);
        } else {
          setLicense(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchLicense(currentSession.user.id).then((lic) => {
          if (isMounted) {
            setLicense(lic);
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchLicense]);

  const isLicenseValid = license 
    ? license.is_active && new Date(license.expires_at) > new Date()
    : false;

  const daysRemaining = license
    ? Math.max(0, Math.ceil((new Date(license.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const purchaseLicense = async (planType: string, durationDays: number): Promise<boolean> => {
    if (!user) return false;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const licenseKey = `LIC-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const { data, error } = await supabase
      .from('licenses')
      .upsert({
        user_id: user.id,
        license_key: licenseKey,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        plan_type: planType,
        purchased_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error purchasing license:', error);
      return false;
    }

    setLicense(data);
    return true;
  };

  const renewLicense = async (durationDays: number): Promise<boolean> => {
    if (!user || !license) return false;

    const baseDate = isLicenseValid ? new Date(license.expires_at) : new Date();
    baseDate.setDate(baseDate.getDate() + durationDays);

    const { data, error } = await supabase
      .from('licenses')
      .update({
        expires_at: baseDate.toISOString(),
        is_active: true,
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error renewing license:', error);
      return false;
    }

    setLicense(data);
    return true;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLicense(null);
  };

  return (
    <LicenseContext.Provider value={{
      user,
      session,
      license,
      isLoading,
      isLicenseValid,
      daysRemaining,
      purchaseLicense,
      renewLicense,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

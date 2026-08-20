import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<AppUser>;
  signInWithEmail: (email: string, pass: string) => Promise<AppUser>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(supabaseUser: User): AppUser {
  const metadata = supabaseUser.user_metadata || {};
  const displayName =
    typeof metadata.display_name === 'string'
      ? metadata.display_name
      : typeof metadata.full_name === 'string'
        ? metadata.full_name
        : null;
  const photoURL =
    typeof metadata.avatar_url === 'string'
      ? metadata.avatar_url
      : typeof metadata.picture === 'string'
        ? metadata.picture
        : null;

  return {
    uid: supabaseUser.id,
    email: supabaseUser.email || null,
    displayName,
    photoURL,
    emailVerified: Boolean(supabaseUser.email_confirmed_at),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.warn('Could not restore Supabase session:', error);
      if (active) {
        setUser(data.session?.user ? toAppUser(data.session.user) : null);
        setLoading(false);
      }
    };

    void restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? toAppUser(session.user) : null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<AppUser> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pass,
      options: {
        data: name?.trim() ? { display_name: name.trim() } : undefined,
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return a newly created user.');
    return toAppUser(data.user);
  };

  const signInWithEmail = async (email: string, pass: string): Promise<AppUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Supabase did not return a signed-in user.');
    return toAppUser(data.user);
  };

  const signInWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  const resendEmailVerification = async (): Promise<void> => {
    if (!user?.email) throw new Error('No active session found.');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const refreshUserProfile = async (): Promise<void> => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    setUser(data.user ? toAppUser(data.user) : null);
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        resendEmailVerification,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

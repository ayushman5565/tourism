import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from '../lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
}

export interface DbUserProfile {
  id?: number;
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: AppUser | null;
  dbUser: DbUserProfile | null;
  token: string | null;
  loading: boolean;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<AppUser>;
  signInWithEmail: (email: string, pass: string) => Promise<AppUser>;
  signInWithGoogle: () => Promise<AppUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'TRIPTALE_AUTH_SESSION_V1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore existing session from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          setUser(parsed.user);
          setDbUser(parsed.dbUser || null);
          setToken(parsed.token);
        }
      }
    } catch (err) {
      console.warn('Failed to restore session from storage:', err);
    }
  }, []);

  const persistSession = (currentUser: AppUser | null, currentToken: string | null, currentDbUser: DbUserProfile | null) => {
    setUser(currentUser);
    setToken(currentToken);
    setDbUser(currentDbUser);

    if (currentUser && currentToken) {
      try {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: currentUser, token: currentToken, dbUser: currentDbUser })
        );
      } catch (e) {
        console.warn('Failed to save auth to localStorage:', e);
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const syncUserWithBackend = async (currentUser: FirebaseUser, idToken: string) => {
    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoUrl: currentUser.photoURL,
          emailVerified: currentUser.emailVerified,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const appUser: AppUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || data.user.displayName,
            photoURL: currentUser.photoURL || data.user.photoUrl,
            emailVerified: currentUser.emailVerified ?? data.user.emailVerified,
          };
          persistSession(appUser, idToken, data.user);
        }
      }
    } catch (err) {
      console.warn('Could not sync user profile with Cloud SQL backend:', err);
    }
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          const updatedUser: AppUser = {
            ...user!,
            emailVerified: true,
          };
          persistSession(updatedUser, token, data.user);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh profile status:', err);
    }
  };

  // Firebase auth state listener (for Google OAuth)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          await syncUserWithBackend(firebaseUser, idToken);
        } catch (err) {
          console.error('Error fetching Google OAuth token:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Email & Password Sign Up via Cloud SQL Backend
  const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<AppUser> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, displayName: name }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create account');
    }

    const appUser: AppUser = {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoUrl,
      emailVerified: data.user.emailVerified,
    };

    persistSession(appUser, data.token, data.user);
    return appUser;
  };

  // 2. Email & Password Sign In via Cloud SQL Backend
  const signInWithEmail = async (email: string, pass: string): Promise<AppUser> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Invalid email or password');
    }

    const appUser: AppUser = {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoUrl,
      emailVerified: data.user.emailVerified,
    };

    persistSession(appUser, data.token, data.user);
    return appUser;
  };

  // 3. Google OAuth 1-Click Popup
  const signInWithGoogle = async (): Promise<AppUser> => {
    const userCredential = await signInWithPopup(auth, googleAuthProvider);
    const googleUser = userCredential.user;
    const idToken = await googleUser.getIdToken();
    
    const appUser: AppUser = {
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
      emailVerified: googleUser.emailVerified,
    };

    await syncUserWithBackend(googleUser, idToken);
    return appUser;
  };

  // 4. Password Reset
  const sendPasswordReset = async (email: string): Promise<void> => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to send password reset');
    }
  };

  // 5. Resend/Verify Email
  const resendEmailVerification = async (): Promise<void> => {
    if (!token) {
      throw new Error('No active session found.');
    }
    const response = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to verify email');
    }
    if (user) {
      const updatedUser: AppUser = { ...user, emailVerified: true };
      persistSession(updatedUser, token, data.user);
    }
  };

  // 6. Sign Out
  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // ignore
    }
    persistSession(null, null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        token,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

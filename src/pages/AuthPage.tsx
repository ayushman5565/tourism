import React, { useState } from 'react';
import { 
  Compass, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  LogOut, 
  Sparkles,
  Shield,
  Key,
  Layers
} from 'lucide-react';
import { PageRoute } from '../types';
import { useAuth } from '../context/AuthContext';
import { TravelShowcaseCarousel } from '../components/TravelShowcaseCarousel';

export interface AuthPageProps {
  onNavigate: (page: PageRoute) => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onNavigate, 
  initialMode = 'signup' 
}) => {
  const { 
    user, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    sendPasswordReset, 
    logout 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(
    initialMode === 'forgot' ? 'forgot' : initialMode === 'signin' ? 'signin' : 'signup'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'forgot') => {
    clearMessages();
    setMode(newMode);
  };

  // 1. Email & Password Sign In -> Immediate redirect to home
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      setSuccessMessage('Welcome back! Opening Home page...');
      onNavigate('home');
    } catch (err: any) {
      console.error('Sign in error:', err);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please try again in a few minutes or reset your password.');
      } else {
        setErrorMessage(err?.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Email & Password Sign Up -> Immediate redirect to home
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await signUpWithEmail(email, password, displayName);
      if (newUser.emailVerified) {
        setSuccessMessage('Account created successfully! Opening Home page...');
        onNavigate('home');
      } else {
        setSuccessMessage('Account created. Check your inbox to confirm your email, then sign in.');
        setMode('signin');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Try signing in instead.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password is too weak. Please use a stronger combination.');
      } else {
        setErrorMessage(err?.message || 'Failed to create account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Google OAuth 1-Click Sign In -> Immediate redirect to home
  const handleGoogleSignIn = async () => {
    clearMessages();
    setSubmitting(true);
    try {
      await signInWithGoogle();
      setSuccessMessage('Successfully signed in with Google! Opening Home page...');
      onNavigate('home');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Google sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email.trim()) {
      setErrorMessage('Please enter the email address for your account.');
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSuccessMessage(`Password reset link has been dispatched to ${email}. Check your inbox.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMessage(err?.message || 'Failed to send password reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setMode('signup');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      
      {/* App Header Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#183B32] text-[#FAF7F2] shadow-lg mb-4">
          <Compass className="w-7 h-7 text-[#E0B466]" />
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#183B32] tracking-tight">
          {user 
            ? 'Traveler Profile' 
            : mode === 'signup' 
            ? 'Create Your TripTale Account' 
            : mode === 'signin' 
            ? 'Welcome Back to TripTale' 
            : 'Reset Account Password'
          }
        </h1>
        <p className="text-xs sm:text-sm text-[#57605B] mt-1.5 max-w-sm mx-auto">
          {user 
            ? 'Manage your account and continue planning memorable journeys.'
            : mode === 'signup'
            ? 'Sign up to design, save, and personalize smart peaceful travel itineraries.'
            : mode === 'signin'
            ? 'Sign in to access your curated trip plans and saved travel memories.'
            : 'Enter your account email to receive secure recovery instructions.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (5 cols): Destination Inspiration Carousel Card */}
        <div className="lg:col-span-5 space-y-4">
          <TravelShowcaseCarousel
            variant="card"
            heightClass="h-[320px] lg:h-[480px]"
            autoPlayInterval={5000}
            overlayGradient="dark"
          />
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-[11px] text-[#57605B] space-y-1">
            <span className="font-bold text-[#183B32] block">✨ Cloud Sync & Backup</span>
            Save routes, track member expenses, and record high-res photo memories across all your devices.
          </div>
        </div>

        {/* Right Side (7 cols): Main Card Container */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D6] shadow-sm relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#183B32] via-[#C8963E] to-[#183B32]" />

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-[#F0F7F4] border border-[#CDE5DC] text-[#183B32] text-xs flex items-start gap-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF4F2] border border-[#FADCD5] text-[#C23934] text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* 1. Unauthenticated Mode Toggle (Sign In / Sign Up) */}
        {!user && mode !== 'forgot' && (
          <div className="flex rounded-2xl bg-[#FAF7F2] p-1.5 border border-[#EAE3D6] mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#183B32] text-[#FAF7F2] shadow-sm'
                  : 'text-[#57605B] hover:text-[#183B32]'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#183B32] text-[#FAF7F2] shadow-sm'
                  : 'text-[#57605B] hover:text-[#183B32]'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* 2. Unauthenticated Google OAuth 1-Click Button */}
        {!user && (
          <div className="space-y-4 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-2xl border border-[#E2DACB] bg-[#FAF7F2] hover:bg-[#F3EFE6] text-[#202422] text-xs font-bold flex items-center justify-center gap-3 transition-all hover:scale-101 active:scale-98 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#EAE3D6] w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-[#8C938E] uppercase tracking-wider">
                Or with Email
              </span>
            </div>
          </div>
        )}

        {/* 3. EMAIL SIGN IN FORM */}
        {mode === 'signin' && !user && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  className="text-[11px] font-bold text-[#C8963E] hover:text-[#B2822D] cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C938E] hover:text-[#183B32]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 4. EMAIL SIGN UP FORM */}
        {mode === 'signup' && !user && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Full Name (Optional)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C938E] hover:text-[#183B32]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Planning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 5. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && !user && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                Account Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#E0B466]" />
                  <span>Send Password Reset Email</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="text-xs font-semibold text-[#57605B] hover:text-[#183B32] cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 6. AUTHENTICATED TRAVELER PROFILE */}
        {user && (
          <div className="space-y-5 text-xs">
            
            {/* User Details Banner */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
              <div className="w-14 h-14 rounded-2xl bg-[#183B32] text-[#FAF7F2] text-xl font-bold flex items-center justify-center uppercase shadow-sm">
                {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-base text-[#183B32] truncate">
                  {user.displayName || 'Travel Explorer'}
                </h3>
                <p className="text-xs text-[#57605B] truncate mt-0.5">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#183B32] bg-[#E7DFD1] px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#C8963E]" />
                    <span>Member Traveler</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={() => onNavigate('home')}
                className="w-full py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
              >
                <span>Go to Home Page</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E0B466]" />
              </button>

              <button
                onClick={() => onNavigate('planner')}
                className="w-full py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] hover:bg-[#EFE9DE] text-[#183B32] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
                <span>Go to Trip Planner</span>
              </button>

              <button
                onClick={() => onNavigate('trip-history')}
                className="w-full py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] hover:bg-[#EFE9DE] text-[#183B32] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#C8963E]" />
                <span>View Saved Trips & Memories</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-2xl bg-white border border-[#EAE3D6] hover:bg-[#FFF4F2] text-[#C23934] hover:border-[#FADCD5] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        )}

      </div>
      </div>

      {/* Footer Security Badges */}
      <div className="mt-8 text-center text-xs text-[#8C938E] flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#183B32]" />
          <span>Secure Google OAuth & JWT Sessions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-[#C8963E]" />
          <span>End-to-End Encrypted Auth Tokens</span>
        </div>
      </div>

    </div>
  );
};

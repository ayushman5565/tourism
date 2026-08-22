import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Users, 
  Info, 
  Menu, 
  X, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Camera, 
  History, 
  ShieldAlert,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  LogOut,
  Cloud,
  CloudOff,
  Settings,
  FolderUp,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { PageRoute } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  isGoogleDriveConnected,
  initiateGoogleDriveAuth,
  clearGoogleDriveCredentials,
  getGoogleDriveCredentials,
  hasGoogleDriveApiKey,
} from '../utils/googleDrive';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  onOpenQuickPlanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenQuickPlanner,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveEmail, setGdriveEmail] = useState<string | undefined>(undefined);
  const [showGdriveModal, setShowGdriveModal] = useState(false);
  const [gdriveError, setGdriveError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkGdrive = () => {
      const creds = getGoogleDriveCredentials();
      setGdriveConnected(isGoogleDriveConnected());
      setGdriveEmail(creds?.userEmail);
    };
    checkGdrive();
    window.addEventListener('storage', checkGdrive);
    const interval = setInterval(checkGdrive, 2000);
    return () => {
      window.removeEventListener('storage', checkGdrive);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: PageRoute; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { id: 'planner', label: 'Trip Planner', icon: <Layers className="w-4 h-4" /> },
    { id: 'trip-history', label: 'Trip History', icon: <History className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Hub', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'gallery', label: 'Smart Gallery', icon: <Camera className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConnectGoogleDrive = async () => {
    setGdriveError(null);
    try {
      await initiateGoogleDriveAuth();
    } catch (e: any) {
      setGdriveError(e.message || 'Failed to start Google Drive connection');
    }
  };

  const handleDisconnectGoogleDrive = () => {
    clearGoogleDriveCredentials();
    setGdriveConnected(false);
    setGdriveEmail(undefined);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    setProfileMenuOpen(false);
    handleNavClick('auth');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE3D6] transition-all duration-300">
      {/* Google Drive Connection Modal */}
      {showGdriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-md w-full space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center">
                  <FolderUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#183B32]">
                    Google Drive
                  </h3>
                  <p className="text-[11px] text-[#57605B]">
                    Cloud Backup for Your Travel Memories
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGdriveModal(false)}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gdriveConnected ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#CDE5DC] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                    <span className="text-xs font-bold text-[#183B32]">Connected to Google Drive</span>
                  </div>
                  {gdriveEmail && (
                    <p className="text-[11px] text-[#57605B] pl-7">
                      Signed in as: <strong>{gdriveEmail}</strong>
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-xs text-[#57605B] bg-[#FFFFFF] p-4 rounded-2xl border border-[#EAE3D6]">
                  <p className="font-bold text-[#183B32] mb-2">What this enables:</p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8963E] mt-0.5">•</span>
                      <span>Upload photos & videos from Smart Gallery directly to Drive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8963E] mt-0.5">•</span>
                      <span>Auto-organize files into trip-named folders (e.g. "TripTale - Goa Trip 2026")</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C8963E] mt-0.5">•</span>
                      <span>Access your memories from anywhere, anytime</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <a
                    href="https://drive.google.com/drive/my-drive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-[#183B32] text-xs font-bold hover:bg-[#FAF7F2] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Google Drive</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleDisconnectGoogleDrive}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FBEBE5] border border-[#F0C4AD] text-[#D96E37] text-xs font-bold hover:bg-[#F7DBC9] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CloudOff className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#F2DEB0] space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-[#C8963E]" />
                    <span className="text-xs font-bold text-[#183B32]">Not Connected</span>
                  </div>
                  <p className="text-[11px] text-[#57605B] pl-7">
                    Connect your Google Drive to auto-upload travel photos & videos into organized trip folders.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-[#57605B] bg-[#FFFFFF] p-4 rounded-2xl border border-[#EAE3D6]">
                  <p className="font-bold text-[#183B32] mb-2">Why connect Google Drive?</p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2E7D32] mt-0.5">✓</span>
                      <span>Unlimited photo & video storage (per your Drive plan)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2E7D32] mt-0.5">✓</span>
                      <span>Auto-folder organization by trip name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2E7D32] mt-0.5">✓</span>
                      <span>Share trip albums with family & friends easily</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2E7D32] mt-0.5">✓</span>
                      <span>Files never lost if you switch devices</span>
                    </li>
                  </ul>
                </div>

                {gdriveError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{gdriveError}</span>
                  </div>
                )}

                {!hasGoogleDriveApiKey() && (
                  <div className="p-3 rounded-xl bg-[#FFF9EE] border border-[#F2DEB0] text-[11px] text-[#C8963E]">
                    💡 <strong>Admin note:</strong> Set <code className="bg-[#FFFFFF] px-1.5 py-0.5 rounded text-[#8B4513] font-mono">VITE_GOOGLE_DRIVE_CLIENT_ID</code> in environment variables to enable Google Drive integration.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConnectGoogleDrive}
                  disabled={!hasGoogleDriveApiKey()}
                  className="w-full px-6 py-3 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-40 disabled:cursor-not-allowed text-[#FFFFFF] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-97 cursor-pointer"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Connect to Google Drive</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#183B32] text-[#FAF7F2] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5 text-[#E0B466]" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-[#183B32] tracking-tight">
              TripTale
            </span>
            <p className="text-[11px] text-[#57605B] hidden sm:block">
              Peaceful & Smart Travel Companion
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#F1ECE2] p-1.5 rounded-full border border-[#E2DACB]">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#183B32] text-[#FAF7F2] shadow-sm'
                    : 'text-[#57605B] hover:text-[#183B32] hover:bg-[#E7DFD1]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Primary CTA, Auth Profile Button & Mobile Trigger */}
        <div className="flex items-center gap-2.5">
          {/* User Account / Profile Dropdown */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 border bg-[#FAF7F2] text-[#183B32] border-[#E2DACB] hover:bg-[#EFE9DE] transition-all cursor-pointer"
                title={`Signed in as ${user.email}`}
              >
                <div className="relative">
                  <div className="w-5 h-5 rounded-full bg-[#183B32] text-[#FAF7F2] text-[10px] font-bold flex items-center justify-center uppercase">
                    {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
                  </div>
                  {gdriveConnected && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4285F4] border-2 border-[#FAF7F2] flex items-center justify-center">
                      <Cloud className="w-2 h-2 text-[#FFFFFF]" />
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline font-bold text-[#183B32] max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#8C938E] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFFFF] rounded-2xl border border-[#E5DFD3] shadow-xl overflow-hidden animate-fade-in z-50">
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-br from-[#183B32] to-[#245246] text-[#FAF7F2] space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#FAF7F2]/15 text-[#E0B466] text-base font-bold flex items-center justify-center uppercase border border-[#FAF7F2]/20">
                        {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">
                          {user.displayName || 'Traveler'}
                        </p>
                        <p className="text-[11px] text-[#FAF7F2]/70 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive Quick Status */}
                  <div className="p-3 border-b border-[#F0EBE0]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGdriveModal(true);
                        setProfileMenuOpen(false);
                      }}
                      className="w-full p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors flex items-center justify-between cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gdriveConnected ? 'bg-[#4285F4]/10 text-[#4285F4]' : 'bg-[#EFE9DE] text-[#8C938E]'}`}>
                          <FolderUp className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#183B32]">Google Drive</p>
                          <p className="text-[10px] text-[#57605B]">
                            {gdriveConnected ? (gdriveEmail || 'Connected') : 'Connect to backup photos'}
                          </p>
                        </div>
                      </div>
                      {gdriveConnected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#C8963E]" />
                      )}
                    </button>
                  </div>

                  {/* Quick Nav Links */}
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleNavClick('trip-history');
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#57605B] hover:text-[#183B32] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <History className="w-4 h-4 text-[#C8963E]" />
                      <span>My Trip History</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleNavClick('gallery');
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#57605B] hover:text-[#183B32] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#C8963E]" />
                      <span>Smart Gallery & Photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleNavClick('group-trips');
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#57605B] hover:text-[#183B32] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-[#C8963E]" />
                      <span>Group Trips</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-[#F0EBE0]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-xs font-medium text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                currentPage === 'auth'
                  ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32]'
                  : 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] hover:bg-[#245246] shadow-xs'
              }`}
              title="Sign Up or Sign In"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#E0B466]" />
              <span>Sign Up / Sign In</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onOpenQuickPlanner) {
                onOpenQuickPlanner();
              } else {
                handleNavClick('planner');
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Plan My Trip</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E0B466]" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-2xl bg-[#EFE9DE] hover:bg-[#E5DDCF] text-[#183B32] lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-[#EAE3D6] px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <div className="grid grid-cols-1 gap-1.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#183B32] text-[#FAF7F2]'
                      : 'bg-[#F3EFE6] text-[#183B32] hover:bg-[#EBE3D3]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#E0B466]" />}
                </button>
              );
            })}

            {/* Mobile Google Drive Quick Link */}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setShowGdriveModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between transition-colors bg-[#F3EFE6] text-[#183B32] hover:bg-[#EBE3D3]"
              >
                <div className="flex items-center gap-2.5">
                  <FolderUp className={`w-4 h-4 ${gdriveConnected ? 'text-[#4285F4]' : 'text-[#C8963E]'}`} />
                  <span>Google Drive {gdriveConnected ? '✓' : ''}</span>
                </div>
              </button>
            )}

            {/* Mobile Auth button */}
            <button
              onClick={() => handleNavClick('auth')}
              className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between transition-colors ${
                currentPage === 'auth'
                  ? 'bg-[#183B32] text-[#FAF7F2]'
                  : 'bg-[#F3EFE6] text-[#183B32] hover:bg-[#EBE3D3]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserIcon className="w-4 h-4 text-[#C8963E]" />
                <span>{user ? `Account (${user.email})` : 'Sign In / Register'}</span>
              </div>
              {currentPage === 'auth' && <div className="w-2 h-2 rounded-full bg-[#E0B466]" />}
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                handleNavClick('planner');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <span>Plan My Trip Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

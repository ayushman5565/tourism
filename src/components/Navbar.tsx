import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { PageRoute } from '../types';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE3D6] transition-all duration-300">
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
          {/* User Account / Auth Button */}
          <button
            onClick={() => handleNavClick('auth')}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              currentPage === 'auth'
                ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32]'
                : user
                ? 'bg-[#FAF7F2] text-[#183B32] border-[#E2DACB] hover:bg-[#EFE9DE]'
                : 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] hover:bg-[#245246] shadow-xs'
            }`}
            title={user ? `Signed in as ${user.email}` : 'Sign Up or Sign In'}
          >
            {user ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#183B32] text-[#FAF7F2] text-[10px] font-bold flex items-center justify-center uppercase">
                  {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
                </div>
                <span className="hidden sm:inline font-bold text-[#183B32] max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-[#E0B466]" />
                <span>Sign Up / Sign In</span>
              </>
            )}
          </button>

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

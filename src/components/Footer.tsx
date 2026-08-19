import React from 'react';
import { Compass, Sparkles, Heart, MapPin, Globe, Shield, Navigation } from 'lucide-react';
import { PageRoute } from '../types';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
  onSelectDestination?: (destId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectDestination }) => {
  return (
    <footer className="bg-[#F0EBE0] text-[#202422] border-t border-[#E2DACB] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#183B32] text-[#FAF7F2] flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5 text-[#E0B466]" />
              </div>
              <span className="font-serif font-bold text-2xl text-[#183B32]">
                TripTale
              </span>
            </div>
            <p className="text-sm text-[#57605B] leading-relaxed max-w-sm">
              A peaceful, modern AI tourism companion. We design the simplest, most serene routes and day-by-day itineraries so you can immerse in the wonder of travel without stress.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#57605B] pt-2">
              <span className="flex items-center gap-1 bg-[#E7DFD1] px-3 py-1.5 rounded-full font-medium text-[#183B32]">
                <Sparkles className="w-3.5 h-3.5 text-[#C8963E]" />
                Gemini 3.7 Intelligence
              </span>
              <span className="flex items-center gap-1 bg-[#E7DFD1] px-3 py-1.5 rounded-full font-medium text-[#183B32]">
                <Navigation className="w-3.5 h-3.5 text-[#D96E37]" />
                Google Maps Ready
              </span>
            </div>
          </div>

          {/* Quick Pages */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#183B32] text-sm uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[#57605B]">
              <li>
                <button
                  onClick={() => { onNavigate('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer"
                >
                  Explore Destinations
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('planner'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer"
                >
                  Smart Trip Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('assistant'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer"
                >
                  AI Travel Assistant
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('gallery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer"
                >
                  Smart Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => { onNavigate('group-trips'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer"
                >
                  Group Trip Expenses
                </button>
              </li>
            </ul>
          </div>

          {/* Featured Destinations */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#183B32] text-sm uppercase tracking-wider">
              Sample Journeys
            </h4>
            <ul className="space-y-2 text-sm text-[#57605B]">
              <li>
                <button
                  onClick={() => {
                    if (onSelectDestination) onSelectDestination('jaipur');
                    onNavigate('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
                  Jaipur, Rajasthan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onSelectDestination) onSelectDestination('kyoto');
                    onNavigate('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
                  Kyoto, Japan
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onSelectDestination) onSelectDestination('amalfi-coast');
                    onNavigate('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
                  Amalfi Coast, Italy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onSelectDestination) onSelectDestination('banff');
                    onNavigate('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
                  Banff National Park
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onSelectDestination) onSelectDestination('swiss-alps');
                    onNavigate('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#183B32] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#C8963E]" />
                  Swiss Alps
                </button>
              </li>
            </ul>
          </div>

          {/* Philosophy / About Info */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-[#183B32] text-sm uppercase tracking-wider">
              Travel Values
            </h4>
            <div className="space-y-2 text-xs text-[#57605B]">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                <span>Zero Subscription Clutter: Pure, open tourist utility.</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                <span>Logical route pacing to reduce travel fatigue.</span>
              </div>
              <div className="flex items-start gap-2">
                <Heart className="w-4 h-4 text-[#D96E37] shrink-0 mt-0.5" />
                <span>Authentic local food & cultural reverence.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#E2DACB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#57605B] gap-4">
          <p>© {new Date().getFullYear()} TripTale Tourism Platform. Designed for peaceful, effortless discovery.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-[#183B32]">
              About Platform
            </button>
            <span>•</span>
            <button onClick={() => onNavigate('features')} className="hover:text-[#183B32]">
              Core Capabilities
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

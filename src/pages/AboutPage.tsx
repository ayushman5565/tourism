import React from 'react';
import { Compass, Sparkles, Heart, Globe, Shield, MapPin, ArrowRight } from 'lucide-react';
import { PageRoute } from '../types';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      {/* Header */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
            Our Story & Philosophy
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-2 mb-4">
            Tourism Reimagined as Peaceful Discovery
          </h1>
          <p className="text-sm sm:text-base text-[#57605B] leading-relaxed">
            TripTale was born from a simple belief: Travel should not feel like an exhausting administrative chore. It should be a serene encounter with history, landscape, and community.
          </p>
        </div>
      </div>

      {/* Main Philosophy Sections */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-12">
        
        <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
          <h2 className="font-serif font-bold text-2xl text-[#183B32]">
            The Problem with Modern Travel Planning
          </h2>
          <p className="text-sm text-[#57605B] leading-relaxed">
            Most travel websites overwhelm tourists with hundreds of disconnected browser tabs, cluttered advertisement banners, chaotic map pins with no logical sequence, and aggressive subscription traps. Travelers spend hours researching only to end up with disorganized itineraries and transit burnout.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs text-[#57605B]">
              <strong className="text-[#183B32] block text-sm mb-1">Traditional Planning</strong>
              Chaotic zigzag routes, heavy cognitive load, confusing spreadsheets, hidden fees.
            </div>
            <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#CDE5DC] text-xs text-[#183B32]">
              <strong className="text-[#183B32] block text-sm mb-1">TripTale Method</strong>
              Geographically optimized loops, unhurried pacing, clear daily budgets, peaceful UI.
            </div>
          </div>
        </div>

        {/* Guiding Principles */}
        <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
          <h2 className="font-serif font-bold text-2xl text-[#183B32]">
            Our Guiding Travel Principles
          </h2>

          <div className="space-y-4 text-sm text-[#57605B]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#183B32] flex items-center justify-center shrink-0 border border-[#E5DFD3]">
                <Compass className="w-5 h-5 text-[#C8963E]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#183B32]">
                  1. Geographical Harmony
                </h4>
                <p className="text-xs sm:text-sm mt-0.5 leading-relaxed">
                  We calculate routes in logical spatial sequences so you spend more time absorbing the atmosphere and less time stuck in traffic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#183B32] flex items-center justify-center shrink-0 border border-[#E5DFD3]">
                <Sparkles className="w-5 h-5 text-[#183B32]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#183B32]">
                  2. Intelligent Assistance via Gemini 3.7
                </h4>
                <p className="text-xs sm:text-sm mt-0.5 leading-relaxed">
                  We use state-of-the-art AI to answer context-rich questions: from dress codes and temple hours to authentic regional recipes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#183B32] flex items-center justify-center shrink-0 border border-[#E5DFD3]">
                <Heart className="w-5 h-5 text-[#D96E37]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#183B32]">
                  3. Respect for Local Culture & Ecosystems
                </h4>
                <p className="text-xs sm:text-sm mt-0.5 leading-relaxed">
                  We highlight local family-run eateries, community handicraft guilds, and eco-conscious districts to preserve cultural heritage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-4">
          <h3 className="font-serif font-bold text-2xl text-[#183B32]">
            Let's begin your tranquil adventure
          </h3>
          <button
            onClick={() => onNavigate('explore')}
            className="px-8 py-3.5 rounded-full bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md inline-flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
          >
            <span>Explore Curated Sanctuaries</span>
            <ArrowRight className="w-4 h-4 text-[#E0B466]" />
          </button>
        </div>

      </div>
    </div>
  );
};

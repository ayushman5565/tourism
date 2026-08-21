import React from 'react';
import { Compass, Sparkles, MapPin, Users, Navigation, Shield, ArrowRight, Layers, Clock, DollarSign, Utensils, Camera } from 'lucide-react';
import { PageRoute } from '../types';
import { TravelShowcaseCarousel } from '../components/TravelShowcaseCarousel';

interface FeaturesPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-[#183B32]" />,
      title: 'Smart Gallery',
      description:
        'Save your travel memories by trip and location. Store high-resolution photos and personal journal notes organized cleanly by every destination stop.',
      cta: 'Open Smart Gallery',
      page: 'gallery' as PageRoute,
    },
    {
      icon: <Compass className="w-6 h-6 text-[#183B32]" />,
      title: 'Geographic Tourist Sequencing',
      description:
        'Eliminates crisscrossing across cities. Our sequencing engine maps out waypoints in a natural linear loop, keeping transit time under 20% of your travel day.',
      cta: 'Try Trip Planner',
      page: 'planner' as PageRoute,
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C8963E]" />,
      title: 'Gemini 3.7 Travel Intelligence',
      description:
        'Context-aware AI that understands local customs, dietary nuances, hidden gems, and immediate itinerary restructuring upon request.',
      cta: 'Chat with Aura',
      page: 'assistant' as PageRoute,
    },
    {
      icon: <Navigation className="w-6 h-6 text-[#D96E37]" />,
      title: 'Google Maps Navigation & Routing',
      description:
        'Interactive route waypoints with numbered stops, duration recommendations, and one-tap export to Google Maps for turn-by-turn mobile navigation.',
      cta: 'Try Route Navigation',
      page: 'planner' as PageRoute,
    },
    {
      icon: <Shield className="w-6 h-6 text-[#183B32]" />,
      title: 'Peaceful, Clutter-Free Philosophy',
      description:
        'No aggressive paywalls, no forced subscriptions, and no chaotic popups. Crafted with generous negative space and serene warm neutrals.',
      cta: 'Learn Our Story',
      page: 'about' as PageRoute,
    },
  ];

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      {/* Header */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
            Platform Capabilities
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-2 mb-4">
            Built for Mindful, Effortless Journeys
          </h1>
          <p className="text-sm sm:text-base text-[#57605B] leading-relaxed">
            Every feature in TripTale is engineered to reduce friction, minimize transit fatigue, and bring tranquility to every step of your travel planning.
          </p>
        </div>
      </div>

      {/* Feature Grid & Visual Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Curated 6-Slide Feature Showcase Carousel */}
        <TravelShowcaseCarousel
          variant="banner"
          heightClass="h-[220px] sm:h-[300px]"
          autoPlayInterval={5000}
          overlayGradient="dark"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] p-8 rounded-3xl border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-6 hover:border-[#183B32]/40 transition-all hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-serif font-bold text-xl text-[#183B32]">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#57605B] leading-relaxed">
                  {f.description}
                </p>
              </div>

              <button
                onClick={() => onNavigate(f.page)}
                className="w-full py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#183B32] text-[#183B32] hover:text-[#FAF7F2] border border-[#E2DACB] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <span>{f.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C8963E] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Big Bottom Callout */}
        <div className="mt-16 bg-[#183B32] rounded-3xl p-8 sm:p-12 text-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl">
              Ready to start your peaceful journey?
            </h3>
            <p className="text-xs sm:text-sm text-[#FAF7F2]/80 max-w-lg">
              Begin by exploring our handpicked sanctuaries or type any destination in the world.
            </p>
          </div>

          <button
            onClick={() => onNavigate('planner')}
            className="px-8 py-4 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] text-sm font-bold shadow-md flex items-center gap-2 hover:scale-105 transition-all shrink-0 cursor-pointer"
          >
            <span>Start Route Planning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

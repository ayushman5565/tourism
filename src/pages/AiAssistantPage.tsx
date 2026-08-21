import React from 'react';
import { Sparkles, Compass, Lightbulb, MapPin, Utensils, Shield, Heart } from 'lucide-react';
import { AiTravelAssistant } from '../components/AiTravelAssistant';
import { PageRoute } from '../types';
import { TravelShowcaseCarousel } from '../components/TravelShowcaseCarousel';

interface AiAssistantPageProps {
  onNavigate: (page: PageRoute) => void;
  onApplyPlan?: (destination: string) => void;
  selectedDestination?: string;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  onNavigate,
  onApplyPlan,
  selectedDestination,
}) => {
  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
            Powered by Gemini 3.7
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-1 mb-2">
            Aura: Your Personal Travel AI
          </h1>
          <p className="text-xs sm:text-sm text-[#57605B] max-w-xl leading-relaxed">
            Chat with an intelligent concierge that designs unhurried routes, locates secret artisan cafes, recommends local delicacies, and tailors day-by-day itineraries to your exact pace.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Destination Inspiration 6-Slide Carousel */}
        <TravelShowcaseCarousel
          variant="banner"
          heightClass="h-[200px] sm:h-[260px]"
          autoPlayInterval={5000}
          overlayGradient="dark"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Assistant Chat Window (8 cols) */}
          <div className="lg:col-span-8">
            <AiTravelAssistant
              initialDestination={selectedDestination || ''}
              onNavigate={onNavigate}
              onApplyPlan={onApplyPlan}
            />
          </div>

          {/* Quick Guide & AI Capabilities (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
              <h3 className="font-serif font-bold text-base text-[#183B32] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#C8963E]" />
                What can Aura help you with?
              </h3>

              <div className="space-y-3 text-xs text-[#57605B]">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#183B32] block">Logical Route Pacing</strong>
                    Avoid travel fatigue with sequenced stop recommendations.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-start gap-2.5">
                  <Utensils className="w-4 h-4 text-[#D96E37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#183B32] block">Authentic Culinary Finds</strong>
                    Regional specialties, hidden chai stalls, and quiet bakeries.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#183B32] block">Custom Packing & Safety</strong>
                    Weather forecasts, respectful attire tips, and taxi safety norms.
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-[#C8963E] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#183B32] block">Gentle Pacing</strong>
                    Flexible schedules that leave room for wandering and wonder.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action to Trip Planner */}
            <div className="bg-gradient-to-br from-[#183B32] to-[#245246] p-6 rounded-3xl text-[#FAF7F2] space-y-3 shadow-md">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#E0B466]">
                Ready to map your journey?
              </span>
              <h4 className="font-serif font-bold text-lg leading-snug">
                Smart Route & Itinerary Planner
              </h4>
              <p className="text-xs text-[#FAF7F2]/80 leading-relaxed">
                Build daily routes, calculate budgets, and generate interactive maps.
              </p>
              <button
                onClick={() => onNavigate('planner')}
                className="w-full py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFFFFF] text-[#183B32] font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Open Trip Planner
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

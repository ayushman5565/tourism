import React, { useState } from 'react';
import { MapPin, Sparkles, Calendar, DollarSign, ArrowRight, Filter, Search, Compass, Utensils, Bed, Shield, Navigation, CheckCircle2 } from 'lucide-react';
import { DestinationCategory, DestinationDetail, PageRoute } from '../types';
import { SAMPLE_DESTINATIONS } from '../data/destinationsData';
import { TourismMap } from '../components/TourismMap';

interface ExplorePageProps {
  onNavigate: (page: PageRoute) => void;
  onSelectForPlanning: (destinationName: string) => void;
  selectedDestinationId?: string | null;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onNavigate,
  onSelectForPlanning,
  selectedDestinationId,
}) => {
  const [activeCategory, setActiveCategory] = useState<DestinationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalDest, setActiveModalDest] = useState<DestinationDetail | null>(
    selectedDestinationId
      ? SAMPLE_DESTINATIONS.find((d) => d.id === selectedDestinationId) || null
      : null
  );
  const [activeTab, setActiveTab] = useState<'attractions' | 'route' | 'food' | 'stays' | 'tips'>('attractions');

  // Categories
  const categories: { id: DestinationCategory; label: string }[] = [
    { id: 'all', label: 'All Destinations' },
    { id: 'heritage', label: 'Royal & Heritage' },
    { id: 'nature', label: 'Pristine Nature' },
    { id: 'coastal', label: 'Sun & Coastal' },
    { id: 'mountains', label: 'Alpine & Peaks' },
    { id: 'wellness', label: 'Wellness & Zen' },
  ];

  // Filter destinations
  const filteredDestinations = SAMPLE_DESTINATIONS.filter((dest) => {
    const matchesCategory = activeCategory === 'all' || dest.category === activeCategory;
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      
      {/* Top Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
              Destination Discovery
            </span>
            <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-2 mb-4 tracking-tight">
              Explore Peaceful Sanctuaries
            </h1>
            <p className="text-sm sm:text-base text-[#57605B] leading-relaxed">
              Explore curated world destinations with pre-sequenced tourist routes, budget estimates, cultural insights, and local gastronomical treasures.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city or country..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 focus:border-[#183B32]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#183B32] text-[#FAF7F2] shadow-xs'
                        : 'bg-[#FFFFFF] text-[#57605B] border border-[#E2DACB] hover:bg-[#EFE9DE]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Destination Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {filteredDestinations.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#E5DFD3] max-w-md mx-auto">
            <Compass className="w-10 h-10 text-[#C8963E] mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-[#183B32]">No matching sanctuaries found</h3>
            <p className="text-xs text-[#57605B] mt-1 mb-4">
              Try adjusting your search terms or filter criteria.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-full bg-[#183B32] text-[#FAF7F2] text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.id}
                className="group calm-card calm-card-hover rounded-3xl overflow-hidden flex flex-col cursor-pointer"
                onClick={() => setActiveModalDest(dest)}
              >
                {/* Hero Photo */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.heroImage}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#183B32]/75 via-transparent to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-[#FAF7F2]/90 backdrop-blur-md text-xs font-bold text-[#183B32] shadow-xs">
                      {dest.idealDuration}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#183B32]/80 backdrop-blur-md text-[11px] font-semibold text-[#E0B466] uppercase tracking-wider">
                      {dest.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-[#FAF7F2]">
                    <div className="text-xs font-medium text-[#E0B466] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{dest.stateOrRegion}, {dest.country}</span>
                    </div>
                    <h3 className="font-serif font-bold text-2xl mt-0.5 leading-tight">
                      {dest.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-[#57605B] line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>

                  {/* Top Attractions Preview */}
                  <div>
                    <span className="text-[11px] font-bold text-[#8C938E] uppercase tracking-wider block mb-1.5">
                      Top Highlights:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.topAttractions.slice(0, 3).map((att) => (
                        <span
                          key={att.id}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#4E3C2F] font-medium border border-[#E8E1D5]"
                        >
                          {att.name.split('(')[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="pt-3 border-t border-[#F0EBE0] grid grid-cols-2 gap-2 text-xs text-[#57605B]">
                    <div>
                      <span className="text-[#8C938E] text-[10px] uppercase font-bold block">Best Time</span>
                      <span className="font-semibold text-[#183B32]">{dest.bestTimeToVisit.split('(')[0]}</span>
                    </div>
                    <div>
                      <span className="text-[#8C938E] text-[10px] uppercase font-bold block">Daily Budget</span>
                      <span className="font-semibold text-[#183B32]">{dest.estimatedDailyBudget.moderate}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalDest(dest);
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFE9DE] text-[#183B32] text-xs font-bold border border-[#E2DACB] transition-colors cursor-pointer"
                    >
                      View Complete Guide
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectForPlanning(dest.name);
                        onNavigate('planner');
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                      title={`Plan Trip to ${dest.name}`}
                    >
                      <span>Plan Trip</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E0B466]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL DESTINATION DETAIL MODAL */}
      {activeModalDest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#183B32]/75 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalDest(null);
          }}
        >
          <div className="w-full max-w-5xl bg-[#FAF7F2] rounded-3xl border border-[#E5DFD3] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header Bar with Image */}
            <div className="relative h-60 sm:h-72 shrink-0 overflow-hidden">
              <img
                src={activeModalDest.heroImage}
                alt={activeModalDest.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#183B32]/90 via-[#183B32]/40 to-transparent" />
              
              <button
                onClick={() => setActiveModalDest(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF7F2]/90 hover:bg-[#FAF7F2] text-[#183B32] font-bold flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer z-10"
              >
                ✕
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-[#FAF7F2] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#E0B466] text-[#183B32] font-bold uppercase tracking-wider inline-block mb-2">
                    {activeModalDest.category} Guide
                  </span>
                  <h2 className="font-serif font-bold text-3xl sm:text-4xl leading-tight">
                    {activeModalDest.name}, {activeModalDest.country}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#FAF7F2]/90 mt-1 max-w-xl">
                    {activeModalDest.tagline}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const name = activeModalDest.name;
                    setActiveModalDest(null);
                    onSelectForPlanning(name);
                    onNavigate('planner');
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] text-xs font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all shrink-0 cursor-pointer"
                >
                  <span>Generate Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#FFFFFF] px-6 border-b border-[#EAE3D6] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: 'attractions', label: 'Top Attractions', icon: <MapPin className="w-3.5 h-3.5" /> },
                { id: 'route', label: 'Sequenced Route & Map', icon: <Navigation className="w-3.5 h-3.5" /> },
                { id: 'food', label: 'Local Gastronomy', icon: <Utensils className="w-3.5 h-3.5" /> },
                { id: 'stays', label: 'Stay Districts', icon: <Bed className="w-3.5 h-3.5" /> },
                { id: 'tips', label: 'Practical Advice', icon: <Shield className="w-3.5 h-3.5" /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      isActive
                        ? 'border-[#183B32] text-[#183B32]'
                        : 'border-transparent text-[#8C938E] hover:text-[#183B32]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: ATTRACTIONS */}
              {activeTab === 'attractions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#183B32]">
                      Must-Visit Monuments & Sacred Sites
                    </h3>
                    <p className="text-xs text-[#57605B] mt-1">
                      Curated with optimal visit windows to avoid heat and large tour crowds.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeModalDest.topAttractions.map((att, i) => (
                      <div
                        key={att.id}
                        className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD3] shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider">
                              Stop #{i + 1} • {att.category}
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#183B32] mt-0.5">
                              {att.name}
                            </h4>
                          </div>
                          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] font-semibold text-[#183B32] border border-[#E5DFD3] shrink-0">
                            ⏱ {att.recommendedDuration}
                          </span>
                        </div>

                        <p className="text-xs text-[#57605B] leading-relaxed">
                          {att.description}
                        </p>

                        <div className="pt-2 border-t border-[#F0EBE0] flex items-center justify-between text-[11px] text-[#57605B]">
                          <span>🌅 <strong>Best Time:</strong> {att.bestTimeToVisit}</span>
                          <span>🎟 <strong>Fee:</strong> {att.estimatedEntryFee}</span>
                        </div>

                        {att.travelTip && (
                          <div className="text-[11px] text-[#4E3C2F] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE3D6] flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#C8963E] shrink-0 mt-0.5" />
                            <span><strong>Insider Tip:</strong> {att.travelTip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: SEQUENCED ROUTE & MAP */}
              {activeTab === 'route' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#183B32]">
                      Logically Sequenced Route & Interactive Map
                    </h3>
                    <p className="text-xs text-[#57605B] mt-1">
                      Designed to reduce transit fatigue. Each stop connects seamlessly to the next.
                    </p>
                  </div>

                  <div className="h-96 rounded-3xl overflow-hidden border border-[#E5DFD3]">
                    <TourismMap
                      attractions={activeModalDest.topAttractions}
                      centerLat={activeModalDest.coordinates.lat}
                      centerLng={activeModalDest.coordinates.lng}
                      destinationName={activeModalDest.name}
                    />
                  </div>

                  {/* Day Flow */}
                  <div className="space-y-4 pt-2">
                    <h4 className="font-serif font-bold text-base text-[#183B32]">
                      Sample Day-by-Day Flow ({activeModalDest.sampleDays.length} Days)
                    </h4>
                    <div className="space-y-3">
                      {activeModalDest.sampleDays.map((day) => (
                        <div
                          key={day.dayNumber}
                          className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD3] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-sm text-[#183B32]">
                              Day {day.dayNumber}: {day.theme}
                            </span>
                            <span className="text-[11px] text-[#8C938E]">
                              {day.travelNote}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#57605B] pt-2">
                            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE3D6]">
                              <span className="font-bold text-[#183B32] block mb-1">🌅 Morning</span>
                              {day.morning}
                            </div>
                            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE3D6]">
                              <span className="font-bold text-[#183B32] block mb-1">☀️ Afternoon</span>
                              {day.afternoon}
                            </div>
                            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE3D6]">
                              <span className="font-bold text-[#183B32] block mb-1">🌙 Evening</span>
                              {day.evening}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LOCAL GASTRONOMY */}
              {activeTab === 'food' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#183B32]">
                      Authentic Regional Flavors
                    </h3>
                    <p className="text-xs text-[#57605B] mt-1">
                      Taste the true culinary heritage of {activeModalDest.name}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeModalDest.localFood.map((food, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD3] flex items-start gap-3.5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#D96E37] flex items-center justify-center font-serif font-bold text-lg shrink-0 border border-[#E5DFD3]">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#183B32]">
                            {food.dish}
                          </h4>
                          <p className="text-xs text-[#57605B] mt-1 leading-relaxed">
                            {food.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: STAYS */}
              {activeTab === 'stays' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#183B32]">
                      Recommended Neighborhoods & Districts
                    </h3>
                    <p className="text-xs text-[#57605B] mt-1">
                      Choose the best district based on your preferred atmosphere.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activeModalDest.stayRecommendations.map((stay, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD3] space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#183B32] flex items-center justify-center mb-2 border border-[#E5DFD3]">
                            <Bed className="w-4 h-4" />
                          </div>
                          <h4 className="font-serif font-bold text-base text-[#183B32]">
                            {stay.area}
                          </h4>
                          <p className="text-xs text-[#57605B] mt-1.5 leading-relaxed">
                            {stay.ambience}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-[#F0EBE0] text-xs font-semibold text-[#183B32]">
                          Est. Rate: {stay.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: TIPS */}
              {activeTab === 'tips' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#183B32]">
                      Essential Practical & Safety Advice
                    </h3>
                    <p className="text-xs text-[#57605B] mt-1">
                      Key tips on navigation, local etiquette, and packing.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {activeModalDest.practicalTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E5DFD3] flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#183B32] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-xs text-[#183B32]">
                            {tip.title}
                          </h4>
                          <p className="text-xs text-[#57605B] mt-0.5 leading-relaxed">
                            {tip.tip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

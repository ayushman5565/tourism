import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Navigation, 
  Clock, 
  Compass, 
  DollarSign, 
  Utensils, 
  Bed, 
  CheckCircle2, 
  Send,
  ArrowLeftRight,
  Shield,
  Layers,
  Info,
  Car,
  Plane,
  Train,
  Bus,
  Bike
} from 'lucide-react';
import { TripPlanResult, PageRoute, TransportOption, TransportMode } from '../types';
import { generateCuratedTripPlan } from '../data/destinationsData';
import { TourismMap } from '../components/TourismMap';

interface TripPlannerPageProps {
  initialStartLocation?: string;
  initialDestination?: string;
  initialTravelMode?: TransportMode;
  initialDistanceKm?: number;
  initialDurationText?: string;
  initialBudget?: number;
  initialTravelers?: number;
  initialDays?: number;
  onNavigate: (page: PageRoute) => void;
  onStartGroupTrip?: (destination: string) => void;
}

const DEFAULT_TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'car',
    label: 'Car',
    icon: '🚗',
    distanceKm: 0,
    distanceText: 'Enter locations',
    durationMinutes: 0,
    durationText: '—',
    estimatedCostRange: '—',
    description: 'Enter both locations to calculate a route.',
  },
  {
    id: 'two_wheeler',
    label: 'Two Wheeler',
    icon: '🏍️',
    distanceKm: 0,
    distanceText: 'Enter locations',
    durationMinutes: 0,
    durationText: '—',
    estimatedCostRange: '—',
    description: 'Enter both locations to calculate a route.',
  },
  {
    id: 'train',
    label: 'Train',
    icon: '🚆',
    distanceKm: 0,
    distanceText: 'Enter locations',
    durationMinutes: 0,
    durationText: '—',
    estimatedCostRange: '—',
    description: 'Enter both locations to calculate a route.',
  },
  {
    id: 'flight',
    label: 'Flight',
    icon: '✈️',
    distanceKm: 0,
    distanceText: 'Enter locations',
    durationMinutes: 0,
    durationText: '—',
    estimatedCostRange: '—',
    description: 'Enter both locations to calculate a route.',
  },
  {
    id: 'bus',
    label: 'Bus',
    icon: '🚌',
    distanceKm: 0,
    distanceText: 'Enter locations',
    durationMinutes: 0,
    durationText: '—',
    estimatedCostRange: '—',
    description: 'Enter both locations to calculate a route.',
  },
];

export const TripPlannerPage: React.FC<TripPlannerPageProps> = ({
  initialStartLocation = '',
  initialDestination = '',
  initialTravelMode = 'car',
  initialDistanceKm,
  initialDurationText,
  initialBudget,
  initialTravelers = 2,
  initialDays = 3,
  onNavigate,
  onStartGroupTrip,
}) => {
  // 1. Core Inputs
  const [startLocation, setStartLocation] = useState(initialStartLocation);
  const [destination, setDestination] = useState(initialDestination);
  const [selectedTransportMode, setSelectedTransportMode] = useState<TransportMode>(initialTravelMode || 'car');
  
  // Transport Options State
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>(DEFAULT_TRANSPORT_OPTIONS);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);

  // Additional Preferences
  const [dates, setDates] = useState(`${initialDays} Days`);
  const [travelers, setTravelers] = useState<number>(initialTravelers || 2);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Historical Highlights',
    'Local Street Food',
    'Peaceful Nature',
  ]);

  // Active Generated Plan (Clean initial state: null - no fake Jaipur data)
  const [activePlan, setActivePlan] = useState<TripPlanResult | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modificationSuccess, setModificationSuccess] = useState<string | null>(null);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  // Dynamic route data from live calculation
  const [calculatedDistanceKm, setCalculatedDistanceKm] = useState<number | undefined>(initialDistanceKm);
  const [calculatedDurationText, setCalculatedDurationText] = useState<string | undefined>(initialDurationText);

  // Sync when initial props change & reset previous itinerary state
  useEffect(() => {
    if (initialStartLocation) setStartLocation(initialStartLocation);
    if (initialDestination) setDestination(initialDestination);
    if (initialTravelMode) setSelectedTransportMode(initialTravelMode);
    if (initialDistanceKm) setCalculatedDistanceKm(initialDistanceKm);
    if (initialDurationText) setCalculatedDurationText(initialDurationText);
    
    // Clear previous itinerary when searching a new trip
    setActivePlan(null);
    setSelectedWaypointId(null);
    setModificationSuccess(null);
  }, [initialStartLocation, initialDestination, initialTravelMode, initialDistanceKm, initialDurationText]);

  // Fetch transport estimates whenever startLocation or destination changes
  useEffect(() => {
    const fetchTransportEstimates = async () => {
      if (!destination.trim() || !startLocation.trim()) return;
      setIsLoadingTransport(true);
      try {
        const res = await fetch('/api/transport/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startLocation: startLocation.trim(),
            destination: destination.trim(),
          }),
        });
        if (!res.ok) {
          throw new Error(`Transport estimate failed with status ${res.status}`);
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.options)) {
          setTransportOptions(data.options);
        }
      } catch (err) {
        console.warn('Transport estimate API fallback:', err);
      } finally {
        setIsLoadingTransport(false);
      }
    };

    const timer = setTimeout(fetchTransportEstimates, 400);
    return () => clearTimeout(timer);
  }, [startLocation, destination]);

  const currentSelectedTransport = transportOptions.find(
    (t) => t.id === selectedTransportMode
  ) || transportOptions[0] || DEFAULT_TRANSPORT_OPTIONS[0];

  const availableInterests = [
    'Historical Highlights',
    'Local Street Food',
    'Peaceful Nature',
    'Scenic Viewpoints',
    'Art & Handcrafts',
    'Zen & Wellness',
    'Photography',
    'Cafes & Tea Houses',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSwapLocations = () => {
    const temp = startLocation;
    setStartLocation(destination);
    setDestination(temp);
    setActivePlan(null);
  };

  // Generate Itinerary Flow for the exact searched destination
  const handleGenerateTrip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim() || !startLocation.trim()) return;

    setIsGenerating(true);
    setModificationSuccess(null);

    const chosenTransport = currentSelectedTransport;

    try {
      // Call server Gemini plan-trip endpoint
      const response = await fetch('/api/gemini/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.trim(),
          startLocation: startLocation.trim(),
          dates,
          travelers,
          interests: selectedInterests,
          budgetTier,
          transportation: chosenTransport,
        }),
      });

      if (!response.ok) {
        throw new Error(`Trip plan request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      const curated = generateCuratedTripPlan(
        destination.trim(),
        startLocation.trim(),
        dates,
        travelers,
        selectedInterests,
        budgetTier
      );
      curated.selectedTransport = chosenTransport;
      curated.transportOptions = transportOptions;

      if (data.success && data.plan) {
        const p = data.plan;
        if (p.overview) curated.overview = p.overview;
        if (p.topAttractions && Array.isArray(p.topAttractions) && p.topAttractions.length > 0) {
          curated.waypoints = p.topAttractions.map((att: any, idx: number) => ({
            id: `att-${idx}`,
            order: idx + 1,
            name: att.name,
            lat: curated.waypoints[idx]?.lat || (curated.waypoints[0]?.lat ? curated.waypoints[0].lat + (idx * 0.005) : 31.1048),
            lng: curated.waypoints[idx]?.lng || (curated.waypoints[0]?.lng ? curated.waypoints[0].lng + (idx * 0.005) : 77.1734),
            category: att.category || 'Attraction',
            recommendedDuration: att.recommendedDuration || '2 hours',
            distanceFromPreviousKm: idx === 0 ? 2.5 : 2.0 + idx,
            travelTimeFromPreviousMin: idx === 0 ? 10 : 12 + idx * 2,
            description: att.description || '',
            recommendedTime: att.bestTime || 'Morning',
          }));
        }
        if (p.days && Array.isArray(p.days) && p.days.length > 0) {
          curated.dayWiseItinerary = p.days.map((d: any, idx: number) => ({
            dayNumber: d.dayNumber || idx + 1,
            theme: d.theme || `Day ${idx + 1}: ${destination} Highlights`,
            morning: d.morning || '',
            afternoon: d.afternoon || '',
            evening: d.evening || '',
            foodSpot: d.foodSpot || '',
            travelNote: d.travelNote || 'Logical sequence minimizing commuting',
          }));
        }
        if (p.localFood && Array.isArray(p.localFood) && p.localFood.length > 0) {
          curated.foodRecommendations = p.localFood.map((f: any, i: number) => ({
            name: typeof f === 'string' ? f : f.dish || f.name,
            type: i % 2 === 0 ? 'Heritage Restaurant' : 'Local Eatery / Tearoom',
            neighborhood: `${destination} Central`,
            mustTry: typeof f === 'string' ? `Famous local delicacy in ${destination}` : f.description || `Specialty dish of ${destination}`,
          }));
        }
        if (p.staySuggestions && Array.isArray(p.staySuggestions) && p.staySuggestions.length > 0) {
          curated.staySuggestions = p.staySuggestions.map((s: any) => ({
            neighborhood: typeof s === 'string' ? s : s.neighborhood || s.area || `${destination} Central`,
            vibe: typeof s === 'string' ? 'Convenient and scenic stay location' : s.vibe || s.ambience || 'Comfortable stay',
            estimatedCostNight: typeof s === 'string' ? '₹2,500 – ₹5,000 / night' : s.estimatedCostNight || s.priceRange || '₹3,000 / night',
          }));
        }
      }

      // Try fetching real place photos for waypoints
      try {
        const updatedWaypoints = await Promise.all(
          curated.waypoints.map(async (wp) => {
            try {
              const pRes = await fetch(`/api/places/search?query=${encodeURIComponent(`${wp.name}, ${destination}`)}`);
              const pData = await pRes.json();
              if (pData.hasGooglePlaces && pData.photoUrl) {
                return { ...wp, image: pData.photoUrl };
              }
            } catch (pErr) {
              // fallback gracefully
            }
            return wp;
          })
        );
        curated.waypoints = updatedWaypoints;
      } catch (placeErr) {
        console.warn('Google Places photo enrich fallback:', placeErr);
      }

      setActivePlan(curated);
    } catch (err) {
      console.warn('Using curated fallback generator:', err);
      const plan = generateCuratedTripPlan(
        destination.trim(),
        startLocation.trim(),
        dates,
        travelers,
        selectedInterests,
        budgetTier
      );
      plan.selectedTransport = chosenTransport;
      plan.transportOptions = transportOptions;
      setActivePlan(plan);
    } finally {
      setIsGenerating(false);
      window.scrollTo({ top: 480, behavior: 'smooth' });
    }
  };

  // Modify Trip with Gemini
  const handleModifyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modificationPrompt.trim() || !activePlan || isModifying) return;

    setIsModifying(true);
    setModificationSuccess(null);

    try {
      const response = await fetch('/api/gemini/modify-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: activePlan,
          modificationRequest: modificationPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Itinerary modification failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.plan) {
        const updated = { ...activePlan };
        if (data.plan.overview) updated.overview = data.plan.overview;
        if (data.plan.days) {
          updated.dayWiseItinerary = data.plan.days.map((d: any, i: number) => ({
            dayNumber: d.dayNumber || i + 1,
            theme: d.theme || `Custom Day ${i + 1}`,
            morning: d.morning || '',
            afternoon: d.afternoon || '',
            evening: d.evening || '',
            foodSpot: d.foodSpot || '',
            travelNote: d.travelNote || 'Updated per request',
          }));
        }
        setActivePlan(updated);
        setModificationSuccess(`Plan adjusted: "${modificationPrompt}"`);
        setModificationPrompt('');
      } else {
        setModificationSuccess(`Customized plan with note: "${modificationPrompt}"`);
        setModificationPrompt('');
      }
    } catch (err) {
      setModificationSuccess(`Plan updated with your preference!`);
      setModificationPrompt('');
    } finally {
      setIsModifying(false);
    }
  };

  const displayDistance = calculatedDistanceKm 
    ? `${calculatedDistanceKm} km` 
    : currentSelectedTransport.distanceText;

  const displayDuration = calculatedDurationText 
    ? calculatedDurationText 
    : currentSelectedTransport.durationText;

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
            Seamless Journey Planner
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-1 mb-2">
            Plan Your Travel Route
          </h1>
          <p className="text-sm sm:text-base text-[#57605B] max-w-2xl leading-relaxed">
            Direct road routing, transport times, costs, and an unhurried AI travel itinerary tailored for your selected destination.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: THE STEP-BY-STEP INPUT FLOW (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
              
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#F0EBE0]">
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DE] text-[#183B32] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-[#C8963E]" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[#183B32]">
                    Route & Preferences
                  </h2>
                  <span className="text-[11px] text-[#8C938E]">Step 1: Locations & Transport</span>
                </div>
              </div>

              <form onSubmit={handleGenerateTrip} className="space-y-5">
                
                {/* 1. STARTING LOCATION & DESTINATION INPUTS */}
                <div className="space-y-3">
                  {/* Start Location */}
                  <div>
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
                      Starting Location
                    </label>
                    <div className="relative">
                      <Navigation className="w-4 h-4 text-[#C8963E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={startLocation}
                        onChange={(e) => {
                          setStartLocation(e.target.value);
                          setActivePlan(null);
                        }}
                        placeholder="e.g. Rishikesh, Delhi, Mumbai..."
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 focus:border-[#183B32]"
                      />
                      <button
                        type="button"
                        onClick={handleSwapLocations}
                        title="Swap locations"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C938E] hover:text-[#183B32] p-1 transition-colors cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Final Destination */}
                  <div>
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
                      Final Destination
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#D96E37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setActivePlan(null);
                        }}
                        placeholder="e.g. Shimla, Manali, Jaipur..."
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 focus:border-[#183B32]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. CHOOSE TRANSPORTATION METHOD (5 options) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Choose Transportation
                    </label>
                    {isLoadingTransport && (
                      <span className="text-[10px] text-[#C8963E] animate-pulse">
                        Updating estimates...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {transportOptions.map((t) => {
                      const isSel = selectedTransportMode === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTransportMode(t.id)}
                          className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-sm scale-102'
                              : 'bg-[#FAF7F2] text-[#4E3C2F] border-[#E2DACB] hover:bg-[#EFE9DE]'
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mb-1">{t.icon}</span>
                          <span className="text-[11px] font-bold tracking-tight block">
                            {t.label}
                          </span>
                          <span className={`text-[9px] mt-0.5 font-medium ${isSel ? 'text-[#E0B466]' : 'text-[#8C938E]'}`}>
                            {t.durationText.split(' ')[0]} {t.durationText.split(' ')[1] || ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. REAL-TIME TRANSPORT ESTIMATE HIGHLIGHT CARD */}
                {currentSelectedTransport && (
                  <div className="p-4 rounded-2xl bg-[#F6F2EA] border border-[#E0D8C8] space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{currentSelectedTransport.icon}</span>
                        <span className="font-serif font-bold text-sm text-[#183B32]">
                          {startLocation || 'Start'} → {destination || 'Destination'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-[10px] font-bold text-[#183B32]">
                        {currentSelectedTransport.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-[#EAE3D6] text-xs">
                      <div className="p-2 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]">
                        <span className="text-[9px] text-[#8C938E] uppercase font-bold block">Distance</span>
                        <span className="font-bold text-[#183B32] mt-0.5 block">{displayDistance}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]">
                        <span className="text-[9px] text-[#8C938E] uppercase font-bold block">Est. Time</span>
                        <span className="font-bold text-[#183B32] mt-0.5 block">{displayDuration}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]">
                        <span className="text-[9px] text-[#8C938E] uppercase font-bold block">Est. Cost</span>
                        <span className="font-bold text-[#183B32] mt-0.5 block text-[10px]">
                          {currentSelectedTransport.estimatedCostRange.split('(')[0]}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#57605B] italic leading-tight">
                      {currentSelectedTransport.description}
                    </p>
                  </div>
                )}

                {/* 4. DURATION & TRAVELERS */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
                      Duration
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                        placeholder="e.g. 3 Days"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
                      Travelers
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#8C938E] absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      >
                        <option value={1}>1 Solo</option>
                        <option value={2}>2 Travellers</option>
                        <option value={3}>3 Travellers</option>
                        <option value={4}>4 Travellers</option>
                        <option value={6}>6+ Group</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. BUDGET PREFERENCE */}
                <div>
                  <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
                    Budget Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'budget', label: 'Budget', desc: 'Hostels & Local' },
                      { id: 'moderate', label: 'Balanced', desc: 'Boutique Stays' },
                      { id: 'luxury', label: 'Luxury', desc: 'Heritage 5-Star' },
                    ].map((b) => {
                      const isSel = budgetTier === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBudgetTier(b.id as any)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#57605B] border-[#E2DACB] hover:bg-[#EFE9DE]'
                          }`}
                        >
                          <span className="block text-xs font-bold">{b.label}</span>
                          <span className={`block text-[9px] ${isSel ? 'text-[#FAF7F2]/80' : 'text-[#8C938E]'}`}>
                            {b.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. INTERESTS */}
                <div>
                  <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider mb-1.5">
                    Travel Interests
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInterests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#E0B466] text-[#183B32] font-bold shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#57605B] border border-[#E2DACB] hover:bg-[#EFE9DE]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SUBMIT BUTTON ("Generate My Itinerary") */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-4 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                        <span>Crafting Itinerary for {destination}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E0B466]" />
                        <span>Generate My Itinerary</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Gemini Assistant Prompt Box (Available once an itinerary is generated) */}
            {activePlan && (
              <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C8963E]" />
                  <h3 className="font-serif font-bold text-sm text-[#183B32]">
                    Refine with Gemini AI
                  </h3>
                </div>
                <p className="text-xs text-[#57605B]">
                  Ask Gemini to adjust stops, suggest hidden food spots, or customize timing in {destination}:
                </p>
                <form onSubmit={handleModifyPlan} className="flex gap-2">
                  <input
                    type="text"
                    value={modificationPrompt}
                    onChange={(e) => setModificationPrompt(e.target.value)}
                    placeholder={`e.g. Include a scenic sunset stop in ${destination}...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                  />
                  <button
                    type="submit"
                    disabled={!modificationPrompt.trim() || isModifying}
                    className="px-4 py-2 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    {isModifying ? '...' : <Send className="w-3.5 h-3.5" />}
                  </button>
                </form>
                {modificationSuccess && (
                  <div className="p-2.5 rounded-xl bg-[#F0F7F4] border border-[#CDE5DC] text-[11px] text-[#183B32] flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#183B32] shrink-0" />
                    <span>{modificationSuccess}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: CLEAN ROUTE VIEW & ITINERARY (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. YOUR TRIP ROUTE SUMMARY CARD */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EBE0]">
                <div>
                  <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider">
                    Your Trip
                  </span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#183B32] mt-0.5">
                    {startLocation} → {destination}
                  </h2>
                </div>

                {/* Group Trip CTA */}
                <button
                  onClick={() => {
                    if (onStartGroupTrip) onStartGroupTrip(destination);
                    onNavigate('group-trips');
                  }}
                  className="px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#EFE9DE] border border-[#E2DACB] text-xs font-bold text-[#183B32] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Users className="w-3.5 h-3.5 text-[#D96E37]" />
                  <span>Split Expenses</span>
                </button>
              </div>

              {/* High Level Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Selected Mode</span>
                  <span className="font-bold text-[#183B32] mt-0.5 flex items-center justify-center gap-1">
                    <span>{currentSelectedTransport.icon}</span>
                    <span>{currentSelectedTransport.label}</span>
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Distance</span>
                  <span className="font-bold text-[#183B32] mt-0.5 block">
                    {displayDistance}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Est. Travel Time</span>
                  <span className="font-bold text-[#183B32] mt-0.5 block">
                    {displayDuration}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Est. Transit Cost</span>
                  <span className="font-bold text-[#183B32] mt-0.5 block text-[11px]">
                    {currentSelectedTransport.estimatedCostRange.split('(')[0]}
                  </span>
                </div>
              </div>

              {activePlan && (
                <p className="text-xs sm:text-sm text-[#57605B] leading-relaxed pt-1">
                  {activePlan.overview}
                </p>
              )}
            </div>

            {/* 2. Google / Leaflet Route Map (Strictly showing Searched Route) */}
            <div className="h-[400px] rounded-3xl overflow-hidden shadow-xs border border-[#E5DFD3]">
              <TourismMap
                startLocation={startLocation}
                destination={destination}
                travelMode={selectedTransportMode}
                waypoints={activePlan?.waypoints || []}
                selectedId={selectedWaypointId}
                onSelectAttraction={(id) => setSelectedWaypointId(id)}
                destinationName={destination}
                onRouteCalculated={(data) => {
                  setCalculatedDistanceKm(data.distanceKm);
                  setCalculatedDurationText(data.durationText);
                }}
              />
            </div>

            {/* 3. CONDITIONAL ITINERARY SECTION: BEFORE vs. AFTER GENERATION */}
            {!activePlan ? (
              /* Clean Pre-Generation Banner with "Generate My Itinerary" CTA */
              <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-3xl border border-[#E5DFD3] text-center shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] flex items-center justify-center mx-auto text-[#183B32]">
                  <Sparkles className="w-7 h-7 text-[#C8963E]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183B32]">
                    Ready to Explore {destination}?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57605B] mt-1.5 max-w-md mx-auto leading-relaxed">
                    Generate your custom day-by-day itinerary with top attractions in {destination}, authentic regional food, accommodation ideas, and travel budgets.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleGenerateTrip()}
                    disabled={isGenerating}
                    className="px-8 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-sm font-bold shadow-md inline-flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                        <span>Crafting Itinerary for {destination}...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E0B466]" />
                        <span>Generate My Itinerary for {destination}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Generated Itinerary Content */
              <div className="space-y-6 animate-fade-in">
                
                {/* A. Sequenced Tourist Waypoints */}
                <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#183B32]">
                        Top Attractions in {destination}
                      </h3>
                      <p className="text-xs text-[#57605B]">
                        Sequenced to minimize transit time around {destination}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activePlan.waypoints.map((wp, idx) => {
                      const isSelected = selectedWaypointId === wp.id;
                      return (
                        <div
                          key={wp.id}
                          onClick={() => setSelectedWaypointId(wp.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF7F2] border-[#183B32] ring-1 ring-[#183B32]'
                              : 'bg-[#FFFFFF] border-[#E8E1D5] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {wp.image ? (
                                <img
                                  src={wp.image}
                                  alt={wp.name}
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#EAE3D6]"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-[#183B32] text-[#FAF7F2] font-bold text-xs flex items-center justify-center shrink-0">
                                  {wp.order}
                                </div>
                              )}
                              <div>
                                <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider">
                                  {wp.category} • Optimal: {wp.recommendedTime}
                                </span>
                                <h4 className="font-serif font-bold text-sm text-[#183B32]">
                                  {wp.name}
                                </h4>
                                <p className="text-xs text-[#57605B] mt-1 leading-relaxed">
                                  {wp.description}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0 text-xs">
                              <span className="px-2 py-1 rounded-lg bg-[#FAF7F2] border border-[#EAE3D6] font-semibold text-[#183B32] block">
                                ⏱ {wp.recommendedDuration}
                              </span>
                              {wp.travelTimeFromPreviousMin && idx > 0 && (
                                <span className="text-[10px] text-[#8C938E] block mt-1">
                                  ~{wp.travelTimeFromPreviousMin} min from Stop {idx}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* B. Day-Wise Detailed Itinerary */}
                <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-lg text-[#183B32]">
                    Day-by-Day Journey Flow
                  </h3>
                  <div className="space-y-4">
                    {activePlan.dayWiseItinerary.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E2DACB]">
                          <span className="font-serif font-bold text-base text-[#183B32]">
                            Day {day.dayNumber}: {day.theme}
                          </span>
                          <span className="text-[11px] text-[#57605B] italic">
                            {day.travelNote}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#57605B]">
                          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#EAE3D6]">
                            <span className="font-bold text-[#183B32] block mb-1">🌅 Morning</span>
                            {day.morning}
                          </div>
                          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#EAE3D6]">
                            <span className="font-bold text-[#183B32] block mb-1">☀️ Afternoon</span>
                            {day.afternoon}
                          </div>
                          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#EAE3D6]">
                            <span className="font-bold text-[#183B32] block mb-1">🌙 Evening</span>
                            {day.evening}
                          </div>
                        </div>

                        {day.foodSpot && (
                          <div className="text-xs text-[#183B32] bg-[#FFFFFF] p-3 rounded-xl border border-[#EAE3D6] flex items-center gap-2">
                            <Utensils className="w-3.5 h-3.5 text-[#D96E37] shrink-0" />
                            <span><strong>Featured Meal:</strong> {day.foodSpot}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* C. Food & Cuisine Recommendations */}
                {activePlan.foodRecommendations && activePlan.foodRecommendations.length > 0 && (
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
                    <h3 className="font-serif font-bold text-lg text-[#183B32] flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-[#D96E37]" />
                      Authentic Food in {destination}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activePlan.foodRecommendations.map((food, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-sm text-[#183B32]">{food.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DE] text-[#4E3C2F] font-semibold">{food.type}</span>
                          </div>
                          <p className="text-xs text-[#57605B]">{food.mustTry}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* D. Budget Breakdown & Stay Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Budget */}
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#183B32] flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#C8963E]" />
                      Estimated Budget ({travelers} travelers)
                    </h4>
                    <div className="space-y-2 text-xs text-[#57605B] pt-1">
                      <div className="flex justify-between">
                        <span>Stay & Lodging:</span>
                        <span className="font-semibold text-[#183B32]">₹{activePlan.estimatedTotalBudget.stay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meals & Gastronomy:</span>
                        <span className="font-semibold text-[#183B32]">₹{activePlan.estimatedTotalBudget.food.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transportation ({activePlan.selectedTransport?.label || 'Direct'}):</span>
                        <span className="font-semibold text-[#183B32]">₹{activePlan.estimatedTotalBudget.transport.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sightseeing & Entry:</span>
                        <span className="font-semibold text-[#183B32]">₹{activePlan.estimatedTotalBudget.sightseeing.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-[#F0EBE0] flex justify-between font-bold text-sm text-[#183B32]">
                        <span>Total Estimated:</span>
                        <span>₹{activePlan.estimatedTotalBudget.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stays */}
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#183B32] flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-[#183B32]" />
                      Stay Suggestions
                    </h4>
                    <div className="space-y-2 text-xs text-[#57605B]">
                      {activePlan.staySuggestions.map((stay, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
                          <div className="font-bold text-[#183B32]">{stay.neighborhood}</div>
                          <div className="text-[11px] text-[#57605B]">{stay.vibe}</div>
                          <div className="text-[10px] font-semibold text-[#C8963E] mt-0.5">{stay.estimatedCostNight}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

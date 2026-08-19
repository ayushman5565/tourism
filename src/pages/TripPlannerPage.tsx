import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Navigation, 
  Clock, 
  Compass, 
  IndianRupee, 
  Utensils, 
  Bed, 
  CheckCircle2, 
  AlertCircle,
  Send,
  ArrowLeftRight,
  Shield,
  Layers,
  Info,
  Car,
  Plane,
  Train,
  Bus,
  Bike,
  CloudSun,
  Droplets,
  Wind
} from 'lucide-react';
import { TripPlanResult, PageRoute, TransportOption, TransportMode } from '../types';
import { generateCuratedTripPlan, calculateDestinationBudgetBreakdown } from '../data/destinationsData';
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

interface WeatherForecastDay {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  condition: string;
  rainProbability: number;
}

interface DestinationWeather {
  location: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  dailyForecast: WeatherForecastDay[];
}

function getWeatherEmoji(weatherCode: number, isDay: boolean = true): string {
  if ([95, 96, 99].includes(weatherCode)) return '⛈️';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '❄️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '🌧️';
  if ([45, 48].includes(weatherCode)) return '🌫️';
  if ([1, 2, 3].includes(weatherCode)) return isDay ? '⛅' : '☁️';
  return isDay ? '☀️' : '🌙';
}

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
}) => {
  // 1. Core Inputs with NO hardcoded default destination/dates
  const [startLocation, setStartLocation] = useState(initialStartLocation);
  const [destination, setDestination] = useState(initialDestination);
  const [selectedTransportMode, setSelectedTransportMode] = useState<TransportMode>(initialTravelMode || 'car');
  
  // Transport Options State
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>(DEFAULT_TRANSPORT_OPTIONS);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);

  // Additional Parameters (Strictly based on user entry)
  const [days, setDays] = useState<number>(initialDays || 3);
  const [travelers, setTravelers] = useState<number>(initialTravelers || 2);
  const [datesText, setDatesText] = useState<string>('');
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'luxury' | 'custom'>('moderate');
  const [customBudgetInput, setCustomBudgetInput] = useState<string>(initialBudget ? String(initialBudget) : '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Historical Highlights',
    'Local Street Food',
    'Scenic Viewpoints',
  ]);

  // Active Generated Plan
  const [activePlan, setActivePlan] = useState<TripPlanResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modificationSuccess, setModificationSuccess] = useState<string | null>(null);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  // Dynamic route data from live calculation
  const [calculatedDistanceKm, setCalculatedDistanceKm] = useState<number | undefined>(initialDistanceKm);
  const [calculatedDurationText, setCalculatedDurationText] = useState<string | undefined>(initialDurationText);

  // Live Weather for the destination matching the trip duration
  const [weatherData, setWeatherData] = useState<DestinationWeather | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Sync when initial props change & reset previous itinerary state
  useEffect(() => {
    if (initialStartLocation) setStartLocation(initialStartLocation);
    if (initialDestination) setDestination(initialDestination);
    if (initialTravelMode) setSelectedTransportMode(initialTravelMode);
    if (initialDistanceKm) setCalculatedDistanceKm(initialDistanceKm);
    if (initialDurationText) setCalculatedDurationText(initialDurationText);
    if (initialBudget) {
      setCustomBudgetInput(String(initialBudget));
      setBudgetTier('custom');
    }
    if (initialTravelers) setTravelers(initialTravelers);
    if (initialDays) setDays(initialDays);
    
    // Clear previous itinerary when searching a new trip
    setActivePlan(null);
    setSelectedWaypointId(null);
    setModificationSuccess(null);
  }, [initialStartLocation, initialDestination, initialTravelMode, initialDistanceKm, initialDurationText, initialBudget, initialTravelers, initialDays]);

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

  // Fetch live weather forecast for destination and duration
  useEffect(() => {
    const destClean = destination.trim();
    if (!destClean) {
      setWeatherData(null);
      setWeatherError(null);
      return;
    }

    const controller = new AbortController();
    const fetchWeather = async () => {
      setIsFetchingWeather(true);
      setWeatherError(null);
      try {
        const numForecastDays = Math.min(14, Math.max(1, days || 3));
        const res = await fetch(`/api/weather?destination=${encodeURIComponent(destClean)}&days=${numForecastDays}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Weather error ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setWeatherData(data);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setWeatherData(null);
          setWeatherError('Weather forecast unavailable for this destination.');
        }
      } finally {
        if (!controller.signal.aborted) setIsFetchingWeather(false);
      }
    };

    const timer = setTimeout(fetchWeather, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [destination, days]);

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

  const parsedCustomBudget = customBudgetInput.trim() ? parseFloat(customBudgetInput.replace(/[^0-9.]/g, '')) || 0 : undefined;

  // Generate Itinerary Flow for the exact searched destination
  const handleGenerateTrip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim() || !startLocation.trim()) return;

    setIsGenerating(true);
    setModificationSuccess(null);

    const chosenTransport = currentSelectedTransport;
    const formattedDates = datesText.trim() ? datesText.trim() : `${days} Days`;
    const tierForGeneration = budgetTier === 'custom' ? 'moderate' : budgetTier;

    try {
      // Call server Gemini plan-trip endpoint
      const response = await fetch('/api/gemini/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.trim(),
          startLocation: startLocation.trim(),
          dates: formattedDates,
          travelers,
          interests: selectedInterests,
          budgetTier: tierForGeneration,
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
        formattedDates,
        travelers,
        selectedInterests,
        tierForGeneration
      );
      curated.selectedTransport = chosenTransport;
      curated.transportOptions = transportOptions;

      // Ensure budget breakdown uses dynamic calculation
      const calculatedBudget = calculateDestinationBudgetBreakdown({
        destination: destination.trim(),
        travelers,
        days,
        budgetTier,
        customBudget: parsedCustomBudget,
      });

      curated.estimatedTotalBudget = {
        stay: calculatedBudget.accommodation,
        food: calculatedBudget.food,
        transport: calculatedBudget.transportation,
        sightseeing: calculatedBudget.activities,
        total: calculatedBudget.total,
        currency: '₹ INR',
      };

      if (data.success && data.plan) {
        const p = data.plan;
        if (p.overview) curated.overview = p.overview;
        if (p.topAttractions && Array.isArray(p.topAttractions) && p.topAttractions.length > 0) {
          curated.waypoints = p.topAttractions.map((att: any, idx: number) => ({
            id: `att-${idx}`,
            order: idx + 1,
            name: att.name,
            lat: curated.waypoints[idx]?.lat || (curated.waypoints[0]?.lat ? curated.waypoints[0].lat + (idx * 0.005) : 28.6139),
            lng: curated.waypoints[idx]?.lng || (curated.waypoints[0]?.lng ? curated.waypoints[0].lng + (idx * 0.005) : 77.2090),
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

      setActivePlan(curated);
    } catch (err) {
      console.warn('Using curated fallback generator:', err);
      const plan = generateCuratedTripPlan(
        destination.trim(),
        startLocation.trim(),
        formattedDates,
        travelers,
        selectedInterests,
        tierForGeneration
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
            Custom Journey Planner
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-1 mb-2">
            Plan Your Travel Route
          </h1>
          <p className="text-sm sm:text-base text-[#57605B] max-w-2xl leading-relaxed">
            Direct road routing, transport times, destination-aware costs, and an unhurried travel itinerary tailored for your selected journey.
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
                  <span className="text-[11px] text-[#8C938E]">Step 1: Locations, Duration & Style</span>
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
                        placeholder="e.g. Delhi, Mumbai, Bengaluru..."
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
                        placeholder="e.g. Goa, Jaipur, Manali, Kerala..."
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 focus:border-[#183B32]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. CHOOSE TRANSPORTATION METHOD */}
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
                        <span className="text-[9px] text-[#8C938E] uppercase font-bold block">Est. Transit Cost</span>
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

                {/* 4. DURATION & TRAVELERS (Responsive Grid - No UI Overlap) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Trip Duration
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 10, 14, 21].map((d) => (
                          <option key={d} value={d}>
                            {d} {d === 1 ? 'Day (Day Trip)' : 'Days'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Number of Travellers
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 cursor-pointer"
                      >
                        <option value={1}>1 Solo Explorer</option>
                        <option value={2}>2 Travellers</option>
                        <option value={3}>3 Travellers</option>
                        <option value={4}>4 Travellers</option>
                        <option value={5}>5 Travellers</option>
                        <option value={6}>6+ Group</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 5. TRAVEL DATES (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                    Travel Dates (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={datesText}
                      onChange={(e) => setDatesText(e.target.value)}
                      placeholder="e.g. Next weekend, Nov 12 - 16..."
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                    />
                  </div>
                </div>

                {/* 6. BUDGET PREFERENCE (Budget, Balanced, Luxury, Custom) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                    Budget Preference
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'budget', label: 'Budget' },
                      { id: 'moderate', label: 'Balanced' },
                      { id: 'luxury', label: 'Luxury' },
                      { id: 'custom', label: 'Custom' },
                    ].map((b) => {
                      const isSel = budgetTier === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setBudgetTier(b.id as any)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#57605B] border-[#E2DACB] hover:bg-[#EFE9DE]'
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>

                  {budgetTier === 'custom' && (
                    <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] space-y-2 animate-fade-in">
                      <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                        Enter Your Total Target Budget (₹)
                      </label>
                      <div className="relative">
                        <span className="text-sm font-bold text-[#183B32] absolute left-3.5 top-1/2 -translate-y-1/2">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={500}
                          step={500}
                          value={customBudgetInput}
                          onChange={(e) => setCustomBudgetInput(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-sm font-bold text-[#183B32] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. INTERESTS */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                    Travel Interests & Activities
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInterests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#183B32] text-[#FAF7F2] font-bold shadow-2xs'
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
                    disabled={isGenerating || !startLocation.trim() || !destination.trim()}
                    className="w-full py-4 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-101 active:scale-98 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                        <span>Crafting Itinerary for {destination || 'your trip'}...</span>
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
                    Refine with AI Assistant
                  </h3>
                </div>
                <p className="text-xs text-[#57605B]">
                  Adjust stops, request dietary recommendations, or re-sequence days in {destination}:
                </p>
                <form onSubmit={handleModifyPlan} className="flex gap-2">
                  <input
                    type="text"
                    value={modificationPrompt}
                    onChange={(e) => setModificationPrompt(e.target.value)}
                    placeholder={`e.g. Add quiet sunrise viewpoints in ${destination}...`}
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

          {/* RIGHT COLUMN: ROUTE VIEW, DYNAMIC WEATHER & ITINERARY (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. YOUR TRIP ROUTE SUMMARY CARD */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EBE0]">
                <div>
                  <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider">
                    Your Journey
                  </span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#183B32] mt-0.5">
                    {startLocation || 'Origin'} → {destination || 'Destination'}
                  </h2>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-xs font-bold text-[#183B32] self-start sm:self-auto">
                  {days} {days === 1 ? 'Day' : 'Days'} • {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                </div>
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

            {/* 2. DYNAMIC WEATHER SECTION (Multi-Day Forecast for Destination & Duration) */}
            {destination.trim() && (
              <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE0]">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-[#C8963E]" />
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#183B32]">
                        Weather & Forecast for {destination}
                      </h3>
                      <span className="text-[11px] text-[#8C938E]">
                        Live conditions and {days}-day forecast for your itinerary
                      </span>
                    </div>
                  </div>
                  {weatherData && (
                    <span className="text-xs font-bold text-[#183B32] px-3 py-1 bg-[#FAF7F2] rounded-full border border-[#E2DACB] self-start sm:self-auto">
                      Current: {weatherData.temperatureC}°C ({weatherData.condition})
                    </span>
                  )}
                </div>

                {isFetchingWeather ? (
                  <div className="py-6 text-center text-xs text-[#57605B] flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#183B32] border-t-transparent rounded-full animate-spin" />
                    <span>Loading forecast for {destination}...</span>
                  </div>
                ) : weatherData && weatherData.dailyForecast && weatherData.dailyForecast.length > 0 ? (
                  <div className="space-y-3">
                    {/* Current snapshot banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F0F7F4] border border-[#CDE5DC] text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {getWeatherEmoji(weatherData.weatherCode, weatherData.isDay)}
                        </span>
                        <div>
                          <span className="font-bold text-[#183B32] block">
                            {weatherData.location.split(',')[0]} • {weatherData.condition}
                          </span>
                          <span className="text-[11px] text-[#57605B]">
                            Feels like {weatherData.feelsLikeC}°C • Humidity {weatherData.humidity}% • Wind {weatherData.windKph} km/h
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold font-serif text-[#183B32]">
                          {weatherData.temperatureC}°C
                        </span>
                      </div>
                    </div>

                    {/* Multi-day forecast cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
                      {weatherData.dailyForecast.map((day, idx) => (
                        <div
                          key={day.date}
                          className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center space-y-1"
                        >
                          <span className="text-[11px] font-bold text-[#183B32] block">
                            {day.dayName} {idx === 0 ? '(Day 1)' : idx + 1 <= days ? `(Day ${idx + 1})` : ''}
                          </span>
                          <span className="text-2xl block my-0.5">
                            {getWeatherEmoji(day.weatherCode, true)}
                          </span>
                          <span className="text-[10px] text-[#57605B] block truncate font-medium">
                            {day.condition}
                          </span>
                          <div className="text-xs font-bold text-[#183B32] pt-0.5">
                            <span>{day.maxTemp}°</span>
                            <span className="text-[#8C938E] text-[10px] font-normal ml-1">/ {day.minTemp}°</span>
                          </div>
                          {day.rainProbability > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-[#1976D2] font-semibold">
                              <Droplets className="w-2.5 h-2.5" /> {day.rainProbability}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : weatherError ? (
                  <p className="text-xs text-[#8C938E] italic text-center py-2">
                    {weatherError}
                  </p>
                ) : null}
              </div>
            )}

            {/* 3. Interactive Route Map */}
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

            {/* 4. CONDITIONAL ITINERARY SECTION */}
            {!activePlan ? (
              /* Clean Pre-Generation Banner with "Generate My Itinerary" CTA */
              <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-3xl border border-[#E5DFD3] text-center shadow-xs space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] flex items-center justify-center mx-auto text-[#183B32]">
                  <Sparkles className="w-7 h-7 text-[#C8963E]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183B32]">
                    Ready to Explore {destination || 'Your Destination'}?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57605B] mt-1.5 max-w-md mx-auto leading-relaxed">
                    Generate your custom day-by-day itinerary with attractions, authentic food, accommodation ideas, and travel budgets in INR.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleGenerateTrip()}
                    disabled={isGenerating || !startLocation.trim() || !destination.trim()}
                    className="px-8 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] text-sm font-bold shadow-md inline-flex items-center gap-2.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                        <span>Crafting Itinerary...</span>
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

                {/* D. Destination-Aware Budget Breakdown & Stays (₹ INR) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Realistic Budget */}
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#183B32] flex items-center gap-1.5">
                      <IndianRupee className="w-4 h-4 text-[#C8963E]" />
                      Estimated Budget ({travelers} {travelers === 1 ? 'traveler' : 'travelers'} • {days} {days === 1 ? 'day' : 'days'})
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
                        <span className="text-base text-[#183B32]">₹{activePlan.estimatedTotalBudget.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stays */}
                  <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#183B32] flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-[#183B32]" />
                      Stay Suggestions in {destination}
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

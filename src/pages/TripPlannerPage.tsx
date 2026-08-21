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
  Wind,
  Bookmark,
  History,
  ShieldAlert,
  Users2,
  X,
  Check,
  Heart
} from 'lucide-react';
import { TripPlanResult, PageRoute, TransportOption, TransportMode, SavedTrip } from '../types';
import { generateCuratedTripPlan, calculateDestinationBudgetBreakdown } from '../data/destinationsData';
import { TourismMap } from '../components/TourismMap';
import { saveTrip } from '../utils/tripStorage';
import { useAuth } from '../context/AuthContext';

export interface TripPlannerPageProps {
  initialStartLocation?: string;
  initialDestination?: string;
  initialTravelMode?: TransportMode;
  initialDistanceKm?: number;
  initialDurationText?: string;
  initialBudget?: number;
  initialTravelers?: number;
  initialDays?: number;
  onNavigate: (page: PageRoute) => void;
  onPlanGenerated?: (
    plan: TripPlanResult,
    config: {
      startLocation: string;
      destination: string;
      travelMode: TransportMode;
      days: number;
      travelers: number;
      datesText: string;
      budgetTier: 'budget' | 'moderate' | 'luxury' | 'custom';
      customBudget?: number;
      distanceKm?: number;
      durationText?: string;
    },
    savedTrip?: SavedTrip
  ) => void;
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
  onPlanGenerated,
  onStartGroupTrip,
}) => {
  const { user } = useAuth();
  // 1. Core Inputs
  const [startLocation, setStartLocation] = useState(initialStartLocation);
  const [destination, setDestination] = useState(initialDestination);
  const [selectedTransportMode, setSelectedTransportMode] = useState<TransportMode>(initialTravelMode || 'car');
  
  // Transport Options State
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>(DEFAULT_TRANSPORT_OPTIONS);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);

  // Additional Parameters
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

  // Loading generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Dynamic route data from live calculation
  const [calculatedDistanceKm, setCalculatedDistanceKm] = useState<number | undefined>(initialDistanceKm);
  const [calculatedDurationText, setCalculatedDurationText] = useState<string | undefined>(initialDurationText);

  // Live Weather for the destination matching the trip duration
  const [weatherData, setWeatherData] = useState<DestinationWeather | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Sync when initial props change
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
  };

  const parsedCustomBudget = customBudgetInput.trim() 
    ? parseFloat(customBudgetInput.replace(/[^0-9.]/g, '')) || 0 
    : undefined;

  // Generate Itinerary Flow & Transition to the New Dedicated Page
  const handleGenerateTrip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim() || !startLocation.trim()) return;

    setIsGenerating(true);
    setSaveError(null);

    const chosenTransport = currentSelectedTransport;
    const formattedDates = datesText.trim() ? datesText.trim() : `${days} Days`;
    const tierForGeneration = budgetTier === 'custom' ? 'moderate' : budgetTier;

    let finalPlan: TripPlanResult;

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

      finalPlan = curated;
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
      finalPlan = plan;
    } finally {
      setIsGenerating(false);
    }

    // Automatically archive the newly generated trip with all its itinerary & expense details into the database
    const tripUniqueId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tripTitle = `${destination.trim()} Trip (${days} Days)`;
    const displayDist = calculatedDistanceKm ? `${calculatedDistanceKm} km` : chosenTransport.distanceText;
    const displayDur = calculatedDurationText ? calculatedDurationText : chosenTransport.durationText;

    const fullSavedTrip: SavedTrip = {
      id: tripUniqueId,
      customName: tripTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startLocation: startLocation.trim(),
      destination: destination.trim(),
      travelers,
      days,
      durationDays: days,
      travelDates: formattedDates,
      budgetTier,
      customBudget: parsedCustomBudget,
      selectedPreferences: selectedInterests,
      transportMode: selectedTransportMode,
      transportDetails: {
        label: chosenTransport.label,
        distanceText: displayDist,
        durationText: displayDur,
        estimatedCost: chosenTransport.estimatedCostRange,
      },
      generatedPlan: finalPlan,
      dailyItinerary: finalPlan.dayWiseItinerary || [],
      waypoints: finalPlan.waypoints || [],
      placesVisited: (finalPlan.waypoints || []).map((w) => w.name),
      foodRecommendations: finalPlan.foodRecommendations || [],
      accommodationDetails: finalPlan.staySuggestions || [],
      budgetBreakdown: finalPlan.estimatedTotalBudget
        ? {
            accommodation: finalPlan.estimatedTotalBudget.stay,
            food: finalPlan.estimatedTotalBudget.food,
            transportation: finalPlan.estimatedTotalBudget.transport,
            activities: finalPlan.estimatedTotalBudget.sightseeing,
            miscellaneous: Math.max(0, finalPlan.estimatedTotalBudget.total - (finalPlan.estimatedTotalBudget.stay + finalPlan.estimatedTotalBudget.food + finalPlan.estimatedTotalBudget.transport + finalPlan.estimatedTotalBudget.sightseeing)),
            total: finalPlan.estimatedTotalBudget.total,
            costPerPerson: Math.round(finalPlan.estimatedTotalBudget.total / (travelers || 1)),
            remainingBudget: parsedCustomBudget ? Math.max(0, parsedCustomBudget - finalPlan.estimatedTotalBudget.total) : 0,
            currency: 'INR',
          }
        : calculateDestinationBudgetBreakdown({
            destination: destination.trim(),
            travelers,
            days,
            budgetTier,
            customBudget: parsedCustomBudget,
          }),
      totalPlannedBudget: finalPlan.estimatedTotalBudget?.total || 0,
      actualSpending: 0,
      notes: `Planned via Trip Planner for ${destination.trim()} (${days} days, ${travelers} travelers).`,
      memories: [],
    };

    // Persist before moving to the itinerary so every generated trip exists in Supabase.
    try {
      await saveTrip(fullSavedTrip, user?.uid);
    } catch (error: any) {
      setSaveError(error.message || 'Unable to save this trip to Supabase. Please try again.');
      return;
    }

    // Pass the generated plan, configuration, and saved trip to parent and navigate to the dedicated Itinerary page!
    if (onPlanGenerated) {
      onPlanGenerated(finalPlan, {
        startLocation: startLocation.trim(),
        destination: destination.trim(),
        travelMode: selectedTransportMode,
        days,
        travelers,
        datesText,
        budgetTier,
        customBudget: parsedCustomBudget,
        distanceKm: calculatedDistanceKm,
        durationText: calculatedDurationText,
      }, fullSavedTrip);
    }

    onNavigate('itinerary');
  };

  const displayDistance = calculatedDistanceKm 
    ? `${calculatedDistanceKm} km` 
    : currentSelectedTransport.distanceText;

  const displayDuration = calculatedDurationText 
    ? calculatedDurationText 
    : currentSelectedTransport.durationText;

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      {saveError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        </div>
      )}
      
      {/* 1. Header Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
                Personalized Route & Budget Studio
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-1 mb-2">
                Trip Planner
              </h1>
              <p className="text-sm sm:text-base text-[#57605B] max-w-2xl leading-relaxed">
                Design custom itineraries with live transport duration, multi-day weather forecasts, authentic food spots, and INR expense projections.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('trip-history')}
                className="px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] hover:bg-[#EFE9DE] text-xs font-semibold text-[#183B32] flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <History className="w-3.5 h-3.5 text-[#C8963E]" />
                <span>Trip History</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('emergency')}
                className="px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] hover:bg-[#FEF6F0] text-xs font-semibold text-[#D96E37] flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#D96E37]" />
                <span>Emergency Hub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: INTERACTIVE TRIP PLANNER FORM (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#183B32] text-[#FAF7F2] flex items-center justify-center">
                    <Compass className="w-4 h-4 text-[#E0B466]" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-[#183B32]">
                      Plan Your Journey
                    </h2>
                    <p className="text-[11px] text-[#57605B]">
                      Enter your route, transport, budget & timeline
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleGenerateTrip} className="space-y-4">
                
                {/* 1. STARTING LOCATION & DESTINATION INPUTS */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Starting Location *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={startLocation}
                        onChange={(e) => setStartLocation(e.target.value)}
                        placeholder="e.g. New Delhi, Mumbai, Bengaluru..."
                        required
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-semibold text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      />
                    </div>
                  </div>

                  {/* Swap button */}
                  <div className="flex justify-center -my-1 relative z-10">
                    <button
                      type="button"
                      onClick={handleSwapLocations}
                      title="Swap Origin & Destination"
                      className="p-1.5 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-[#57605B] hover:text-[#183B32] hover:bg-[#EAE3D6] transition-colors shadow-xs cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Destination *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#D96E37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g. Goa, Ladakh, Jaipur, Manali..."
                        required
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-semibold text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. TRANSPORT MODE SELECTION */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Preferred Mode of Travel
                    </label>
                    {isLoadingTransport && (
                      <span className="text-[10px] text-[#C8963E] flex items-center gap-1">
                        <div className="w-2.5 h-2.5 border border-[#C8963E] border-t-transparent rounded-full animate-spin" />
                        Estimating routes...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {transportOptions.map((opt) => {
                      const isSelected = selectedTransportMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedTransportMode(opt.id)}
                          className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-2xs'
                              : 'bg-[#FAF7F2] text-[#57605B] border-[#E2DACB] hover:bg-[#EFE9DE]'
                          }`}
                        >
                          <span className="text-base">{opt.icon}</span>
                          <span className="text-[10px] font-bold truncate max-w-full">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Highlight current transport stats */}
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-between text-xs text-[#57605B]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{currentSelectedTransport.icon}</span>
                      <span className="font-semibold text-[#183B32]">
                        {currentSelectedTransport.label}:
                      </span>
                      <span>{currentSelectedTransport.durationText}</span>
                    </div>
                    <span className="font-bold text-[#183B32]">
                      {currentSelectedTransport.estimatedCostRange.split('(')[0]}
                    </span>
                  </div>
                </div>

                {/* 3. DURATION & TRAVELERS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Duration (Days)
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={days}
                        onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Travelers
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={travelers}
                        onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. TRAVEL DATES (Optional) */}
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
                      placeholder="e.g. Nov 12 - 16, Weekend getaways..."
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-sm font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                    />
                  </div>
                </div>

                {/* 5. BUDGET PREFERENCE */}
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

                {/* 6. TRAVEL INTERESTS */}
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
          </div>

          {/* RIGHT COLUMN: ROUTE VIEW, DYNAMIC WEATHER & MAP (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. YOUR TRIP ROUTE SUMMARY CARD */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EBE0]">
                <div>
                  <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider">
                    Journey Overview
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
                waypoints={[]}
                destinationName={destination}
                onRouteCalculated={(data) => {
                  setCalculatedDistanceKm(data.distanceKm);
                  setCalculatedDurationText(data.durationText);
                }}
              />
            </div>

            {/* 4. "Generate My Itinerary" Banner */}
            <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-3xl border border-[#E5DFD3] text-center shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] flex items-center justify-center mx-auto text-[#183B32]">
                <Sparkles className="w-7 h-7 text-[#C8963E]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#183B32]">
                  Ready to Generate Your {destination || 'Custom'} Itinerary?
                </h3>
                <p className="text-xs sm:text-sm text-[#57605B] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Click below to generate and view your day-by-day travel plan, authentic foods, recommended stays, and interactive budget breakdown on the itinerary page.
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
                      <span>Crafting Your Complete Itinerary...</span>
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

          </div>

        </div>
      </div>

    </div>
  );
};

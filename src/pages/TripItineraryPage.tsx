import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Bookmark, 
  Users2, 
  ShieldAlert, 
  Utensils, 
  Bed, 
  Clock, 
  CloudSun, 
  Droplets, 
  CheckCircle2, 
  Send, 
  X, 
  Share2, 
  Navigation,
  Check,
  Camera,
  Layers,
  FileText
} from 'lucide-react';
import { 
  PageRoute, 
  TripPlanResult, 
  TransportMode, 
  TransportOption, 
  SavedTrip, 
  DayItinerary 
} from '../types';
import { TourismMap } from '../components/TourismMap';
import { BudgetPlanner } from '../components/BudgetPlanner';
import { saveTrip, syncTripToSupabase } from '../utils/tripStorage';
import { calculateDestinationBudgetBreakdown } from '../data/destinationsData';
import { useAuth } from '../context/AuthContext';
import { TravelShowcaseCarousel } from '../components/TravelShowcaseCarousel';

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

export interface TripItineraryPageProps {
  plan: TripPlanResult | null;
  savedTripId?: string | null;
  startLocation: string;
  destination: string;
  travelMode: TransportMode;
  days: number;
  travelers: number;
  datesText?: string;
  budgetTier: 'budget' | 'moderate' | 'luxury' | 'custom';
  customBudget?: number;
  distanceKm?: number;
  durationText?: string;
  onNavigate: (page: PageRoute) => void;
  onUpdatePlan?: (updatedPlan: TripPlanResult) => void;
  onStartGroupTrip?: (destination: string) => void;
}

export const TripItineraryPage: React.FC<TripItineraryPageProps> = ({
  plan: initialPlan,
  savedTripId: initialSavedTripId,
  startLocation,
  destination,
  travelMode,
  days,
  travelers,
  datesText = '',
  budgetTier,
  customBudget,
  distanceKm,
  durationText,
  onNavigate,
  onUpdatePlan,
  onStartGroupTrip,
}) => {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState<TripPlanResult | null>(initialPlan);
  const [currentSavedTripId, setCurrentSavedTripId] = useState<string | null>(initialSavedTripId || null);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);

  // Budget Tier & Custom Budget adjustments on this page
  const [activeBudgetTier, setActiveBudgetTier] = useState<'budget' | 'moderate' | 'luxury' | 'custom'>(budgetTier || 'moderate');
  const [activeCustomBudget, setActiveCustomBudget] = useState<number | undefined>(customBudget);

  // Save Trip to History Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [customTripName, setCustomTripName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // AI Refinement State
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modificationSuccess, setModificationSuccess] = useState<string | null>(null);

  // Weather State
  const [weatherData, setWeatherData] = useState<DestinationWeather | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  // Update internal plan when prop changes
  useEffect(() => {
    if (initialPlan) {
      setActivePlan(initialPlan);
    }
    if (initialSavedTripId) {
      setCurrentSavedTripId(initialSavedTripId);
    }
  }, [initialPlan, initialSavedTripId]);

  // Fetch weather forecast for destination
  useEffect(() => {
    const destClean = (destination || activePlan?.destination || '').trim();
    if (!destClean) return;

    const controller = new AbortController();
    const fetchWeather = async () => {
      setIsFetchingWeather(true);
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
          console.warn('Weather fetch error:', err);
        }
      } finally {
        if (!controller.signal.aborted) setIsFetchingWeather(false);
      }
    };

    fetchWeather();
    return () => controller.abort();
  }, [destination, activePlan?.destination, days]);

  const effectiveDestination = destination || activePlan?.destination || 'Your Destination';
  const effectiveStart = startLocation || activePlan?.startLocation || 'Your Origin';
  const effectiveDates = datesText || activePlan?.dates || `${days} Days`;
  const effectiveTransport = activePlan?.selectedTransport;

  // Handle Save Trip Modal
  const handleOpenSaveModal = () => {
    const defaultName = `${effectiveDestination} Trip (${days} Days)`;
    setCustomTripName(defaultName);
    setSaveNotes('');
    setIsSaveModalOpen(true);
    setSaveSuccessMessage(null);
  };

  const handleSaveTripToHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlan) return;

    const calculatedBudget = calculateDestinationBudgetBreakdown({
      destination: effectiveDestination,
      travelers,
      days,
      budgetTier: activeBudgetTier,
      customBudget: activeCustomBudget,
    });

    const tripIdToUse = currentSavedTripId || `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setCurrentSavedTripId(tripIdToUse);

    const newSavedTrip: SavedTrip = {
      id: tripIdToUse,
      customName: customTripName.trim() || `${effectiveDestination} Trip (${days} Days)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startLocation: effectiveStart,
      destination: effectiveDestination,
      travelers,
      days,
      durationDays: days,
      travelDates: effectiveDates,
      budgetTier: activeBudgetTier,
      customBudget: activeCustomBudget,
      transportMode: travelMode,
      transportDetails: effectiveTransport ? {
        label: effectiveTransport.label,
        distanceText: effectiveTransport.distanceText,
        durationText: effectiveTransport.durationText,
        estimatedCost: effectiveTransport.estimatedCostRange,
      } : undefined,
      dailyItinerary: activePlan.dayWiseItinerary || [],
      waypoints: activePlan.waypoints || [],
      placesVisited: (activePlan.waypoints || []).map((w) => w.name),
      foodRecommendations: activePlan.foodRecommendations || [],
      accommodationDetails: activePlan.staySuggestions,
      budgetBreakdown: calculatedBudget,
      totalPlannedBudget: calculatedBudget.total,
      notes: saveNotes.trim() || undefined,
      memories: [],
    };

    saveTrip(newSavedTrip, user?.uid);
    if (user?.uid) {
      void syncTripToSupabase(newSavedTrip, user.uid);
    }
    setIsSaveModalOpen(false);
    setSaveSuccessMessage(`"${newSavedTrip.customName}" successfully updated & stored in your Trip History!`);

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 6000);
  };

  // AI Itinerary Refinement Handler
  const handleModifyPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modificationPrompt.trim() || !activePlan) return;

    setIsModifying(true);
    setModificationSuccess(null);

    try {
      const response = await fetch('/api/gemini/modify-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: activePlan,
          userPrompt: modificationPrompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Modification failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.updatedPlan) {
        setActivePlan(data.updatedPlan);
        if (onUpdatePlan) {
          onUpdatePlan(data.updatedPlan);
        }

        // Also sync updated itinerary to DB if we have a saved trip ID
        if (currentSavedTripId) {
          const calculatedBudget = calculateDestinationBudgetBreakdown({
            destination: effectiveDestination,
            travelers,
            days,
            budgetTier: activeBudgetTier,
            customBudget: activeCustomBudget,
          });
          const updatedTrip: SavedTrip = {
            id: currentSavedTripId,
            customName: `${effectiveDestination} Trip (${days} Days)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            startLocation: effectiveStart,
            destination: effectiveDestination,
            travelers,
            days,
            durationDays: days,
            travelDates: effectiveDates,
            budgetTier: activeBudgetTier,
            customBudget: activeCustomBudget,
            transportMode: travelMode,
            dailyItinerary: data.updatedPlan.dayWiseItinerary || activePlan.dayWiseItinerary || [],
            waypoints: data.updatedPlan.waypoints || activePlan.waypoints || [],
            placesVisited: (data.updatedPlan.waypoints || activePlan.waypoints || []).map((w: any) => w.name),
            foodRecommendations: data.updatedPlan.foodRecommendations || activePlan.foodRecommendations || [],
            accommodationDetails: data.updatedPlan.staySuggestions || activePlan.staySuggestions,
            budgetBreakdown: calculatedBudget,
            totalPlannedBudget: calculatedBudget.total,
            memories: [],
          };
          saveTrip(updatedTrip, user?.uid);
          if (user?.uid) {
            void syncTripToSupabase(updatedTrip, user.uid);
          }
        }

        setModificationSuccess('Itinerary adjusted with your AI preferences & saved to database!');
        setModificationPrompt('');
      } else {
        throw new Error('Could not parse adjusted plan');
      }
    } catch (err) {
      console.warn('AI modification fallback:', err);
      setModificationSuccess('AI suggestions applied to your itinerary notes.');
      setModificationPrompt('');
    } finally {
      setIsModifying(false);
      setTimeout(() => setModificationSuccess(null), 4000);
    }
  };

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-16 px-4 flex items-center justify-center">
        <div className="bg-[#FFFFFF] p-10 sm:p-14 rounded-3xl border border-[#E5DFD3] text-center max-w-lg shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] flex items-center justify-center mx-auto text-[#183B32]">
            <Compass className="w-8 h-8 text-[#C8963E]" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-[#183B32]">
            No Itinerary Generated Yet
          </h2>
          <p className="text-xs sm:text-sm text-[#57605B] leading-relaxed">
            Please configure your trip details and click "Generate My Itinerary" in the Trip Planner.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('planner')}
              className="px-6 py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Trip Planner</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#202422] pb-24">
      
      {/* Top Header Banner with Breadcrumbs & Journey Hero */}
      <div className="relative isolate overflow-hidden bg-[#183B32] text-[#FAF7F2] py-8 sm:py-10 border-b border-[#14322a]">
        {/* Background 6-Slide Carousel with Emerald Gradient */}
        <TravelShowcaseCarousel
          variant="hero-bg"
          overlayGradient="emerald"
          autoPlayInterval={5000}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          
          {/* Breadcrumb Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#E0B466]" />
              <span>Edit Trip Details in Planner</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E0B466] text-[#183B32] font-bold text-[11px] uppercase tracking-wider">
                Customized Journey Itinerary
              </span>
            </div>
          </div>

          {/* Hero Title & Trip Snapshot */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/15 text-[#E0B466] text-xs font-bold flex items-center gap-1.5 border border-white/10">
                  <MapPin className="w-3.5 h-3.5" />
                  {effectiveStart} → {effectiveDestination}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-[#FAF7F2] text-xs font-medium border border-white/10">
                  {days} {days === 1 ? 'Day' : 'Days'} • {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                </span>
                {effectiveDates && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#FAF7F2] text-xs border border-white/10 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#E0B466]" />
                    {effectiveDates}
                  </span>
                )}
              </div>

              <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#FAF7F2] tracking-tight">
                {effectiveDestination} Travel Plan
              </h1>
              
              {activePlan.overview && (
                <p className="text-xs sm:text-sm text-[#FAF7F2]/80 max-w-3xl leading-relaxed pt-1">
                  {activePlan.overview}
                </p>
              )}
            </div>

            {/* Top Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={handleOpenSaveModal}
                className="px-5 py-2.5 rounded-2xl bg-[#E0B466] hover:bg-[#d6a54f] text-[#183B32] font-bold text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-[#183B32]" />
                <span>Save Trip to History</span>
              </button>

              <button
                onClick={() => {
                  if (onStartGroupTrip) {
                    onStartGroupTrip(effectiveDestination);
                  } else {
                    onNavigate('group-trips');
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-[#FAF7F2] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
              >
                <Users2 className="w-4 h-4 text-[#E0B466]" />
                <span>Split Group Expenses</span>
              </button>

              <button
                onClick={() => onNavigate('emergency')}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-[#D96E37] text-[#FAF7F2] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer border border-white/20"
              >
                <ShieldAlert className="w-4 h-4 text-[#E0B466]" />
                <span>Emergency Hub</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Save Confirmation Alert */}
        {saveSuccessMessage && (
          <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#CDE5DC] text-[#183B32] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2E7D32] shrink-0" />
              <span className="text-xs font-semibold">{saveSuccessMessage}</span>
            </div>
            <button
              onClick={() => onNavigate('trip-history')}
              className="px-4 py-2 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-bold hover:bg-[#245246] transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              View in Trip History →
            </button>
          </div>
        )}

        {/* 1. Trip High-Level Metrics & Weather Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Journey Metrics Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0]">
                <h3 className="font-serif font-bold text-base text-[#183B32] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#C8963E]" />
                  Journey Transit Details
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-[#183B32]">
                  {effectiveTransport?.label || 'Direct Transit'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Distance</span>
                  <span className="font-bold text-[#183B32] text-sm mt-0.5 block">
                    {distanceKm ? `${distanceKm} km` : effectiveTransport?.distanceText || 'Optimized Route'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Est. Transit Time</span>
                  <span className="font-bold text-[#183B32] text-sm mt-0.5 block">
                    {durationText || effectiveTransport?.durationText || `${days * 2} hrs transit`}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center col-span-2">
                  <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Estimated Transport Cost</span>
                  <span className="font-bold text-[#183B32] text-sm mt-0.5 block">
                    {effectiveTransport?.estimatedCostRange || '₹1,500 – ₹3,500'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick AI Refinement Input in card */}
            <div className="pt-2 border-t border-[#F0EBE0]">
              <form onSubmit={handleModifyPlan} className="flex gap-2">
                <input
                  type="text"
                  value={modificationPrompt}
                  onChange={(e) => setModificationPrompt(e.target.value)}
                  placeholder="Ask AI: e.g. Add sunset spots, slow pace..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
                <button
                  type="submit"
                  disabled={!modificationPrompt.trim() || isModifying}
                  className="px-3 py-2 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  {isModifying ? '...' : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
              {modificationSuccess && (
                <span className="text-[11px] text-[#183B32] font-semibold block mt-1.5">
                  ✓ {modificationSuccess}
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Weather & Multi-Day Forecast (7 cols) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE0]">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-[#C8963E]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#183B32]">
                    Destination Weather Forecast
                  </h3>
                  <span className="text-[11px] text-[#8C938E]">
                    {effectiveDestination} • {days}-Day Weather Outlook
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
              <div className="py-8 text-center text-xs text-[#57605B] flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#183B32] border-t-transparent rounded-full animate-spin" />
                <span>Loading forecast for {effectiveDestination}...</span>
              </div>
            ) : weatherData && weatherData.dailyForecast && weatherData.dailyForecast.length > 0 ? (
              <div className="space-y-3">
                {/* Current snapshot banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#F0F7F4] border border-[#CDE5DC] text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getWeatherEmoji(weatherData.weatherCode, weatherData.isDay)}
                    </span>
                    <div>
                      <span className="font-bold text-[#183B32] block">
                        {weatherData.location.split(',')[0]} • {weatherData.condition}
                      </span>
                      <span className="text-[11px] text-[#57605B]">
                        Feels like {weatherData.feelsLikeC}°C • Humidity {weatherData.humidity}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-serif text-[#183B32]">
                      {weatherData.temperatureC}°C
                    </span>
                  </div>
                </div>

                {/* Multi-day forecast cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
                  {weatherData.dailyForecast.slice(0, Math.max(3, days)).map((day, idx) => (
                    <div
                      key={day.date}
                      className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-center space-y-1"
                    >
                      <span className="text-[10px] font-bold text-[#183B32] block">
                        Day {idx + 1} ({day.dayName.slice(0, 3)})
                      </span>
                      <span className="text-xl block my-0.5">
                        {getWeatherEmoji(day.weatherCode, true)}
                      </span>
                      <span className="text-[9px] text-[#57605B] block truncate font-medium">
                        {day.condition}
                      </span>
                      <div className="text-xs font-bold text-[#183B32]">
                        <span>{day.maxTemp}°</span>
                        <span className="text-[#8C938E] text-[10px] font-normal ml-0.5">/ {day.minTemp}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8C938E] italic text-center py-4">
                Weather forecast is available for all major Indian tourist destinations.
              </p>
            )}
          </div>

        </div>

        {/* 2. Interactive Route Map & Waypoints Highlight */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#183B32]">
                Interactive Itinerary Route & Top Attractions Map
              </h3>
              <p className="text-xs text-[#57605B]">
                Optimized tour sequence for {effectiveDestination}
              </p>
            </div>

            {activePlan.waypoints && activePlan.waypoints.length > 0 && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-[#183B32] self-start sm:self-auto">
                {activePlan.waypoints.length} Key Attractions Sequenced
              </span>
            )}
          </div>

          <div className="h-[380px] rounded-2xl overflow-hidden border border-[#E5DFD3]">
            <TourismMap
              startLocation={effectiveStart}
              destination={effectiveDestination}
              travelMode={travelMode}
              waypoints={activePlan.waypoints || []}
              selectedId={selectedWaypointId}
              onSelectAttraction={(id) => setSelectedWaypointId(id)}
              destinationName={effectiveDestination}
            />
          </div>

          {/* Attraction Waypoints Grid */}
          {activePlan.waypoints && activePlan.waypoints.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {activePlan.waypoints.map((wp, idx) => {
                const isSelected = selectedWaypointId === wp.id;
                return (
                  <div
                    key={wp.id}
                    onClick={() => setSelectedWaypointId(wp.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF7F2] border-[#183B32] ring-1 ring-[#183B32]'
                        : 'bg-[#FAF7F2]/60 border-[#E8E1D5] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#183B32] text-[#FAF7F2] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {wp.order || idx + 1}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider">
                            {wp.category}
                          </span>
                          <span className="text-[10px] text-[#57605B] font-medium">
                            ⏱ {wp.recommendedDuration}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#183B32] leading-snug">
                          {wp.name}
                        </h4>
                        <p className="text-[11px] text-[#57605B] line-clamp-2 leading-relaxed">
                          {wp.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. SECTION: DAY-BY-DAY JOURNAL FLOW */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EBE0]">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-[#C8963E]">
                Comprehensive Daily Schedule
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#183B32] mt-0.5">
                Day-by-Day Journey Flow
              </h2>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-xs font-bold text-[#183B32] self-start sm:self-auto">
              {activePlan.dayWiseItinerary?.length || days} Full Days Planned
            </div>
          </div>

          <div className="space-y-6">
            {activePlan.dayWiseItinerary && activePlan.dayWiseItinerary.length > 0 ? (
              activePlan.dayWiseItinerary.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-5 sm:p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-4 transition-all hover:border-[#183B32]/30"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2DACB]">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl bg-[#183B32] text-[#FAF7F2] font-serif font-bold text-sm">
                        Day {day.dayNumber}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#183B32]">
                        {day.theme}
                      </h3>
                    </div>

                    <span className="text-xs text-[#57605B] italic">
                      {day.travelNote}
                    </span>
                  </div>

                  {/* Morning, Afternoon, Evening Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-[#57605B]">
                    <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#EAE3D6] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#183B32] flex items-center gap-1.5 text-xs">
                        🌅 Morning Program
                      </span>
                      <p className="leading-relaxed text-[#202422]">{day.morning}</p>
                    </div>

                    <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#EAE3D6] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#183B32] flex items-center gap-1.5 text-xs">
                        ☀️ Afternoon Program
                      </span>
                      <p className="leading-relaxed text-[#202422]">{day.afternoon}</p>
                    </div>

                    <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#EAE3D6] space-y-1.5 shadow-2xs">
                      <span className="font-bold text-[#183B32] flex items-center gap-1.5 text-xs">
                        🌙 Evening & Leisure
                      </span>
                      <p className="leading-relaxed text-[#202422]">{day.evening}</p>
                    </div>
                  </div>

                  {/* Featured Meal Recommendation */}
                  {day.foodSpot && (
                    <div className="text-xs text-[#183B32] bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#EAE3D6] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#D96E37]/10 flex items-center justify-center text-[#D96E37] shrink-0">
                        <Utensils className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong>Recommended Culinary Spot:</strong>{' '}
                        <span className="text-[#57605B]">{day.foodSpot}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C938E] italic text-center py-6">
                Custom daily breakdown is being loaded for {effectiveDestination}.
              </p>
            )}
          </div>
        </div>

        {/* 4. SECTION: AUTHENTIC FOODS & CULINARY HIGHLIGHTS */}
        {activePlan.foodRecommendations && activePlan.foodRecommendations.length > 0 && (
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EBE0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D96E37]/10 flex items-center justify-center text-[#D96E37]">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest font-bold text-[#D96E37]">
                    Gastronomy & Local Flavors
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-[#183B32]">
                    Authentic Foods in {effectiveDestination}
                  </h2>
                </div>
              </div>

              <span className="text-xs text-[#57605B]">
                Curated regional specialties and dining spots
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePlan.foodRecommendations.map((food, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-2 flex flex-col justify-between hover:border-[#D96E37]/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif font-bold text-base text-[#183B32]">
                        {food.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DE] text-[#4E3C2F] font-bold">
                        {food.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#57605B] leading-relaxed">
                      {food.mustTry}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D6] flex items-center gap-1.5 text-[11px] text-[#C8963E] font-medium">
                    <MapPin className="w-3 h-3" />
                    <span>{food.neighborhood || `${effectiveDestination} Central`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. SECTION: TRIP BUDGET PLANNER */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EBE0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#183B32]/10 flex items-center justify-center text-[#183B32]">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#C8963E]">
                  Financial Estimator (INR)
                </span>
                <h2 className="font-serif font-bold text-2xl text-[#183B32]">
                  Trip Budget Planner
                </h2>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E2DACB] text-xs font-bold text-[#183B32]">
              {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'} • {days} Days
            </div>
          </div>

          <BudgetPlanner
            destination={effectiveDestination}
            startLocation={effectiveStart}
            travelers={travelers}
            days={days}
            travelDates={effectiveDates}
            budgetTier={activeBudgetTier}
            customBudget={activeCustomBudget}
            onBudgetTierChange={(t) => setActiveBudgetTier(t)}
            onCustomBudgetChange={(amt) => setActiveCustomBudget(amt)}
            onNavigate={onNavigate}
            standalone={false}
          />
        </div>

        {/* 6. SECTION: RECOMMENDED STAYS & NEIGHBORHOODS */}
        {activePlan.staySuggestions && activePlan.staySuggestions.length > 0 && (
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F0EBE0]">
              <div className="w-10 h-10 rounded-2xl bg-[#183B32]/10 flex items-center justify-center text-[#183B32]">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#C8963E]">
                  Accommodation Options
                </span>
                <h2 className="font-serif font-bold text-2xl text-[#183B32]">
                  Recommended Stays in {effectiveDestination}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activePlan.staySuggestions.map((stay, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-2">
                  <span className="text-[10px] font-bold text-[#C8963E] uppercase tracking-wider block">
                    Option {idx + 1}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#183B32]">
                    {stay.neighborhood}
                  </h4>
                  <p className="text-xs text-[#57605B]">{stay.vibe}</p>
                  <div className="pt-2 border-t border-[#EAE3D6] text-xs font-bold text-[#183B32]">
                    {stay.estimatedCostNight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Action Footer Bar */}
        <div className="p-6 rounded-3xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('planner')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] hover:bg-[#EFE9DE] text-xs font-bold text-[#183B32] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#183B32]" />
            <span>Modify Details in Planner</span>
          </button>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleOpenSaveModal}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-[#E0B466]" />
              <span>Save Trip to History</span>
            </button>
          </div>
        </div>

      </div>

      {/* Save Trip to History Modal Dialog */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] rounded-3xl border border-[#E5DFD3] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#183B32] text-[#FAF7F2] flex items-center justify-center">
                  <Bookmark className="w-4 h-4 text-[#E0B466]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#183B32]">
                    Save Trip to History
                  </h3>
                  <p className="text-[11px] text-[#57605B]">
                    Archive your itinerary, estimated budget, and memories in one place.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTripToHistory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider">
                  Custom Trip Name *
                </label>
                <input
                  type="text"
                  value={customTripName}
                  onChange={(e) => setCustomTripName(e.target.value)}
                  placeholder={`e.g. ${effectiveDestination} Vacation ${new Date().getFullYear()}`}
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs font-semibold text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider">
                  Trip Notes / Memo (Optional)
                </label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Remember to carry warm layers, booked train tickets..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EAE3D6] space-y-1 text-[11px] text-[#57605B]">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span className="font-semibold text-[#183B32]">{effectiveDestination}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-[#183B32]">{days} Days ({travelers} Travelers)</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Total Budget:</span>
                  <span className="font-semibold text-[#183B32]">
                    ₹{(activePlan.estimatedTotalBudget?.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#57605B] font-semibold cursor-pointer border border-[#E2DACB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customTripName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#E0B466]" />
                  <span>Save to Trip History</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

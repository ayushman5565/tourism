import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { TripItineraryPage } from './pages/TripItineraryPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { GroupTripsPage } from './pages/GroupTripsPage';
import { SmartGalleryPage } from './pages/SmartGalleryPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { TripHistoryPage } from './pages/TripHistoryPage';
import { EmergencyHubPage } from './pages/EmergencyHubPage';
import { AuthPage } from './pages/AuthPage';
import { AiTravelAssistant } from './components/AiTravelAssistant';
import { PageRoute, TransportMode, SavedTrip, TripPlanResult } from './types';
import { Sparkles, Compass } from 'lucide-react';
import { generateCuratedTripPlan } from './data/destinationsData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageRoute>('auth');
  const [selectedStartLocation, setSelectedStartLocation] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedTravelMode, setSelectedTravelMode] = useState<TransportMode>('car');
  const [selectedDistanceKm, setSelectedDistanceKm] = useState<number | undefined>(undefined);
  const [selectedDurationText, setSelectedDurationText] = useState<string | undefined>(undefined);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  
  // Trip Planner initial options
  const [plannerBudget, setPlannerBudget] = useState<number>(10000);
  const [plannerTravelers, setPlannerTravelers] = useState<number>(2);
  const [plannerDays, setPlannerDays] = useState<number>(3);
  const [plannerBudgetTier, setPlannerBudgetTier] = useState<'budget' | 'moderate' | 'luxury' | 'custom'>('moderate');
  const [plannerDatesText, setPlannerDatesText] = useState<string>('');

  // Generated Active Trip Plan for Dedicated Itinerary Page
  const [activeTripPlan, setActiveTripPlan] = useState<TripPlanResult | null>(null);
  const [activeSavedTripId, setActiveSavedTripId] = useState<string | null>(null);

  // Floating AI Assistant Modal State
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);

  // Track if initial landing redirect has happened
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-[#183B32]">Supabase configuration required</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#57605B]">
            TripTale will not use browser storage for trips. Add valid VITE_SUPABASE_URL and
            VITE_SUPABASE_PUBLISHABLE_KEY values, then restart the development server.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!loading) {
      if (user) {
        // On initial app load with an active session, send to home page
        if (!initialRedirectDone) {
          setCurrentPage('home');
          setInitialRedirectDone(true);
        }
      } else {
        // When not authenticated, always show the signup page first
        setCurrentPage('auth');
        setInitialRedirectDone(false);
      }
    }
  }, [user, loading, initialRedirectDone]);

  // Scroll to top on page change
  const handleNavigate = (page: PageRoute) => {
    // If not authenticated, keep user on auth page
    if (!user && page !== 'auth') {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanTripFromRoute = (
    startLocation: string,
    destName: string,
    travelMode?: TransportMode,
    distanceKm?: number,
    durationText?: string
  ) => {
    setSelectedStartLocation(startLocation);
    setSelectedDestination(destName);
    if (travelMode) setSelectedTravelMode(travelMode);
    setSelectedDistanceKm(distanceKm);
    setSelectedDurationText(durationText);
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchDestination = (destName: string) => {
    setSelectedDestination(destName);
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlanTripWithBudget = (dest: string, budget: number, travelers: number, days: number) => {
    setSelectedDestination(dest);
    setPlannerBudget(budget);
    setPlannerBudgetTier('custom');
    setPlannerTravelers(travelers);
    setPlannerDays(days);
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDestinationForExplore = (destId: string) => {
    setSelectedDestinationId(destId);
    setSelectedDestination(destId);
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectForPlanning = (destName: string) => {
    setSelectedDestination(destName);
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartGroupTrip = (destination: string) => {
    setSelectedDestination(destination);
    setCurrentPage('group-trips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when "Generate My Itinerary" succeeds in TripPlannerPage
  const handlePlanGenerated = (
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
  ) => {
    setActiveTripPlan(plan);
    if (savedTrip?.id) {
      setActiveSavedTripId(savedTrip.id);
    }
    setSelectedStartLocation(config.startLocation);
    setSelectedDestination(config.destination);
    setSelectedTravelMode(config.travelMode);
    setPlannerDays(config.days);
    setPlannerTravelers(config.travelers);
    setPlannerDatesText(config.datesText);
    setPlannerBudgetTier(config.budgetTier);
    if (config.customBudget) {
      setPlannerBudget(config.customBudget);
    }
    setSelectedDistanceKm(config.distanceKm);
    setSelectedDurationText(config.durationText);
    setCurrentPage('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Itinerary View from Saved Trip in History
  const handleOpenSavedTripInItinerary = (trip: SavedTrip) => {
    setActiveSavedTripId(trip.id);
    setSelectedStartLocation(trip.startLocation);
    setSelectedDestination(trip.destination);
    if (trip.transportMode) {
      setSelectedTravelMode(trip.transportMode);
    }
    setPlannerTravelers(trip.travelers);
    const tripDays = trip.days || trip.durationDays || 3;
    setPlannerDays(tripDays);
    setPlannerBudgetTier(trip.budgetTier || 'moderate');
    setPlannerDatesText(trip.travelDates || '');
    if (trip.customBudget) {
      setPlannerBudget(trip.customBudget);
    } else if (trip.budgetBreakdown?.total) {
      setPlannerBudget(trip.budgetBreakdown.total);
    } else if (trip.totalPlannedBudget) {
      setPlannerBudget(trip.totalPlannedBudget);
    }

    const curated = trip.generatedPlan ? { ...trip.generatedPlan } : generateCuratedTripPlan(
      trip.destination,
      trip.startLocation,
      trip.travelDates || `${tripDays} Days`,
      trip.travelers,
      trip.selectedPreferences || ['Historical Highlights', 'Local Street Food', 'Scenic Viewpoints'],
      trip.budgetTier === 'custom' ? 'moderate' : trip.budgetTier || 'moderate'
    );

    if (trip.dailyItinerary && trip.dailyItinerary.length > 0) {
      curated.dayWiseItinerary = trip.dailyItinerary;
    }
    if (trip.waypoints && trip.waypoints.length > 0) {
      curated.waypoints = trip.waypoints;
    }
    if (trip.accommodationDetails && trip.accommodationDetails.length > 0) {
      curated.staySuggestions = trip.accommodationDetails.map((a) => ({
        neighborhood: a.neighborhood || `${trip.destination} Central`,
        vibe: a.vibe || 'Comfortable Stay',
        estimatedCostNight: a.estimatedCostNight || '₹3,000 / night',
      }));
    }
    if (trip.foodRecommendations && trip.foodRecommendations.length > 0) {
      curated.foodRecommendations = trip.foodRecommendations.map((f: any, i: number) => {
        if (typeof f === 'string') {
          return {
            name: f,
            type: i % 2 === 0 ? 'Heritage Restaurant' : 'Local Eatery',
            neighborhood: `${trip.destination} Central`,
            mustTry: `Specialty food in ${trip.destination}`,
          };
        }
        return f;
      });
    }
    if (trip.budgetBreakdown) {
      curated.estimatedTotalBudget = {
        stay: trip.budgetBreakdown.accommodation,
        food: trip.budgetBreakdown.food,
        transport: trip.budgetBreakdown.transportation,
        sightseeing: trip.budgetBreakdown.activities,
        total: trip.budgetBreakdown.total,
        currency: '₹ INR',
      };
    }

    setActiveTripPlan(curated);
    setCurrentPage('itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadSavedTripToPlanner = (trip: SavedTrip) => {
    setActiveSavedTripId(trip.id);
    setSelectedStartLocation(trip.startLocation);
    setSelectedDestination(trip.destination);
    if (trip.transportMode) {
      setSelectedTravelMode(trip.transportMode);
    }
    setPlannerTravelers(trip.travelers);
    setPlannerDays(trip.days || trip.durationDays || 3);
    setPlannerBudgetTier(trip.budgetTier || 'moderate');
    setPlannerDatesText(trip.travelDates || '');
    if (trip.customBudget) {
      setPlannerBudget(trip.customBudget);
    } else if (trip.budgetBreakdown?.total) {
      setPlannerBudget(trip.budgetBreakdown.total);
    } else if (trip.totalPlannedBudget) {
      setPlannerBudget(trip.totalPlannedBudget);
    }

    // Build plan object so it can also be viewed immediately on itinerary page if requested
    const curated = trip.generatedPlan ? { ...trip.generatedPlan } : generateCuratedTripPlan(
      trip.destination,
      trip.startLocation,
      trip.travelDates || `${trip.days} Days`,
      trip.travelers,
      trip.selectedPreferences || ['Historical Highlights', 'Local Street Food', 'Scenic Viewpoints'],
      trip.budgetTier === 'custom' ? 'moderate' : trip.budgetTier || 'moderate'
    );
    if (trip.dailyItinerary && trip.dailyItinerary.length > 0) {
      curated.dayWiseItinerary = trip.dailyItinerary;
    }
    if (trip.waypoints && trip.waypoints.length > 0) {
      curated.waypoints = trip.waypoints;
    }
    if (trip.accommodationDetails && trip.accommodationDetails.length > 0) {
      curated.staySuggestions = trip.accommodationDetails.map((a) => ({
        neighborhood: a.neighborhood || `${trip.destination} Central`,
        vibe: a.vibe || 'Comfortable Stay',
        estimatedCostNight: a.estimatedCostNight || '₹3,000 / night',
      }));
    }
    if (trip.foodRecommendations && trip.foodRecommendations.length > 0) {
      curated.foodRecommendations = trip.foodRecommendations.map((f: any, i: number) => {
        if (typeof f === 'string') {
          return {
            name: f,
            type: i % 2 === 0 ? 'Heritage Restaurant' : 'Local Eatery',
            neighborhood: `${trip.destination} Central`,
            mustTry: `Specialty food in ${trip.destination}`,
          };
        }
        return f;
      });
    }
    setActiveTripPlan(curated);

    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-peaceful-bg-pattern flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-[#183B32] text-[#FAF7F2] flex items-center justify-center shadow-xl mb-4 animate-pulse">
          <Compass className="w-8 h-8 text-[#E0B466] animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h2 className="font-serif font-bold text-xl text-[#183B32]">TripTale</h2>
        <p className="text-xs text-[#57605B] mt-1">Preparing your peaceful travel companion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#202422] flex flex-col selection:bg-[#183B32] selection:text-[#FAF7F2] relative">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenQuickPlanner={() => handleNavigate('planner')}
      />

      {/* 2. Main Page Views */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onPlanTripFromRoute={handlePlanTripFromRoute}
            onSearchDestination={handleSearchDestination}
            onSelectDestination={handleSelectDestinationForExplore}
            onPlanTripWithBudget={handlePlanTripWithBudget}
          />
        )}

        {currentPage === 'explore' && (
          <ExplorePage
            onNavigate={handleNavigate}
            onSelectForPlanning={handleSelectForPlanning}
            selectedDestinationId={selectedDestinationId}
          />
        )}

        {currentPage === 'planner' && (
          <TripPlannerPage
            initialStartLocation={selectedStartLocation}
            initialDestination={selectedDestination}
            initialTravelMode={selectedTravelMode}
            initialDistanceKm={selectedDistanceKm}
            initialDurationText={selectedDurationText}
            initialBudget={plannerBudget}
            initialTravelers={plannerTravelers}
            initialDays={plannerDays}
            onNavigate={handleNavigate}
            onPlanGenerated={handlePlanGenerated}
            onStartGroupTrip={handleStartGroupTrip}
          />
        )}

        {currentPage === 'itinerary' && (
          <TripItineraryPage
            plan={activeTripPlan}
            savedTripId={activeSavedTripId}
            startLocation={selectedStartLocation}
            destination={selectedDestination}
            travelMode={selectedTravelMode}
            days={plannerDays}
            travelers={plannerTravelers}
            datesText={plannerDatesText}
            budgetTier={plannerBudgetTier}
            customBudget={plannerBudget}
            distanceKm={selectedDistanceKm}
            durationText={selectedDurationText}
            onNavigate={handleNavigate}
            onUpdatePlan={(updated) => setActiveTripPlan(updated)}
            onStartGroupTrip={handleStartGroupTrip}
          />
        )}

        {currentPage === 'assistant' && (
          <AiAssistantPage
            onNavigate={handleNavigate}
            onApplyPlan={handleSearchDestination}
            selectedDestination={selectedDestination}
          />
        )}

        {currentPage === 'group-trips' && (
          <GroupTripsPage
            initialTripName={selectedDestination}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'gallery' && (
          <SmartGalleryPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'trip-history' && (
          <TripHistoryPage
            onNavigate={handleNavigate}
            onOpenTripInItinerary={handleOpenSavedTripInItinerary}
            onSelectTripForPlanning={handleLoadSavedTripToPlanner}
          />
        )}

        {currentPage === 'emergency' && (
          <EmergencyHubPage
            onNavigate={handleNavigate}
            activeDestination={selectedDestination}
          />
        )}

        {currentPage === 'features' && (
          <FeaturesPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'auth' && (
          <AuthPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectDestination={handleSelectDestinationForExplore}
      />

      {/* 4. Floating AI Travel Companion Widget (Available on all pages) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isFloatingAiOpen ? (
          <button
            onClick={() => setIsFloatingAiOpen(true)}
            className="px-5 py-3.5 rounded-full bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] font-semibold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#FAF7F2]/20 cursor-pointer"
            title="Chat with Aura (Gemini Travel AI)"
          >
            <div className="w-5 h-5 rounded-full bg-[#E0B466] text-[#183B32] flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </div>
            <span>Ask Aura AI</span>
          </button>
        ) : null}
      </div>

      {/* 5. Floating AI Travel Companion Modal Dialog */}
      {isFloatingAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl">
            <AiTravelAssistant
              initialDestination={selectedDestination}
              tripContext={{ destination: selectedDestination }}
              onNavigate={handleNavigate}
              isFloatingModal={true}
              onCloseModal={() => setIsFloatingAiOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

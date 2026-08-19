import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { GroupTripsPage } from './pages/GroupTripsPage';
import { SmartGalleryPage } from './pages/SmartGalleryPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { TripHistoryPage } from './pages/TripHistoryPage';
import { EmergencyHubPage } from './pages/EmergencyHubPage';
import { AiTravelAssistant } from './components/AiTravelAssistant';
import { PageRoute, TransportMode, SavedTrip } from './types';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
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

  // Floating AI Assistant Modal State
  const [isFloatingAiOpen, setIsFloatingAiOpen] = useState(false);

  // Scroll to top on page change
  const handleNavigate = (page: PageRoute) => {
    setCurrentPage(page);
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
    setPlannerTravelers(travelers);
    setPlannerDays(days);
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDestinationForExplore = (destId: string) => {
    setSelectedDestinationId(destId);
    setCurrentPage('explore');
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

  const handleLoadSavedTripToPlanner = (trip: SavedTrip) => {
    setSelectedStartLocation(trip.startLocation);
    setSelectedDestination(trip.destination);
    if (trip.transportMode) {
      setSelectedTravelMode(trip.transportMode);
    }
    setPlannerTravelers(trip.travelers);
    setPlannerDays(trip.days || trip.durationDays || 3);
    if (trip.customBudget) {
      setPlannerBudget(trip.customBudget);
    } else if (trip.budgetBreakdown?.total) {
      setPlannerBudget(trip.budgetBreakdown.total);
    } else if (trip.totalPlannedBudget) {
      setPlannerBudget(trip.totalPlannedBudget);
    }
    setCurrentPage('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

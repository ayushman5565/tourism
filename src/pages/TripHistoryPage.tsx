import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Calendar, 
  Users, 
  MapPin, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Clock, 
  Camera, 
  FileText, 
  Edit3, 
  Check, 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Navigation,
  Bed,
  Utensils,
  Share2,
  FolderOpen
} from 'lucide-react';
import { PageRoute, SavedTrip, TripMemory, TransportMode } from '../types';
import { 
  getSavedTrips, 
  deleteTrip, 
  duplicateTrip, 
  saveTrip, 
  addTripMemory, 
  deleteTripMemory, 
  updateTripSpending, 
  updateTripNotes 
} from '../utils/tripStorage';

interface TripHistoryPageProps {
  onNavigate: (page: PageRoute) => void;
  onContinueTrip: (trip: SavedTrip) => void;
}

export const TripHistoryPage: React.FC<TripHistoryPageProps> = ({
  onNavigate,
  onContinueTrip,
}) => {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
  
  // Edit Trip Name / Notes / Spending Modal or Inline State
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editActualSpending, setEditActualSpending] = useState<string>('');

  // Add Memory Modal State
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState('');
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [memoryLocationTag, setMemoryLocationTag] = useState('');
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);

  // Active Tab in Detail Modal: 'itinerary' | 'memories' | 'budget' | 'notes'
  const [detailTab, setDetailTab] = useState<'itinerary' | 'memories' | 'budget' | 'notes'>('itinerary');

  // Load trips on mount
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = () => {
    const list = getSavedTrips();
    setTrips(list);
    if (selectedTrip) {
      const refreshed = list.find((t) => t.id === selectedTrip.id);
      setSelectedTrip(refreshed || null);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this trip record?')) {
      deleteTrip(id);
      loadTrips();
      if (selectedTrip?.id === id) setSelectedTrip(null);
    }
  };

  const handleDuplicate = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    duplicateTrip(id);
    loadTrips();
  };

  const handleOpenDetail = (trip: SavedTrip) => {
    setSelectedTrip(trip);
    setEditName(trip.customName);
    setEditNotes(trip.notes || '');
    setEditActualSpending(trip.actualSpending ? String(trip.actualSpending) : '');
    setDetailTab('itinerary');
  };

  const handleSaveTripEdits = () => {
    if (!selectedTrip) return;
    const spendingNum = editActualSpending.trim() ? parseFloat(editActualSpending.replace(/[^0-9.]/g, '')) || 0 : undefined;
    const updated: SavedTrip = {
      ...selectedTrip,
      customName: editName.trim() || selectedTrip.customName,
      notes: editNotes,
      actualSpending: spendingNum,
      updatedAt: new Date().toISOString(),
    };
    saveTrip(updated);
    setIsEditingTrip(false);
    loadTrips();
  };

  // Handle Photo Upload (File or URL)
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError('Photo size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setPhotoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMemoryPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !memoryPhotoUrl.trim() || !memoryCaption.trim()) return;

    addTripMemory(selectedTrip.id, {
      photoUrl: memoryPhotoUrl.trim(),
      caption: memoryCaption.trim(),
      date: memoryDate,
      locationTag: memoryLocationTag.trim() || selectedTrip.destination,
    });

    setMemoryPhotoUrl('');
    setMemoryCaption('');
    setMemoryLocationTag('');
    setIsAddMemoryOpen(false);
    loadTrips();
  };

  const handleDeleteMemory = (memoryId: string) => {
    if (!selectedTrip) return;
    deleteTripMemory(selectedTrip.id, memoryId);
    loadTrips();
  };

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      
      {/* Header Banner */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
                Personal Travel Journal & Archive
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#183B32] mt-1 mb-2">
                Trip History & Memories
              </h1>
              <p className="text-sm sm:text-base text-[#57605B] max-w-2xl leading-relaxed">
                Revisit your past journeys, track budgets & actual expenses, explore day-by-day itineraries, and preserve beautiful photo memories.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('planner')}
              className="px-6 py-3 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#E0B466]" />
              <span>Plan New Trip</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Saved Trips List / Grid */}
        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const primaryMemory = trip.memories?.[0];
              const memoryCount = trip.memories?.length || 0;
              const plannedTotal = trip.budgetBreakdown?.total || trip.customBudget || 0;
              const actualSpent = trip.actualSpending || 0;

              return (
                <div
                  key={trip.id}
                  onClick={() => handleOpenDetail(trip)}
                  className="group bg-[#FFFFFF] rounded-3xl border border-[#E5DFD3] hover:border-[#183B32]/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  {/* Card Top: Memory preview or destination placeholder */}
                  <div className="relative h-48 w-full bg-[#EFE9DE] overflow-hidden">
                    {primaryMemory ? (
                      <img
                        src={primaryMemory.photoUrl}
                        alt={trip.customName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#8C938E] p-4 text-center bg-gradient-to-br from-[#FAF7F2] to-[#EAE3D6]">
                        <Compass className="w-10 h-10 text-[#C8963E] mb-2 opacity-70" />
                        <span className="font-serif font-bold text-lg text-[#183B32]">
                          {trip.destination}
                        </span>
                        <span className="text-xs text-[#57605B] mt-0.5">
                          {trip.days} Days • {trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay & Badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider border border-white/20">
                        {trip.budgetTier} Tier
                      </span>

                      {memoryCount > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#183B32]/80 backdrop-blur-md text-[#FAF7F2] text-[10px] font-bold flex items-center gap-1 border border-white/20">
                          <Camera className="w-3 h-3 text-[#E0B466]" />
                          <span>{memoryCount} {memoryCount === 1 ? 'Photo' : 'Photos'}</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-[#FAF7F2]">
                      <span className="text-[11px] font-semibold text-[#E0B466] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trip.startLocation} → {trip.destination}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#FAF7F2] tracking-tight truncate drop-shadow-md">
                        {trip.customName}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Trip Meta Grid */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D6]">
                        <div>
                          <span className="text-[9px] text-[#8C938E] font-bold uppercase block">Duration</span>
                          <span className="font-bold text-[#183B32]">{trip.days} Days</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#8C938E] font-bold uppercase block">Travelers</span>
                          <span className="font-bold text-[#183B32]">{trip.travelers}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#8C938E] font-bold uppercase block">Est. Budget</span>
                          <span className="font-bold text-[#183B32]">₹{plannedTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Travel Dates */}
                      {trip.travelDates && (
                        <div className="flex items-center gap-1.5 text-xs text-[#57605B]">
                          <Calendar className="w-3.5 h-3.5 text-[#C8963E]" />
                          <span>{trip.travelDates}</span>
                        </div>
                      )}

                      {/* Short Note Preview if available */}
                      {trip.notes && (
                        <p className="text-xs text-[#57605B] line-clamp-2 italic">
                          "{trip.notes}"
                        </p>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-[#F0EBE0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleDuplicate(trip.id, e)}
                          title="Duplicate this trip"
                          className="p-2 rounded-xl text-[#57605B] hover:text-[#183B32] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(trip.id, e)}
                          title="Delete trip"
                          className="p-2 rounded-xl text-[#8C938E] hover:text-[#C62828] hover:bg-[#FFEBEE] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContinueTrip(trip);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EFE9DE] hover:bg-[#183B32] text-[#183B32] hover:text-[#FAF7F2] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Reopen in Planner</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#FFFFFF] p-12 sm:p-16 rounded-3xl border border-[#E5DFD3] text-center max-w-xl mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF7F2] border border-[#E2DACB] flex items-center justify-center mx-auto text-[#183B32]">
              <FolderOpen className="w-8 h-8 text-[#C8963E]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-[#183B32]">
                Your travel memories will appear here.
              </h3>
              <p className="text-xs sm:text-sm text-[#57605B] mt-1.5 max-w-sm mx-auto leading-relaxed">
                Save trips from the Trip Planner to build your lifetime travel archive with day itineraries, expense tracking, and captured photos.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('planner')}
                className="px-8 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E0B466]" />
                <span>Create Your First Trip Plan</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* TRIP SUMMARY & JOURNAL MODAL */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#183B32]/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#E5DFD3] shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-6 sm:p-8 bg-[#183B32] text-[#FAF7F2] relative shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#FAF7F2] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2]/15 text-[#E0B466] text-[10px] font-bold uppercase tracking-wider border border-white/20">
                    {selectedTrip.startLocation} → {selectedTrip.destination}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2]/15 text-[#FAF7F2] text-[10px] font-bold">
                    {selectedTrip.days} Days • {selectedTrip.travelers} {selectedTrip.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                  {selectedTrip.travelDates && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2]/15 text-[#FAF7F2] text-[10px]">
                      {selectedTrip.travelDates}
                    </span>
                  )}
                </div>

                {!isEditingTrip ? (
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight">
                      {selectedTrip.customName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingTrip(true)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FAF7F2] text-xs transition-colors cursor-pointer"
                      title="Edit trip details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#E0B466]" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Trip Name (e.g. Goa Trip 2026)"
                      className="w-full px-3 py-2 rounded-xl bg-white text-[#202422] text-sm font-bold focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveTripEdits}
                        className="px-3 py-1.5 rounded-xl bg-[#E0B466] text-[#183B32] text-xs font-bold cursor-pointer"
                      >
                        Save Name
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingTrip(false)}
                        className="px-3 py-1.5 rounded-xl bg-white/20 text-[#FAF7F2] text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Tabs inside Modal */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/15">
                {[
                  { id: 'itinerary', label: 'Daily Itinerary', icon: <Compass className="w-3.5 h-3.5" /> },
                  { id: 'memories', label: `Memories (${selectedTrip.memories?.length || 0})`, icon: <Camera className="w-3.5 h-3.5" /> },
                  { id: 'budget', label: 'Budget & Spending', icon: <IndianRupee className="w-3.5 h-3.5" /> },
                  { id: 'notes', label: 'Trip Notes', icon: <FileText className="w-3.5 h-3.5" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      detailTab === tab.id
                        ? 'bg-[#FAF7F2] text-[#183B32] shadow-sm'
                        : 'text-[#FAF7F2]/80 hover:text-[#FAF7F2] hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body with Tab Contents */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
              
              {/* TAB 1: DAILY ITINERARY */}
              {detailTab === 'itinerary' && (
                <div className="space-y-4">
                  {selectedTrip.dailyItinerary && selectedTrip.dailyItinerary.length > 0 ? (
                    selectedTrip.dailyItinerary.map((day) => (
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
                    ))
                  ) : (
                    <p className="text-xs text-[#8C938E] italic text-center py-6">
                      No custom day-by-day itinerary recorded for this trip.
                    </p>
                  )}

                  {/* Accommodation preview */}
                  {selectedTrip.accommodationDetails && selectedTrip.accommodationDetails.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD3] space-y-2 mt-4">
                      <h4 className="font-serif font-bold text-sm text-[#183B32] flex items-center gap-1.5">
                        <Bed className="w-4 h-4 text-[#183B32]" />
                        Stay Recommendations
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedTrip.accommodationDetails.map((stay, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6]">
                            <div className="font-bold text-[#183B32]">{stay.neighborhood}</div>
                            <div className="text-[11px] text-[#57605B]">{stay.vibe}</div>
                            <div className="text-[10px] font-semibold text-[#C8963E] mt-0.5">{stay.estimatedCostNight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MEMORIES & PHOTOS */}
              {detailTab === 'memories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#183B32]">
                        Trip Memories & Moments
                      </h3>
                      <p className="text-xs text-[#57605B]">
                        Attach captured travel snapshots, captions, and locations.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddMemoryOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E0B466]" />
                      <span>Add Memory</span>
                    </button>
                  </div>

                  {selectedTrip.memories && selectedTrip.memories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedTrip.memories.map((mem) => (
                        <div
                          key={mem.id}
                          className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E5DFD3] overflow-hidden shadow-xs space-y-2 flex flex-col"
                        >
                          <div className="h-48 w-full bg-[#EFE9DE] relative overflow-hidden">
                            <img
                              src={mem.photoUrl}
                              alt={mem.caption}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteMemory(mem.id)}
                              title="Delete memory"
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                            <p className="text-xs font-medium text-[#202422] leading-relaxed">
                              {mem.caption}
                            </p>
                            
                            <div className="flex items-center justify-between text-[10px] text-[#8C938E] pt-1 border-t border-[#F0EBE0]">
                              <span>{mem.date}</span>
                              {mem.locationTag && (
                                <span className="flex items-center gap-1 text-[#C8963E] font-semibold">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {mem.locationTag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D6] p-6 space-y-3">
                      <Camera className="w-8 h-8 text-[#8C938E] mx-auto opacity-70" />
                      <p className="text-xs text-[#57605B]">
                        No photo memories added yet for {selectedTrip.customName}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAddMemoryOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-semibold cursor-pointer"
                      >
                        Upload First Memory
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BUDGET & SPENDING */}
              {detailTab === 'budget' && (
                <div className="space-y-6">
                  {/* Budget Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Planned Budget</span>
                      <span className="font-serif font-bold text-xl text-[#183B32] mt-1 block">
                        ₹{(selectedTrip.budgetBreakdown?.total || selectedTrip.customBudget || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Actual Spending</span>
                      <span className="font-serif font-bold text-xl text-[#183B32] mt-1 block">
                        ₹{(selectedTrip.actualSpending || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6]">
                      <span className="text-[10px] text-[#8C938E] uppercase font-bold block">Remaining / Surplus</span>
                      <span className={`font-serif font-bold text-xl mt-1 block ${
                        (selectedTrip.budgetBreakdown?.total || 0) - (selectedTrip.actualSpending || 0) >= 0
                          ? 'text-green-700'
                          : 'text-red-600'
                      }`}>
                        ₹{((selectedTrip.budgetBreakdown?.total || selectedTrip.customBudget || 0) - (selectedTrip.actualSpending || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Planned Breakdown Details */}
                  {selectedTrip.budgetBreakdown && (
                    <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD3] space-y-3">
                      <h4 className="font-serif font-bold text-sm text-[#183B32]">
                        Planned Category Allocation
                      </h4>

                      <div className="space-y-2 text-xs text-[#57605B]">
                        <div className="flex justify-between">
                          <span>🏨 Accommodation:</span>
                          <span className="font-semibold text-[#183B32]">₹{selectedTrip.budgetBreakdown.accommodation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🍽️ Food & Dining:</span>
                          <span className="font-semibold text-[#183B32]">₹{selectedTrip.budgetBreakdown.food.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🚗 Transportation:</span>
                          <span className="font-semibold text-[#183B32]">₹{selectedTrip.budgetBreakdown.transportation.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🎟️ Sightseeing & Activities:</span>
                          <span className="font-semibold text-[#183B32]">₹{selectedTrip.budgetBreakdown.activities.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🛡️ Miscellaneous / Buffer:</span>
                          <span className="font-semibold text-[#183B32]">₹{selectedTrip.budgetBreakdown.miscellaneous.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Update Actual Spending Field */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-3">
                    <label className="block text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Record Actual Expense Total
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editActualSpending}
                        onChange={(e) => setEditActualSpending(e.target.value)}
                        placeholder="e.g. 29500"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-xs font-medium text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                      />
                      <button
                        type="button"
                        onClick={handleSaveTripEdits}
                        className="px-4 py-2 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Update Spending
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TRIP NOTES */}
              {detailTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#183B32]">
                        Trip Notes & Reflections
                      </h3>
                      <p className="text-xs text-[#57605B]">
                        Personal travel advice, favorite cafes, secret spots, or packing lessons.
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={6}
                    placeholder="Write your travel notes, recommendations, contacts or memories here..."
                    className="w-full p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2DACB] text-xs text-[#202422] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveTripEdits}
                      className="px-5 py-2 rounded-xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold cursor-pointer"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 sm:p-6 bg-[#FAF7F2] border-t border-[#EAE3D6] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDuplicate(selectedTrip.id)}
                  className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] hover:bg-[#EFE9DE] text-xs font-semibold text-[#183B32] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(selectedTrip.id)}
                  className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] hover:bg-[#FFEBEE] text-xs font-semibold text-[#C62828] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTrip(null);
                  onContinueTrip(selectedTrip);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue / Load in Trip Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD MEMORY MODAL */}
      {isAddMemoryOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E5DFD3] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#C8963E]" />
                <h3 className="font-serif font-bold text-lg text-[#183B32]">
                  Add Trip Memory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMemoryOpen(false)}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemorySubmit} className="space-y-4 text-xs">
              {/* Photo Input (File Upload or Image URL) */}
              <div className="space-y-2">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider">
                  Photo (Upload File or Enter Image URL)
                </label>
                
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#183B32] file:text-[#FAF7F2]"
                  />
                  
                  <span className="text-[10px] text-[#8C938E] text-center font-medium">— or paste web image link —</span>

                  <input
                    type="url"
                    value={memoryPhotoUrl}
                    onChange={(e) => setMemoryPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                  />
                </div>

                {photoUploadError && (
                  <span className="text-[11px] text-red-600 block">{photoUploadError}</span>
                )}

                {memoryPhotoUrl && (
                  <div className="h-36 rounded-xl overflow-hidden border border-[#E2DACB] mt-2">
                    <img
                      src={memoryPhotoUrl}
                      alt="Memory preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider">
                  Memory Note / Caption *
                </label>
                <input
                  type="text"
                  value={memoryCaption}
                  onChange={(e) => setMemoryCaption(e.target.value)}
                  placeholder="e.g. Sunset over the lighthouse cliffs 🌅"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#183B32] uppercase tracking-wider">
                    Date
                  </label>
                  <input
                    type="date"
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                  />
                </div>

                {/* Location Tag */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#183B32] uppercase tracking-wider">
                    Location Tag
                  </label>
                  <input
                    type="text"
                    value={memoryLocationTag}
                    onChange={(e) => setMemoryLocationTag(e.target.value)}
                    placeholder={`e.g. ${selectedTrip.destination}`}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-xs focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F0EBE0]">
                <button
                  type="button"
                  onClick={() => setIsAddMemoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#FAF7F2] text-[#57605B] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!memoryPhotoUrl.trim() || !memoryCaption.trim()}
                  className="px-5 py-2 rounded-xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-50 text-[#FAF7F2] font-bold shadow-sm cursor-pointer"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

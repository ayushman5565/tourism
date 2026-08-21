import React, { useState } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  HeartHandshake, 
  Compass, 
  ArrowLeft,
  Navigation,
  Car,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { INDIA_EMERGENCY_CONTACTS, TRAVEL_SAFETY_TIPS } from '../data/emergencyData';
import { EmergencyContact, PageRoute } from '../types';
import { TravelShowcaseCarousel } from '../components/TravelShowcaseCarousel';

interface EmergencyHubPageProps {
  onNavigate: (page: PageRoute) => void;
  currentTripDestination?: string;
}

type EmergencyCategory = 'all' | 'police' | 'ambulance' | 'women_safety' | 'highway' | 'transit' | 'general';

export const EmergencyHubPage: React.FC<EmergencyHubPageProps> = ({
  onNavigate,
  currentTripDestination,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Geolocation State
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSOSMessage, setCopiedSOSMessage] = useState(false);

  // SOS Modal Confirmation State
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosCallTarget, setSosCallTarget] = useState<EmergencyContact | null>(null);

  // Category Tabs
  const categories: { id: EmergencyCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Contacts', icon: '🚨' },
    { id: 'general', label: '112 Unified', icon: '🆘' },
    { id: 'police', label: 'Police', icon: '👮' },
    { id: 'ambulance', label: 'Ambulance & EMS', icon: '🚑' },
    { id: 'women_safety', label: 'Women Safety', icon: '🛡️' },
    { id: 'highway', label: 'Highway & NHAI', icon: '🛣️' },
    { id: 'transit', label: 'Tourist & Rail', icon: '🚆' },
  ];

  // Filtered Contacts
  const filteredContacts = INDIA_EMERGENCY_CONTACTS.filter((contact) => {
    const matchesCat = selectedCategory === 'all' || contact.category === selectedCategory;
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.includes(searchQuery) ||
      contact.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Acquire Live GPS coordinates on user demand
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location access was denied. Please enable device location permissions.');
        } else if (err.code === 2) {
          setLocationError('Unable to acquire GPS signal. Please check your network/GPS connection.');
        } else {
          setLocationError('Location request timed out. Please retry.');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Google Maps link from coords
  const mapsUrl = locationCoords
    ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`
    : '';

  const sosTextMessage = locationCoords
    ? `🚨 EMERGENCY SOS ALERT: I need immediate assistance${currentTripDestination ? ` in/near ${currentTripDestination}` : ''}. My current GPS coordinates are: ${locationCoords.lat}, ${locationCoords.lng}. Live Map: ${mapsUrl}`
    : `🚨 EMERGENCY SOS ALERT: I need immediate assistance${currentTripDestination ? ` in/near ${currentTripDestination}` : ''}. Please call me back urgently.`;

  const handleCopyLocation = () => {
    if (!mapsUrl) return;
    navigator.clipboard.writeText(mapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySOSMessage = () => {
    navigator.clipboard.writeText(sosTextMessage);
    setCopiedSOSMessage(true);
    setTimeout(() => setCopiedSOSMessage(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(sosTextMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSendSMS = () => {
    const encoded = encodeURIComponent(sosTextMessage);
    window.open(`sms:?body=${encoded}`, '_self');
  };

  const handleInitiateSosCall = (contact: EmergencyContact) => {
    setSosCallTarget(contact);
    setIsSosModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      
      {/* Header Banner */}
      <div className="relative isolate overflow-hidden bg-[#183B32] text-[#FAF7F2] py-10 sm:py-14 border-b border-[#245246]">
        {/* Background 6-Slide Carousel with Emerald Gradient */}
        <TravelShowcaseCarousel
          variant="hero-bg"
          overlayGradient="emerald"
          autoPlayInterval={5000}
        />
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10 pointer-events-none">
          <ShieldAlert className="w-80 h-80 text-[#FAF7F2]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-xs font-bold text-[#E0B466] uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified India Emergency Directory</span>
              </div>
              <h1 className="font-serif font-bold text-3xl sm:text-5xl tracking-tight">
                Emergency & SOS Hub
              </h1>
              <p className="text-sm sm:text-base text-[#FAF7F2]/80 mt-2 max-w-2xl leading-relaxed">
                One-tap official helpline numbers, live GPS coordinate sharing, and traveler safety protocols across India.
              </p>
            </div>

            {/* Quick Trigger National 112 SOS Button */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => handleInitiateSosCall(INDIA_EMERGENCY_CONTACTS[0])}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] font-serif font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-[#E0B466]/40 animate-pulse"
              >
                <ShieldAlert className="w-6 h-6 text-[#FAF7F2]" />
                <span>Trigger 112 SOS Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* TOP SECTION: LIVE GPS LOCATION SHARING CARD */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EBE0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FBE9E7] text-[#D96E37] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-[#183B32]">
                  Live Location & Emergency Pin
                </h2>
                <p className="text-xs text-[#57605B]">
                  Acquire and copy/share your exact GPS coordinates with emergency responders or family.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFetchLocation}
              disabled={isLocating}
              className="px-5 py-2.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              {isLocating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Acquiring GPS...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-[#E0B466]" />
                  <span>{locationCoords ? 'Update My GPS Location' : 'Get Current Location'}</span>
                </>
              )}
            </button>
          </div>

          {/* Location Result Display */}
          {locationCoords && (
            <div className="p-5 rounded-2xl bg-[#F6F2EA] border border-[#E0D8C8] space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] font-bold uppercase block">Latitude</span>
                  <span className="font-mono font-bold text-sm text-[#183B32] mt-0.5 block">{locationCoords.lat}° N</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] font-bold uppercase block">Longitude</span>
                  <span className="font-mono font-bold text-sm text-[#183B32] mt-0.5 block">{locationCoords.lng}° E</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]">
                  <span className="text-[10px] text-[#8C938E] font-bold uppercase block">GPS Accuracy</span>
                  <span className="font-mono font-bold text-sm text-[#183B32] mt-0.5 block">Within ~{locationCoords.accuracy || 15} meters</span>
                </div>
              </div>

              {/* Share Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={handleCopyLocation}
                  className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#183B32] border border-[#E2DACB] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#8C938E]" />}
                  <span>{copiedLink ? 'Maps Link Copied!' : 'Copy Google Maps Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySOSMessage}
                  className="px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#183B32] border border-[#E2DACB] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedSOSMessage ? <Check className="w-3.5 h-3.5 text-green-600" /> : <MessageSquare className="w-3.5 h-3.5 text-[#8C938E]" />}
                  <span>{copiedSOSMessage ? 'SOS Text Copied!' : 'Copy Complete SOS Message'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BE5B] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendSMS}
                  className="px-4 py-2 rounded-xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#E0B466]" />
                  <span>Send SOS SMS</span>
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <div className="p-4 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}
        </div>

        {/* HELPLINE SEARCH & CATEGORY FILTER */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#183B32]">
                Official Emergency Helplines (India)
              </h2>
              <p className="text-xs sm:text-sm text-[#57605B] mt-0.5">
                Tap any number below to initiate a direct call on your phone.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8C938E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search police, ambulance, highway..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs font-medium text-[#202422] placeholder:text-[#8C938E] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-xs'
                      : 'bg-[#FFFFFF] text-[#57605B] border-[#E2DACB] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Helpline Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-5 rounded-3xl bg-[#FFFFFF] border transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                  contact.isPrimary
                    ? 'border-[#D96E37]/50 ring-1 ring-[#D96E37]/30'
                    : 'border-[#E5DFD3]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EFE9DE] text-[#183B32] text-[10px] font-bold uppercase tracking-wider">
                      {contact.hours}
                    </span>
                    {contact.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FBE9E7] text-[#D96E37] text-[10px] font-bold uppercase">
                        Primary
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-[#183B32]">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-[#57605B] mt-1 leading-relaxed">
                      {contact.description}
                    </p>
                  </div>
                </div>

                {/* Call Button & Number Badge */}
                <div className="pt-3 border-t border-[#F0EBE0] flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-[#8C938E]">Dial:</span>
                    <span className="font-mono font-bold text-2xl text-[#183B32]">
                      {contact.number}
                    </span>
                  </div>

                  <a
                    href={`tel:${contact.number}`}
                    onClick={(e) => {
                      // On non-mobile or for extra safety, we show confirmation or allow direct click
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] active:scale-95 text-[#FAF7F2] text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <PhoneCall className="w-4 h-4 text-[#E0B466]" />
                    <span>Call {contact.number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#E5DFD3] p-6">
              <p className="text-sm text-[#8C938E]">
                No emergency contacts found matching "{searchQuery}".
              </p>
            </div>
          )}
        </div>

        {/* TRAVEL SAFETY PROTOCOLS & GUIDELINES */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0EBE0]">
            <HeartHandshake className="w-5 h-5 text-[#C8963E]" />
            <h3 className="font-serif font-bold text-lg text-[#183B32]">
              India Traveler Safety Guidelines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {TRAVEL_SAFETY_TIPS.map((tip, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] space-y-1.5">
                <h4 className="font-serif font-bold text-sm text-[#183B32]">
                  {tip.title}
                </h4>
                <p className="text-[#57605B] leading-relaxed">
                  {tip.tip}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SOS CONFIRMATION WARNING MODAL */}
      {isSosModalOpen && sosCallTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E5DFD3] shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFEBEE] text-[#C62828] flex items-center justify-center mx-auto border border-[#FFCDD2]">
              <AlertTriangle className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#C62828] uppercase tracking-wider">
                Emergency Call Confirmation
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#183B32] mt-1">
                Call {sosCallTarget.name}?
              </h3>
              <p className="text-xs text-[#57605B] mt-2 leading-relaxed">
                You are about to dial official helpline <strong>{sosCallTarget.number}</strong> ({sosCallTarget.hours}). Only use emergency services for genuine assistance.
              </p>
            </div>

            {locationCoords && (
              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-left text-xs">
                <span className="font-bold text-[#183B32] block">Your Current Coordinates to tell operator:</span>
                <span className="font-mono text-[11px] text-[#57605B] mt-0.5 block">
                  Lat: {locationCoords.lat}, Lng: {locationCoords.lng}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSosModalOpen(false)}
                className="px-4 py-3 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFE9DE] text-[#57605B] font-semibold text-xs border border-[#E2DACB] cursor-pointer"
              >
                Cancel
              </button>

              <a
                href={`tel:${sosCallTarget.number}`}
                onClick={() => setIsSosModalOpen(false)}
                className="px-4 py-3 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call {sosCallTarget.number} Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

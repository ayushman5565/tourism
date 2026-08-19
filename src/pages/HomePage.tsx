import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ArrowLeftRight, 
  Car, 
  Bike, 
  Bus, 
  Train, 
  Plane, 
  Sparkles, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { PageRoute, TransportMode } from '../types';
import { SAMPLE_DESTINATIONS } from '../data/destinationsData';
import { BudgetPlanner } from '../components/BudgetPlanner';
import { QuickRouteMap } from '../components/QuickRouteMap';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
  onPlanTripFromRoute?: (
    startLocation: string,
    destination: string,
    travelMode?: TransportMode,
    distanceKm?: number,
    durationText?: string
  ) => void;
  onSearchDestination: (destination: string) => void;
  onSelectDestination: (destId: string) => void;
  onPlanTripWithBudget?: (destination: string, budget: number, travelers: number, days: number) => void;
}

type VehicleType = 'car' | 'two_wheeler' | 'bus' | 'train';

interface VehicleOption {
  id: VehicleType;
  label: string;
  icon: string;
  distanceKm: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
  costRange: string;
  note: string;
}

interface CurrentWeather {
  location: string;
  currentTime: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  weatherCode: number;
  condition: string;
  isDay: boolean;
}

function weatherIcon(weatherCode: number, isDay: boolean): string {
  if ([95, 96, 99].includes(weatherCode)) return '⛈️';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '❄️';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '🌧️';
  if ([45, 48].includes(weatherCode)) return '🌫️';
  if ([1, 2, 3].includes(weatherCode)) return isDay ? '⛅' : '☁️';
  return isDay ? '☀️' : '🌙';
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onPlanTripFromRoute,
  onSearchDestination,
  onSelectDestination,
  onPlanTripWithBudget,
}) => {
  // 1. ROUTE FINDER INPUTS
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
  const carouselDestinations = SAMPLE_DESTINATIONS.slice(0, 3);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  useEffect(() => {
    if (carouselDestinations.length < 2) return;

    const intervalId = window.setInterval(() => {
      setActiveCarouselIndex((current) => (current + 1) % carouselDestinations.length);
    }, 5500);

    return () => window.clearInterval(intervalId);
  }, [carouselDestinations.length]);

  // Dynamic Route Data State
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationText, setDurationText] = useState<string>('—');
  const [flightStatus, setFlightStatus] = useState<string>('Enter locations');
  const [flightDetail, setFlightDetail] = useState<string>(
    'Enter a starting location and destination to see available transport options.'
  );
  const [isFetchingTransport, setIsFetchingTransport] = useState<boolean>(false);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Vehicle data cache
  const [vehicleData, setVehicleData] = useState<Record<VehicleType, { duration: string; cost: string }>>({
    car: { duration: '—', cost: '—' },
    two_wheeler: { duration: '—', cost: '—' },
    bus: { duration: '—', cost: '—' },
    train: { duration: 'Unavailable', cost: 'N/A' },
  });

  // Fetch transport estimates whenever start or destination changes
  useEffect(() => {
    if (!startLocation.trim() || !destination.trim()) return;

    let isMounted = true;
    setIsFetchingTransport(true);

        fetch('/api/transport/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startLocation: startLocation.trim(),
        destination: destination.trim(),
        selectedMode: selectedVehicle,
      }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Transport estimate failed with status ${res.status}`);
            return res.json();
          })
      .then((data) => {
        if (!isMounted) return;
        setIsFetchingTransport(false);

        if (data.baseDistanceKm) {
          setDistanceKm(data.baseDistanceKm);
        }

        if (data.flight) {
          setFlightStatus(data.flight.status || 'Not available for this route');
          setFlightDetail(data.flight.detail || '');
        }

        if (Array.isArray(data.options)) {
          const map: any = {};
          data.options.forEach((opt: any) => {
            map[opt.id] = {
              duration: opt.durationText,
              cost: opt.estimatedCostRange,
            };
          });
          setVehicleData(map);

          // Update active duration based on selected vehicle
          const active = data.options.find((o: any) => o.id === selectedVehicle);
          if (active) {
            setDurationText(active.durationText);
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsFetchingTransport(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startLocation, destination]);

  // Fetch live conditions shortly after a destination is entered or selected.
  useEffect(() => {
    const destinationQuery = destination.trim();
    if (!destinationQuery) {
      setWeather(null);
      setWeatherError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsFetchingWeather(true);
      setWeatherError(null);

      try {
        const response = await fetch(`/api/weather?destination=${encodeURIComponent(destinationQuery)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Weather request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error('Weather data is unavailable');
        setWeather(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setWeather(null);
          setWeatherError('Current weather is unavailable for this destination.');
        }
      } finally {
        if (!controller.signal.aborted) setIsFetchingWeather(false);
      }
    }, 550);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [destination]);

  // Update active duration when vehicle selection changes
  useEffect(() => {
    if (vehicleData[selectedVehicle]) {
      setDurationText(vehicleData[selectedVehicle].duration);
    }
  }, [selectedVehicle, vehicleData]);

  // Swap starting location & destination
  const handleSwapLocations = () => {
    const temp = startLocation;
    setStartLocation(destination);
    setDestination(temp);
  };

  // Navigate to complete trip planner with current locations and vehicle
  const handleStartTripPlanning = () => {
    const cleanStartLocation = startLocation.trim();
    const cleanDestination = destination.trim();
    if (!cleanStartLocation || !cleanDestination) return;

    if (onPlanTripFromRoute) {
      onPlanTripFromRoute(
        cleanStartLocation,
        cleanDestination,
        selectedVehicle as TransportMode,
        distanceKm,
        durationText
      );
    } else {
      onSearchDestination(cleanDestination);
    }
  };

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24">
      
      {/* 1. HERO & WHERE DO YOU WANT TO GO? (ROUTE FINDER ONLY) */}
      <section className="relative isolate overflow-hidden py-12 sm:py-18">
        {/* Destination imagery from the former sanctuary cards */}
        <div className="absolute inset-0 -z-10 bg-[#183B32]" aria-hidden="true">
          {carouselDestinations.map((dest, index) => (
            <img
              key={dest.id}
              src={dest.heroImage}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                index === activeCarouselIndex ? 'opacity-100' : 'opacity-0'
              }`}
              referrerPolicy="no-referrer"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#102923]/70 via-[#183B32]/55 to-[#FAF7F2]/85" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-[#FAF7F2] tracking-tight drop-shadow-sm">
            Where do you want to go?
          </h1>
          <div className="mt-4 flex justify-center gap-2" aria-label="Destination image carousel">
            {carouselDestinations.map((dest, index) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => setActiveCarouselIndex(index)}
                className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FAF7F2] focus:ring-offset-2 focus:ring-offset-[#183B32] ${
                  index === activeCarouselIndex ? 'w-7 bg-[#E0B466]' : 'w-2 bg-[#FAF7F2]/65 hover:bg-[#FAF7F2]'
                }`}
                aria-label={`Show ${dest.name} image`}
                aria-pressed={index === activeCarouselIndex}
              />
            ))}
          </div>
        </div>

        {/* The Clean Route Finder Card */}
        <div className="bg-[#FFFFFF]/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-[#FAF7F2]/70 shadow-xl space-y-6">
          
          {/* Location Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
            
            {/* Starting Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#183B32] uppercase tracking-wider block">
                Starting Location
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FAF7F2] border border-[#E2DACB] rounded-2xl focus-within:ring-2 focus-within:ring-[#183B32]/30 focus-within:border-[#183B32] transition-all">
                <MapPin className="w-4 h-4 text-[#183B32] shrink-0" />
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="Enter starting city (e.g. Delhi, Mumbai)"
                  className="w-full bg-transparent text-sm text-[#202422] placeholder:text-[#8C938E] focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-2 md:pt-5">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="w-10 h-10 rounded-full bg-[#FAF7F2] hover:bg-[#183B32] text-[#183B32] hover:text-[#FAF7F2] border border-[#E2DACB] flex items-center justify-center transition-all shadow-2xs hover:rotate-180 duration-300 cursor-pointer"
                title="Swap starting location and destination"
                aria-label="Swap starting location and destination"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#183B32] uppercase tracking-wider block">
                Destination
              </label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FAF7F2] border border-[#E2DACB] rounded-2xl focus-within:ring-2 focus-within:ring-[#183B32]/30 focus-within:border-[#183B32] transition-all">
                <MapPin className="w-4 h-4 text-[#D96E37] shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination (e.g. Goa, Jaipur, Manali)"
                  className="w-full bg-transparent text-sm text-[#202422] placeholder:text-[#8C938E] focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Live Weather for the selected destination */}
          {destination.trim() && <div className="rounded-2xl border border-[#D9E5E0] bg-[#F2F8F5] px-4 py-3.5">
            {isFetchingWeather ? (
              <div className="flex items-center gap-2.5 text-xs font-medium text-[#57605B]">
                <span className="h-4 w-4 rounded-full border-2 border-[#183B32]/30 border-t-[#183B32] animate-spin" />
                Loading current weather for {destination.trim() || 'your destination'}…
              </div>
            ) : weather ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={weather.condition}>
                    {weatherIcon(weather.weatherCode, weather.isDay)}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#57605B]">Current weather</p>
                    <p className="text-sm font-bold text-[#183B32]">
                      {weather.location.split(',')[0]} · {weather.condition}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57605B] sm:justify-end">
                  <span><strong className="text-[#183B32] text-base">{weather.temperatureC}°C</strong> · feels {weather.feelsLikeC}°C</span>
                  <span>Humidity {weather.humidity}%</span>
                  <span>Wind {weather.windKph} km/h</span>
                </div>
              </div>
            ) : weatherError ? (
              <p className="text-xs text-[#57605B]">{weatherError}</p>
            ) : null}
          </div>}

          {/* Vehicle Selection */}
          <div className="space-y-2 pt-2 border-t border-[#F0EBE0]">
            <label className="text-[11px] font-bold text-[#57605B] uppercase tracking-wider block">
              Choose Vehicle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              {/* Car */}
              <button
                type="button"
                onClick={() => setSelectedVehicle('car')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedVehicle === 'car'
                    ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#202422] border-[#E2DACB] hover:bg-[#F3ECE0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🚗</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Car</span>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">
                    {vehicleData.car?.duration || '~5-6 hr'}
                  </div>
                  <div className="text-[10px] opacity-75">Highway Drive</div>
                </div>
              </button>

              {/* Two Wheeler */}
              <button
                type="button"
                onClick={() => setSelectedVehicle('two_wheeler')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedVehicle === 'two_wheeler'
                    ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#202422] border-[#E2DACB] hover:bg-[#F3ECE0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🏍️</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Two Wheeler</span>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">
                    {vehicleData.two_wheeler?.duration || '~6-7 hr'}
                  </div>
                  <div className="text-[10px] opacity-75">Scenic Ride</div>
                </div>
              </button>

              {/* Bus */}
              <button
                type="button"
                onClick={() => setSelectedVehicle('bus')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedVehicle === 'bus'
                    ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#202422] border-[#E2DACB] hover:bg-[#F3ECE0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🚌</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Bus</span>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">
                    {vehicleData.bus?.duration || '~7-8 hr'}
                  </div>
                  <div className="text-[10px] opacity-75">Intercity Coach</div>
                </div>
              </button>

              {/* Train */}
              <button
                type="button"
                onClick={() => setSelectedVehicle('train')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedVehicle === 'train'
                    ? 'bg-[#183B32] text-[#FAF7F2] border-[#183B32] shadow-sm'
                    : 'bg-[#FAF7F2] text-[#202422] border-[#E2DACB] hover:bg-[#F3ECE0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🚆</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Train</span>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-xs">
                    {vehicleData.train?.duration || 'Express Rail'}
                  </div>
                  <div className="text-[10px] opacity-75">Station-to-Station</div>
                </div>
              </button>
            </div>
          </div>

          {/* Live Route Summary Results */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD3] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE3D6] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider">
                  Route
                </span>
                <div className="font-serif font-bold text-base sm:text-lg text-[#183B32] flex items-center gap-2">
                  <span>{startLocation || 'Start'}</span>
                  <span className="text-[#C8963E]">→</span>
                  <span>{destination || 'Destination'}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs sm:text-sm">
                <div>
                  <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                    Distance
                  </span>
                  <span className="font-bold text-[#183B32] text-sm sm:text-base">
                    {distanceKm} km
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                    Estimated Time
                  </span>
                  <span className="font-bold text-[#D96E37] text-sm sm:text-base">
                    {durationText}
                  </span>
                </div>
              </div>
            </div>

            {/* Flight Availability Section */}
            <div className="flex items-start gap-3 pt-1 text-xs">
              <div className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#E2DACB] text-[#183B32] flex items-center justify-center shrink-0">
                <span className="text-base">✈️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#183B32]">Flight:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      flightStatus.toLowerCase().includes('available') && !flightStatus.toLowerCase().includes('not')
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#FBE9E7] text-[#C62828]'
                    }`}
                  >
                    {flightStatus}
                  </span>
                </div>
                {flightDetail && (
                  <p className="text-[11px] text-[#57605B] mt-0.5">
                    {flightDetail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Google Map Tracing the Route */}
          {startLocation.trim() && destination.trim() && (
            <div className="space-y-1.5">
              <QuickRouteMap
                startLocation={startLocation}
                destination={destination}
                vehicleMode={selectedVehicle}
                onRouteCalculated={(info) => {
                  if (info.distanceKm) setDistanceKm(info.distanceKm);
                  if (info.durationText) setDurationText(info.durationText);
                }}
              />
            </div>
          )}
        </div>

        {/* 2. DIRECTLY UNDER ROUTE FINDER: PLAN YOUR COMPLETE TRIP CARD */}
        <div className="mt-8 bg-[#183B32] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg border border-[#245246]">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-[#E0B466]" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#E0B466]">
                AI Travel Planner
              </span>
            </div>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl">
              Plan Your Complete Trip
            </h3>
            <p className="text-xs sm:text-sm text-[#FAF7F2]/80 max-w-lg">
              Let AI create your complete itinerary with attractions, food, stays, budget and activities for {destination || 'your destination'}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartTripPlanning}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#D96E37] hover:bg-[#C25D28] text-[#FAF7F2] text-sm font-bold shadow-md flex items-center justify-center gap-2 hover:scale-105 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <span>Plan My Trip →</span>
          </button>
        </div>

        </div>
      </section>

      {/* 3. BUDGET PLANNER IN LOWER SECTION OF HOME PAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <BudgetPlanner
          onNavigate={onNavigate}
          onPlanTrip={(dest, budget, travelers, days) => {
            if (onPlanTripWithBudget) {
              onPlanTripWithBudget(dest, budget, travelers, days);
            } else {
              onSearchDestination(dest);
            }
          }}
        />
      </section>

    </div>
  );
};

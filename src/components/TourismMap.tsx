import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass, Info, ExternalLink, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { RouteWaypoint, TouristAttraction, TransportMode } from '../types';

interface TourismMapProps {
  startLocation?: string;
  destination?: string;
  travelMode?: TransportMode;
  waypoints?: RouteWaypoint[];
  attractions?: TouristAttraction[];
  centerLat?: number;
  centerLng?: number;
  selectedId?: string | null;
  onSelectAttraction?: (id: string) => void;
  destinationName?: string;
  onRouteCalculated?: (data: { distanceKm: number; durationText: string }) => void;
}

type RouteCoordinate = [number, number] | { lat: number; lng: number };

function isNamedRouteCoordinate(point: RouteCoordinate): point is { lat: number; lng: number } {
  return !Array.isArray(point);
}

function normalizeRouteCoordinates(polyline: unknown): [number, number][] {
  if (!Array.isArray(polyline)) return [];

  return polyline.reduce<[number, number][]>((coordinates, point: RouteCoordinate) => {
    if (Array.isArray(point) && point.length >= 2) {
      const [lat, lng] = point;
      if (Number.isFinite(lat) && Number.isFinite(lng)) coordinates.push([lat, lng]);
    } else if (
      isNamedRouteCoordinate(point) &&
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng)
    ) {
      coordinates.push([point.lat, point.lng]);
    }
    return coordinates;
  }, []);
}

export const TourismMap: React.FC<TourismMapProps> = ({
  startLocation,
  destination,
  travelMode = 'car',
  waypoints = [],
  attractions = [],
  centerLat,
  centerLng,
  selectedId,
  onSelectAttraction,
  destinationName,
  onRouteCalculated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [hasGoogleMapsKey, setHasGoogleMapsKey] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationText: string;
    startName: string;
    destName: string;
  } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Normalize attraction points
  const points = waypoints.length > 0
    ? waypoints.map((wp, idx) => ({
        id: wp.id,
        order: wp.order || idx + 1,
        name: wp.name,
        lat: wp.lat,
        lng: wp.lng,
        category: wp.category,
        duration: wp.recommendedDuration,
        description: wp.description,
        time: wp.recommendedTime,
      }))
    : attractions.map((att, idx) => ({
        id: att.id,
        order: idx + 1,
        name: att.name,
        lat: att.lat,
        lng: att.lng,
        category: att.category,
        duration: att.recommendedDuration,
        description: att.description,
        time: att.bestTimeToVisit,
      }));

  // Fetch Google Maps API Key status
  useEffect(() => {
    fetch('/api/maps-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasKey) {
          setHasGoogleMapsKey(true);
        }
      })
      .catch(() => {});
  }, []);

  // Main Map & Route Rendering Effect
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    import('leaflet').then(async (L) => {
      if (isCancelled || !mapContainerRef.current) return;

      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map instance if not already initialized
      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [28.6139, 77.2090],
          zoom: 6,
          zoomControl: false,
        });

        const tileUrl = mapType === 'satellite'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);
        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      // 1. CLEANUP ALL EXISTING LAYERS (markers & polylines)
      markersRef.current.forEach((m) => {
        try { map.removeLayer(m); } catch (e) {}
      });
      markersRef.current = [];

      if (polylineRef.current) {
        try { map.removeLayer(polylineRef.current); } catch (e) {}
        polylineRef.current = null;
      }

      const activeStart = startLocation?.trim();
      const activeDest = destination?.trim() || destinationName?.trim();

      // If we have start and destination, fetch real route geometry from backend
      if (activeStart && activeDest) {
        setIsLoadingRoute(true);
        try {
          const res = await fetch(
            `/api/route?start=${encodeURIComponent(activeStart)}&destination=${encodeURIComponent(activeDest)}&mode=${encodeURIComponent(travelMode)}`
          );
          if (!res.ok) {
            throw new Error(`Route request failed with status ${res.status}`);
          }
          const data = await res.json();
          if (isCancelled) return;

          if (data.success && data.start && data.destination) {
            setRouteInfo({
              distanceKm: data.distanceKm || 0,
              durationText: data.durationText || '',
              startName: data.start.name,
              destName: data.destination.name,
            });

            if (onRouteCalculated) {
              onRouteCalculated({
                distanceKm: data.distanceKm || 0,
                durationText: data.durationText || '',
              });
            }

            const allBoundsCoords: [number, number][] = [];

            // A. Start Marker
            const startIconHtml = `
              <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                background: #183B32;
                color: #FAF7F2;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                border: 2px solid #FAF7F2;
                box-shadow: 0 4px 12px rgba(24, 59, 50, 0.4);
                white-space: nowrap;
                font-family: system-ui, sans-serif;
              ">
                <span>📍</span>
                <span>${data.start.name}</span>
              </div>
            `;
            const startDivIcon = L.divIcon({
              html: startIconHtml,
              className: 'custom-start-pin',
              iconSize: [120, 30],
              iconAnchor: [60, 15],
            });

            const startMarker = L.marker([data.start.lat, data.start.lng], { icon: startDivIcon }).addTo(map);
            startMarker.bindPopup(`<strong>Origin:</strong> ${data.start.name}`);
            markersRef.current.push(startMarker);
            allBoundsCoords.push([data.start.lat, data.start.lng]);

            // B. Destination Marker
            const destIconHtml = `
              <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                background: #D96E37;
                color: #FAF7F2;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                border: 2px solid #FAF7F2;
                box-shadow: 0 4px 12px rgba(217, 110, 55, 0.4);
                white-space: nowrap;
                font-family: system-ui, sans-serif;
              ">
                <span>🏁</span>
                <span>${data.destination.name}</span>
              </div>
            `;
            const destDivIcon = L.divIcon({
              html: destIconHtml,
              className: 'custom-dest-pin',
              iconSize: [120, 30],
              iconAnchor: [60, 15],
            });

            const destMarker = L.marker([data.destination.lat, data.destination.lng], { icon: destDivIcon }).addTo(map);
            destMarker.bindPopup(`<strong>Destination:</strong> ${data.destination.name}`);
            markersRef.current.push(destMarker);
            allBoundsCoords.push([data.destination.lat, data.destination.lng]);

            // C. Draw Route Polyline
            const polyCoords = normalizeRouteCoordinates(data.polyline);
            if (polyCoords.length > 0) {
              const polyline = L.polyline(polyCoords, {
                color: '#183B32',
                weight: 5,
                opacity: 0.85,
                dashArray: travelMode === 'flight' ? '8, 8' : undefined,
              }).addTo(map);

              polylineRef.current = polyline;
              polyCoords.forEach((pt) => allBoundsCoords.push(pt));
            }

            // D. Add Attraction Waypoints if provided (when itinerary has been generated)
            if (points.length > 0) {
              points.forEach((pt) => {
                const isSelected = selectedId === pt.id;
                const iconHtml = `
                  <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${isSelected ? '#D96E37' : '#C8963E'};
                    color: #FAF7F2;
                    font-weight: 700;
                    font-size: 12px;
                    border: 2.5px solid #FAF7F2;
                    box-shadow: 0 4px 12px rgba(24, 59, 50, 0.3);
                    cursor: pointer;
                    transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                  ">
                    ${pt.order}
                  </div>
                `;

                const customIcon = L.divIcon({
                  html: iconHtml,
                  className: 'custom-leaflet-pin',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16],
                });

                const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(map);

                marker.on('click', () => {
                  if (onSelectAttraction) onSelectAttraction(pt.id);
                });

                marker.bindPopup(`
                  <div style="padding: 6px; max-width: 220px; font-family: system-ui, sans-serif;">
                    <div style="font-size: 10px; font-weight: 700; color: #C8963E; text-transform: uppercase; margin-bottom: 2px;">
                      Stop ${pt.order} • ${pt.category || 'Attraction'}
                    </div>
                    <div style="font-size: 13px; font-weight: bold; color: #183B32; margin-bottom: 4px;">
                      ${pt.name}
                    </div>
                    <div style="font-size: 11px; color: #57605B; margin-bottom: 6px;">
                      ${pt.description}
                    </div>
                    <div style="font-size: 10px; color: #183B32; font-weight: 600; background: #FAF7F2; padding: 4px 6px; border-radius: 6px;">
                      ⏱ ${pt.duration}
                    </div>
                  </div>
                `);

                markersRef.current.push(marker);
                allBoundsCoords.push([pt.lat, pt.lng]);
              });
            }

            // E. Auto-fit bounds strictly to this route
            if (allBoundsCoords.length > 0) {
              const bounds = L.latLngBounds(allBoundsCoords);
              map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
            }
          }
        } catch (err) {
          console.warn('Map route fetch fallback:', err);
        } finally {
          setIsLoadingRoute(false);
        }
      } else if (points.length > 0) {
        // Fallback if only attraction waypoints are provided
        const latLngs: [number, number][] = [];
        points.forEach((pt) => {
          const isSelected = selectedId === pt.id;
          const iconHtml = `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${isSelected ? '#D96E37' : '#183B32'};
              color: #FAF7F2;
              font-weight: 700;
              font-size: 12px;
              border: 2.5px solid #FAF7F2;
              box-shadow: 0 4px 12px rgba(24, 59, 50, 0.3);
              cursor: pointer;
            ">
              ${pt.order}
            </div>
          `;
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-leaflet-pin',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(map);
          markersRef.current.push(marker);
          latLngs.push([pt.lat, pt.lng]);
        });

        if (latLngs.length > 1) {
          const polyline = L.polyline(latLngs, {
            color: '#183B32',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8',
          }).addTo(map);
          polylineRef.current = polyline;
          map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
        } else if (latLngs.length === 1) {
          map.setView(latLngs[0], 12);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [startLocation, destination, destinationName, travelMode, points.length, selectedId]);

  // Open Google Maps directions in external tab
  const handleOpenGoogleDirections = () => {
    const origin = startLocation?.trim();
    const dest = destination?.trim() || destinationName?.trim();
    if (!origin || !dest) {
      window.open('https://www.google.com/maps', '_blank', 'noopener,noreferrer');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const displayTitle = startLocation && destination 
    ? `${startLocation} → ${destination}`
    : destinationName || destination || 'Route Map';

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden calm-card border border-[#E5DFD3] flex flex-col">
      {/* Top Map Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-[#FAF7F2]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E5DFD3] shadow-sm pointer-events-auto flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-[#183B32] text-[#FAF7F2]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#183B32] flex items-center gap-1.5">
              <span>{displayTitle}</span>
              {points.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EFE9DE] text-[#4E3C2F] font-semibold">
                  {points.length} Stops
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#57605B]">
              {isLoadingRoute ? 'Calculating road route...' : 'Direct route geometry & navigation'}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleOpenGoogleDirections}
            className="px-3.5 py-2 rounded-xl bg-[#FAF7F2]/95 hover:bg-[#FFFFFF] text-xs font-semibold text-[#183B32] border border-[#E5DFD3] shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Open in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-[#D96E37]" />
            <span className="hidden sm:inline">Google Maps</span>
            <ExternalLink className="w-3 h-3 text-[#57605B]" />
          </button>
        </div>
      </div>

      {/* Map Surface */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] flex-1 z-0" />

      {/* Bottom Status Banner */}
      <div className="bg-[#FAF7F2] border-t border-[#E5DFD3] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-[#57605B] gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#183B32] animate-ping" />
          <span className="font-medium text-[#183B32]">
            {hasGoogleMapsKey ? 'Google Maps Layer Active' : 'Live Interactive Route'}
          </span>
          {routeInfo && (
            <>
              <span className="text-[#8C938E]">•</span>
              <span>{routeInfo.distanceKm} km (~{routeInfo.durationText})</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#183B32]">
          <span>📍 {startLocation || 'Start'}</span>
          <span>→</span>
          <span>🏁 {destination || 'Destination'}</span>
        </div>
      </div>
    </div>
  );
};

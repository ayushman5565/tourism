import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface QuickRouteMapProps {
  startLocation: string;
  destination: string;
  vehicleMode: 'car' | 'two_wheeler' | 'bus' | 'train';
  onRouteCalculated?: (data: { distanceKm: number; durationText: string; polyline?: [number, number][] }) => void;
}

export const QuickRouteMap: React.FC<QuickRouteMapProps> = ({
  startLocation,
  destination,
  vehicleMode,
  onRouteCalculated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationText: string;
    startName: string;
    destName: string;
  } | null>(null);

  // External Google Maps directions URL
  const googleMapsDirectionsUrl =
    startLocation && destination
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
          startLocation
        )}&destination=${encodeURIComponent(destination)}&travelmode=${
          vehicleMode === 'train' || vehicleMode === 'bus' ? 'transit' : 'driving'
        }`
      : `https://www.google.com/maps`;

  // Fetch route and draw map
  useEffect(() => {
    if (!startLocation.trim() || !destination.trim()) {
      setRouteInfo(null);
      setErrorMsg(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    fetch(
      `/api/route?start=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(
        destination
      )}&mode=${vehicleMode}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Could not calculate route between these locations.');
        return res.json();
      })
      .then(async (data) => {
        if (!isMounted) return;
        setIsLoading(false);

        if (!data.start || !data.destination) {
          setErrorMsg('Location coordinates could not be determined.');
          return;
        }

        const startCoords: [number, number] = [data.start.lat, data.start.lng];
        const destCoords: [number, number] = [data.destination.lat, data.destination.lng];
        const polylineCoords: [number, number][] =
          data.polyline && data.polyline.length > 0
            ? data.polyline
            : [startCoords, destCoords];

        setRouteInfo({
          distanceKm: data.distanceKm,
          durationText: data.durationText,
          startName: data.start.name || startLocation,
          destName: data.destination.name || destination,
        });

        if (onRouteCalculated) {
          onRouteCalculated({
            distanceKm: data.distanceKm,
            durationText: data.durationText,
            polyline: polylineCoords,
          });
        }

        // Render Leaflet Map
        if (mapContainerRef.current) {
          const L = await import('leaflet');

          // Fix default Leaflet icons
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          });

          if (!leafletMapRef.current) {
            const map = L.map(mapContainerRef.current, {
              center: startCoords,
              zoom: 7,
              zoomControl: false,
            });

            L.tileLayer(
              'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
              {
                attribution:
                  '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
                maxZoom: 19,
              }
            ).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);
            leafletMapRef.current = map;
          }

          const map = leafletMapRef.current;

          // Clear previous markers
          markersRef.current.forEach((m) => map.removeLayer(m));
          markersRef.current = [];

          // Clear previous polyline
          if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
            polylineRef.current = null;
          }

          // Custom Start Marker (Green badge)
          const startHtml = `
            <div style="background-color: #183B32; color: #FAF7F2; border: 2px solid #FFFFFF; border-radius: 9999px; padding: 4px 10px; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap;">
              <span>📍 Start: ${startLocation}</span>
            </div>
          `;
          const startIcon = L.divIcon({
            html: startHtml,
            className: 'custom-route-start-marker',
            iconAnchor: [30, 20],
          });
          const startMarker = L.marker(startCoords, { icon: startIcon }).addTo(map);
          markersRef.current.push(startMarker);

          // Custom Destination Marker (Amber badge)
          const destHtml = `
            <div style="background-color: #D96E37; color: #FAF7F2; border: 2px solid #FFFFFF; border-radius: 9999px; padding: 4px 10px; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); white-space: nowrap;">
              <span>🏁 Dest: ${destination}</span>
            </div>
          `;
          const destIcon = L.divIcon({
            html: destHtml,
            className: 'custom-route-dest-marker',
            iconAnchor: [30, 20],
          });
          const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
          markersRef.current.push(destMarker);

          // Draw Route Polyline
          const polyline = L.polyline(polylineCoords, {
            color: '#183B32',
            weight: 5,
            opacity: 0.85,
            dashArray: vehicleMode === 'train' ? '8, 8' : undefined,
            lineJoin: 'round',
          }).addTo(map);
          polylineRef.current = polyline;

          // Fit bounds to show both points with padding
          const bounds = L.latLngBounds([startCoords, destCoords]);
          if (polylineCoords.length > 2) {
            polylineCoords.forEach((pt) => bounds.extend(pt));
          }
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoading(false);
        setErrorMsg('Could not find direct highway route. Please verify city spelling.');
      });

    return () => {
      isMounted = false;
    };
  }, [startLocation, destination, vehicleMode]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5DFD3] shadow-sm bg-[#F4EFE6]">
      {/* Map Header Bar */}
      <div className="bg-[#FAF7F2]/90 backdrop-blur-xs px-4 py-2.5 border-b border-[#EAE3D6] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#183B32] font-semibold">
          <Navigation className="w-3.5 h-3.5 text-[#D96E37]" />
          <span>Interactive Route Map</span>
          {routeInfo && (
            <span className="text-[#57605B] font-normal hidden sm:inline">
              ({routeInfo.distanceKm} km · {routeInfo.durationText})
            </span>
          )}
        </div>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#183B32] hover:text-[#D96E37] font-medium transition-colors cursor-pointer"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Map View Canvas */}
      <div className="relative w-full h-[320px] sm:h-[380px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#FAF7F2]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <RefreshCw className="w-6 h-6 text-[#183B32] animate-spin" />
            <p className="text-xs font-semibold text-[#183B32]">
              Calculating optimal route & travel time...
            </p>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && !isLoading && (
          <div className="absolute top-4 left-4 right-4 bg-[#FDEDEC] text-[#9A2D24] p-3 rounded-xl border border-[#F5C2BF] text-xs flex items-center gap-2 shadow-sm z-10">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Empty Search Prompt */}
        {(!startLocation.trim() || !destination.trim()) && !isLoading && (
          <div className="absolute inset-0 bg-[#FAF7F2]/70 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-12 h-12 rounded-full bg-[#183B32]/10 text-[#183B32] flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#183B32]">
              Enter a Starting Location and Destination
            </p>
            <p className="text-xs text-[#57605B] mt-1 max-w-xs">
              The map will automatically trace the route and calculate distance and vehicle travel times.
            </p>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="bg-[#FAF7F2] px-4 py-2 border-t border-[#EAE3D6] flex items-center justify-between text-[11px] text-[#57605B] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#183B32]" />
            <span>Starting Location</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D96E37]" />
            <span>Destination</span>
          </div>
        </div>
        <span className="text-[10px] text-[#86908A]">Turn-by-turn road geometry</span>
      </div>
    </div>
  );
};

export interface RouteSegment {
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng]
}

export interface CalculatedTripRoute {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  routeGeometry: [number, number][]; // [lat, lng]
  legs: { from: string; to: string; distanceKm: number }[];
}

/**
 * Great-circle distance using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Interpolate curve points between two coordinates for smooth cartographic trails
 */
export function interpolateArc(
  start: [number, number],
  end: [number, number],
  steps = 8
): [number, number][] {
  const points: [number, number][] = [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = lat1 + (lat2 - lat1) * fraction;
    const lng = lng1 + (lng2 - lng1) * fraction;
    // Add subtle curvature
    const curveOffset = Math.sin(fraction * Math.PI) * 0.015;
    points.push([lat + curveOffset, lng]);
  }
  return points;
}

/**
 * Fetch real driving road geometry from OSRM public API with automatic geodesic fallback
 */
export async function calculateTripRoute(
  waypoints: { name: string; lat: number; lng: number }[]
): Promise<CalculatedTripRoute> {
  if (waypoints.length < 2) {
    return {
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      routeGeometry: waypoints.map((w) => [w.lat, w.lng]),
      legs: [],
    };
  }

  // Calculate direct leg distances first
  let directTotalDist = 0;
  const legs: { from: string; to: string; distanceKm: number }[] = [];
  const fallbackGeometry: [number, number][] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const dist = calculateHaversineDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    directTotalDist += dist;
    legs.push({
      from: p1.name,
      to: p2.name,
      distanceKm: dist,
    });
    const arc = interpolateArc([p1.lat, p1.lng], [p2.lat, p2.lng], 10);
    fallbackGeometry.push(...arc);
  }

  try {
    const coordsParam = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        const route = data.routes[0];
        const routeDistanceKm = parseFloat((route.distance / 1000).toFixed(1));
        const durationMinutes = Math.round(route.duration / 60);
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        return {
          totalDistanceKm: routeDistanceKm,
          totalDurationMinutes: durationMinutes,
          routeGeometry: coordinates,
          legs,
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing network unavailable, using great-circle route geometry:', err);
  }

  return {
    totalDistanceKm: parseFloat(directTotalDist.toFixed(1)),
    totalDurationMinutes: Math.round(directTotalDist * 1.5), // approx 40km/h average in hills/city
    routeGeometry: fallbackGeometry,
    legs,
  };
}

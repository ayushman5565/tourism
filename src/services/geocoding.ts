export interface GeocodeResult {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type: string;
}

// Popular explorer destinations curated for immediate fast autocomplete
export const POPULAR_DESTINATIONS: GeocodeResult[] = [
  {
    placeId: 'pop-1',
    name: 'Rishikesh',
    displayName: 'Rishikesh, Dehradun, Uttarakhand, India',
    lat: 30.0869,
    lng: 78.2676,
    type: 'city',
  },
  {
    placeId: 'pop-2',
    name: 'Haridwar',
    displayName: 'Haridwar, Uttarakhand, India',
    lat: 29.9457,
    lng: 78.1642,
    type: 'city',
  },
  {
    placeId: 'pop-3',
    name: 'Manali',
    displayName: 'Manali, Kullu, Himachal Pradesh, India',
    lat: 32.2432,
    lng: 77.1892,
    type: 'town',
  },
  {
    placeId: 'pop-4',
    name: 'Delhi',
    displayName: 'New Delhi, National Capital Territory of Delhi, India',
    lat: 28.6139,
    lng: 77.2090,
    type: 'city',
  },
  {
    placeId: 'pop-5',
    name: 'Goa',
    displayName: 'Panaji, North Goa, Goa, India',
    lat: 15.4909,
    lng: 73.8278,
    type: 'state',
  },
  {
    placeId: 'pop-6',
    name: 'Jaipur',
    displayName: 'Jaipur, Rajasthan, India',
    lat: 26.9124,
    lng: 75.7873,
    type: 'city',
  },
  {
    placeId: 'pop-7',
    name: 'Mussoorie',
    displayName: 'Mussoorie, Dehradun, Uttarakhand, India',
    lat: 30.4598,
    lng: 78.0644,
    type: 'town',
  },
  {
    placeId: 'pop-8',
    name: 'Dehradun',
    displayName: 'Dehradun, Uttarakhand, India',
    lat: 30.3165,
    lng: 78.0322,
    type: 'city',
  },
  {
    placeId: 'pop-9',
    name: 'Leh Ladakh',
    displayName: 'Leh, Ladakh, India',
    lat: 34.1526,
    lng: 77.5771,
    type: 'town',
  },
  {
    placeId: 'pop-10',
    name: 'Varanasi',
    displayName: 'Varanasi, Uttar Pradesh, India',
    lat: 25.3176,
    lng: 82.9739,
    type: 'city',
  },
];

export async function searchDestinations(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&limit=6&addressdetails=1`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          placeId: String(item.place_id),
          name: item.name || item.display_name.split(',')[0],
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || 'place',
        }));
      }
    }
  } catch (err) {
    console.warn('Nominatim network lookup timed out or failed, using local matching:', err);
  }

  // Local fallback search against popular places
  return POPULAR_DESTINATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(trimmed) ||
      p.displayName.toLowerCase().includes(trimmed)
  );
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const locality =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          addr.county ||
          addr.state ||
          data.display_name.split(',')[0];
        const state = addr.state ? `, ${addr.state}` : '';
        return `${locality}${state}`;
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
  }

  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Generator with automatic model fallback & retry
async function generateContentWithFallback(ai: GoogleGenAI, config: any): Promise<string> {
  const modelsToTry = [
    config.model || "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...config,
          model: modelName,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 1) {
          // Wait 600ms with jitter before retrying
          await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini model attempts failed.");
}

// Comprehensive coordinate cache for instant geocoding
const KNOWN_COORDINATES: Record<string, { lat: number; lng: number; hasAirport?: boolean }> = {
  rishikesh: { lat: 30.0869, lng: 78.2676, hasAirport: false },
  shimla: { lat: 31.1048, lng: 77.1734, hasAirport: false },
  dehradun: { lat: 30.3165, lng: 78.0322, hasAirport: true },
  mussoorie: { lat: 30.4598, lng: 78.0644, hasAirport: false },
  delhi: { lat: 28.6139, lng: 77.2090, hasAirport: true },
  "new delhi": { lat: 28.6139, lng: 77.2090, hasAirport: true },
  jaipur: { lat: 26.9124, lng: 75.7873, hasAirport: true },
  mumbai: { lat: 19.0760, lng: 72.8777, hasAirport: true },
  goa: { lat: 15.2993, lng: 74.1240, hasAirport: true },
  bangalore: { lat: 12.9716, lng: 77.5946, hasAirport: true },
  bengaluru: { lat: 12.9716, lng: 77.5946, hasAirport: true },
  agra: { lat: 27.1767, lng: 78.0081, hasAirport: true },
  manali: { lat: 32.2432, lng: 77.1892, hasAirport: false },
  udaipur: { lat: 24.5854, lng: 73.7125, hasAirport: true },
  jodhpur: { lat: 26.2389, lng: 73.0243, hasAirport: true },
  varanasi: { lat: 25.3176, lng: 82.9739, hasAirport: true },
  chennai: { lat: 13.0827, lng: 80.2707, hasAirport: true },
  kolkata: { lat: 22.5726, lng: 88.3639, hasAirport: true },
  hyderabad: { lat: 17.3850, lng: 78.4867, hasAirport: true },
  pune: { lat: 18.5204, lng: 73.8567, hasAirport: true },
  chandigarh: { lat: 30.7333, lng: 76.7794, hasAirport: true },
  amritsar: { lat: 31.6340, lng: 74.8723, hasAirport: true },
  srinagar: { lat: 34.0837, lng: 74.7973, hasAirport: true },
  leh: { lat: 34.1526, lng: 77.5771, hasAirport: true },
  haridwar: { lat: 29.9457, lng: 78.1642, hasAirport: false },
  nainital: { lat: 29.3919, lng: 79.4542, hasAirport: false },
  ooty: { lat: 11.4102, lng: 76.6950, hasAirport: false },
  kochi: { lat: 9.9312, lng: 76.2673, hasAirport: true },
  alleppey: { lat: 9.4981, lng: 76.3388, hasAirport: false },
  munnar: { lat: 10.0889, lng: 77.0595, hasAirport: false },
  darjeeling: { lat: 27.0410, lng: 88.2663, hasAirport: false },
  gangtok: { lat: 27.3389, lng: 88.6065, hasAirport: false },
  kyoto: { lat: 35.0116, lng: 135.7681, hasAirport: false },
  tokyo: { lat: 35.6762, lng: 139.6503, hasAirport: true },
  osaka: { lat: 34.6937, lng: 135.5023, hasAirport: true },
  rome: { lat: 41.9028, lng: 12.4964, hasAirport: true },
  florence: { lat: 43.7696, lng: 11.2558, hasAirport: true },
  amalfi: { lat: 40.6340, lng: 14.6027, hasAirport: false },
  naples: { lat: 40.8518, lng: 14.2681, hasAirport: true },
  banff: { lat: 51.1784, lng: -115.5708, hasAirport: false },
  calgary: { lat: 51.0447, lng: -114.0719, hasAirport: true },
  zermatt: { lat: 45.9765, lng: 7.7491, hasAirport: false },
  zurich: { lat: 47.3769, lng: 8.5417, hasAirport: true },
  geneva: { lat: 46.2044, lng: 6.1432, hasAirport: true },
  bali: { lat: -8.4095, lng: 115.1889, hasAirport: true },
  denpasar: { lat: -8.6705, lng: 115.2126, hasAirport: true },
  ubud: { lat: -8.5069, lng: 115.2625, hasAirport: false },
  paris: { lat: 48.8566, lng: 2.3522, hasAirport: true },
  london: { lat: 51.5074, lng: -0.1278, hasAirport: true },
  "new york": { lat: 40.7128, lng: -74.0060, hasAirport: true },
  dubai: { lat: 25.2048, lng: 55.2708, hasAirport: true },
  singapore: { lat: 1.3521, lng: 103.8198, hasAirport: true },
  bangkok: { lat: 13.7563, lng: 100.5018, hasAirport: true },
};

function calculateGreatCircleKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return Math.round(R * c);
}

// Dynamic geocoding: Checks cache first, then Google Geocoding API if key available, then OpenStreetMap Nominatim
async function geocodeLocation(locationName: string): Promise<{ lat: number; lng: number; displayName: string; hasAirport: boolean } | null> {
  const clean = locationName.toLowerCase().trim();
  if (!clean) return null;

  // 1. Direct cache match
  for (const [key, val] of Object.entries(KNOWN_COORDINATES)) {
    if (clean === key || clean.startsWith(key + ",") || clean.includes(key)) {
      return { lat: val.lat, lng: val.lng, displayName: locationName, hasAirport: val.hasAirport ?? false };
    }
  }

  // 2. Try Google Geocoding API
  const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (gmapsKey && gmapsKey !== "MY_GOOGLE_MAPS_API_KEY") {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${gmapsKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        return {
          lat: loc.lat,
          lng: loc.lng,
          displayName: data.results[0].formatted_address || locationName,
          hasAirport: false,
        };
      }
    } catch (gErr) {
      console.warn("Google Geocoding error:", gErr);
    }
  }

  // 3. Try OpenStreetMap Nominatim API
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
    const res = await fetch(nominatimUrl, {
      headers: { "User-Agent": "TripTale-Tourism-Route-Finder/1.0" },
    });
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name || locationName,
        hasAirport: false,
      };
    }
  } catch (nomErr) {
    console.warn("Nominatim Geocoding error:", nomErr);
  }

  return null;
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function describeWeatherCode(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Light rain showers",
    81: "Rain showers",
    82: "Heavy rain showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
  };

  return descriptions[code] || "Current conditions";
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "TripTale Tourism Platform" });
});

// Maps configuration check endpoint
app.get("/api/maps-config", (_req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || "";
  res.json({
    hasKey: Boolean(key && key !== "MY_GOOGLE_MAPS_API_KEY"),
  });
});

// Current weather and multi-day forecast for the selected destination.
// Coordinates are resolved using geocoding, then sent to Open-Meteo's forecast API.
app.get("/api/weather", async (req, res) => {
  try {
    const destination = (req.query.destination as string || "").trim();
    const daysParam = parseInt(req.query.days as string || "3", 10);
    const forecastDays = Math.min(14, Math.max(1, isNaN(daysParam) ? 3 : daysParam));

    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const location = await geocodeLocation(destination);
    if (!location) {
      return res.status(404).json({ error: `Could not find weather for ${destination}` });
    }

    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.search = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lng),
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max",
      forecast_days: String(forecastDays),
      timezone: "auto",
    }).toString();

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Weather provider returned ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    if (!current || typeof current.temperature_2m !== "number") {
      throw new Error("Weather provider returned an incomplete response");
    }

    const daily = weatherData.daily || {};
    const dailyForecast: Array<{
      date: string;
      dayName: string;
      maxTemp: number;
      minTemp: number;
      weatherCode: number;
      condition: string;
      rainProbability: number;
    }> = [];

    if (Array.isArray(daily.time)) {
      daily.time.forEach((dateStr: string, idx: number) => {
        const dateObj = new Date(dateStr);
        const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : dateObj.toLocaleDateString("en-US", { weekday: "short" });
        const code = daily.weather_code?.[idx] ?? 0;
        dailyForecast.push({
          date: dateStr,
          dayName,
          maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? current.temperature_2m),
          minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? current.temperature_2m - 5),
          weatherCode: code,
          condition: describeWeatherCode(code),
          rainProbability: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
        });
      });
    }

    res.json({
      success: true,
      location: location.displayName,
      currentTime: current.time,
      temperatureC: Math.round(current.temperature_2m),
      feelsLikeC: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windKph: Math.round(current.wind_speed_10m),
      weatherCode: current.weather_code,
      condition: describeWeatherCode(current.weather_code),
      isDay: Boolean(current.is_day),
      forecastDaysRequested: forecastDays,
      forecast: dailyForecast,
    });
  } catch (err: any) {
    console.warn("Weather lookup failed:", err);
    res.status(502).json({ error: "Unable to load current weather" });
  }
});

// Dynamic Geocoding Endpoint
app.get("/api/geocode", async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      return res.status(400).json({ error: "Query 'q' is required" });
    }
    const result = await geocodeLocation(q);
    if (!result) {
      return res.status(404).json({ error: `Could not geocode location: ${q}` });
    }
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: "Geocoding failed", message: err?.message });
  }
});

// Dynamic Route & Polyline Endpoint (Returns real OSRM / Google route)
app.get("/api/route", async (req, res) => {
  try {
    const start = req.query.start as string;
    const destination = req.query.destination as string;
    const mode = (req.query.mode as string) || "car";

    if (!start || !destination) {
      return res.status(400).json({ error: "Both 'start' and 'destination' are required" });
    }

    const startGeocode = await geocodeLocation(start);
    const destGeocode = await geocodeLocation(destination);

    if (!startGeocode || !destGeocode) {
      return res.status(404).json({ error: "Could not find coordinates for one or both locations." });
    }

    let routeDistanceKm = 0;
    let routeDurationMinutes = 0;
    let coordinates: [number, number][] = [];

    // 1. Try OSRM routing service for driving path
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startGeocode.lng},${startGeocode.lat};${destGeocode.lng},${destGeocode.lat}?overview=full&geometries=geojson`;
      const osrmRes = await fetch(osrmUrl);
      const osrmData = await osrmRes.json();

      if (osrmData.code === "Ok" && osrmData.routes && osrmData.routes.length > 0) {
        const route = osrmData.routes[0];
        routeDistanceKm = Math.round(route.distance / 1000);
        routeDurationMinutes = Math.round(route.duration / 60);
        // GeoJSON is [lng, lat], convert to [lat, lng]
        coordinates = route.geometry.coordinates.map((pt: [number, number]) => [pt[1], pt[0]]);
      }
    } catch (osrmErr) {
      console.warn("OSRM routing service failed, using great circle interpolation:", osrmErr);
    }

    // Fallback if routing service had no connectivity
    if (coordinates.length === 0) {
      const aerial = calculateGreatCircleKm(startGeocode.lat, startGeocode.lng, destGeocode.lat, destGeocode.lng);
      routeDistanceKm = Math.max(5, Math.round(aerial * 1.28));
      routeDurationMinutes = Math.round((routeDistanceKm / 55) * 60);
      coordinates = [
        [startGeocode.lat, startGeocode.lng],
        [destGeocode.lat, destGeocode.lng],
      ];
    }

    // Vehicle specific duration adjustments
    let vehicleDurationMinutes = routeDurationMinutes;
    if (mode === "two_wheeler") {
      vehicleDurationMinutes = Math.round(routeDurationMinutes * 1.12);
    } else if (mode === "bus") {
      vehicleDurationMinutes = Math.round(routeDurationMinutes * 1.25 + 25);
    } else if (mode === "train") {
      vehicleDurationMinutes = Math.max(45, Math.round((routeDistanceKm / 65) * 60 + 20));
    }

    res.json({
      success: true,
      start: {
        name: start,
        lat: startGeocode.lat,
        lng: startGeocode.lng,
      },
      destination: {
        name: destination,
        lat: destGeocode.lat,
        lng: destGeocode.lng,
      },
      distanceKm: routeDistanceKm,
      durationMinutes: vehicleDurationMinutes,
      durationText: formatDuration(vehicleDurationMinutes),
      polyline: coordinates,
    });
  } catch (err: any) {
    console.error("Route calculation error:", err);
    res.status(500).json({ error: "Failed to calculate route", message: err?.message });
  }
});

// 3. TRANSPORTATION ESTIMATES & FLIGHT AVAILABILITY ENDPOINT
app.post("/api/transport/estimate", async (req, res) => {
  try {
    const { startLocation, destination, selectedMode } = req.body;
    if (!startLocation || !startLocation.trim() || !destination || !destination.trim()) {
      return res.status(400).json({ error: "Starting location and destination are required" });
    }

    const startClean = startLocation.trim();
    const destClean = destination.trim();

    const startGeocode = await geocodeLocation(startClean);
    const destGeocode = await geocodeLocation(destClean);

    let baseDistanceKm = 100;
    let baseDurationMins = 120;

    if (startGeocode && destGeocode) {
      const aerialKm = calculateGreatCircleKm(startGeocode.lat, startGeocode.lng, destGeocode.lat, destGeocode.lng);
      
      // Try OSRM for exact distance
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startGeocode.lng},${startGeocode.lat};${destGeocode.lng},${destGeocode.lat}?overview=false`;
        const osrmRes = await fetch(osrmUrl);
        const osrmData = await osrmRes.json();
        if (osrmData.code === "Ok" && osrmData.routes?.[0]) {
          baseDistanceKm = Math.round(osrmData.routes[0].distance / 1000);
          baseDurationMins = Math.round(osrmData.routes[0].duration / 60);
        } else {
          baseDistanceKm = Math.max(5, Math.round(aerialKm * 1.28));
          baseDurationMins = Math.round((baseDistanceKm / 55) * 60);
        }
      } catch {
        baseDistanceKm = Math.max(5, Math.round(aerialKm * 1.28));
        baseDurationMins = Math.round((baseDistanceKm / 55) * 60);
      }
    } else {
      // Approximate for general search
      baseDistanceKm = 120;
      baseDurationMins = 140;
    }

    // Vehicle Options Calculations
    // 1. Car (🚗)
    const carMins = baseDurationMins;
    const carCostMin = Math.round(baseDistanceKm * 8 + 150);
    const carCostMax = Math.round(baseDistanceKm * 12 + 300);

    // 2. Two Wheeler (🏍️)
    const bikeMins = Math.round(baseDurationMins * 1.12);
    const bikeCostMin = Math.round(baseDistanceKm * 2.5 + 50);
    const bikeCostMax = Math.round(baseDistanceKm * 4 + 100);

    // 3. Train (🚆)
    const trainAvailable = baseDistanceKm >= 25;
    const trainMins = Math.max(40, Math.round((baseDistanceKm / 68) * 60 + 20));
    const trainCostMin = Math.max(100, Math.round(baseDistanceKm * 1.5));
    const trainCostMax = Math.max(300, Math.round(baseDistanceKm * 4));

    // 4. Bus (🚌)
    const busMins = Math.round(baseDurationMins * 1.22 + 20);
    const busCostMin = Math.max(100, Math.round(baseDistanceKm * 1.25));
    const busCostMax = Math.max(250, Math.round(baseDistanceKm * 2.5));

    // 5. Flight (✈️) Availability Logic
    // Flights are only available if distance is significant (>160 km) AND both locations have airport capability
    const startHasAirport = startGeocode?.hasAirport ?? false;
    const destHasAirport = destGeocode?.hasAirport ?? false;
    
    let flightStatus: 'Available' | 'Not available for this route' | 'Flight availability data unavailable' = 'Not available for this route';
    let flightDetail = 'No direct airport pair for this driving route';
    let flightDurationMinutes = 0;
    let flightCostMin = 0;
    let flightCostMax = 0;

    if (baseDistanceKm < 160) {
      flightStatus = 'Not available for this route';
      flightDetail = `Distance (${baseDistanceKm} km) is too short for scheduled air transit. Road or rail is recommended.`;
    } else if (startHasAirport && destHasAirport) {
      flightStatus = 'Available';
      flightDurationMinutes = Math.min(180, Math.max(55, Math.round(45 + (baseDistanceKm / 750) * 60)));
      flightCostMin = Math.round(3500 + baseDistanceKm * 5);
      flightCostMax = Math.round(6500 + baseDistanceKm * 10);
      flightDetail = `Direct or 1-stop air connection available (~${formatDuration(flightDurationMinutes)}).`;
    } else if (startGeocode && destGeocode && baseDistanceKm >= 160) {
      // One or neither is a known major airport city (e.g., mountain towns like Rishikesh, Shimla, Manali)
      flightStatus = 'Not available for this route';
      flightDetail = 'No direct commercial flight route exists between these locations.';
    } else {
      flightStatus = 'Flight availability data unavailable';
      flightDetail = 'Could not verify commercial flight availability for this route.';
    }

    const options = [
      {
        id: "car",
        label: "Car",
        icon: "🚗",
        distanceKm: baseDistanceKm,
        distanceText: `${baseDistanceKm} km`,
        durationMinutes: carMins,
        durationText: formatDuration(carMins),
        estimatedCostRange: `₹${carCostMin.toLocaleString('en-IN')} – ₹${carCostMax.toLocaleString('en-IN')}`,
        description: "Direct highway route, flexible stops.",
      },
      {
        id: "two_wheeler",
        label: "Two Wheeler",
        icon: "🏍️",
        distanceKm: baseDistanceKm,
        distanceText: `${baseDistanceKm} km`,
        durationMinutes: bikeMins,
        durationText: formatDuration(bikeMins),
        estimatedCostRange: `₹${bikeCostMin.toLocaleString('en-IN')} – ₹${bikeCostMax.toLocaleString('en-IN')}`,
        description: "Scenic highway ride.",
      },
      {
        id: "bus",
        label: "Bus",
        icon: "🚌",
        distanceKm: baseDistanceKm,
        distanceText: `${baseDistanceKm} km`,
        durationMinutes: busMins,
        durationText: formatDuration(busMins),
        estimatedCostRange: `₹${busCostMin.toLocaleString('en-IN')} – ₹${busCostMax.toLocaleString('en-IN')} / ticket`,
        description: "Intercity highway coach service.",
      },
      {
        id: "train",
        label: "Train",
        icon: "🚆",
        distanceKm: Math.round(baseDistanceKm * 0.96),
        distanceText: `${Math.round(baseDistanceKm * 0.96)} km`,
        durationMinutes: trainMins,
        durationText: trainAvailable ? formatDuration(trainMins) : "Unavailable",
        estimatedCostRange: trainAvailable ? `₹${trainCostMin.toLocaleString('en-IN')} – ₹${trainCostMax.toLocaleString('en-IN')} / ticket` : "N/A",
        description: trainAvailable ? "Station-to-station rail connection." : "Public transport information unavailable for this route.",
      },
    ];

    // Keep the transport options consumed by the planner in sync with the
    // availability result returned below. Previously, a valid flight was
    // calculated but never surfaced as a selectable planner option.
    if (flightStatus === 'Available') {
      options.push({
        id: "flight",
        label: "Flight",
        icon: "✈️",
        distanceKm: baseDistanceKm,
        distanceText: `${baseDistanceKm} km (Air)`,
        durationMinutes: flightDurationMinutes,
        durationText: formatDuration(flightDurationMinutes),
        estimatedCostRange: `₹${flightCostMin.toLocaleString('en-IN')} – ₹${flightCostMax.toLocaleString('en-IN')} / ticket`,
        description: flightDetail,
      });
    }

    res.json({
      success: true,
      startLocation: startClean,
      destination: destClean,
      startCoordinates: startGeocode ? { lat: startGeocode.lat, lng: startGeocode.lng } : null,
      destCoordinates: destGeocode ? { lat: destGeocode.lat, lng: destGeocode.lng } : null,
      baseDistanceKm,
      options,
      flight: {
        status: flightStatus,
        detail: flightDetail,
        durationMinutes: flightDurationMinutes,
        durationText: flightDurationMinutes > 0 ? formatDuration(flightDurationMinutes) : null,
        costRange: flightCostMin > 0 ? `₹${flightCostMin.toLocaleString('en-IN')} – ₹${flightCostMax.toLocaleString('en-IN')}` : null,
      },
    });
  } catch (err: any) {
    console.error("Transport estimate error:", err);
    res.status(500).json({ error: "Failed to estimate transportation options" });
  }
});

// 6. GOOGLE PLACES SEARCH & PHOTO PROXY ENDPOINT
// Retrieves real place details and official Google Maps Place photos safely
app.get("/api/places/search", async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!gmapsKey || gmapsKey === "MY_GOOGLE_MAPS_API_KEY") {
      return res.json({
        hasGooglePlaces: false,
        results: [],
      });
    }

    // Call Google Places TextSearch API
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${gmapsKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const place = data.results[0];
      const photoRef = place.photos?.[0]?.photo_reference;
      
      return res.json({
        hasGooglePlaces: true,
        name: place.name,
        formattedAddress: place.formatted_address,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        location: place.geometry?.location,
        photoUrl: photoRef
          ? `/api/places/photo?photo_reference=${photoRef}&maxwidth=800`
          : null,
      });
    }

    res.json({ hasGooglePlaces: true, results: [] });
  } catch (err: any) {
    console.error("Google Places search proxy error:", err);
    res.status(500).json({ error: "Failed to search places" });
  }
});

app.get("/api/places/photo", async (req, res) => {
  try {
    const photoRef = req.query.photo_reference as string;
    const maxWidth = req.query.maxwidth || "800";
    const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!photoRef || !gmapsKey || gmapsKey === "MY_GOOGLE_MAPS_API_KEY") {
      return res.status(404).send("Photo reference or Google API key missing");
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${gmapsKey}`;
    const photoRes = await fetch(url);

    if (photoRes.ok && photoRes.body) {
      const contentType = photoRes.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      const buffer = await photoRes.arrayBuffer();
      return res.send(Buffer.from(buffer));
    }

    res.status(404).send("Place photo not found");
  } catch (err: any) {
    console.error("Place photo proxy error:", err);
    res.status(500).send("Error fetching place photo");
  }
});

// Gemini AI Chatbot endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, tripContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array" });
    }

    const ai = getGeminiClient();
    const dest = tripContext?.destination || "your destination";
    const lastUserMsg = messages[messages.length - 1]?.content || "";

    // Contextual fallback function
    const generateContextualFallback = () => {
      if (lastUserMsg.toLowerCase().includes("food") || lastUserMsg.toLowerCase().includes("eat") || lastUserMsg.toLowerCase().includes("restaurant")) {
        return `Here are top culinary highlights for **${dest}**:
- **Traditional Breakfast**: Seek out heritage tea spots and morning bakeries serving authentic local specialties.
- **Midday Rest**: Choose airy garden cafes or shaded heritage courtyards to escape peak sun.
- **Evening Dining**: Reserve a table at panoramic rooftop eateries for regional thalis and fresh delicacies.`;
      } else if (lastUserMsg.toLowerCase().includes("3 day") || lastUserMsg.toLowerCase().includes("itinerary") || lastUserMsg.toLowerCase().includes("plan")) {
        return `Here is a serene 3-Day journey for **${dest}**:
- **Day 1 (Historic Core)**: Morning arrival & grand landmark visit (8:30 AM). Midday artisan lanes. Sunset viewpoint with chai.
- **Day 2 (Art & Architecture)**: Morning palace & museum tour. Traditional lunch. Afternoon garden walk and folk craft studios.
- **Day 3 (Nature & Serenity)**: Sunrise scenic overlook. Peaceful temple/monastery visit. Relaxed evening dinner with local music.`;
      } else if (lastUserMsg.toLowerCase().includes("budget") || lastUserMsg.toLowerCase().includes("cost")) {
        return `**Estimated Daily Budget for ${dest}**:
- **Budget**: ₹3,000–₹4,500/day (Clean guesthouses, local cafes, public transit)
- **Comfortable / Balanced**: ₹6,000–₹10,000/day (Boutique stays, dedicated taxis, ticket composite passes)
- **Luxury**: ₹18,000+/day (Premium properties, private guide & chauffeur)`;
      } else if (lastUserMsg.toLowerCase().includes("pack") || lastUserMsg.toLowerCase().includes("safe") || lastUserMsg.toLowerCase().includes("tip")) {
        return `**Essential Tips for ${dest}**:
- **Attire**: Breathable cottons, comfortable walking footwear with good grip, and modest coverings for sacred sites.
- **Timing**: Start early (before 9:30 AM) to experience monuments with tranquil crowds and soft natural light.
- **Hydration**: Always carry a refillable water flask and sun protection.`;
      }
      return `Welcome to **${dest}**! For the smoothest experience, visit major monuments early in the morning, cluster neighboring stops to avoid midday traffic, and leave your late afternoons open for peaceful wandering. Would you like a detailed day-by-day itinerary or food recommendations?`;
    };

    if (!ai) {
      return res.json({ reply: generateContextualFallback(), fallback: true });
    }

    const systemInstruction = `You are "Aura", a peaceful, highly knowledgeable, and friendly AI Travel Assistant on TripTale.
Your objective is to give tourists the easiest, most peaceful, and most practical advice for traveling.
Keep your tone warm, welcoming, concise, well-structured, and realistic.
${tripContext ? `Active Trip Context: Destination = ${tripContext.destination || 'Unspecified'}, Start Location = ${tripContext.startLocation || 'Unspecified'}, Dates = ${tripContext.dates || 'Flexible'}, Travelers = ${tripContext.travelers || 1}, Preferences = ${tripContext.interests?.join(', ') || 'General Sightseeing'}.` : ''}

Rules:
1. Prioritize practical advice, realistic travel times, logical route order, and authentic local food.
2. Structure longer answers with clear bullet points, bold headings, and manageable day-by-day or itemized suggestions.
3. If the user asks for itinerary recommendations, provide a clear, easy-to-follow plan prioritizing nearby attractions together.
4. Avoid fluff and corporate clichés. Speak like an experienced, thoughtful local travel guide.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    try {
      const reply = await generateContentWithFallback(ai, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply, fallback: false });
    } catch (apiErr) {
      console.warn("Gemini API unavailable, providing contextual fallback:", apiErr);
      res.json({
        reply: generateContextualFallback(),
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("Gemini chat route error:", error);
    res.json({
      reply: "Here is a helpful tip: When visiting your destination, visit key monuments early (between 8:30 AM and 11:00 AM) to experience the site in serene morning light and avoid long lines.",
      fallback: true,
    });
  }
});

// Gemini Trip Plan & Itinerary Generation endpoint
app.post("/api/gemini/plan-trip", async (req, res) => {
  try {
    const { destination, startLocation, dates, travelers, interests, budgetTier, transportation } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        fallback: true,
        message: "Gemini API key not configured. Using standard high-accuracy tourist curation.",
      });
    }

    const prompt = `Generate a realistic, peaceful, and logically sequenced tourist itinerary for:
Destination: ${destination}
Starting Point: ${startLocation || 'Not specified'}
Chosen Transportation: ${transportation?.label || 'Direct Route'} (${transportation?.durationText || ''})
Travel Dates/Duration: ${dates || '3 Days'}
Number of Travelers: ${travelers || 2}
Interests/Preferences: ${interests ? interests.join(', ') : 'Must-see Highlights, Local Culture, Peaceful Nature, Authentic Food'}
Budget Preference: ${budgetTier || 'Balanced / Moderate'}

Please provide a JSON output formatted with the following structure:
{
  "destination": "${destination}",
  "tagline": "Short evocative subtitle",
  "overview": "2-3 peaceful sentences summarizing why this journey is rewarding",
  "bestTimeToVisit": "e.g. October to March",
  "recommendedDays": 3,
  "estimatedBudget": {
    "currency": "INR",
    "range": "₹15,000 - ₹30,000 per person",
    "breakdown": {
      "stay": "₹7,000 - ₹14,000",
      "food": "₹4,000 - ₹8,000",
      "transport": "₹2,500 - ₹5,000",
      "activities": "₹1,500 - ₹3,500"
    }
  },
  "topAttractions": [
    {
      "name": "Attraction Name",
      "description": "Short explanation",
      "recommendedDuration": "1.5 - 2 hours",
      "bestTime": "Morning (8:30 AM)",
      "category": "Heritage / Nature / Culture / Food",
      "travelTip": "Buy tickets online to skip the queue"
    }
  ],
  "days": [
    {
      "dayNumber": 1,
      "theme": "Historic Heart & Sunset Views",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "foodSpot": "Recommended authentic eatery or dish",
      "travelNote": "Short transit tip"
    }
  ],
  "localFood": [
    "Dish or restaurant recommendation with brief note"
  ],
  "staySuggestions": [
    { "area": "Neighborhood / District", "whyStayHere": "Peaceful ambience, walkable to cafes" }
  ],
  "practicalTips": [
    "Practical safety, transit, or packing tip"
  ]
}

Ensure the attractions are grouped geographically so tourists do not waste time commuting back and forth across the city.`;

    try {
      const jsonText = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const planData = JSON.parse(jsonText || "{}");
      res.json({ success: true, plan: planData, fallback: false });
    } catch (modelErr) {
      console.warn("Gemini plan-trip model error, using fallback:", modelErr);
      res.json({ success: false, fallback: true });
    }
  } catch (error: any) {
    console.error("Gemini plan-trip error:", error);
    res.json({ success: false, fallback: true, error: error?.message });
  }
});

// Gemini Itinerary Modification endpoint
app.post("/api/gemini/modify-itinerary", async (req, res) => {
  try {
    const { currentPlan, modificationRequest } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(400).json({ error: "Gemini API key not configured" });
    }

    const prompt = `You are modifying an existing tourist itinerary for ${currentPlan.destination}.
User Modification Request: "${modificationRequest}"

Current Plan Summary:
Destination: ${currentPlan.destination}
Duration: ${currentPlan.days?.length || 3} days

Apply the user's modifications thoughtfully while preserving logical route ordering and peaceful travel pacing.
Return the updated plan in the exact same JSON format with updated 'days', 'topAttractions', 'localFood', and 'overview'.`;

    try {
      const jsonText = await generateContentWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const updatedPlan = JSON.parse(jsonText || "{}");
      res.json({ success: true, plan: updatedPlan, fallback: false });
    } catch (modelErr) {
      console.warn("Gemini modify-itinerary model error:", modelErr);
      res.json({ success: false, fallback: true });
    }
  } catch (error: any) {
    console.error("Gemini modify-itinerary error:", error);
    res.status(500).json({ error: error?.message || "Failed to modify itinerary" });
  }
});

// Vite middleware for development & Static server for production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TripTale Tourism Platform server running on http://localhost:${PORT}`);
  });
}

setupViteOrStatic();

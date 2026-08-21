import { SmartPlace } from '../types';

const DB_NAME = 'triptale_smart_gallery_places_db';
const DB_VERSION = 1;
const STORE_NAME = 'places_store';
const LOCAL_STORAGE_KEY = 'triptale_smart_gallery_places_v2';

function readLocalPlaces(): SmartPlace[] {
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!local) return [];
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Load all places
export async function loadSmartPlaces(): Promise<SmartPlace[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const result = request.result as SmartPlace[];
        if (result && Array.isArray(result) && result.length > 0) {
          resolve(result);
        } else {
          // Check localStorage fallback
          resolve(readLocalPlaces());
        }
      };
      request.onerror = () => {
        resolve(readLocalPlaces());
      };
    });
  } catch {
    return readLocalPlaces();
  }
}

// Save all places
export async function saveSmartPlaces(places: SmartPlace[]): Promise<void> {
  // 1. Try saving full dataset to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const place of places) {
      store.put(place);
    }
  } catch (e) {
    console.warn('IndexedDB save failed:', e);
  }

  // 2. Also save to localStorage for instant fallback
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(places));
  } catch {
    // If photos are too large for localStorage string quota, store places with recent thumbnails
    try {
      const lightweight = places.map((p) => ({
        ...p,
        photos: p.photos.slice(0, 6),
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // IndexedDB handles it
    }
  }
}

// Process user-selected photo file with client-side canvas compression
export function processImageFile(file: File): Promise<{ url: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200; // Crisp resolution, compact storage
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            url: result,
            fileName: file.name,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({
          url: compressedUrl,
          fileName: file.name,
        });
      };
      img.onerror = () => {
        resolve({
          url: result,
          fileName: file.name,
        });
      };
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

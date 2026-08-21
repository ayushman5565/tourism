import { GoogleDriveCredentials, GoogleDriveUploadResult } from '../types';

const GOOGLE_DRIVE_CREDENTIALS_KEY = 'triptale_google_drive_credentials';

const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
];

export function hasGoogleDriveApiKey(): boolean {
  const key = (import.meta as any).env?.VITE_GOOGLE_DRIVE_CLIENT_ID;
  return Boolean(key && key !== 'YOUR_GOOGLE_DRIVE_CLIENT_ID');
}

export function getGoogleDriveClientId(): string {
  return (import.meta as any).env?.VITE_GOOGLE_DRIVE_CLIENT_ID || '';
}

export function getGoogleDriveRedirectUri(): string {
  return window.location.origin + '/google-drive-callback';
}

export function saveGoogleDriveCredentials(creds: GoogleDriveCredentials): void {
  try {
    localStorage.setItem(GOOGLE_DRIVE_CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (e) {
    console.warn('Failed to save Google Drive credentials:', e);
  }
}

export function getGoogleDriveCredentials(): GoogleDriveCredentials | null {
  try {
    const raw = localStorage.getItem(GOOGLE_DRIVE_CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleDriveCredentials;
    if (parsed.tokenExpiry && parsed.tokenExpiry < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearGoogleDriveCredentials(): void {
  try {
    localStorage.removeItem(GOOGLE_DRIVE_CREDENTIALS_KEY);
  } catch (e) {
    console.warn('Failed to clear Google Drive credentials:', e);
  }
}

export function isGoogleDriveConnected(): boolean {
  return getGoogleDriveCredentials() !== null;
}

export function buildGoogleDriveAuthUrl(): string {
  const clientId = getGoogleDriveClientId();
  const redirectUri = getGoogleDriveRedirectUri();
  const scope = GOOGLE_DRIVE_SCOPES.join(' ');
  const state = btoa(JSON.stringify({ ts: Date.now() }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: scope,
    include_granted_scopes: 'true',
    state: state,
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function initiateGoogleDriveAuth(): Promise<void> {
  if (!hasGoogleDriveApiKey()) {
    throw new Error('Google Drive Client ID is not configured. Please set VITE_GOOGLE_DRIVE_CLIENT_ID in your environment.');
  }
  const authUrl = buildGoogleDriveAuthUrl();
  window.location.href = authUrl;
}

export function handleGoogleDriveCallback(hash: string): GoogleDriveCredentials | null {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');
    const state = params.get('state');

    if (!accessToken) {
      const error = params.get('error');
      if (error) {
        console.warn('Google Drive auth error:', error);
      }
      return null;
    }

    void state;

    const expiry = expiresIn ? Date.now() + parseInt(expiresIn, 10) * 1000 : undefined;

    const creds: GoogleDriveCredentials = {
      accessToken,
      tokenExpiry: expiry,
      connectedAt: new Date().toISOString(),
    };

    fetchGoogleUserInfo(accessToken).then((info) => {
      if (info.email || info.name) {
        const updated: GoogleDriveCredentials = {
          ...creds,
          userEmail: info.email,
          userName: info.name,
        };
        saveGoogleDriveCredentials(updated);
      }
    }).catch(() => {
      saveGoogleDriveCredentials(creds);
    });

    saveGoogleDriveCredentials(creds);
    return creds;
  } catch (e) {
    console.warn('Failed to parse Google Drive callback:', e);
    return null;
  }
}

async function fetchGoogleUserInfo(accessToken: string): Promise<{ email?: string; name?: string }> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return { email: data.email, name: data.name };
  } catch {
    return {};
  }
}

async function ensureValidToken(): Promise<string> {
  const creds = getGoogleDriveCredentials();
  if (!creds || !creds.accessToken) {
    throw new Error('Google Drive is not connected. Please connect first.');
  }
  return creds.accessToken;
}

async function createTripFolder(accessToken: string, tripName: string, tripId?: string): Promise<string> {
  const folderName = `TripTale - ${tripName}${tripId ? ` (${tripId.slice(0, 8)})` : ''}`;
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const boundary = '-------314159265358979323846';
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    `--${boundary}--\r\n`;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create folder: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.id;
}

export async function uploadToGoogleDrive(
  file: File,
  tripName: string,
  tripId?: string,
  onProgress?: (percent: number) => void,
): Promise<GoogleDriveUploadResult> {
  const accessToken = await ensureValidToken();

  const folderId = await createTripFolder(accessToken, tripName, tripId);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const metadata = {
      name: file.name,
      parents: [folderId],
      mimeType: file.type,
    };

    const boundary = '-------314159265358979323846';
    const dashBoundary = `--${boundary}`;
    const closeBoundary = `--${boundary}--`;
    const metadataPart =
      `${dashBoundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) + '\r\n';
    const filePartHeader =
      `${dashBoundary}\r\n` +
      `Content-Type: ${file.type}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n';

    xhr.open(
      'POST',
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType,webViewLink,webContentLink',
    );
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', `multipart/related; boundary="${boundary}"`);

    if (onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            fileId: data.id,
            webViewLink: data.webViewLink,
            webContentLink: data.webContentLink,
            name: data.name,
            size: parseInt(data.size || '0', 10),
            mimeType: data.mimeType,
          });
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during Google Drive upload'));
    xhr.onabort = () => reject(new Error('Upload aborted'));

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const body = metadataPart + filePartHeader + base64 + '\r\n' + closeBoundary;
        xhr.send(body);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file for upload'));
    reader.readAsDataURL(file);
  });
}

export async function listGoogleDriveTripFolders(): Promise<Array<{ id: string; name: string }>> {
  const accessToken = await ensureValidToken();
  const q = "name contains 'TripTale -' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name)',
    orderBy: 'createdTime desc',
    pageSize: '50',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to list folders: ${res.status}`);
  }

  const data = await res.json();
  return data.files || [];
}

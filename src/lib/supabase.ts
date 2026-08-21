import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('example.com')
);

/** Exposed so the UI never silently uses the development-only mock client. */
export const isSupabaseConfigured = isConfigured;

// Fallback client for development when Supabase is not configured. Trip rows
// intentionally remain in memory so trip data is never persisted in browser storage.
function createMockSupabaseClient(): SupabaseClient {
  const LOCAL_USER_KEY = 'triptale_mock_auth_user';
  const listeners: Array<(event: string, session: any) => void> = [];
  const mockTables = new Map<string, any[]>();

  const getStoredUser = () => {
    try {
      const data = localStorage.getItem(LOCAL_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  const setStoredUser = (user: any) => {
    try {
      if (user) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    } catch (e) {
      console.warn('Mock auth localStorage save failed:', e);
    }
  };

  const mockClient = {
    auth: {
      async getSession() {
        const user = getStoredUser();
        return { data: { session: user ? { user, access_token: 'mock-token' } : null }, error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        listeners.push(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = listeners.indexOf(callback);
                if (idx >= 0) listeners.splice(idx, 1);
              },
            },
          },
        };
      },
      async signUp({ email, options }: any) {
        const name = options?.data?.display_name || email.split('@')[0];
        const user = {
          id: `user-${Date.now()}`,
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { display_name: name, full_name: name },
        };
        setStoredUser(user);
        listeners.forEach((l) => l('SIGNED_IN', { user, access_token: 'mock-token' }));
        return { data: { user, session: { user, access_token: 'mock-token' } }, error: null };
      },
      async signInWithPassword({ email }: any) {
        const existing = getStoredUser();
        const user = existing?.email === email ? existing : {
          id: `user-${Date.now()}`,
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { display_name: email.split('@')[0] },
        };
        setStoredUser(user);
        listeners.forEach((l) => l('SIGNED_IN', { user, access_token: 'mock-token' }));
        return { data: { user, session: { user, access_token: 'mock-token' } }, error: null };
      },
      async signInWithOAuth() {
        const user = {
          id: `google-user-${Date.now()}`,
          email: 'traveler@gmail.com',
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { display_name: 'Explorer Traveler', avatar_url: '' },
        };
        setStoredUser(user);
        listeners.forEach((l) => l('SIGNED_IN', { user, access_token: 'mock-token' }));
        return { data: { provider: 'google', url: '' }, error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
      async resend() {
        return { data: {}, error: null };
      },
      async getUser() {
        const user = getStoredUser();
        return { data: { user }, error: null };
      },
      async signOut() {
        setStoredUser(null);
        listeners.forEach((l) => l('SIGNED_OUT', null));
        return { error: null };
      },
    },
    from(tableName: string) {
      const getTableData = (): any[] => mockTables.get(tableName) || [];
      const setTableData = (data: any[]) => mockTables.set(tableName, data);

      return {
        async upsert(record: any) {
          const rows = getTableData();
          const idx = rows.findIndex((r) => r.id === record.id);
          if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...record, updated_at: new Date().toISOString() };
          } else {
            rows.unshift({ ...record, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
          }
          setTableData(rows);
          return { data: record, error: null };
        },
        delete() {
          return {
            async eq(field: string, value: any) {
              const rows = getTableData().filter((r) => r[field] !== value);
              setTableData(rows);
              return { data: null, error: null };
            },
          };
        },
        select() {
          return {
            eq(field: string, value: any) {
              return {
                async order() {
                  const rows = getTableData().filter((r) => r[field] === value);
                  return { data: rows, error: null };
                },
              };
            },
          };
        },
      };
    },
  };

  return mockClient as unknown as SupabaseClient;
}

let supabaseInstance: SupabaseClient;

if (isConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client, using fallback mock:', err);
    supabaseInstance = createMockSupabaseClient();
  }
} else {
  supabaseInstance = createMockSupabaseClient();
}

/** Browser client with safe fallback */
export const supabase = supabaseInstance;


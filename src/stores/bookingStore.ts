import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Check if window is defined (client-side) or not (server-side)
const isServer = typeof window === 'undefined';

export type BookingState = {
  name?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  barberId?: string;
  clientExists?: boolean;
  missingFields?: string[];
  status: 'initial' | 'pending_confirmation' | 'confirmed' | 'completed';
};

type SessionBookings = {
  [sessionId: string]: BookingState;
};

interface BookingStore {
  // State
  sessions: SessionBookings;
  
  // Actions
  initializeSession: (sessionId: string) => void;
  updateBookingState: (sessionId: string, update: Partial<BookingState>) => void;
  getBookingState: (sessionId: string) => BookingState | undefined;
  clearSession: (sessionId: string) => void;
  clearAllSessions: () => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      sessions: {},

      initializeSession: (sessionId: string) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              status: 'initial'
            }
          }
        }));
      },

      updateBookingState: (sessionId: string, update: Partial<BookingState>) => {
        set((state) => {
          const currentSession = state.sessions[sessionId] || { status: 'initial' };
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...currentSession,
                ...update
              }
            }
          };
        });
      },

      getBookingState: (sessionId: string) => {
        return get().sessions[sessionId];
      },

      clearSession: (sessionId: string) => {
        set((state) => {
          const { [sessionId]: _, ...rest } = state.sessions;
          return { sessions: rest };
        });
      },

      clearAllSessions: () => {
        set({ sessions: {} });
      }
    }),
    {
      name: 'booking-store',
      // Skip hydration to avoid hydration mismatch errors
      skipHydration: true,
      // Use custom storage that checks for localStorage availability
      storage: createJSONStorage(() => {
        // Use a no-op storage when running on the server
        if (isServer) {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          };
        }
        return localStorage;
      })
    }
  )
);

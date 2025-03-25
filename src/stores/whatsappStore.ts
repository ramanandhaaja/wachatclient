import { create } from 'zustand';

export interface WhatsAppStatus {
  status: string;
  reportedStatus?: string;
  qrCode: string | null;
  clientInfo?: any;
  clientState?: string;
  canSendMessage?: boolean;
  needsReconnect?: boolean;
  detailed?: string;
  isInitialized?: boolean;
  hasClient?: boolean;
  timestamp?: string;
}

interface WhatsAppStore {
  status: WhatsAppStatus | null;
  isInitializing: boolean;
  error: string | null;
  
  // Actions
  setStatus: (status: WhatsAppStatus) => void;
  setIsInitializing: (isInitializing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Derived state
  isConnected: () => boolean;
  isReady: () => boolean;
  needsReconnect: () => boolean;
}

export const useWhatsAppStore = create<WhatsAppStore>((set, get) => ({
  status: null,
  isInitializing: false,
  error: null,
  
  setStatus: (status) => set({ status }),
  setIsInitializing: (isInitializing) => set({ isInitializing }),
  setError: (error) => set({ error }),
  
  isConnected: () => {
    const { status } = get();
    return status?.status === 'connected';
  },
  
  isReady: () => {
    const { status } = get();
    return status?.status === 'connected' && status?.canSendMessage === true;
  },
  
  needsReconnect: () => {
    const { status } = get();
    // Check if the API explicitly tells us we need to reconnect
    if (status?.needsReconnect === true) {
      return true;
    }
    // If status says connected but we can't send messages, we need to reconnect
    return status?.status === 'connected' && status?.canSendMessage !== true;
  }
}));

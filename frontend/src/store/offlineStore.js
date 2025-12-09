import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOfflineStore = create(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      pendingActions: [],
      
      // Set online status
      setOnlineStatus: (status) => set({ isOnline: status }),
      
      // Add an action to pending queue
      addPendingAction: (action) => set((state) => ({
        pendingActions: [...state.pendingActions, {
          ...action,
          id: Date.now(),
          timestamp: new Date().toISOString()
        }]
      })),
      
      // Remove a pending action
      removePendingAction: (actionId) => set((state) => ({
        pendingActions: state.pendingActions.filter(a => a.id !== actionId)
      })),
      
      // Clear all pending actions
      clearPendingActions: () => set({ pendingActions: [] }),
      
      // Get pending actions count
      getPendingCount: () => get().pendingActions.length,
      
      // Process all pending actions
      processPendingActions: async (apiHandlers) => {
        const { pendingActions, removePendingAction } = get();
        
        for (const action of pendingActions) {
          try {
            const handler = apiHandlers[action.type];
            if (handler) {
              await handler(action.payload);
              removePendingAction(action.id);
            }
          } catch (error) {
            console.error('Failed to sync action:', action, error);
            // Keep the action in queue if it fails
          }
        }
      }
    }),
    {
      name: 'flowboard-offline',
      partialize: (state) => ({ pendingActions: state.pendingActions })
    }
  )
);

// Initialize online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnlineStatus(false);
  });
}

export default useOfflineStore;

// Action types for offline operations
export const OfflineActionTypes = {
  CREATE_CARD: 'CREATE_CARD',
  UPDATE_CARD: 'UPDATE_CARD',
  DELETE_CARD: 'DELETE_CARD',
  MOVE_CARD: 'MOVE_CARD',
  CREATE_LIST: 'CREATE_LIST',
  UPDATE_LIST: 'UPDATE_LIST',
  DELETE_LIST: 'DELETE_LIST'
};


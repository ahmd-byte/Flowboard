import { create } from 'zustand';

const MAX_HISTORY = 50;

const useHistoryStore = create((set, get) => ({
  past: [],
  future: [],
  
  // Add a new action to history
  pushAction: (action) => set((state) => ({
    past: [...state.past.slice(-MAX_HISTORY + 1), action],
    future: [] // Clear future when new action is performed
  })),

  // Undo the last action
  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return null;
    
    const lastAction = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [lastAction, ...future]
    });
    
    return lastAction;
  },

  // Redo the last undone action
  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return null;
    
    const nextAction = future[0];
    set({
      past: [...past, nextAction],
      future: future.slice(1)
    });
    
    return nextAction;
  },

  // Check if undo is available
  canUndo: () => get().past.length > 0,
  
  // Check if redo is available
  canRedo: () => get().future.length > 0,

  // Clear all history
  clearHistory: () => set({ past: [], future: [] })
}));

export default useHistoryStore;

// Action types for reference
export const ActionTypes = {
  CARD_CREATE: 'CARD_CREATE',
  CARD_DELETE: 'CARD_DELETE',
  CARD_UPDATE: 'CARD_UPDATE',
  CARD_MOVE: 'CARD_MOVE',
  LIST_CREATE: 'LIST_CREATE',
  LIST_DELETE: 'LIST_DELETE',
  LIST_UPDATE: 'LIST_UPDATE',
  LIST_MOVE: 'LIST_MOVE'
};


import { create } from 'zustand';

const useBoardStore = create((set) => ({
  board: null,
  lists: {}, // { listId: { id, title, cardIds: [] } }
  cards: {}, // { cardId: { id, title, ... } }
  listOrder: [], // [listId, listId, ...]

  setBoardData: (data) => set({
    board: data.board,
    lists: data.lists,
    cards: data.cards,
    listOrder: data.listOrder,
  }),

  // Optimistic update for list reordering
  moveList: (sourceIndex, destinationIndex) => set((state) => {
    const newOrder = Array.from(state.listOrder);
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, removed);
    return { listOrder: newOrder };
  }),

  // Optimistic update for card reordering
  moveCard: (sourceListId, destListId, sourceIndex, destIndex, cardId) => set((state) => {
    const newLists = { ...state.lists };
    const sourceList = newLists[sourceListId];
    const destList = newLists[destListId];

    // Remove from source
    const newSourceCardIds = Array.from(sourceList.cardIds);
    newSourceCardIds.splice(sourceIndex, 1);
    newLists[sourceListId] = { ...sourceList, cardIds: newSourceCardIds };

    // Add to destination
    const newDestCardIds = sourceListId === destListId ? newSourceCardIds : Array.from(destList.cardIds);
    
    // If same list, we already modified the array, so use that. 
    // If different list, we modified source, now modify dest.
    if (sourceListId === destListId) {
       newDestCardIds.splice(destIndex, 0, cardId);
       newLists[sourceListId] = { ...sourceList, cardIds: newDestCardIds };
    } else {
       newDestCardIds.splice(destIndex, 0, cardId);
       newLists[destListId] = { ...destList, cardIds: newDestCardIds };
    }

    return { lists: newLists };
  }),
  
  addList: (list) => set((state) => ({
    lists: { ...state.lists, [list.id]: { ...list, cardIds: [] } },
    listOrder: [...state.listOrder, list.id],
  })),

  removeList: (listId) => set((state) => {
    const newLists = { ...state.lists };
    const newCards = { ...state.cards };
    const list = newLists[listId];
    
    // Remove cards belonging to this list
    if (list && list.cardIds) {
      list.cardIds.forEach(cardId => {
        delete newCards[cardId];
      });
    }
    
    delete newLists[listId];
    
    return {
      lists: newLists,
      cards: newCards,
      listOrder: state.listOrder.filter(id => id !== listId),
    };
  }),

  addCard: (listId, card) => set((state) => {
    const list = state.lists[listId];
    if (!list) return state;
    
    return {
      cards: { ...state.cards, [card.id]: card },
      lists: {
        ...state.lists,
        [listId]: {
          ...list,
          cardIds: [...(list.cardIds || []), card.id]
        }
      }
    };
  }),

  removeCard: (listId, cardId) => set((state) => {
    const list = state.lists[listId];
    if (!list) return state;
    
    const newCards = { ...state.cards };
    delete newCards[cardId];
    
    return {
      cards: newCards,
      lists: {
        ...state.lists,
        [listId]: {
          ...list,
          cardIds: (list.cardIds || []).filter(id => id !== cardId)
        }
      }
    };
  }),

  updateCard: (cardId, updates) => set((state) => ({
    cards: { 
      ...state.cards, 
      [cardId]: { ...state.cards[cardId], ...updates } 
    }
  })),
}));

export default useBoardStore;


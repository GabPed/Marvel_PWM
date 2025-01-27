import { createSlice } from '@reduxjs/toolkit';
import { addAvailableCards } from './availableSlice';

const initialState = {
  cards: [],
  currentPage: 0,
  totalCards: 1,
  search: ''
};

const tradedSlice = createSlice({
  name: 'traded',
  initialState,
  reducers: {
    addTradedCards: (state, action) => {
        const { cards, currentPage, totalCards } = action.payload;

        // Crea un insieme di ID delle carte già esistenti
        const existingCardIds = new Set(state.cards.map(card => card._id));
  
        // Filtra le nuove carte, mantenendo solo quelle che non sono già nel frontend
        const uniqueNewCards = cards.filter(card => !existingCardIds.has(card._id));
  
        // Aggiungi le nuove carte in coda alle carte esistenti
        state.cards = [...state.cards, ...uniqueNewCards];
        state.currentPage = currentPage; 
        state.totalCards = totalCards;
    },
    addTradedSearch: (state, action) => {
      state.search = action.payload.search;
    },
    resetTraded: (state) => {
      state.cards = [];
      state.currentPage = 0;
      state.totalCards = 1;
    },
    removeCardTraded: (state, action) => {
        state.cards = state.cards.filter(card => card._id !== action.payload._id);
        if (state.totalCards > 0) {
            state.totalCards--;
        }
    },
  },
});

export const { addTradedCards, addTradedSearch, resetTraded, removeCardTraded} = tradedSlice.actions;
export default tradedSlice.reducer;

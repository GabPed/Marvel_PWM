import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cards: [],
  currentPage: 0,
  totalCards: 1, //Impostato a 1, verrà sovrascritto alla prima chiamata
  search: ''
};

const albumSlice = createSlice({
  name: 'album',
  initialState,
  reducers: {
    addAlbumCards: (state, action) => {
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
    addAlbumSearch: (state, action) => {
      state.search = action.payload.search;
    },
    resetAlbum: (state) => {
      state.cards = [];
      state.currentPage = 0;
      state.totalCards = 1;
    }
  },
});

export const { addAlbumCards, resetAlbum, addAlbumSearch } = albumSlice.actions;
export default albumSlice.reducer;
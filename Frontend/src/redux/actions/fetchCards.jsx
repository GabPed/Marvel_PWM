import { apiRequest } from '../../auth/ApiRequest';
import config from '../../config';
import { addAlbumCards, resetAlbum } from '../slices/albumSlice';
import { addAvailableCards, resetAvailable } from '../slices/availableSlice';
import { addTradedCards, resetTraded } from '../slices/tradedSlice';

export const fetchCards = (state, page = 1, search, navigate) => async (dispatch) => {
  
  try {
    var request = `${import.meta.env.VITE_SERVER_URL}/albums/state/${state}?page=${page}`;
    if (search && search.trim() !== '') {
      request += `&search=${search}`;
    }

    // Aggiungi i parametri state e page alla richiesta
    const response = await apiRequest(request, {
      method: 'GET',
    }, navigate); // Passa navigate come argomento

    if (response.ok) {
      const data = await response.json();

      const { album, currentPage, totalCards } = data; // Ottieni i dati dalla risposta

      // Dispatch dei dati nel Redux store in base allo stato
      if (state === 'D') {
        await dispatch(addAlbumCards({
          cards: album,
          currentPage,
          totalCards,
        }));
      } else if (state === 'S') {
        await dispatch(addAvailableCards({
          cards: album,
          currentPage,
          totalCards,
        }));
      } else if (state === 'B') {
        await dispatch(addTradedCards({
          cards: album,
          currentPage,
          totalCards,
        }));
      }
    }
  } catch (error) {
    console.error('Errore nel caricamento delle carte:', error);
  }
};



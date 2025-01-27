import mongoose from "mongoose";
import { Character } from "../models/characters.js";
import { User } from "../models/users.js";
import { getCharacter } from "./characters.js";
import { getUserInfo } from "./users.js";

const costoPacchetto = 1 //Da mettere in ENV o DB
const creditiFigurina = 0.20 

export const getAlbum = async (req, res) => {
    const { id } = req.user;
    
    try {
        const user = await User.findById(id).lean();

        if (!user) {
            return res.status(404).json({ message: 'Utente non presente' });
        }

        let album = user.album;
        
        res.status(200).json({ album: await composeAlbum(album) }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAlbumByState = async (req, res) => {
    const { id } = req.user; // ID dell'utente dal token
    const { state } = req.params || {}; // Stato delle carte (D, S, B)
    const { page = 1, limit = 18, skip = 0, search } = req.query; // Parametri di paginazione (default: pagina 1, 20 carte per pagina)

    try {
        // Trova l'utente per ID
        const user = await User.findById(id).lean();

        if (!user) {
            return res.status(404).json({ message: 'Utente non presente' });
        }
        
        // Filtro per lo stato delle carte nel campo 'album'
        let album = user.album
            .filter(card => card.stato === state)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        album = await composeAlbum(album)

        // Aggiungi il filtro per la ricerca se 'search' è valorizzata
        if (search) {
            const searchLower = search.toLowerCase(); // Converte il termine di ricerca in minuscolo per un confronto case-insensitive
            album = album.filter(card => 
                card.hero.toLowerCase().includes(searchLower) // Filtra le carte in base al nome che include il termine di ricerca
            );
        }

        // Implementazione della paginazione
        const totalCards = album.length; // Numero totale di carte che soddisfano il filtro
        const startIndex = (page - 1) * limit + skip; // Indice di inizio per la pagina corrente
        const endIndex = page * limit + skip; // Indice di fine per la pagina corrente

        const paginatedAlbum = album.slice(startIndex, endIndex); // Estrae solo le carte della pagina richiesta

        // Risponde con le carte paginati e il numero totale di carte
        res.status(200).json({
            totalCards,
            currentPage: Number(page),
            totalPages: Math.ceil(totalCards / limit),
            album: paginatedAlbum
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};



export const getAlbumByUsername = async (req,res) => {
    const { username } = req.params || {};
    const { page = 1, limit = 18, skip = 0, search } = req.query;
    try {
        const user = await User.findOne({ username },
            { album: {
                $filter: {
                    input: '$album',
                    as: 'card',
                    cond: { $eq: ['$$card.stato', 'B'] } // Filtra figurine con stato diverso da 'O'
                }
              }
            }).lean(); 
        if (!user) return res.status(404).json({ message: 'User not found' });
        let album = await composeAlbum(user.album)

        // Aggiungi il filtro per la ricerca se 'search' è valorizzata
        if (search) {
            const searchLower = search.toLowerCase(); // Converte il termine di ricerca in minuscolo per un confronto case-insensitive
            album = album.filter(card => 
                card.hero.toLowerCase().includes(searchLower) // Filtra le carte in base al nome che include il termine di ricerca
            );
        }

        // Implementazione della paginazione
        const totalCards = album.length; // Numero totale di carte che soddisfano il filtro
        const startIndex = (page - 1) * limit + skip; // Indice di inizio per la pagina corrente
        const endIndex = page * limit + skip; // Indice di fine per la pagina corrente

        const paginatedAlbum = album.slice(startIndex, endIndex); // Estrae solo le carte della pagina richiesta

        // Risponde con le carte paginati e il numero totale di carte
        res.status(200).json({
            totalCards,
            currentPage: Number(page),
            totalPages: Math.ceil(totalCards / limit),
            album: paginatedAlbum
        });
    } catch (error) {
       
        res.status(500).json({ message: error.message });
    }
}

export const getListedCards = async (req, res) => {
  const { id } = req.user; 
  const { page = 1, limit = 18, search } = req.query; // Aggiunto 'search' come parametro della query
  const pageNumber = parseInt(page, 10); // Conversione in numero intero
  const limitNumber = parseInt(limit, 10); // Conversione in numero intero

  try {
    // Query per ottenere tutte le figurine con stato "B" escludendo l'utente attuale
    let album = await User.aggregate([
      // Filtro per escludere l'utente attuale
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(id) }, // Assicurati che 'id' sia convertito in ObjectId
        },
      },
      // Disaccoppia gli elementi dell'array "album"
      { $unwind: "$album" },
      
      // Filtro per trovare solo le figurine con stato "B"
      {
        $match: {
          "album.stato": "B",
        },
      },
      
      // Ordina le figurine per la modifica più recente
      { $sort: { "album.updatedAt": -1 } },
          
      // Proietta solo i campi necessari
      {
        $project: {
          user_id: "$_id", // Proietta l'ID dell'utente
          id_figurina: "$album.id_figurina", // Proietta l'ID della figurina
          stato: "$album.stato", // Proietta lo stato della figurina
          _id: "$album._id", // Proietta l'ID dell'oggetto della figurina
          updatedAt: "$album.updatedAt", // Proietta la data di aggiornamento
        },
      },
    ]);

    album = await composeAlbum(album)

    // Gestione della ricerca, se fornita
    if (search) {
      const searchLower = search.toLowerCase(); // Converte il termine di ricerca in minuscolo
      album = album.filter(card => 
        card.hero.toLowerCase().includes(searchLower) // Assicurati di filtrare per il campo corretto
      );
    }

    // Implementazione della paginazione
    const totalCards = album.length; // Numero totale di carte che soddisfano il filtro
    const startIndex = (pageNumber - 1) * limitNumber; // Indice di inizio per la pagina corrente
    const endIndex = startIndex + limitNumber; // Indice di fine per la pagina corrente

    const paginatedAlbum = album.slice(startIndex, endIndex); // Estrae solo le carte della pagina richiesta

    res.status(200).json({ 
      totalPages: Math.ceil(totalCards / limitNumber),
      album: await enrichAlbumWithUserInfo(paginatedAlbum) // Usa il risultato paginato qui
    });

  } catch (err) {
    console.error("Errore nell'ottenimento delle figurine:", err);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const buyStickerPacks = async (req,res) => {
    const { id } = req.user

    try {
        const user = await User.findById(id)
        if(!user) return res.status(404).json({message: 'Utente non presente'}); 

        if(user.crediti - costoPacchetto < 0) return res.status(402).json({message: 'Saldo insufficiente'});
        user.crediti = user.crediti - costoPacchetto; 

        // Estrai nuove figurine
        const newCards = await getRandomCharacters();
        let cardCheck = [];

        // Ottieni gli id delle figurine già presenti nell'album dell'utente
        const existingCardIds = user.album.map(card => String(card.id_figurina));
        
        for (let i = 0; i < newCards.length; i++) {
            
            const currentIdFigurina = String(newCards[i].id_figurina); 
            
            // Crea una copia profonda dell'oggetto per evitare modifiche non intenzionali
            const cardCopy = { ...newCards[i] };

            // Controlla se la figurina è già nel pacchetto corrente
            if (cardCheck.includes(currentIdFigurina)) cardCopy.stato = 'S'; // Se è un duplicato nel pacchetto, imposta lo stato a 'S'
            else cardCheck.push(currentIdFigurina); 
            
            // Controlla se la figurina è già nell'album dell'utente
            if (existingCardIds.includes(currentIdFigurina)) cardCopy.stato = 'S'; // Se è già nell'album, imposta lo stato a 'S'
            
            // Sostituisci l'oggetto originale con la sua copia eventualmente modificata
            newCards[i] = cardCopy;
        }
 
        // Aggiungi le nuove figurine all'album dell'utente
        user.album.push(...newCards);

        // Salva l'utente aggiornato
        await user.save();
        
        const nuoveFigurineAggiunte = user.album.slice(-newCards.length).map(card => card.toObject());
        
        res.status(200).json({cards: await composeAlbum(nuoveFigurineAggiunte)})

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const listCard = async (req, res) => {
    const { id } = req.user
    const { _id: idCard} = req.body || {}
    if(!idCard || !mongoose.Types.ObjectId.isValid(idCard)) return res.status(400).json({ message: 'Card ID not valid' });  

    try {
        // Trova l'utente tramite il suo ID
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Trova la figurina specifica tramite _id
        const figurina = user.album.id(idCard);
        if (!figurina) return res.status(404).json({ message: 'Figurina non trovata' });
        if (figurina.stato !== 'S') return res.status(404).json({ message: 'Figurina non scambiabile' });

        figurina.stato = 'B';
        await user.save();
        return res.status(200).json({ message: 'Stato della figurina aggiornato con successo'});
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della figurina:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const sellCard = async (req, res) => {
    const { id } = req.user
    const { _id: idCard} = req.body || {}

    if(!idCard || !mongoose.Types.ObjectId.isValid(idCard)) return res.status(400).json({ message: 'Card ID not valid' });  
 
    try {
        // Trova l'utente tramite il suo ID
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Trova la figurina specifica tramite _id
        const figurina = user.album.id(idCard);
        if (!figurina) return res.status(404).json({ message: 'Figurina non trovata' });
        if (figurina.stato !== 'S') return res.status(404).json({ message: 'Figurina non vendibile' });

        // Rimozione della figurina e aggiunta dei crediti
        user.album.pull({ _id: idCard });
        user.crediti = user.crediti + creditiFigurina

        // Salva l'utente e ritorna i crediti aggiornati
        await user.save();
        return res.status(200).json({ message: 'Figurina venduta con successo', crediti: user.crediti });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della figurina:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

export const unlistCard = async (req, res) => {
    const { id } = req.user
    const { _id: idCard} = req.body || {}
    if(!idCard || !mongoose.Types.ObjectId.isValid(idCard)) return res.status(400).json({ message: 'Card ID not valid' });  

    try {
        // Trova l'utente tramite il suo ID
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Trova la figurina specifica tramite _id
        const figurina = user.album.id(idCard);
        if (!figurina) return res.status(404).json({ message: 'Figurina non trovata' });
        if (figurina.stato !== 'B') return res.status(404).json({ message: 'Card not unlistable' });

        figurina.stato = 'S';
        
        await user.save();
        return res.status(200).json({ message: 'Stato della figurina aggiornato con successo'});
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della figurina:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}
//Elenco funzioni interne

// Aggiunge le informazioni aggiuntive per ogni figurina
export const composeAlbum = async (album) => {

    const albumComplete = await Promise.all(
        album.map(async (card) => {
            const characterData = await getCharacter(card.id_figurina); // Ottieni hero e image
            
            return { ...card, ...characterData }; // Aggiungi hero e image alla figurina
        })
    );
    return albumComplete
}

const enrichAlbumWithUserInfo = async (album) => {
    const albumWithUserInfo = await Promise.all(
        album.map(async (card) => {
            const userInfo = await getUserInfo(card.user_id); 
            return { ...card, userInfo }; 
        })
    );

    return albumWithUserInfo; // Ritorna il nuovo array arricchito
};

// Funzione per ottenere 5 caratteri casuali
const getRandomCharacters = async () => {
    try {
        // Ottieni un totale di 5 documenti casuali (anche duplicati)
        const randomCharacters = await Character.aggregate([
            { $sample: { size: 5 } }, // Estrai 5 documenti casuali
            { $addFields: { stato: 'D' } }, 
            { $project: { _id: 0, id_figurina: '$id', stato: 1 } } 
        ]);

        return randomCharacters;
    } catch (error) {
        console.error('Errore durante l\'estrazione dei caratteri casuali:', error);
        throw error;
    }
};
import mongoose from "mongoose";
import { Offer } from "../models/offers.js";
import { User } from "../models/users.js";
import { composeAlbum } from "./albums.js";
import { getUserInfo } from "./users.js";

export const getCardsToOffer = async (req, res) => {
    const { id } = req.user;
    const { idOfferente } = req.params;
    const { page = 1, limit = 18, search} = req.query;

    // Verifica se gli ID sono validi per Mongoose
    if (!mongoose.Types.ObjectId.isValid(idOfferente)) return res.status(400).json({ message: 'Id non conforme' });
    if(id == idOfferente) return res.status(400).json({ message: 'Id non conforme' });
    try {
        // Trova l'utente offerente
        const offUser = await User.findById(idOfferente);
        if (!offUser) return res.status(404).json({ message: "Utente offerente non trovato" });

        // Trova l'utente acquirente
        const acqUser = await User.findById(id).lean();
        if (!acqUser) return res.status(404).json({ message: 'Utente acquirente non trovato' });

        // Estrai le figurine con stato 'S' dall'album dell'acquirente
        const acquirenteFigurineS = acqUser.album.filter(figurina => figurina.stato === 'S');

        // Filtra le figurine dell'acquirente che non sono nell'album dell'offerente
        var figurineDaOffrire = acquirenteFigurineS.filter(figurinaAcq => {
            return !offUser.album.some(figurinaOff => figurinaOff.id_figurina === figurinaAcq.id_figurina);
        });

        figurineDaOffrire = await composeAlbum(figurineDaOffrire)

        if (search) {
            const searchLower = search.toLowerCase(); // Converte il termine di ricerca in minuscolo per un confronto case-insensitive
            figurineDaOffrire = figurineDaOffrire.filter(card => 
                card.hero.toLowerCase().includes(searchLower) // Filtra le carte in base al nome che include il termine di ricerca
            );
        }
        const totalFigurine = figurineDaOffrire.length; // Numero totale di carte che soddisfano il filtro
        const startIndex = (page - 1) * limit; // Indice di inizio per la pagina corrente
        const endIndex = page * limit; // Indice di fine per la pagina corrente

        const figurine = figurineDaOffrire.slice(startIndex, endIndex); // Estrae solo le carte della pagina richiesta

        // Rispondi con le offerte arricchite
        res.status(200).json({
            totalPages: Math.ceil(totalFigurine / limit),
            album: figurine
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCardsToSelect = async (req, res) => {
    const { id } = req.user;
    const { idOfferente } = req.params;
    const { page = 1, limit = 18, search} = req.query;
    // Verifica se gli ID sono validi per Mongoose
    if (!mongoose.Types.ObjectId.isValid(idOfferente)) return res.status(400).json({ message: 'Id non conforme' });
    if(id == idOfferente) return res.status(400).json({ message: 'Id non conforme' });
    try {
        // Trova l'utente offerente
        const offUser = await User.findById(idOfferente).lean();
        if (!offUser) return res.status(404).json({ message: "Utente offerente non trovato" });

        // Trova l'utente acquirente
        const acqUser = await User.findById(id);
        if (!acqUser) return res.status(404).json({ message: 'Utente acquirente non trovato' });

        // Estrai le figurine con stato 'B' dall'album dell'acquirente
        const offerenteFigurineB = offUser.album.filter(figurina => figurina.stato === 'B');

        // Filtra le figurine dell'acquirente che non sono nell'album dell'offerente
        var figurineSelezionabili = offerenteFigurineB.filter(figurinaOff => {
            return !acqUser.album.some(figurinaAcq => figurinaAcq.id_figurina === figurinaOff.id_figurina);
        });

        figurineSelezionabili = await composeAlbum(figurineSelezionabili)

        if (search) {
            const searchLower = search.toLowerCase(); // Converte il termine di ricerca in minuscolo per un confronto case-insensitive
            figurineSelezionabili = figurineSelezionabili.filter(card => 
                card.hero.toLowerCase().includes(searchLower) // Filtra le carte in base al nome che include il termine di ricerca
            );
        }
        
        const totalFigurine = figurineSelezionabili.length; // Numero totale di carte che soddisfano il filtro
        const startIndex = (page - 1) * limit; // Indice di inizio per la pagina corrente
        const endIndex = page * limit; // Indice di fine per la pagina corrente

        const figurine = figurineSelezionabili.slice(startIndex, endIndex); // Estrae solo le carte della pagina richiesta

        // Rispondi con le offerte arricchite
        res.status(200).json({
            totalPages: Math.ceil(totalFigurine / limit),
            album: await composeAlbum(figurine)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addOffers = async (req,res) => {
    const { id } = req.user //Id di chi propone l'offerta
    const { idFigurineOfferente, idOfferente, idFigurineAcquirente } = req.body || {} //Id univoca della figurina presente in baratto

    // Verifica se gli ID sono di tipo conforme a mongoose
    if(!mongoose.Types.ObjectId.isValid(idOfferente)) return res.status(404).json({message: 'Id non conforme'});

    // Verifica se idFigurineOfferente e idFigurineAcquirente sono degli array 
    if (!Array.isArray(idFigurineOfferente))  return res.status(400).json({message: "Il formato passato non è corretto"});
    if (!Array.isArray(idFigurineAcquirente))  return res.status(400).json({message: "Il formato passato non è corretto"});
    if(idFigurineOfferente.length === 0) return res.status(400).json({message: "Nessuna figurina offerente presente"});
    if(idFigurineAcquirente.length === 0) return res.status(400).json({message: "Nessuna figurina acquirente presente"});
    try {

        const offUser = await User.findById(idOfferente);
        if(!offUser) return res.status(404).json({message: "Utente offerente non trovato"});

        const acqUser = await User.findById(id);
        if (!acqUser) return res.status(404).json({ message: 'Utente acquirente non trovato' });

        var elencoFigurineOfferente = [];
        for(let i=0; i<idFigurineOfferente.length; i++) {
            if(!idFigurineOfferente[i]) return res.status(404).json({ message: 'Id figurina non presente' }); 
           
            const figurina = offUser.album.id(idFigurineOfferente[i]);
            //Verifica se le figurine sono presentI nell'album dell'acquirente
            if (!figurina) return res.status(404).json({ message: "Figurina "+idFigurineOfferente[i]+" non presente nell'album dell'offerente" });

            //Verifica se le figurine dell'offerente ha stato S
            if (figurina.stato != 'B') return res.status(400).json({ message: 'Figurina '+idFigurineOfferente[i]+' non scambiabile' });

            //Verifica se le figurine passate sono uguali
            if (elencoFigurineOfferente.some(fig => fig.id_figurina === figurina.id_figurina)) {
                return res.status(400).json({ message: 'La figurina con ID: ' + figurina.id_figurina + ' è presente più volte' });
            }

            // Verifica se la figurina è già presente nell'album dell'offerente
            if(acqUser.album.find(fig => fig.id_figurina === figurina.id_figurina)) return res.status(400).json({ message: "Figurina "+figurina.id_figurina+" già presente nell'album di "+acqUser.username});
            
            elencoFigurineOfferente.push({id: idFigurineOfferente[i], id_figurina: figurina.id_figurina});
      
        }
        
        var elencoFigurineAcquirente = [];
        for(let i=0; i<idFigurineAcquirente.length; i++) {
            if(!idFigurineAcquirente[i]) return res.status(404).json({ message: 'Id figurina non presente' }); 

            const figurina = acqUser.album.id(idFigurineAcquirente[i]);
            //Verifica se le figurine sono presentI nell'album dell'acquirente
            if (!figurina) return res.status(404).json({ message: "Figurina "+idFigurineAcquirente[i]+" non presente nell'album dell'acquirente" });

            //Verifica se le figurine dell'acquirente hanno stato S
            if (figurina.stato != 'S') return res.status(400).json({ message: 'Figurina '+idFigurineAcquirente[i]+' non scambiabile' });

            //Verifica se le figurine passate sono uguali
            if (elencoFigurineAcquirente.some(fig => fig.id_figurina === figurina.id_figurina)) {
                return res.status(400).json({ message: 'La figurina con ID: ' + figurina.id_figurina + ' è presente più volte' });
            }
            // Verifica se la figurina è già presente nell'album dell'offerente
            if(offUser.album.find(fig => fig.id_figurina === figurina.id_figurina)) return res.status(400).json({ message: "Figurina già presente nell'album di "+offUser.username});

            figurina.stato = 'O';
            
            elencoFigurineAcquirente.push({id: idFigurineAcquirente[i], id_figurina: figurina.id_figurina});
        }

        await acqUser.save();
        const newOffer = new Offer({
            figurine_offerente: elencoFigurineOfferente,  // ID delle figurine offerta
            id_utente_offerente: idOfferente,   // ID dell'utente che offre
            figurine_acquirente: elencoFigurineAcquirente,// ID delle figurine dell'acquirente
            id_utente_acquirente: id,           // ID dell'utente acquirente
            stato: 'In attesa'                  // Stato della proposta
        });

        // Salva l'oggetto nel database
        const savedOffer = await newOffer.save();
        res.status(200).json({ offers: savedOffer,message: `Offerta inviata con successo!` });
    } catch (error) {
        // Gestisci eventuali errori
        console.error("Errore durante l'invio dell'offerta:", error);
        res.status(500).json({ message: error.message });
    }
}

export const getOffers = async (req, res) => {
    const { id } = req.user;
    const { page = 1, limit = 18, skip = 0, state, direction  } = req.query;

    try {
        // Trova tutte le offerte dell'utente
        let offers;

        if (!direction) {
            // Se non c'è direzione, cerca le offerte dove l'utente è sia acquirente che offerente
            offers = await Offer.find({
                $or: [
                { id_utente_acquirente: id },
                { id_utente_offerente: id }
                ]
            })
            .sort({ updatedAt: -1 })
            .lean();
        } else {
        // Se c'è una direzione specifica, cerca in base a essa
            const filter = direction === 'sended' ? { id_utente_acquirente: id } : { id_utente_offerente: id };
            offers = await Offer.find(filter).lean();
        }
        
        if(state === 'closed') offers = offers.filter(offer => offer.stato !== 'In attesa');
        else if(state) offers = offers.filter(offer => offer.stato === state);

        // Controlla se ci sono offerte
        if (!offers || offers.length === 0) {
            return res.status(400).json({ message: "Nessuna offerta presente" });
        }

        // Implementazione della paginazione
        const totalOffers = offers.length; // Numero totale di carte che soddisfano il filtro
        const startIndex = (page - 1) * limit + skip; // Indice di inizio per la pagina corrente
        const endIndex = page * limit + skip; // Indice di fine per la pagina corrente

        const paginatedOffers = offers.slice(startIndex, endIndex); // Estrae solo le carte della pagina richiesta

        // Mappa le offerte per arricchirle con l'album dell'offerente
        const offersWithAlbums = await Promise.all(paginatedOffers.map(async (offer) => {
            offer.figurine_offerente = await composeAlbum(offer.figurine_offerente)
            offer.figurine_acquirente = await composeAlbum(offer.figurine_acquirente)
            return {
                ...offer,
            };
        }));
        
        // Rispondi con le offerte arricchite
        res.status(200).json({
            totalPages: Math.ceil(totalOffers / limit),
            offers: await enrichOfferWithUserInfo(offersWithAlbums)
        });
    } catch (error) {
        console.error("Errore durante l'invio dell'offerta:", error);
        res.status(500).json({ message: error.message });
    }
};


export const updateOffer = async (req,res) => {
    const { id } = req.user
    const { idOffer, stato} = req.body || {} 

    if(!mongoose.Types.ObjectId.isValid(idOffer)) return res.status(404).json({message: 'Id non conforme'});
    if(stato !== 'Accettata' && stato !== 'Rifiutata' ) return res.status(404).json({message: 'Stato non valido'});

    try {
        const offer = await Offer.findById(idOffer);

        if(!offer) return res.status(404).json({message: "Offerta non presente"});
        if(offer.stato != 'In attesa') return res.status(400).json({message: "Impossibile accettare/rifiutare l'offerta"})
        
        const offUser = await User.findById(offer.id_utente_offerente)
        if(!offUser) return res.status(404).json({message: "Utente offerente non presente"});
    
        const acqUser = await User.findById(offer.id_utente_acquirente)
        if(!acqUser) return res.status(404).json({message: "Utente acquirente presente"});

        // Verifica se chi manda la modifica dello stato è l'offerente (solo lui può accettare o annullare l'offerte)
        if(!offUser._id.equals(id)) return res.status(401).json({ message: 'Operazione non concessa' });

        if(stato === 'Accettata') {
            // Leggo tutte le figurine proposte dall'acquirente
            for(let i=0; i < offer.figurine_acquirente.length; i++) {
                const idFigurineAcquirente = offer.figurine_acquirente[i].id;
                const figurina = acqUser.album.id(idFigurineAcquirente);  // Trova la figurina dell'acquirente
                if(!figurina) return res.status(404).json({ message: "La figurina con ID "+idFigurineAcquirente+" non è più presente nell'album dell'acquirente" });
                if(figurina.stato !== 'O') return res.status(404).json({ message: "La figurina con ID "+idFigurineAcquirente+" non è scambiabile" });

                // Verifica se la figurina è già presente nell'album dell'offerente e rifiuta in automatico l'offerta VALUTARE se eliminarla direttamente
                if(offUser.album.find(fig => fig.id_figurina === figurina.id_figurina)) {
                    //await rifiutaOfferta(offer, acqUser);  
                    return res.status(400).json({ message: "Figurina "+figurina.id_figurina+" già presente nell'album di "+offUser.username+", l'offerta è stata rifiutata in automatico."});
                }

                figurina.stato = 'D'
                offUser.album.push(figurina); 
                acqUser.album.pull({ _id: idFigurineAcquirente });  
            }            

            // Leggo tutte le figurine proposte dall'acquirente
            for(let i=0; i < offer.figurine_offerente.length; i++) {
                const idFigurineOfferente = offer.figurine_offerente[i].id;
                const figurina = offUser.album.id(idFigurineOfferente);  // Trova la figurina dell'acquirente
                if(!figurina) return res.status(404).json({ message: "La figurina con ID "+idFigurineOfferente+" non è più presente nell'album dell'offerente" });
                if(figurina.stato !== 'B') return res.status(404).json({ message: "La figurina con ID "+idFigurineOfferente+" non è scambiabile" });

                // Verifica se la figurina è già presente nell'album dell'offerente e rifiuta in automatico l'offerta VALUTARE se eliminarla direttamente
                if(acqUser.album.find(fig => fig.id_figurina === figurina.id_figurina)) {
                    //await rifiutaOfferta(offer, acqUser);  
                    return res.status(400).json({ message: "Figurina "+figurina.id_figurina+" già presente nell'album di "+offUser.username+", l'offerta è stata rifiutata in automatico."});
                }
                figurina.stato = 'D'
                acqUser.album.push(figurina); 
                offUser.album.pull({ _id: idFigurineOfferente });  
            }

            offer.stato = stato;
            
            await offer.save()

            await acqUser.save();
            await offUser.save();

            const offers = await Offer.find({
                figurine_offerente: {
                    $elemMatch: { id_figurina: offer.id_figurina_offerente }
                },
                stato: "In attesa"
            });
            
            const acquirenti = await Promise.all(offers.map(offer => User.findById(offer.id_utente_acquirente)));
            acquirenti.forEach((acqUser, index) => {
                if (acqUser) rifiutaOfferta(offers[index], acqUser);
            });
            
        }
        else {
            await rifiutaOfferta(offer, acqUser);  
        }
        
        res.status(200).json({ offers: offer });
    } catch (error) {
        console.error("Errore durante l'invio dell'offerta:", error);
        res.status(500).json({ message: error.message });
    }
}

const rifiutaOfferta = async (offer, acqUser) => {
    try {
        const numFigurine = offer.figurine_acquirente.length;
        
        // Aggiorna lo stato delle figurine dell'acquirente
        for (let i = 0; i < numFigurine; i++) {
            acqUser.album.id(offer.figurine_acquirente[i].id).stato = 'S'
        }
        // Aggiorna lo stato dell'offerta
        offer.stato = 'Rifiutata';
        await offer.save();
        await acqUser.save();
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'offerta", error);
        throw error;
    }
}

export const deleteOffersById = async (id) => {
    try {
        await Offer.deleteMany({id_figurina_offerente: id });
    } catch (error) {
        console.error("Errore durante l'eliminazione delle offerte per la figurina: ", id);
        throw error; 
    }
};

export const deleteOffers = async (userId) => {
    try {
        await Offer.deleteMany({
            $or: [
                { id_utente_acquirente: userId },
                { id_utente_offerente: userId }
            ]
        });
    } catch (error) {
        console.error("Errore durante l'eliminazione delle offerte per l'utente:", error);
        throw error; 
    }
};

const enrichOfferWithUserInfo = async (offers) => {
    const albumWithUserInfo = await Promise.all(
        offers.map(async (offer) => {
            const utente_offerente = await getUserInfo(offer.id_utente_offerente); 
            const utente_acquirente = await getUserInfo(offer.id_utente_acquirente); 
            return { ...offer, utente_offerente,  utente_acquirente}; 
        })
    );

    return albumWithUserInfo; // Ritorna il nuovo array arricchito
};

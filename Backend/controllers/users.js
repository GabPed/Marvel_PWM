import { User } from "../models/users.js";
import bcrypt from 'bcryptjs';
import {isPasswordValid, isEmailValid} from '../validation/users.js';
import { deleteOffers } from "./offers.js";
import { Avatar } from "../models/avatars.js";
import mongoose, { Mongoose } from "mongoose";
import { Character } from "../models/characters.js";

export const getUser = async (req, res) => {
    const { id } = req.user 
    try {
        const user = await User.findById(id);
        if(!user) return res.status(404).json({ message: "Utente non trovato" });
        const charactersCount = await Character.countDocuments();
        const album = user.album.filter(card => card.stato === 'D').length
        return res.status(200).json({ user: {...await cleanUser(user), cardsFound: album, totalCards: charactersCount}});
    } catch (error) {
        console.error("Errore durante l'ottenimento dell'utente: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({username})
        if(!user) return res.status(404).json({ message: "Utente non trovato"});
        const userClean = await cleanUser(user)
        delete userClean.email
        delete userClean.crediti
        delete userClean.favoriteHero

        return res.status(200).json({ user: userClean});
    } catch (error) {
        console.error("Errore durante l'ottenimento dell'utente:", error);
        res.status(500).json({ message: error.message });
    }
}

export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await getUserInfo(id);
        if(!user) return res.status(404).json({ message: "Utente non trovato"});
        return res.status(200).json({ user: user});
    } catch (error) {
        console.error("Errore durante l'ottenimento dell'utente:", error);
        res.status(500).json({ message: error.message });
    }
}

export const getUserInfo = async(id) => {
    try {
        const user = await User.findById(id)
        if(!user) return;
        const userClean = await cleanUser(user)
        delete userClean.email
        delete userClean.crediti
        delete userClean.favoriteHero
        
        return userClean;
    } catch (error) {
        console.error("Errore durante l'ottenimento dell'utente:", error);
        throw (error);
    }
}

export const searchUsersByUsername = async (req, res) => {
    const { username } = req.params; 

    if (!username) return res.status(400).json({ message: 'Nessun parametro di ricerca fornito' });
    
    try {
        // Cerca utenti in cui gli username contengano la stringa di ricerca 
        const users = await User.find({ 
            username: { $regex: username, $options: 'i' } 
        })
        
        // Verifica se sono stati trovati utenti
        if (users.length === 0) return res.status(404).json({ message: 'Nessun utente trovato' });

        const userClean = await Promise.all(
            users.map(async (user) => {
                const cleanedUser = await cleanUser(user); // Attendere il risultato di cleanUser
                console.log(cleanedUser);
                delete cleanedUser.email;              // Elimina le proprietà non desiderate
                delete cleanedUser.crediti;
                delete cleanedUser.favoriteHero;
                return cleanedUser;                    // Restituisci l'utente pulito
            })
        );
        

        // Ritorna l'elenco degli username trovati
        return res.status(200).json({ users: userClean});
    } catch (error) {
        console.error("Errore durante la ricerca degli utenti:", error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteUser = async (req,res) => {
    const { id } = req.user
    const { password } = req.body || {}
    
    try {
        // Verifica la presenza della password di conferma per poter cambiare i dati
        if(!password) return res.status(400).json({message: "La password non è corretta"});

        // Estrae la password corrente per verificare se corrisponde alla password passata
        const currentUser = await User.findById(id).select('password');
        if(!currentUser) return res.status(404).json({ message: 'Utente non trovato o già eliminato' });
        if(!await bcrypt.compare(password, currentUser.password)) return res.status(400).json({message: "La password non è corretta"});
        
        // Elimina tutte le offerte dell'utente
        await deleteOffers(id);

        // Trova ed elimina l'utente
        const deletedUser = await User.findByIdAndDelete(id);

        // Verifica se l'utente è stato trovato e eliminato
        if (!deletedUser) return res.status(404).json({ message: 'Utente non trovato o già eliminato' });

        res.status(200).json({ message: `Utente con ID ${id} eliminato con successo!` });
    } catch (error) {
       // console.error("Errore durante l'eliminazione dell'utente:", error);
        res.status(500).json({ message: error.message });
    }
}

export const updateUser = async (req,res) => {
    const { id, email } = req.user
    const data = { ...req.body || {} }; //Spread operator
    //Effettuate l'aggiornamento dei dati
    try{
        // Verifica che i dati inseriti se presenti siano corretti
    // Verifica username
    if (data.username && (typeof data.username != 'string' || data.username.trim() === '')) return res.status(400).json({ message: "Username non valido" })
    if (data.favoriteHero && (typeof data.favoriteHero != 'string' || data.favoriteHero.trim() === '')) return res.status(400).json({ message: "Eroe preferito non valido" })
    
    //Verifica se i valori di Email e Password sono validi
    if(data.email) {
        if (!isEmailValid(data.email)) return res.status(400).json({ message: "Email non valida" })
    }  
        //Verifica se è da modificare la password
    if(data.password) {
            //Verifica che non si tratta del token inviato per mail
            if(!email) { 
                if(!data.oldPassword) return res.status(400).json({message: "La vecchia password non è corretta"});
                //Estra la password corrente per verificare se corrisponde alla password passata
                const currentUser = await User.findById(id).select('password');
                if(!await bcrypt.compare(data.oldPassword, currentUser.password)) return res.status(401).json({message: "La password non è corretta"});
            }
            // Verifica la presenza della password di conferma per poter cambiare i dati
            if(!data.confirmPassword) return res.status(400).json({message: "La password di conferma non è corretta"});
            if(data.password) {
                const passwordCheck = isPasswordValid(data.password)
                if (!passwordCheck.valid) return res.status(400).json({ message: passwordCheck.message });
                // Verifica se le password corrispondono
                if (data.password != data.confirmPassword) return res.status(400).json({ message: "Le password non corrispondono" })
                data.password = await bcrypt.hash(data.password, 10);
            }
        }
        
        //Forza la rimozione dell'aggiornamento dei crediti nel caso venga passato come parametro del body
        delete data.crediti

        const user = await User.findByIdAndUpdate(id, data, {new: true /*Restituisce l'oggetto nuovo*/})

        return res.status(200).json({message: "Informazioni utente aggiornate con successo", user: await cleanUser(user)});
    } catch (error) {
        console.log()
        res.status(404).json({message: error.message})
    }
}

// Funzione che ritorna l'utente senza alcuni campi 
export const cleanUser = async (user) => {
    const userClean = user.toObject();
    delete userClean.password;
    delete userClean.createdAt;
    delete userClean.updatedAt;
    delete userClean.__v;
    delete userClean.album;
  
    const heroData = await Avatar.findOne({ superhero: userClean.favoriteHero });  
    if(heroData) userClean.favoriteHero_img = heroData.file; 

    return userClean;
}  
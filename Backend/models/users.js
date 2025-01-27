import mongoose from "mongoose";

// Definisci il sottoschema per le figurine nell'album
const albumItemSchema = mongoose.Schema({
    id_figurina: {
        type: Number,
        require: true
    },
    stato: {
        type: String,
        require: true
    }
}, { timestamps: true }); // Abilita i timestamp per ogni elemento nell'album

// Definisci lo schema principale dell'utente
const usersSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    favoriteHero: {
        type: String,
        require: true
    },
    crediti: {
        type: Number,
        require: true
    },
    album: [albumItemSchema] // Usa il sottoschema per l'array album
}, { timestamps: true }); // Abilita i timestamp per l'utente

export const User = mongoose.model('User', usersSchema);

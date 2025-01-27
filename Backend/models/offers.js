import mongoose from "mongoose";

const offersSchema = mongoose.Schema({
    figurine_offerente: [{
        id: {
            type: String,
            require: true
        },
        id_figurina: {
            type: Number,
            require: true
        },
        _id: false
    }],
    id_utente_offerente: {
        type: String,
        require: true
    },
    figurine_acquirente: [{
        id: {
            type: String,
            require: true
        },
        id_figurina: {
            type: Number,
            require: true
        },
        _id: false
    }],
    id_utente_acquirente: {
        type: String,
        require: true
    },
    stato: {
        type: String,
        require: true
    }
},{timestamps: true})

export const Offer = mongoose.model('Offer',offersSchema);

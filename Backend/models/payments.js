import mongoose from "mongoose";

const paymentsSchema = mongoose.Schema({
    id_utente: {
        type: String,
        require: true
    },
    payerID: {
        type: String,
        require: true
    },
    paymentId: {
        type: String,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    crediti: {
        type: Number,
        require: true
    },
    stato: {
        type: String,
        require: true
    }
},{timestamps: true})

export const Payment = mongoose.model('Payment',paymentsSchema);

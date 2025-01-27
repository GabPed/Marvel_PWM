import mongoose from "mongoose";

const charactersSchema = mongoose.Schema({
    id: {
        type: String,
        require: true,
        unique: true
    },
    hero: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    series: [{
        type: String,
        require: true
    }],
    events: [{
        type: String,
        require: true
    }],
    comics: [{
        type: String,
        require: true
    }]
},{timestamps: true})

export const Character = mongoose.model('Characters',charactersSchema);

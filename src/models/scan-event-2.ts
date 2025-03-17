const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This scan event takes into account entry AND exit events
const scanEvent2Schema = new Schema({
    _id: {
        type: String,
        required: true
    },
    entryTime: {
        type: Date,
        required: true
    },
    exitTime: {
        type: Date,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    entryTurnstile: {
        type: Number,
        required: true
    },
    exitTurnstile: {
        type: Number,
        required: false
    },
    cardNumber: {
        type: Number,
        required: true
    },
    cardTechnology: {
        type: String,
        required: false
    }
}, { timestamps: true });

export default mongoose.models?.ScanEvent2 || mongoose.model('ScanEvent2', scanEvent2Schema)
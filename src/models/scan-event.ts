const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scanEventSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    firstNames: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    turnstile: {
        type: Number,
        required: true
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

export default mongoose.models?.ScanEvent || mongoose.model('ScanEvent', scanEventSchema)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // unique username
    username: {
        type: String,
        required: true,
        unique: true
    },
    // Users first name
    firstName: {
        type: String,
        required: true,
    },
    // Users last name
    lastName: {
        type: String,
        required: false,
    },
    // user's email
    email: {
        type: String,
        required: true,
        unique: true
    },
    // user's password
    password: {
        type: String, // Will be null for OAuth users
        required: false
    },
    // "credentials" for normal users, "provider" for OAuth users
    provider: {
        type: String,
        required: true
    },
    // Google ID, only for OAuth users
    providerId: {
        type: String,
        required: false
    },
    // user's role
    role: {
        type: String,
        required: true,
        default: "user"
    },
    // user's profile picture
    profilePicture: {
        type: String,
        required: false
    },
}, { timestamps: true });

export default mongoose.models?.User || mongoose.model('User', userSchema);

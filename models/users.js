const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    rol: {
        type: String,
        enum: ['admin', 'physio', 'patient'],
        required: true
    },
    userId: {
        type: String,
        required: true,
    }
});

let User = mongoose.model('User', userSchema);
module.exports = User;
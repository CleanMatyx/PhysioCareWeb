const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    medicalRecord: {
        type: String,
        required: false,
        maxlength: 1000
    },
    appointments: [{
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        physio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Physio',
            required: true
        },
        diagnosis: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 500
        },
        treatment: {
            type: String,
            required: true
        },
        observations: {
            type: String,
            required: false,
            maxlength: 500
        },
        price: {
            type: Number,
            required: true
        }

    }]
});

let Record = mongoose.model('Record', recordSchema);
module.exports = Record;
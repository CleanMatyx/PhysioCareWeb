const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio.'],
        minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
        maxlength: [50, 'El nombre no puede exceder los 50 caracteres.']
    },
    surname: {
        type: String,
        required: [true, 'El apellido es obligatorio.'],
        minlength: [2, 'El apellido debe tener al menos 2 caracteres.'],
        maxlength: [50, 'El apellido no puede exceder los 50 caracteres.']
    },
    birthDate: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria.']
    },
    address: {
        type: String,
        required: false,
        maxlength: [100, 'La dirección no puede exceder los 100 caracteres.']
    },
    insuranceNumber: {
        type: String,
        required: [true, 'El número de seguro es obligatorio.'],
        match: [/^[a-zA-Z0-9]{9}$/, 'El número de seguro debe tener exactamente 9 caracteres alfanuméricos.'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio.'],
        match: [/^\S+@\S+\.\S+$/, 'El correo electrónico debe ser válido.'],
        unique: true
    },
    image: {
        type: String,
        required: false
    }
});

let Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
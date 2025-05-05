const mongoose = require('mongoose');

let physioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio.'],
        minlength: [2, 'El nombre debe tener al menos 2 caracteres.'],
        maxlength: [50, 'El nombre no puede exceder los 50 caracteres.'],
    },
    surname: {
        type: String,
        required: [true, 'El apellido es obligatorio.'],
        minlength: [2, 'El apellido debe tener al menos 2 caracteres.'],
        maxlength: [50, 'El apellido no puede exceder los 50 caracteres.'],
    },
    specialty:{
        type: String,
        required: [false, 'La especialidad es obligatoria.'],
        enum: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological']
    },
    licenseNumber: {
        type: String,
        required: [true, 'El número de licencia es obligatorio.'],
        match: /^[A-Z]\d{7}$/,
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

let Physio = mongoose.model('Physio', physioSchema);
module.exports = Physio;
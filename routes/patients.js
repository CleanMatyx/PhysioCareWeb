const express = require('express');
const auth = require('../auth/auth');
const Patient = require('../models/patient');
const Record = require('../models/record'); // Importar el modelo Record

const router = express.Router();

const allowedRoles = ['admin', 'physio'];

// Const para enviar respuestas y errores
const sendResponse = (res, status, data) => res.status(status).json(data);
const sendError = (res, status, message) => res.status(status).json({ message });
const isAuthorized = (user, roles) => roles.includes(user.rol);

/**
 * Ruta accesible para admin y physio.
 * Devuelve todos los pacientes.
 */
router.get('/', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const patients = await Patient.find();
    if (!patients.length) {
      return sendError(res, 404, "No hay pacientes en la base de datos.");
    }
    return sendResponse(res, 200, { ok: true, result: patients });
  } catch (error) {
    console.error("Error al obtener pacientes:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Permite buscar pacientes por nombre y apellido.
 */
router.get('/find', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  // Se inicializa el objeto de consulta
  let query = {};
  if (req.query.surname) {
    query.surname = { $regex: req.query.surname, $options: 'i' };
  }
  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: 'i' };
  }

  try {
    const patients = await Patient.find(query);
    if (!patients.length) {
      return sendError(res, 404, "No se encontraron pacientes con los campos introducidos.");
    }
    return sendResponse(res, 200, { ok: true, result: patients });
  } catch (error) {
    console.error("Error al buscar pacientes:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio: pueden obtener cualquier paciente.
 * patient: solo puede obtener su propio registro (si el id coincide con el del usuario autenticado).
 */
router.get('/:id', auth.protegerRuta, async (req, res) => {
  const { rol, id: userId } = req.user;

  // Si el usuario no es admin, physio o patient, se niega el acceso
  if (![...allowedRoles, 'patient'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  // Si el usuario es patient, se permite el acceso solo a su propio registro
  if (rol === 'patient' && String(req.params.id) !== String(userId)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return sendError(res, 404, "No se encontraron pacientes con el 'id' introducido en la base de datos.");
    }

    // Buscar registros médicos y citas del paciente
    const records = await Record.find({ patient: req.params.id })
      .populate('appointments.physio', 'name surname');

    return sendResponse(res, 200, { 
      ok: true, 
      result: { patient, records } 
    });
  } catch (error) {
    console.error("Error al obtener el paciente y sus registros:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Crea un nuevo paciente.
 */
router.post('/', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const newPatient = new Patient({
      name: req.body.name,
      surname: req.body.surname,
      birthDate: req.body.birthDate,
      address: req.body.address,
      insuranceNumber: req.body.insuranceNumber,
      email: req.body.email,
    });
    const result = await newPatient.save();
    return sendResponse(res, 201, { ok: true, result });
  } catch (error) {
    console.error("Error al insertar el paciente:", error);
    return sendError(res, 400, "Error al insertar el paciente.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Actualiza los datos de un paciente.
 */
router.put('/:id', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  const patientId = req.params.id;
  // Evitamos actualizar el _id
  const dataUpdated = { ...req.body };
  delete dataUpdated._id;

  try {
    const updatedPatient = await Patient.findByIdAndUpdate(patientId, dataUpdated, { new: true });
    if (!updatedPatient) {
      return sendError(res, 400, "Error actualizando los datos del paciente.");
    }
    return sendResponse(res, 200, { ok: true, result: updatedPatient });
  } catch (error) {
    console.error("Error al actualizar el paciente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Elimina un paciente.
 */
router.delete('/:id', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const result = await Patient.findByIdAndDelete(req.params.id);
    if (!result) {
      return sendError(res, 404, "El paciente a eliminar no existe.");
    }
    return sendResponse(res, 200, { ok: true, result });
  } catch (error) {
    console.error("Error al eliminar el paciente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

module.exports = router;

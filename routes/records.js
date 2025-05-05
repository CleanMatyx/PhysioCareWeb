const express = require('express');
const auth = require('../auth/auth');
const Record = require('../models/record');
const Patient = require('../models/patient');

const router = express.Router();

const allowedRoles = ['admin', 'physio'];

// Helpers para enviar respuestas y errores
const sendResponse = (res, status, data) => res.status(status).json(data);
const sendError = (res, status, message) => res.status(status).json({ message });
const isAuthorized = (user, roles) => roles.includes(user.rol);

/**
 * Ruta accesible para admin y physio.
 * Devuelve todos los expedientes del sistema.
 */
router.get('/', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }
  try {
    const records = await Record.find();
    if (!records.length) {
      return sendError(res, 404, "No se encuentran expedientes en el sistema.");
    }
    return sendResponse(res, 200, { ok: true, result: records });
  } catch (error) {
    console.error("Error al obtener los registros:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Devuelve todas las citas con el nombre del paciente, el fisioterapeuta asignado y la fecha y hora.
 */
router.get('/appointments', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const records = await Record.find()
      .populate('patient', 'name surname')
      .populate('appointments.physio', 'name surname');

    if (!records.length) {
      return sendError(res, 404, "No se encontraron citas.");
    }

    const appointments = records.flatMap(record => {
      if (!record.patient) return []; // Ignorar registros sin paciente
      return record.appointments
        .filter(appointment => appointment.physio) // Ignorar citas sin fisioterapeuta
        .map(appointment => ({
          patientName: `${record.patient.name} ${record.patient.surname}`,
          physioName: `${appointment.physio.name} ${appointment.physio.surname}`,
          date: appointment.date,
          diagnosis: appointment.diagnosis,
          treatment: appointment.treatment,
          observations: appointment.observations
        }));
    });

    return sendResponse(res, 200, { ok: true, result: appointments });
  } catch (error) {
    console.error("Error al obtener las citas:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Permite buscar expedientes por nombre y apellido del paciente.
 */
router.get('/find', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

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
      return sendError(res, 404, "No se encontraron pacientes.");
    }
    const patientIds = patients.map(patient => patient._id);
    const records = await Record.find({ patient: { $in: patientIds } })
      .populate('patient')
      .populate('appointments.physio');

    if (!records.length) {
      return sendError(res, 404, "No se encontraron expedientes.");
    }
    console.log("Resultados de la búsqueda:", records);
    return sendResponse(res, 200, { ok: true, result: records });
  } catch (error) {
    console.error("Error al buscar:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio: pueden obtener cualquier expediente.
 * patient: solo puede obtener su propio expediente.
 */
router.get('/:id', auth.protegerRuta, async (req, res) => {
  const { rol, id: userId } = req.user;

  // Permitir acceso a admin, physio y patient
  if (![...allowedRoles, 'patient'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    // Buscamos el expediente por su _id_ proporcionado en params
    const record = await Record.findById(req.params.id)
      .populate('patient')
      .populate('appointments.physio');

    if (!record) {
      return sendError(res, 404, "El expediente no se ha encontrado");
    }

    // Si el usuario es patient, verificamos que el expediente le pertenezca
    if (rol === 'patient' && String(record.patient._id) !== String(userId)) {
      return sendError(res, 403, "Acceso no autorizado.");
    }

    return sendResponse(res, 200, { ok: true, result: record });
  } catch (error) {
    console.error("Error al obtener el expediente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Crear un nuevo expediente (accesible para admin y physio)
 */
router.post('/', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }
  try {
    const newRecord = new Record({
      patient: req.body.patient,
      medicalRecord: req.body.medicalRecord,
      appointments: [] // No se incluyen citas en este endpoint
    });
    const result = await newRecord.save();
    return sendResponse(res, 201, { ok: true, result });
  } catch (error) {
    console.error("Error al insertar el expediente médico:", error);
    return sendError(res, 400, "Error al insertar el expediente médico.");
  }
});

/**
 * Añadir una cita al expediente (accesible para admin y physio)
 */
router.post('/:id/appointments', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return sendError(res, 404, "El expediente no se ha encontrado");
    }
    record.appointments.push({
      date: req.body.date,
      physio: req.body.physio,
      diagnosis: req.body.diagnosis,
      treatment: req.body.treatment,
      observations: req.body.observations
    });
    const updatedRecord = await record.save();
    return sendResponse(res, 201, { ok: true, result: updatedRecord });
  } catch (error) {
    console.error("Error al guardar la cita:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para el mismo patient que busque su id y añada el endpoint de 
 * '/appointments'
 */
router.get('/:id/appointments', auth.protegerRuta, async (req, res) => {
  const { rol, id: userId } = req.user;
  const patient = await Patient.findById(req.params.id);

  // Permitir acceso a admin, physio y patient
  if (![...allowedRoles, 'patient'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    // Buscamos el expediente por su _id_ proporcionado en params
    // const record = await Record.findById(req.params.id)
    //   .populate('patient')
    //   .populate('appointments.physio');

    const record = await Record.find({ patient: patient._id })

    if (!record) {
      return sendError(res, 404, "No hay citas registradas con ese id de paciente");
    }

    // Si el usuario es patient, verificamos que el expediente le pertenezca
    // if (rol === 'patient' && String(record.patient._id) !== String(userId)) {
    //   return sendError(res, 403, "Acceso no autorizado.");
    // }

    return sendResponse(res, 200, { 
      ok: true, 
      result: record.map((r) => r.appointments).sort((a, b) => b.date - a.date)
    });
  } catch (error) {
    console.error("Error al obtener el expediente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Buscar expediente por id de paciente
 * Ruta accesible para admin y physio
 */
router.get('/patient/:patientId', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }
  try {
    const record = await Record.findOne({ patient: req.params.patientId })
      .populate('patient')
      .populate('appointments.physio');
    if (!record) {
      return sendError(res, 404, "No se encontró expediente para ese paciente.");
    }
    return sendResponse(res, 200, { ok: true, result: record });
  } catch (error) {
    console.error("Error al buscar expediente por id de paciente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Eliminar un expediente (accesible para admin y physio)
 */
router.delete('/:id', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }
  try {
    const result = await Record.findByIdAndDelete(req.params.id);
    if (!result) {
      return sendError(res, 404, "El expediente no existe");
    }
    return sendResponse(res, 200, { ok: true, result });
  } catch (error) {
    console.error("Error al eliminar el expediente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

module.exports = router;

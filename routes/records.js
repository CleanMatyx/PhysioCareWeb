const express = require('express');
const auth = require('../auth/auth');
const Record = require('../models/record');
const Patient = require('../models/patient');
const mongoose = require('mongoose');

const router = express.Router();

const allowedRoles = ['admin', 'physio'];

// Helpers para enviar respuestas y errores
const sendResponse = (res, status, data) => res.status(status).json(data);
const sendError = (res, status, message) => res.status(status).json({ message });
const isAuthorized = (user, roles) => roles.includes(user.rol);

// Generar un ObjectId único para appointmentId
const generateObjectId = () => new mongoose.Types.ObjectId();

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
    // Buscamos los expedientes por el id del paciente proporcionado en params
    const records = await Record.find({ patient: req.params.id })
      .populate('patient')
      .populate('appointments.physio');

    if (!records.length) {
      return sendError(res, 404, "No se encontraron expedientes para el paciente proporcionado.");
    }

    // Si el usuario es patient, verificamos que los expedientes le pertenezcan
    if (rol === 'patient' && String(req.params.id) !== String(userId)) {
      return sendError(res, 403, "Acceso no autorizado.");
    }

    return sendResponse(res, 200, { ok: true, result: records });
  } catch (error) {
    console.error("Error al obtener los expedientes:", error);
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
      result: record.flatMap((r) => r.appointments).sort((a, b) => b.date - a.date)
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
 * Obtener el recordId por id de paciente
 * Ruta accesible para admin, physio y patient
 */
router.get('/patient/:patientId/record', auth.protegerRuta, async (req, res) => {
  const { rol } = req.user;

  // Permitir acceso solo a admin, physio y patient
  if (![...allowedRoles, 'patient'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const record = await Record.findOne({ patient: req.params.patientId });

    if (!record) {
      return sendError(res, 404, "No se encontró expediente para el paciente proporcionado.");
    }

    return sendResponse(res, 200, { ok: true, recordId: record._id });
  } catch (error) {
    console.error("Error al obtener el recordId:", error);
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

router.delete('/:recordId/appointments/:appointmentId', auth.protegerRuta, async (req, res) => {
  const { rol, id: userId } = req.user;

  // Permitir acceso solo a admin y physio
  if (!['admin', 'physio'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const record = await Record.findById(req.params.recordId);

    if (!record) {
      return sendError(res, 404, "El expediente no se encontró.");
    }

    const appointmentIndex = record.appointments.findIndex(
      (appointment) => String(appointment._id) === req.params.appointmentId
    );

    if (appointmentIndex === -1) {
      return sendError(res, 404, "La cita no se encontró.");
    }

    const appointment = record.appointments[appointmentIndex];

    // Verificar si el usuario es physio y si es el physio asignado a la cita
    if (rol === 'physio' && String(appointment.physio) !== String(userId)) {
      return sendError(res, 403, "Acceso no autorizado.");
    }

    // Eliminar la cita del array de citas
    record.appointments.splice(appointmentIndex, 1);

    await record.save();

    return sendResponse(res, 200, { ok: true, message: "Cita eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar la cita:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Permite eliminar una cita específica por su ID, siempre que el fisioterapeuta que realiza la acción
 * sea el mismo asignado a la cita.
 */
router.delete('/appointments/:appointmentId', auth.protegerRuta, async (req, res) => {
  const { rol, id: userId } = req.user;

  // Permitir acceso solo a admin y physio
  if (!['admin', 'physio'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    // Buscar el expediente que contiene la cita
    const record = await Record.findOne({ 'appointments._id': req.params.appointmentId });

    if (!record) {
      return sendError(res, 404, "La cita no se encontró.");
    }

    // Encontrar la cita específica dentro del expediente
    const appointment = record.appointments.find(
      (appointment) => String(appointment._id) === req.params.appointmentId
    );

    if (!appointment) {
      return sendError(res, 404, "La cita no se encontró.");
    }

    // Verificar si el usuario es physio y si es el physio asignado a la cita
    if (rol === 'physio' && String(appointment.physio) !== String(userId)) {
      return sendError(res, 403, "Acceso no autorizado.");
    }

    // Eliminar la cita del array de citas
    record.appointments = record.appointments.filter(
      (appointment) => String(appointment._id) !== req.params.appointmentId
    );

    await record.save();

    return sendResponse(res, 200, { ok: true, message: "Cita eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar la cita:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Devuelve todas las citas asignadas a un fisioterapeuta específico por su ID.
 */
// router.get('/physio/:physioId/appointments', auth.protegerRuta, async (req, res) => {
//   if (!isAuthorized(req.user, allowedRoles)) {
//     return sendError(res, 403, "Acceso no autorizado.");
//   }

//   try {
//     const records = await Record.find({ 'appointments.physio': req.params.physioId })
//       .populate('patient', 'name surname')
//       .populate('appointments.physio', 'name surname');

//     if (!records.length) {
//       return sendError(res, 404, "No se encontraron citas para el fisioterapeuta proporcionado.");
//     }

//     const appointments = records.flatMap(record => {
//       return record.appointments
//         .filter(appointment => String(appointment.physio._id) === req.params.physioId)
//         .map(appointment => ({
//           id: appointment._id,
//           patientName: `${record.patient.name} ${record.patient.surname}`,
//           physioName: `${appointment.physio.name} ${appointment.physio.surname}`,
//           date: appointment.date,
//           diagnosis: appointment.diagnosis,
//           treatment: appointment.treatment,
//           observations: appointment.observations
//         }));
//     });

//     return sendResponse(res, 200, { ok: true, result: appointments });
//   } catch (error) {
//     console.error("Error al obtener las citas del fisioterapeuta:", error);
//     return sendError(res, 500, "Error interno del servidor.");
//   }
// });

router.get('/physio/:physioId/appointments', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  const { physioId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(physioId)) {
    return sendError(res, 400, "ID de fisioterapeuta inválido.");
  }

  try {
    const records = await Record.find({ 'appointments.physio': physioId })
      .populate('patient', 'name surname')
      .populate('appointments.physio', 'name surname');

    const appointments = records.flatMap(record =>
      record.appointments
        .filter(appointment =>
          appointment.physio && String(appointment.physio._id) === physioId
        )
        .map(appointment => ({
          id: appointment._id,
          patientName: `${record.patient.name} ${record.patient.surname}`,
          physioName: `${appointment.physio.name} ${appointment.physio.surname}`,
          date: appointment.date,
          diagnosis: appointment.diagnosis,
          treatment: appointment.treatment,
          observations: appointment.observations,
          price: appointment.price
        }))
    );

    if (!appointments.length) {
      return sendError(res, 404, "No se encontraron citas para el fisioterapeuta proporcionado.");
    }

    return sendResponse(res, 200, { ok: true, result: appointments });
  } catch (error) {
    console.error("Error al obtener las citas del fisioterapeuta:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});


/**
 * Ruta accesible para admin y physio.
 * Permite a un fisioterapeuta crear una cita para un paciente específico por su ID.
 */
router.post('/patients/:patientId/appointments', auth.protegerRuta, async (req, res) => {
  const { rol, id: userId } = req.user;

  // Permitir acceso solo a admin y physio
  if (!['admin', 'physio'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    // Buscar el expediente del paciente
    const record = await Record.findOne({ patient: req.params.patientId });

    if (!record) {
      return sendError(res, 404, "El expediente del paciente no se encontró.");
    }

    // Crear la nueva cita con un appointmentId único
    const newAppointment = {
      appointmentId: generateObjectId(),
      date: req.body.date,
      physio: rol === 'physio' ? userId : req.body.physio,
      diagnosis: req.body.diagnosis,
      treatment: req.body.treatment,
      observations: req.body.observations
    };

    // Agregar la cita al expediente
    record.appointments.push(newAppointment);
    await record.save();

    return sendResponse(res, 201, { ok: true, message: "Cita creada correctamente.", appointment: newAppointment });
  } catch (error) {
    console.error("Error al crear la cita:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta para crear una cita directamente con los datos proporcionados.
 * Accesible para admin y physio.
 */
router.post('/appointments', auth.protegerRuta, async (req, res) => {
  const { rol } = req.user;

  // Permitir acceso solo a admin y physio
  if (!['admin', 'physio'].includes(rol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    // Buscar el expediente del paciente
    const record = await Record.findOne({ patient: req.body.patient });

    if (!record) {
      return sendError(res, 404, "El expediente del paciente no se encontró.");
    }

    const price = req.body.price || 0;

    // Crear la nueva cita con un appointmentId único
    const newAppointment = {
      appointmentId: generateObjectId(),
      date: req.body.date,
      physio: req.body.physio,
      diagnosis: req.body.diagnosis,
      treatment: req.body.treatment,
      observations: req.body.observations,
      price: price
    };

    // Agregar la cita al expediente
    record.appointments.push(newAppointment);
    await record.save();

    return sendResponse(res, 201, { ok: true, message: "Cita creada correctamente.", appointment: newAppointment });
  } catch (error) {
    console.error("Error al crear la cita:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin y physio.
 * Devuelve el número de citas asociadas a un paciente específico por su ID.
 */
router.get('/patient/:patientId/appointments/count', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, allowedRoles)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const record = await Record.findOne({ patient: req.params.patientId });

    if (!record) {
      return sendError(res, 404, "No se encontró expediente para ese paciente.");
    }

    const appointmentCount = record.appointments.length;

    return sendResponse(res, 200, { ok: true, count: appointmentCount });
  } catch (error) {
    console.error("Error al contar las citas del paciente:", error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

module.exports = router;

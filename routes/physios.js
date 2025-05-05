const express = require('express');
const auth = require('../auth/auth');
const Physio = require('../models/physio');
const router = express.Router();
const reqRol = ['admin'];
const specialties = ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological'];

// Const para enviar respuestas y errores
const sendResponse = (res, status, data) => res.status(status).send(data);
const sendError = (res, status, message) => res.status(status).send({ message });
const isAuthorized = (user, allowedRoles) => allowedRoles.includes(user.rol);

/**
 * Ruta accesible para todos.
 * Ruta para obtener todos los fisios.
 */
router.get('/', auth.protegerRuta, async (req, res) => {
  try {
    const result = await Physio.find();
    if (!result.length) {
      return sendError(res, 404, "No hay fisios en el sistema.");
    }
    return sendResponse(res, 200, { ok: true, result });
  } catch (error) {
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para todos.
 * Ruta para obtener fisios por especialidad.
 */
router.get('/find', auth.protegerRuta, async (req, res) => {
  try {
    const { specialty } = req.query;
    const query = specialty? { 
        specialty: { 
            $regex: specialty, 
            $options: 'i' 
        } 
    }: {};

    const result = await Physio.find(query);
    if (!result.length) {
      return sendError(res, 404, "El fisio no se ha encontrado");
    }
    return sendResponse(res, 200, { ok: true, result });
  } catch (error) {
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para todos.
 * Ruta para obtener fisios por 'id'.
 */
router.get('/:id', auth.protegerRuta, async (req, res) => {
  try {
    const result = await Physio.findById(req.params.id);
    if (!result) {
      return sendError(res, 404, "El fisio por 'id' no se ha encontrado");
    }
    return sendResponse(res, 200, { ok: true, result });
  } catch (error) {
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin.
 * Ruta para crear un nuevo fisio.
 */
router.post('/', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, reqRol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  if (!specialties.includes(req.body.specialty)) {
    return sendError(res, 400, "La especialidad no es válida.");
  }

  try {
    const newPhysio = new Physio({
      name: req.body.name,
      surname: req.body.surname,
      specialty: req.body.specialty,
      licenseNumber: req.body.licenseNumber,
      email: req.body.email,
    });

    const result = await newPhysio.save();
    if (!result) {
      return sendError(res, 400, "Error actualizando los datos del fisio");
    }
    return sendResponse(res, 201, { ok: true, result });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin.
 * Ruta para actualizar un fisio por 'id'.
 */
router.put('/:id', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, reqRol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  if (!specialties.includes(req.body.specialty)) {
    return sendError(res, 400, "La especialidad no es válida.");
  }

  try {
    const dataUpdated = { ...req.body };
    delete dataUpdated._id;

    const updatedPhysio = await Physio.findByIdAndUpdate(
      req.params.id,
      dataUpdated,
      { new: true }
    );

    if (!updatedPhysio) {
      return sendError(res, 400, "Error actualizando los datos del fisio");
    }
    return sendResponse(res, 200, { ok: true, result: updatedPhysio });
  } catch (error) {
    return sendError(res, 500, "Error interno del servidor.");
  }
});

/**
 * Ruta accesible para admin.
 * Ruta para eliminar un fisio por 'id'.
 */
router.delete('/:id', auth.protegerRuta, async (req, res) => {
  if (!isAuthorized(req.user, reqRol)) {
    return sendError(res, 403, "Acceso no autorizado.");
  }

  try {
    const result = await Physio.findByIdAndDelete(req.params.id);
    if (!result) {
      return sendError(res, 404, "El fisio a eliminar no existe.");
    }
    return sendResponse(res, 200, { ok: true, result });
  } catch (error) {
    return sendError(res, 500, "Error interno del servidor.");
  }
});

module.exports = router;

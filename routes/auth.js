const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const { generarToken } = require('../auth/auth');

let router = express.Router();

// Modificar las rutas para devolver respuestas en formato JSON en lugar de renderizar vistas Nunjucks

// router.get('/login', (req, res) => {
//     return res.status(200).json({ message: 'Formulario de inicio de sesión disponibleasdasd.' });
// });

// router.post('/login', async (req, res) => {
//   const { login, password } = req.body;
//   try {
//     const user = await User.findOne({ login });
//     if (!user) {
//       return res.status(401).json({ error: 'Credenciales incorrectas' });
//     }
//     const passwordValida = await bcrypt.compare(password, user.password);
//     if (!passwordValida) {
//       return res.status(401).json({ error: 'Credenciales incorrectas' });
//     }
//     // Guardar usuario en la sesión
//     req.session.usuario = {
//       id: user._id,
//       login: user.login,
//       rol: user.rol
//     };
//     return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: req.session.usuario });
//   } catch (error) {
//     console.error("Error en login:", error);
//     return res.status(500).json({ error: 'Error al intentar iniciar sesión' });
//   }
// });

// Cambiar el uso de Model.find() para usar async/await en lugar de callbacks
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    // Buscar el usuario usando async/await
    const usuario = await User.find({ login });

    if (usuario.length === 0) {
      return res.status(401).send({
        ok: false,
        error: "login incorrecto"
      });
    }

    const match = await bcrypt.compare(password, usuario[0].password);

    if (match) {
      const token = generarToken(usuario[0]._id, usuario[0].login, usuario[0].rol);
      return res.status(200).send({
        ok: true,
        token: token
      });
    } else {
      return res.status(401).send({
        ok: false,
        error: "login incorrecto"
      });
    }
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).send({
      ok: false,
      error: "Error interno del servidor"
    });
  }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
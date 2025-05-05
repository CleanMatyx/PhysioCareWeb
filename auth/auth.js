// Importamos el módulo 'jsonwebtoken' para trabajar con tokens JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();
// const secreto = process.env.SECRETO;

// Clave secreta utilizada para firmar y verificar los tokens JWT
const secreto = process.env.SECRETO;

// Función que genera un token JWT basado en el nombre de usuario
// El token tiene una duración de 2 horas
let generarToken = (id, login, rol) => jwt.sign({id, login: login, rol: rol}, secreto, {expiresIn: "2 hours"});

// Función para validar un token JWT recibido
// Devuelve los datos decodificados del token si es válido
let validarToken = token => {
    try {
        let resultado = jwt.verify(token, secreto);
        return resultado;
    } catch (e) {
        return null;
    }
}

// Middleware para proteger rutas restringidas
// Verifica que el token sea válido antes de permitir el acceso a la ruta
let protegerRuta = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token && token.startsWith("Bearer ")) {
        token = token.slice(7);
        let decoded = validarToken(token);
        if (decoded) {
            req.user = decoded;
            next(); 
        } else {
            res.status(401).send({
                ok: false, 
                error: "Token inválido o expirado"});
        }
    } else {
        res.status(403).send({
            ok: false, 
            error: "Acceso no autorizado"});
    }
}


// Exportamos las funciones para poder usarlas en otros módulos de la aplicación
module.exports = {
    generarToken: generarToken,
    validarToken: validarToken,
    protegerRuta: protegerRuta
};
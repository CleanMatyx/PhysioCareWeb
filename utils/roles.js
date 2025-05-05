const rolesAccess = (rolesPermitidos) => {
    return (req, res, next) => {
      const usuario = req.session.usuario;
      if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).render('error.njk', {
          error: 'Acceso no autorizado.'
        });
      }
      req.user = usuario;
      next();
    };
  };
  
  module.exports = rolesAccess;
  
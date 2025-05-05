// Carga de librerías y configuración de la aplicación
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const path = require('path');
const methodOverride = require('method-override');
require('dotenv').config();

// Enrutadores
const patientRouter = require('./routes/patients');
const physioRouter = require('./routes/physios');
const recordRouter = require('./routes/records');
const auth = require('./routes/auth');

const BASE_PATH = '/api/physioWeb';
// app.use(BASE_PATH, (req, res, next) => {
//     next();
// });

// Conectar con mongoDB
mongoose.connect(process.env.DB)
    .then(() => {
        console.log('Conexión exitosa a MongoDB');
    })
    .catch((error) => {
        console.error('Error conectando a MongoDB:', error);
    });

// Inicializar express
let app = express();

// Configuración de motor de plantillas Nunjucks
const env = nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

env.addFilter('date', function(value, format) {
    const fecha = new Date(value);
    if (isNaN(fecha)) return value;
  
    // Ejemplo simple para "dd/MM/yyyy"
    if (format === 'dd/MM/yyyy') {
      return (
        ('0' + fecha.getDate()).slice(-2) + '/' +
        ('0' + (fecha.getMonth() + 1)).slice(-2) + '/' +
        fecha.getFullYear()
      );
    }
  
    return fecha.toLocaleDateString();
  });
  

app.set('view engine', 'njk');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SECRETO,
    resave: false,
    saveUninitialized: false,
    expires: new Date(Date.now() + 3600000), // 1 hora
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  

// Middleware para procesar métodos HTTP como PUT y DELETE
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.use(methodOverride('_method'));

// Middleware para servir archivos estáticos desde una carpeta /public.
app.use('/public', express.static('public'));

app.use('/api/physioweb', express.static('public'));

// Middleware para servir la capreta de uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware para servir Bootstrap desde node_modules
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

app.use((req, res, next) => {
  if (req.session && req.session.usuario) {
    req.user = req.session.usuario;
  }
  next();
});


// Middleware para servir archivos estáticos
app.use('/patients', patientRouter);
app.use('/physios', physioRouter);
app.use('/records', recordRouter);
app.use('/auth', auth);

// Ruta para redirigir a la página principal
app.get('/', (req, res) => {
  const user = req.session.usuario;

  if (!user) return res.render('welcome.njk');

  switch (user.rol) {
      case 'admin':
      case 'physio':
          return res.redirect(`/patients`);
      case 'patient':
          return res.redirect(`/patients/${user.id}`);
      default:
          return res.render('welcome.njk');
  }
});
  
// Puerto del servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor en el puerto ${PORT}`);
});
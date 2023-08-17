const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Console, log } = require('console');

const app = express();
const PORT = 3000; // Puerto en el que se ejecutará el servidor

// Configuración de express-session
app.use(cookieParser());
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: true
}));


// ASIGNAR NUESTRO MOTOR DE PLANTILLAS Y LA RUTA DE LAS VISTAS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// ASIGNAR LA CARPETA DE PUBLIC PARA CSS Y JS
app.use(express.static(__dirname + '/public'));

// MANEJAR LOS ARCHIVOS JSON
app.use(express.json());

// ESTABLECER RUTAS 

// GET METHODS
app.get('/', (req, res) => {
    if (req.session.user) {
        let user = req.session.user
        // El usuario ha iniciado sesión, muestra el dashboard
       res.render('dashboard' , {user});
    } else {
        // El usuario no ha iniciado sesión, redireccionar al formulario de inicio de sesión
        res.render('index');
    }
   
});

app.get('/reconocimiento_facial', (req, res) => {
   

    if (req.session.user) {
        let user = req.session.user
        // El usuario ha iniciado sesión, muestra el dashboard
       res.render('dashboard' , {user});
    } else {
        res.render('reconocimiento_facial');
    }
});

app.get('/api/users', (req, res) => {
    try {
        const usersData = fs.readFileSync('database.json', 'utf8');
        res.json(JSON.parse(usersData));
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos de usuarios' });
    }
});

app.post('/reconocimiento_facial', (req, res) => {
    
    if (req.session.user) {
        let user = req.session.user
        // El usuario ha iniciado sesión, muestra el dashboard
       res.render('dashboard' , {user});
    } else {
        const usuarioAutenticado = req.body;
        req.session.user = usuarioAutenticado;
        res.redirect('/dashboard');
    }
});

// Ruta para el dashboard
app.get('/dashboard', (req, res) => {
    // Verificar si el usuario ha iniciado sesión
    if (req.session.user) {
        let user = req.session.user
        // El usuario ha iniciado sesión, muestra el dashboard
       res.render('dashboard' , {user});
    } else {
        // El usuario no ha iniciado sesión, redireccionar al formulario de inicio de sesión
        res.redirect('/');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.log('Error al cerrar sesión:', err);
      } else {
        res.redirect('/'); // Redirige a la página de inicio de sesión
      }
    });
});

// Poner a escuchar el servidor en el puerto 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
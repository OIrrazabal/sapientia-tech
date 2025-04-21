const express = require('express');
const router = express.Router();
const db = require('../db/conexion');
const Usuario = require('../models/usuario.model'); // Agregar esta línea
const bcrypt = require('bcrypt');

router.get('/login', (req, res) => {
    res.render('public/login/index', { 
        error: req.query.error || null 
    });
});

router.post('/login/try', async (req, res) => {
    const { email, password } = req.body;

    console.log('Email: /login/try', email);
    console.log('Password: /login/try', password);

    try {
        // Verificar si existe el usuario
        const usuario = await Usuario.findOne( email );
        if (!usuario) {
            return res.redirect('/public/login?error=Usuario no encontrado');
        }

        console.log("usuario encontrado:", usuario);
        console.log("comprar", password, usuario.contraseña);

        //const passwordMatch = await bcrypt.compare(password, usuario.contraseña);

        passwordMatch = password === usuario.contraseña; // Comparar la contraseña ingresada con la almacenada
        
        // Verificar contraseña directamente con la almacenada
        if (!passwordMatch) {
            return res.redirect('/public/login?error=Contraseña incorrecta');
        }

        console.log('paso la comparacion de contrasenha')

        // Crear sesión
        req.session.usuario = usuario;
        req.session.userId = usuario.id; // Importante para el middleware
        req.session.isAdmin = false;
        req.session.isProfesor = false;
        req.session.isAlumno = false;
        if (usuario.rol === 0) {
            req.session.isAdmin = true;
        } else if (usuario.rol === 1) {
            req.session.isProfesor = true;
        } else {
            req.session.isAlumno = true;
        }
        
        // Redirigir al home
        res.redirect('/auth/home');

    } catch (error) {
        console.error('Error en login:', error);
        res.redirect('/public/login?error=Error del servidor');
    }
});

// Agregar ruta de logout
router.get('/logout', (req, res) => {
    // Destruir la sesión
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/?error=Error al cerrar sesión');
        }
        
        // Limpiar la cookie de sesión
        res.clearCookie('is3-session-name');
        
        // Redirigir al login
        res.redirect('/public/login');
    });
});

module.exports = router;
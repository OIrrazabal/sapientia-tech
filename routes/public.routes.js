const express = require('express');
const router = express.Router();
const db = require('../db/conexion');
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcrypt');

router.get('/admin-login', (req, res) => {
    res.render('public/admin-login/index');
});

router.get('/login', (req, res) => {
    res.render('public/login/index', { 
        error: req.query.error || null 
    });
});

router.post('/login/try', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        
        if (!usuario) {
            return res.redirect('/public/login?error=Usuario no encontrado');
        }

        // Verificar contraseña
        const match = await bcrypt.compare(password, usuario.contraseña);
        if (!match) {
            return res.redirect('/public/login?error=Contraseña incorrecta');
        }

        // Crear sesión
        req.session.usuario = usuario;
        req.session.userId = usuario.id;
        req.session.isAdmin = usuario.es_admin === 1;

        res.redirect('/auth/home');

        // Redirigir según el tipo de usuario
        // if (usuario.es_admin === 1) {
        //     res.redirect('/admin/home'); // Redirige a la vista de admin
        // } else {
        //     res.redirect('/auth/home'); // Redirige a la vista normal
        // }

    } catch (error) {
        console.error('Error en login:', error);
        res.redirect('/public/login?error=Error del servidor');
    }
});

router.post('/admin-login/try', async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        return res.status(400).send('contraseña o email vacio');
    }

    if (password.length < 6) {
        return res.status(400).send('contraseña muy corta');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Email invalido');
    }

    try {
        const user = await Usuario.loginAdmin(email, password); // Cambiar username por email
        
        if (!user || !user.success) {
            return res.redirect('/public/admin-login?error=Credenciales incorrectas');
        }

        // Validar si es admin usando el servicio
        if (!Usuario.es_admin === 1) { // Ajustar según la estructura que devuelve loginAdmin
            return res.redirect('/public/admin-login?error=No autorizado');
        }

        // Crear sesión para admin
        req.session.usuario = user.user;
        req.session.userId = user.user.id;
        req.session.isAdmin = true;

        // Usuario válido y admin
        res.redirect('/auth/home');
    } catch (error) {
        console.error('Error en admin login:', error);
        res.redirect('/public/admin-login?error=Error del servidor');
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
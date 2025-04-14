const express = require('express');
const router = express.Router();
const db = require('../db/conexion');

router.get('/admin-login', (req, res) => {
    res.render('public/admin-login/index');
});

router.get('/login', (req, res) => {
    res.render('public/login/index');
});


router.post('/login/try', (req, res) => {
    // Obtener datos del formulario
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

    // Buscar usuario en BD
    const query = 'SELECT * FROM usuarios WHERE email = ? AND contraseña = ?';
    db.get(query, [email, password], (err, user) => {
        if (!user) {
            return res.redirect('/public/login');
        }

        if (user.es_admin === 1) {
            return res.redirect('/public/login');
        }

        // Usuario válido y no admin
        res.redirect('/auth/home');
    });
});

router.post('/admin-login/try', (req, res) => {
    // Obtener datos del formulario
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

    // Buscar usuario en BD
    const query = 'SELECT * FROM usuarios WHERE email = ? AND contraseña = ?';
    db.get(query, [email, password], (err, user) => {
        if (!user) {
            return res.redirect('/public/login');
        }

        if (user.es_admin !== 1) {
            return res.redirect('/public/login');
        }

        // Usuario válido y no admin
        res.redirect('/auth/home');
    });
});


module.exports = router;
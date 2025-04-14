const express = require('express');
const router = express.Router();
const db = require('../db/conexion');

router.get('/admin-login', (req, res) => {
    res.render('public/admin-login/index');
});

router.get('/login', (req, res) => {
    res.render('public/login/index');
});


router.post('/login/try', async (req, res) => {
    // Obtener datos del formulario
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({ error: 'Campos vacíos' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Contraseña muy corta' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email invalido' });
    }

    const user = await Usuario.loginAdmin(username, password);
        
    if (!user) {
        return res.redirect('/public/admin-login');
    }

    // Validar si es admin usando el servicio
    if (!Usuario.isAdmin(user)) {
        return res.redirect('/public/admin-login');
    }
    // Usuario válido y admin
    res.redirect('/auth/home');
});

module.exports = router;
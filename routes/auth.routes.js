const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');

router.get('/', (req, res) => {
    res.redirect('/auth/home');
});

// Usando el método home del controlador
router.get('/home', authController.home);

// Agregar logout (GET para probar desde el navegador)
router.get('/logout', authController.logout);

// Nuevo endpoint para logout
router.post('/logout', authController.logout);

module.exports = router;
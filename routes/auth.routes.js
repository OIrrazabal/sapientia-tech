const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const { checkLogin } = require('../middleware/auth.middleware');
const Usuario = require('../models/usuario.model');

// Ruta de depuración
router.get('/debug/usuarios', async (req, res) => {
  const usuarios = await Usuario.listar();
  res.json(usuarios);
});

// Redirección inicial
router.get('/', (req, res) => {
  res.redirect('/auth/home');
});

// Ruta protegida
router.get('/home', checkLogin, authController.home);

// Formulario de login
router.get('/login', (req, res) => {
  res.render('auth/login/index', { error: req.query.error });
});

// Procesar login
router.post('/login', authController.login);

// Agregar logout (GET para probar desde el navegador)
router.get('/logout', authController.logout);

// Nuevo endpoint para logout
router.post('/logout', authController.logout);

module.exports = router;
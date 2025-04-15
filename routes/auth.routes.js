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
  res.render('auth/login');
});

// Procesar login
router.post('/login', async (req, res) => {

  const { email, password } = req.body;
  const usuarios = await Usuario.listar();

  const user = usuarios.find(u => u.email === email && u.contraseña === password);

  if (user) {
    req.session.userId = user.id;
    req.session.userNombre = user.nombre;
    res.redirect('/auth/home');
  } else {
    res.render('auth/login', { error: 'Credenciales inválidas' });
  }
});

module.exports = router;
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

router.get('/debug/cursos', (req, res) => {
  const db = require('../db/conexion');
  db.all('SELECT * FROM cursos', (err, cursos) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(cursos);
  });
});

router.get('/debug/inscripciones', (req, res) => {
  const db = require('../db/conexion');
  db.all('SELECT * FROM inscripciones', (err, inscripciones) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(inscripciones);
  });
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

// Ruta para la página del equipo
router.get('/team', checkLogin, authController.team);

//Listar mis cursos como profesor
router.get('/mis-cursos', checkLogin, authController.misCursos);

// Listar mis cursos como alumno
router.get('/mis-cursos-alumno', checkLogin, authController.misCursosAlumno);

// Ruta para la página de profesores
router.get('/profesores', authController.profesores);

// Ruta para buscar cursos
router.get('/buscar', checkLogin, authController.buscarCursos);

// Mostrar formulario para agregar sección
router.get('/cursos/:id/secciones', checkLogin, authController.mostrarFormularioSeccion);

// Procesar el formulario de nueva sección
router.post('/cursos/:id/secciones', checkLogin, authController.agregarSeccion);

module.exports = router;
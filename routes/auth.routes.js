const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const { checkLogin } = require('../middleware/auth.middleware');
const Usuario = require('../models/usuario.model');

// Redirección inicial
router.get('/', authController.redirectHome);

// Ruta protegida
router.get('/home', checkLogin, authController.home);

// Formulario de login
router.get('/login', authController.loginForm);

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

//ver curso
router.get('/curso/:id', checkLogin, authController.verCurso);

// Mostrar formulario para agregar sección
router.get('/cursos/:id/secciones', checkLogin, authController.mostrarFormularioSeccion);

// Procesar el formulario de nueva sección
router.post('/cursos/:id/secciones', checkLogin, authController.agregarSeccion);

// ver todos los cursos publicados
router.get('/mis-cursos-redirect', checkLogin, authController.redirectMisCursos);

module.exports = router;
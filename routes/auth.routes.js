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

//Listar mis cursos como profesor
router.get('/mis-cursos', checkLogin, authController.misCursos);

// Listar mis cursos como alumno
router.get('/mis-cursos-alumno', checkLogin, authController.misCursosAlumno);

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

// Ruta para publicar curso
router.post('/curso/:id/publicar', checkLogin, authController.publicarCurso);

// Ruta para inscripción a curso
router.post('/curso/:id/inscribir', checkLogin, authController.inscribirAlumno);

module.exports = router;
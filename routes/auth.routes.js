const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const { checkLogin, verificarAutenticacion } = require('../middleware/auth.middleware');
const Usuario = require('../models/usuario.model');
const { uploadProfile, deleteOldProfilePhotos } = require('../middleware/upload.middleware');

// Redirección inicial
router.get('/', authController.redirectHome);

// Ruta protegida
router.get('/home', checkLogin, authController.home);

// Formulario de login
router.get('/login', authController.loginForm);

// Procesar login
router.post('/login', authController.login);



// Paso 1: Mostrar confirmación inicial
// Mostrar formulario (GET) y procesar baja (POST)
router
  .route('/dar-de-baja')
  .get(verificarAutenticacion, authController.confirmarBajaPaso1)
  .post(verificarAutenticacion, authController.confirmarBajaPaso2);

// Paso final: aplicar baja lógica y cerrar sesión
router.post('/dar-de-baja-definitivo', verificarAutenticacion, authController.darDeBajaUsuario);

// --------------------------

// Logout (GET y POST)
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

// Listar mis cursos como profesor
router.get('/mis-cursos', checkLogin, authController.misCursos);

// Listar mis cursos como alumno
router.get('/mis-cursos-alumno', checkLogin, authController.misCursosAlumno);

// Ruta para buscar cursos
router.get('/buscar', checkLogin, authController.buscarCursos);

// Ver curso
router.get('/curso/:id', checkLogin, authController.verCurso);

// Mostrar formulario para agregar sección
router.get('/cursos/:id/secciones', checkLogin, authController.mostrarFormularioSeccion);

// Procesar formulario de nueva sección
router.post('/cursos/:id/secciones', checkLogin, authController.agregarSeccion);

// Ver todos los cursos publicados
router.get('/mis-cursos-redirect', checkLogin, authController.redirectMisCursos);

// Publicar curso
router.post('/curso/:id/publicar', checkLogin, authController.publicarCurso);

// Inscripción a curso
router.post('/curso/:id/inscribir', checkLogin, authController.inscribirAlumno);

// Crear valoración
router.post('/curso/:id/valorar', checkLogin, authController.crearValoracion);

// Perfil
router.get('/perfil', checkLogin, authController.mostrarPerfil);
router.post(
    '/actualizar-perfil',
    deleteOldProfilePhotos,              // Primero elimina las fotos viejas
    uploadProfile.single('foto_perfil'), // Luego sube la nueva
    authController.actualizarPerfil
);

//Modificar contraseña
router.get('/micontrasena', checkLogin, authController.formCambiarContrasena);
router.post('/micontrasena', checkLogin, authController.cambiarContrasena);

module.exports = router;
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');
const { checkLogin, verificarAutenticacion, isLoggedIn } = require('../middleware/auth.middleware');
const Usuario = require('../models/usuario.model');
const { uploadProfile, deleteOldProfilePhotos } = require('../middleware/upload.middleware');
// Importar módulos necesarios para manejar archivos
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const mkdirp = require('mkdirp');

// Configuración de almacenamiento para videos
const videoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const cursoId = req.params.id;
    const uploadDir = path.join(__dirname, '../temp');
    
    try {
      // Verificar si existe el directorio
      try {
        await fs.access(uploadDir);
      } catch (error) {
        // Si no existe, crearlo
        await fs.mkdir(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error al crear directorio:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Filtro para archivos de video
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido. Solo se aceptan MP4 o WebM.'), false);
  }
};

// Configurar multer con límite de tamaño (3MB)
const upload = multer({
  storage: videoStorage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: videoFileFilter
});

// Asegúrate de que exista el directorio de videos después de iniciar la aplicación
const videosBaseDir = path.join(__dirname, '../assets/videos');
fs.mkdir(videosBaseDir, { recursive: true })
  .then(() => console.log('Directorio de videos creado'))
  .catch(err => console.error('Error al crear directorio de videos:', err));

// Redirección inicial
router.get('/', authController.redirectHome);

// Ruta protegida
router.get('/home', checkLogin, authController.home);

// Formulario de login
router.get('/login', authController.loginForm);

// Procesar login
router.post('/login', authController.login);

// Paso 1: Mostrar confirmación inicial
router
  .route('/dar-de-baja')
  .get(verificarAutenticacion, authController.confirmarBajaPaso1)
  .post(verificarAutenticacion, authController.confirmarBajaPaso2);

// Paso final: aplicar baja lógica y cerrar sesión
router.post('/dar-de-baja-definitivo', verificarAutenticacion, authController.darDeBajaUsuario);

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

// Procesar formulario de nueva sección con video
router.post('/cursos/:id/secciones', checkLogin, upload.single('video'), authController.agregarSeccion);

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
  checkLogin,
  (req, res, next) => {
    uploadProfile.single('foto_perfil')(req, res, err => {
      if (err) {
        req.session.errorPerfil = err.message;
        return res.redirect('/auth/perfil');
      }
      next();
    });
  },
  deleteOldProfilePhotos,
  authController.actualizarPerfil
);

//Modificar contraseña
router.get('/micontrasena', checkLogin, authController.formCambiarContrasena);
router.post('/micontrasena', checkLogin, authController.cambiarContrasena);

// Ruta para streaming de videos
router.get('/videos/:cursoId/:seccionId/:fileName', checkLogin, authController.streamVideo);

// Eliminar una sección
router.post('/curso/:cursoId/seccion/:seccionId/eliminar', checkLogin, authController.eliminarSeccion);

module.exports = router;

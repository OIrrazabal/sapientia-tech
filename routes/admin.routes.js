const express = require('express');
const adminController = require('../controllers/admin/admin.controller');
const { checkAdmin } = require('../middleware/admin.middleware');
const router = express.Router();

router.get('/home', checkAdmin, adminController.home);

//crear cursos
router.get('/crear-curso', checkAdmin, adminController.mostrarFormulario);

router.post('/crear-curso', checkAdmin, adminController.crearCurso);

//asignar profesores
router.get('/asignar-profesor', checkAdmin, adminController.mostrarFormularioAsignar);
router.post('/asignar-profesor', checkAdmin, adminController.procesarAsignacionProfesor);

// Agregar esta línea para ver asignaciones:
router.get('/asignaciones', checkAdmin, adminController.verAsignaciones);

// También agregar rutas para nuevas asignaciones si las necesitas:
router.get('/asignaciones/nueva', checkAdmin, adminController.nuevaAsignacion);
router.post('/asignaciones/crear', checkAdmin, adminController.crearAsignacionDesdeListado);
router.post('/asignaciones/eliminar/:id', checkAdmin, adminController.eliminarAsignacion);

// Gestión de usuarios
router.get('/usuarios', checkAdmin, adminController.listarUsuarios);
router.get('/usuarios/nuevo', checkAdmin, adminController.mostrarFormularioUsuario);
router.post('/usuarios/crear', checkAdmin, adminController.crearUsuario); // ✅
router.get('/usuarios/editar/:id', checkAdmin, adminController.mostrarFormularioEditar);
router.post('/usuarios/editar/:id', checkAdmin, adminController.editarUsuario);

//inscripciones
router.get('/inscripciones', checkAdmin, adminController.inscripciones);

//categorias
router.get('/categorias', checkAdmin, adminController.listarCategorias);
router.get('/categorias/nueva', checkAdmin, adminController.mostrarFormularioCategoria);
router.post('/categorias/crear', checkAdmin, adminController.crearCategoria);
router.get('/categorias/:id/editar', checkAdmin, adminController.mostrarFormularioEditar);
router.post('/categorias/:id/editar', checkAdmin, adminController.editarCategoria);

module.exports = router;
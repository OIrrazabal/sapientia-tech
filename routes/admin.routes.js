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

router.post('/asignar-profesor', checkAdmin, adminController.asignarProfesor);
router.get('/asignaciones', adminController.verAsignaciones);
router.get('/asignaciones/nueva', adminController.nuevaAsignacion);
router.post('/asignaciones/crear', adminController.crearAsignacionDesdeListado);
router.post('/asignaciones/:id/eliminar', adminController.eliminarAsignacion);

// Gestión de usuarios
router.get('/usuarios', checkAdmin, adminController.listarUsuarios);
router.get('/usuarios/nuevo', checkAdmin, adminController.mostrarFormularioUsuario);
router.post('/usuarios/crear', checkAdmin, adminController.crearUsuario);
router.get('/usuarios/editar/:id', checkAdmin, adminController.mostrarFormularioEditar);
router.post('/usuarios/editar/:id', checkAdmin, adminController.editarUsuario);
//usuarios
router.get('/usuarios', checkAdmin, adminController.listarUsuarios);
router.get('/usuarios/nuevo', checkAdmin, adminController.mostrarFormularioUsuario);
router.post('/usuarios/crear', checkAdmin, adminController.crearUsuario);

//inscripciones
router.get('/inscripciones', checkAdmin, adminController.inscripciones);
router.get('/inscripciones/:alumno_id/:curso_id/eliminar', checkAdmin, adminController.eliminarInscripcion);
router.get('/inscripciones/nueva', checkAdmin, adminController.formNuevaInscripcion);
router.post('/inscripciones/nueva', checkAdmin, adminController.registrarInscripcion);

//categorias
router.get('/categorias', checkAdmin, adminController.listarCategorias);
router.get('/categorias/nueva', checkAdmin, adminController.mostrarFormularioCategoria);
router.post('/categorias/crear', checkAdmin, adminController.crearCategoria);
router.get('/categorias/:id/editar', checkAdmin, adminController.mostrarFormularioEditar);
router.post('/categorias/:id/editar', checkAdmin, adminController.editarCategoria);

module.exports = router;
const express = require('express');
const adminController = require('../controllers/admin/admin.controller');
const rutasController = require('../controllers/admin/rutas.controller');
const { checkAdmin } = require('../middleware/admin.middleware');
const router = express.Router();
const { uploadCategoria, uploadProfile } = require('../middleware/upload.middleware');

router.get('/home', checkAdmin, adminController.home);

//crear cursos
router.get('/crear-curso', checkAdmin, adminController.mostrarFormularioCurso);           // crear
router.get('/crear-curso/:id', checkAdmin, adminController.mostrarFormularioCurso);        // editar
router.post('/crear-curso/:id?', checkAdmin, uploadCategoria.single('imagen'), adminController.guardarCurso); // ambos
router.get('/editar-curso', checkAdmin, adminController.listarCursos);

//asignar profesores
router.get('/asignar-profesor', checkAdmin, adminController.mostrarFormularioAsignar);
router.post('/asignar-profesor', checkAdmin, adminController.procesarAsignacionProfesor);

// Agregar esta línea para ver asignaciones:
router.get('/asignaciones', checkAdmin, adminController.verAsignaciones);

// También agregar rutas para nuevas asignaciones si las necesitas:
router.get('/asignaciones/nueva', checkAdmin, adminController.nuevaAsignacion);
router.post('/asignaciones/crear', checkAdmin, adminController.crearAsignacionDesdeListado);
router.get('/asignaciones/crear', checkAdmin, adminController.crearAsignacionDesdeListado); // Added for redirects
router.post('/asignaciones/eliminar/:id', checkAdmin, adminController.eliminarAsignacion);

// Gestión de usuarios
router.get('/usuarios', checkAdmin, adminController.listarUsuarios);
router.get('/usuarios/nuevo', checkAdmin, adminController.mostrarFormularioUsuario);
router.post('/usuarios/crear', checkAdmin, adminController.crearUsuario); // ✅
router.get('/usuarios/editar/:id', checkAdmin, adminController.mostrarFormularioEditar);
router.post('/usuarios/editar/:id', checkAdmin, adminController.editarUsuario);

//inscripciones
router.get('/inscripciones', checkAdmin, adminController.inscripciones);
router.get('/inscripciones/:alumno_id/:curso_id/eliminar', checkAdmin, adminController.eliminarInscripcion);
router.get('/inscripciones/nueva', checkAdmin, adminController.formNuevaInscripcion);
router.post('/inscripciones/nueva', checkAdmin, adminController.registrarInscripcion);

//categorias
router.get('/categorias', checkAdmin, adminController.listarCategorias);
router.get('/categorias/nueva', checkAdmin, adminController.mostrarFormularioCategoria);
router.post(
    '/categorias/crear',
    checkAdmin,
    uploadCategoria.single('imagen'),
    adminController.crearCategoria
);
router.get('/categorias/:id/editar', checkAdmin, adminController.mostrarFormularioEditarCategoria);
router.post('/categorias/:id/editar', checkAdmin, uploadCategoria.single('imagen'), adminController.editarCategoria);

router.get('/estadisticas', checkAdmin, adminController.verEstadisticas);

//rutas de aprendizaje
router.get('/rutas', checkAdmin, rutasController.index);
router.get('/rutas/nueva', checkAdmin, rutasController.mostrarCrearRuta);
router.post('/rutas/crear', checkAdmin, rutasController.crear);
router.get('/rutas/:id/editar', checkAdmin, rutasController.mostrarEditarRuta);
router.post('/rutas/:id/actualizar', checkAdmin, rutasController.actualizar);
router.post('/rutas/:id/agregar-curso', checkAdmin, rutasController.agregarCurso);
router.get('/rutas/:id/eliminar-curso/:cursoId', checkAdmin, rutasController.quitarCurso);
router.post('/rutas/:id/eliminar', checkAdmin, rutasController.eliminar);

// Rutas para correlatividades
router.get('/rutas/:id/curso/:cursoId/correlatividades', checkAdmin, rutasController.mostrarAgregarCorrelatividad);
router.post('/rutas/:id/curso/:cursoId/correlatividades/agregar', checkAdmin, rutasController.agregarCorrelatividad);
router.get('/rutas/:id/curso/:cursoId/correlatividades/eliminar/:correlativoId', checkAdmin, rutasController.eliminarCorrelatividad);

module.exports = router;
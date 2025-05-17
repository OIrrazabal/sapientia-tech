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
router.get('/usuarios', checkAdmin, adminController.listarUsuarios);

module.exports = router;
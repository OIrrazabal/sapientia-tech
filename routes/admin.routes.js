const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/curso.controller');
const { checkLogin } = require('../middleware/auth.middleware');
const { checkAdmin } = require('../middleware/admin.middleware');

router.get('/cursos', checkLogin, checkAdmin, cursoController.index);

router.get('/cursos/ver/:id', checkLogin, checkAdmin, cursoController.show);

router.get('/cursos/crear', checkLogin, checkAdmin, cursoController.create);

router.post('/cursos/guardar', checkLogin, checkAdmin, cursoController.store);

router.get('/cursos/asignar_profesor/:id', checkLogin, checkAdmin, cursoController.create_teacher);

router.post('/cursos/guardar_profesor/:id', checkLogin, checkAdmin, cursoController.store_teacher);

module.exports = router;
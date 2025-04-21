const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesor.controller');
const { checkLogin } = require('../middleware/auth.middleware');
const { checkProfesor } = require('../middleware/profesor.middleware');

router.get('/mis_cursos', checkLogin, checkProfesor, profesorController.index);

router.get('/cursos/ver/:id', checkLogin, checkProfesor, profesorController.show);

router.post('/cursos/publicar/:id', checkLogin, checkProfesor, profesorController.publish)

module.exports = router;
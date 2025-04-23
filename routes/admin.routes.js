const express = require('express');
const adminController = require('../controllers/admin/admin.controller');
const { checkAdmin } = require('../middleware/admin.middleware');
const router = express.Router();

router.get('/home', checkAdmin, adminController.home);

router.get('/crear-curso', checkAdmin, adminController.mostrarFormulario);

router.post('/crear-curso', checkAdmin, adminController.crearCurso);

module.exports = router;
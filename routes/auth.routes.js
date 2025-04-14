const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');

router.get('/', (req, res) => {
    res.redirect('/auth/home');
});

// Usando el método home del controlador
router.get('/home', authController.home);

module.exports = router;
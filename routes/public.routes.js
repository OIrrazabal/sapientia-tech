const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public/public.controller');

router.get('/', publicController.showHome);

// Rutas de login
router.get('/admin-login', publicController.showAdminLogin);
router.get('/login', publicController.showLogin);

// Procesar logins
router.post('/login/try', publicController.loginTry);
router.post('/admin-login/try', publicController.adminLoginTry);

// Logout
router.get('/logout', publicController.logout);

// Páginas públicas
router.get('/about', publicController.showAbout);
router.get('/testimonial', publicController.showTestimonial);
router.get('/contact', publicController.showContact);

module.exports = router;
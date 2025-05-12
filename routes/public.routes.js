const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public/public.controller');

// 🔍 Consola de verificación:
//console.log("🔎 Funciones cargadas en publicController:", Object.keys(publicController));
//console.log("🔎 Tipo de showHome:", typeof publicController.showHome);

//mostrar la vista de inicio
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
router.get('/team', publicController.team);
router.get('/profesores', publicController.profesores);
router.get('/privacy', publicController.showPrivacy);
router.get('/terms', publicController.showTerms);
router.get('/faqs', publicController.showFaqs);

module.exports = router;
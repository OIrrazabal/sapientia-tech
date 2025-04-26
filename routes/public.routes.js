const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public/public.controller');

// Rutas de login
router.get('/admin-login', publicController.showAdminLogin);
router.get('/login', publicController.showLogin);

// Procesar logins
router.post('/login/try', publicController.loginTry);
router.post('/admin-login/try', publicController.adminLoginTry);

// Logout
router.get('/logout', publicController.logout);



// SIN usar controller
//acerca de
router.get('/about', (req, res) => {
    res.render('about', {
      title: 'Acerca de Nosotros',
      usuario: req.session.usuario || null
    });
    });
    //testimonial
  router.get('/testimonial', (req, res) => {
    res.render('testimonial', {
      title: 'Testimonial',
      usuario: req.session.usuario || null
    });
});
//contactos
router.get('/contact', (req, res) => {
  res.render('contact', {
      title: 'Contacto',
      usuario: req.session.usuario || null
  });
});
module.exports = router;
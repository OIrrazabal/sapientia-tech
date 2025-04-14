// controllers/auth/auth.controller.js

const Usuario = require('../../models/usuario.model');

const authController = {};

authController.home = async (req, res) => {
  try {
    // query de prueba que selecciona todos los usuarios
    const users = await Usuario.listar();
    console.log(users);
    
    res.render('auth/home/index'); // renderiza views/auth/home/index.ejs
  } catch (error) {
    console.error('error al consultar usuarios:', error);
    res.status(500).send('server error');
  }
};

module.exports = authController;

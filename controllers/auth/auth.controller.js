// controllers/auth/auth.controller.js

const Usuario = require('../../models/usuario.model');

const authController = {};

authController.home = async (req, res) => {
  try {
    const users = await Usuario.listar();

    res.render('auth/home/index');
  } catch (error) {
    res.status(500).send('server error');
  }
};

module.exports = authController;

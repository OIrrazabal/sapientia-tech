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

// Nuevo método logout
authController.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // elimina la cookie de sesión
    return res.status(200).json({ message: 'Sesión cerrada correctamente' });
  });
};

module.exports = authController;

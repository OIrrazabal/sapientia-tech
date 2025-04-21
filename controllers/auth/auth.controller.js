// controllers/auth/auth.controller.js

const Usuario = require('../../models/usuario.model');
const bcrypt = require('bcrypt');

const authController = {};

authController.home = async (req, res) => {
  try {
    const users = await Usuario.listar();

    //Pasamos los usuarios a la vista
    res.render('auth/home/index', {
      title: 'Inicio',
      usuario: req.session.usuario || null
    });
  } catch (error) {
    res.status(500).send('server error');
  }
};

authController.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Verificar si existe el usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.redirect('/public/login?error=Usuario no encontrado');
        }

        const passwordMatch = await bcrypt.compare(password, usuario.contraseña);

        // Verificar contraseña directamente con la almacenada
        if (!passwordMatch) {
            return res.redirect('/public/login?error=Contraseña incorrecta');
        }

        // Crear sesión
        req.session.usuario = usuario;
        req.session.userId = usuario.id; // Importante para el middleware
        req.session.isAdmin = false;
        if (usuario.rol === 0) {
          req.session.isAdmin = true;
        }
        
        // Redirigir al home
        res.redirect('/auth/home');
        
    } catch (error) {
        console.error('Error en login:', error);
        res.redirect('/public/login?error=Error del servidor');
    }
};

// Nuevo método logout
authController.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid'); // elimina la cookie de sesión
     res.redirect('/'); // redirige al inicio después de cerrar sesión
  });
};

module.exports = authController;
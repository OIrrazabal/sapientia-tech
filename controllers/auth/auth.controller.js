// controllers/auth/auth.controller.js

const Usuario = require('../../models/usuario.model');

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

        // Verificar contraseña directamente con la almacenada
        if (password !== usuario.contraseña) {
            return res.redirect('/public/login?error=Contraseña incorrecta');
        }

        // Crear sesión
        req.session.usuario = usuario;
        req.session.userId = usuario.id; // Importante para el middleware
        
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

authController.team = (req, res) => {
  try {
    res.render('team', {
      title: 'Nuestro Equipo',
      usuario: req.session.usuario || null
    });
  } catch (error) {
    console.error('Error al renderizar la página de equipo:', error);
    res.status(500).send('Error del servidor');
  }
};

module.exports = authController;

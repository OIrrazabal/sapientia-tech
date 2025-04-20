// controllers/auth/auth.controller.js

const Usuario = require('../../models/usuario.model');

const authController = {};

authController.home = async (req, res) => {
  try {
    const users = await Usuario.listar();

    //Pasamos los usuarios a la vista
    res.render('auth/home/index', {
      title: 'Inicio',
      usuario: req.session.usuario || null,
      active: 'inicio' //
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

//Obtener cursos donde el usuario es profesor
authController.misCursos = async (req, res) => {
  const db = require('../../db/conexion');
  const usuario = req.session.usuario;

  // Verificar que el usuario esté logueado y sea profesor
  if (!usuario || usuario.rol !== 'profesor') {
      return res.status(403).send("Acceso denegado");
  }

  try {
      // Consultar cursos asignados al profesor desde la base de datos
      const cursos = await db.all('SELECT * FROM cursos WHERE profesor_id = ?', [usuario.id]);

      // Renderizar la vista con la lista de cursos
      res.render('auth/mis-cursos', { cursos });
  } catch (error) {
      console.error("Error al obtener cursos:", error);
      res.status(500).send("Error al obtener los cursos.");
  }
};

// Listar todos los usuarios
authController.profesores = async (req, res) => {
  try {
    let profesores = (await Usuario.listar()).filter(u => u.rol === 'profesor');
    if (!Array.isArray(profesores)) profesores = [];
    res.render('auth/profesores', { 
      profesores,
      active: 'profesores',
      usuario: req.session.usuario || null
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.render('auth/profesores', { 
      profesores: [],
      active: 'profesores',
      usuario: req.session.usuario || null
    });
  }
};

module.exports = authController;

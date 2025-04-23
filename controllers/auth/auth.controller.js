const Usuario = require('../../models/usuario.model');
const bcrypt = require('bcrypt');

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
        const match = await bcrypt.compare(password, usuario.contraseña);
        if (!match) {
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

  if (!usuario || usuario.rol !== 'profesor') {
    return res.status(403).send("Acceso denegado");
  }

  db.all(
    `SELECT c.*, u.nombre AS profesor_nombre
     FROM cursos c
     INNER JOIN usuarios u ON u.id = c.profesor_id
     WHERE c.profesor_id = ?`,
    [usuario.id],
    (err, cursos) => {
      if (err) {
        console.error("Error al obtener cursos:", err);
        return res.render('auth/mis-cursos', { cursos: [], usuario });
      }
      res.render('auth/mis-cursos', { cursos, usuario });
    }
  );
};

// Listar cursos donde el usuario es alumno
authController.misCursosAlumno = async (req, res) => {
  const db = require('../../db/conexion');
  const usuario = req.session.usuario;

  if (!usuario || usuario.rol !== 'estudiante') {
    return res.status(403).send("Acceso denegado");
  }

  db.all(
    `SELECT c.*, u.nombre AS profesor_nombre
     FROM cursos c
     INNER JOIN inscripciones i ON i.curso_id = c.id
     INNER JOIN usuarios u ON u.id = c.profesor_id
     WHERE i.alumno_id = ?`,
    [usuario.id],
    (err, cursos) => {
      if (err) {
        console.error("Error al obtener cursos:", err);
        return res.render('auth/mis-cursos-alumno', { cursos: [], usuario });
      }
      res.render('auth/mis-cursos-alumno', { cursos, usuario });
    }
  );
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

// Buscar Cursos
authController.buscarCursos = async (req, res) => {
  const db = require('../../db/conexion');
  const busqueda = req.query.q || '';
  let cursos = [];

  if (busqueda.trim() !== '') {
    const query = `
        SELECT * FROM cursos
        WHERE publicado = 1 AND LOWER(nombre) LIKE LOWER(?)
    `;

    cursos = await db.all(query, [`%${busqueda}%`]);
}

res.render('auth/Buscar', {
    cursos,
    busqueda,
    usuario: req.session.usuario || null
});
};

// Mostrar formulario para agregar sección
authController.mostrarFormularioSeccion = (req, res) => {
  const db = require('../../db/conexion');
  const cursoId = req.params.id;
  const usuario = req.session.usuario;

  db.get(
    'SELECT * FROM cursos WHERE id = ?',
    [cursoId],
    (err, curso) => {
      if (err) {
        console.error("Error al obtener curso:", err);
        return res.redirect('/auth/mis-cursos');
      }

      if (!curso) {
        return res.redirect('/auth/mis-cursos');
      }

      if (curso.profesor_id !== usuario.id) {
        return res.redirect('/auth/mis-cursos');
      }

      res.render('auth/secciones', {
        curso,
        usuario,
        error: null
      });
    }
  );
};

// Procesar el formulario de nueva sección
authController.agregarSeccion = (req, res) => {
  const db = require('../../db/conexion');
  const cursoId = req.params.id;
  const { nombre, descripcion } = req.body;
  const usuario = req.session.usuario;

  db.get(
    'SELECT * FROM cursos WHERE id = ? AND profesor_id = ?',
    [cursoId, usuario.id],
    (err, curso) => {
      if (err || !curso) {
        return res.render('auth/secciones', {
          curso: { id: cursoId },
          usuario,
          error: 'No tienes permiso para agregar secciones a este curso'
        });
      }

      if (curso.publicado === 1) {
        return res.render('auth/secciones', {
          curso,
          usuario,
          error: 'No se pueden agregar secciones a un curso publicado'
        });
      }

      db.run(
        'INSERT INTO secciones (nombre, descripcion, curso_id) VALUES (?, ?, ?)',
        [nombre, descripcion, cursoId],
        (err) => {
          if (err) {
            console.error("Error al insertar sección:", err);
            return res.render('auth/secciones', {
              curso,
              usuario,
              error: 'Error al crear la sección'
            });
          }
          res.redirect(`/auth/cursos/${cursoId}`);
        }
      );
    }
  );
};

module.exports = authController;
const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const bcrypt = require('bcrypt');

const authController = {};

authController.redirectHome = (req, res) => {
  res.redirect('/auth/home');
};

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

authController.loginForm = (req, res) => {
  res.render('auth/login/index', { error: req.query.error });
};

authController.login = async (req, res) => {
  try {
      const { email, password } = req.body;
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
          return res.redirect('/public/login?error=Usuario no encontrado');
      }
      const match = await bcrypt.compare(password, usuario.contraseña);
      if (!match) {
          return res.redirect('/public/login?error=Contraseña incorrecta');
      }
      req.session.usuario = usuario;
      res.redirect('/auth/home');
  } catch (error) {
      console.error(error);
      res.redirect('/public/login?error=Error de servidor');
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
     res.redirect('/public/login'); // redirige al inicio después de cerrar sesión
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
    const usuario = req.session.usuario;

    if (!usuario || usuario.rol !== 'profesor') {
        return res.status(403).send("Acceso denegado");
    }

    try {
        const cursos = await Curso.getCursosByProfesor(usuario.id);
        res.render('auth/mis-cursos', { cursos, usuario });
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.render('auth/mis-cursos', { cursos: [], usuario });
    }
};

// Listar cursos donde el usuario es alumno
authController.misCursosAlumno = async (req, res) => {
    const usuario = req.session.usuario;

    if (!usuario || usuario.rol !== 'estudiante') {
        return res.status(403).send("Acceso denegado");
    }

    try {
        const cursos = await Curso.getCursosByAlumno(usuario.id);
        res.render('auth/mis-cursos-alumno', { cursos, usuario });
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.render('auth/mis-cursos-alumno', { cursos: [], usuario });
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

// Buscar Cursos
authController.buscarCursos = async (req, res) => {
    const busqueda = req.query.q || '';
    let cursos = [];

    if (busqueda.trim() !== '') {
        try {
            cursos = await Curso.buscarCursos(busqueda);
        } catch (error) {
            console.error("Error al buscar cursos:", error);
        }
    }

    res.render('auth/buscar', {
        cursos,
        busqueda,
        usuario: req.session.usuario || null,
        active: 'buscar'
    });
};

// ver todos los cursos
authController.redirectMisCursos = (req, res) => {
  if (req.session.usuario) {
      if (req.session.usuario.rol === 'profesor') {
          res.redirect('/auth/mis-cursos');
      } else if (req.session.usuario.rol === 'estudiante') {
          res.redirect('/auth/mis-cursos-alumno');
      } else {
          res.redirect('/auth/home');
      }
  } else {
      res.redirect('/public/login');
  }
};

// ver curso
authController.verCurso = async (req, res) => {
    const cursoId = req.params.id;
    const usuario = req.session.usuario;

    try {
        const curso = await Curso.getCursoById(cursoId);
        if (!curso) {
            return res.redirect('/auth/home');
        }

        const inscripcion = await Curso.verificarInscripcion(cursoId, usuario.id);
        const secciones = await Curso.getSeccionesByCurso(cursoId);

        res.render('auth/ver-curso', {
            curso,
            secciones,
            usuario,
            esProfesor: curso.profesor_id === usuario.id,
            estaInscrito: !!inscripcion
        });
    } catch (error) {
        console.error('Error al obtener curso:', error);
        res.redirect('/auth/home');
    }
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
authController.agregarSeccion = async (req, res) => {
    const cursoId = req.params.id;
    const { nombre, descripcion } = req.body;
    const usuario = req.session.usuario;

    try {
        const curso = await Curso.getCursoById(cursoId);
        
        if (!curso || curso.profesor_id !== usuario.id) {
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

        await Curso.agregarSeccion(nombre, descripcion, cursoId);
        res.redirect('/auth/mis-cursos');
    } catch (error) {
        console.error("Error al insertar sección:", error);
        res.render('auth/secciones', {
            curso: { id: cursoId },
            usuario,
            error: 'Error al crear la sección'
        });
    }
};

// Publicar curso
authController.publicarCurso = async (req, res) => {
  const cursoId = req.params.id;
  const usuario = req.session.usuario;

  try {
      const curso = await Curso.getCursoById(cursoId);
      
      // Validar que existe el curso y soy el profesor
      if (!curso || curso.profesor_id !== usuario.id) {
          return res.redirect('/auth/curso/' + cursoId);
      }

      // Validar que el curso no esté publicado
      if (curso.publicado) {
          return res.redirect('/auth/curso/' + cursoId);
      }

      // Validar que tenga al menos una sección
      const secciones = await Curso.getSeccionesByCurso(cursoId);
      if (!secciones || secciones.length === 0) {
          return res.redirect('/auth/curso/' + cursoId);
      }

      // Publicar el curso
      await Curso.publicarCurso(cursoId);
      res.redirect('/auth/curso/' + cursoId);
  } catch (error) {
      console.error('Error al publicar curso:', error);
      res.redirect('/auth/curso/' + cursoId);
  }
};

// Inscribir alumno
authController.inscribirAlumno = async (req, res) => {
  const cursoId = req.params.id;
  const usuario = req.session.usuario;

  try {
      const curso = await Curso.getCursoById(cursoId);
      
      // Validar que existe el curso y está publicado
      if (!curso || !curso.publicado) {
          return res.status(400).json({
              error: 'El curso no está disponible para inscripción'
          });
      }

      // Validar que no soy el profesor
      if (curso.profesor_id === usuario.id) {
          return res.status(400).json({
              error: 'No puedes inscribirte a un curso donde eres profesor'
          });
      }

      // Validar que no esté ya inscrito
      const inscripcion = await Curso.verificarInscripcion(cursoId, usuario.id);
      if (inscripcion) {
          return res.status(400).json({
              error: 'Ya estás inscrito en este curso'
          });
      }

      // Realizar inscripción
      await Curso.inscribirAlumno(cursoId, usuario.id);
      
      res.redirect('/auth/curso/' + cursoId);
  } catch (error) {
      console.error('Error al inscribir alumno:', error);
      res.status(500).json({
          error: 'Error al procesar la inscripción'
      });
  }
};





module.exports = authController;
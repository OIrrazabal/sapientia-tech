const adminController = {};
const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const cursoSchema = require('../../validators/curso.schema');
const db = require('../../db/conexion');
const util = require('util');

// Home del Admin
adminController.home = (req, res) => {
  res.render('admin/home/index', {
    usuario: req.session.usuario || null
  });
};

// Crear cursos
adminController.mostrarFormulario = async (req, res) => {
  try {
    res.render('admin/crear-curso/index', {
      usuario: req.session.usuario || null,
      error: null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('admin/crear-curso/index', {
      error: 'Error al cargar el formulario',
      usuario: req.session.usuario || null
    });
  }
};

adminController.crearCurso = async (req, res) => {
  const { nombre, descripcion } = req.body;
  const { error } = cursoSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).render('admin/crear-curso/index', {
      error: error.details.map(err => err.message).join('. '),
      usuario: req.session.usuario || null,
      valores: req.body
    });
  }

  try {
    await Curso.crear({ nombre, descripcion });
    res.redirect('/admin/home');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('admin/crear-curso/index', {
      error: 'Error al crear el curso',
      usuario: req.session.usuario || null,
      valores: req.body
    });
  }
};

// Asignar profesores 
adminController.mostrarFormularioAsignar = async (req, res) => {
  try {
    const profesores = await Usuario.listar().then(users => users.filter(u => u.rol === 'profesor'));
    const cursos = await Curso.listarDisponibles();

    res.render('admin/asignar-profesor/index', {
      profesores,
      cursos,
      usuario: req.session.usuario || null,
      error: null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('admin/asignar-profesor/index', {
      error: 'Error al cargar el formulario',
      profesores: [],
      cursos: [],
      usuario: req.session.usuario || null
    });
  }
};

adminController.asignarProfesor = async (req, res) => {
  const { curso_id, profesor_id } = req.body;

  if (!curso_id || !profesor_id) {
    return res.status(400).render('admin/asignar-profesor/index', {
      error: 'Todos los campos son requeridos',
      profesores: await Usuario.listar().then(users => users.filter(u => u.rol === 'profesor')),
      cursos: await Curso.listarDisponibles(),
      usuario: req.session.usuario || null
    });
  }

  try {
    await Curso.asignarProfesor(curso_id, profesor_id);
    res.redirect('/admin/home');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('admin/asignar-profesor/index', {
      error: 'Error al asignar profesor',
      profesores: await Usuario.listar().then(users => users.filter(u => u.rol === 'profesor')),
      cursos: await Curso.listarDisponibles(),
      usuario: req.session.usuario || null
    });
  }
};

// Ver asignaciones
adminController.verAsignaciones = async (req, res) => {
  try {
    const query = `
      SELECT 
        asignaciones.id AS asignacion_id,
        cursos.id AS curso_id,
        cursos.nombre AS titulo,
        cursos.publicado,
        usuarios.id AS profesor_id,
        usuarios.nombre AS profesor_nombre
      FROM asignaciones
      JOIN cursos ON asignaciones.id_curso = cursos.id
      JOIN usuarios ON asignaciones.id_profesor = usuarios.id
    `;

    const dbAll = util.promisify(db.all).bind(db);
    const result = await dbAll(query);

    res.render('admin/asignaciones/index', {
      asignaciones: result,
      usuario: req.session.usuario || null,
      appName: 'eLEARNING'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener asignaciones');
  }
};

// Formulario para nueva asignación (desde botón CREAR)
adminController.nuevaAsignacion = async (req, res) => {
  try {
    const profesores = await Usuario.listar().then(users => users.filter(u => u.rol === 'profesor'));
    const cursos = await Curso.listar();
    res.render('admin/asignaciones/nueva', {
      profesores,
      cursos,
      usuario: req.session.usuario || null,
      error: null
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error al cargar formulario de asignación');
  }
};

// Procesar creación de nueva asignación con validación
adminController.crearAsignacionDesdeListado = async (req, res) => {
  const { curso_id, profesor_id } = req.body;

  if (!curso_id || !profesor_id) {
    return res.status(400).send('Campos obligatorios');
  }

  try {
    const dbGet = util.promisify(db.get).bind(db);
    const query = `SELECT * FROM asignaciones WHERE id_curso = ? AND id_profesor = ?`;
    const existente = await dbGet(query, [curso_id, profesor_id]);

    if (existente) {
      const profesores = await Usuario.listar().then(users => users.filter(u => u.rol === 'profesor'));
      const cursos = await Curso.listar();
      return res.status(400).render('admin/asignaciones/nueva', {
        profesores,
        cursos,
        usuario: req.session.usuario || null,
        error: 'Este profesor ya está asignado a ese curso.'
      });
    }

    const dbRun = util.promisify(db.run).bind(db);
    await dbRun(`INSERT INTO asignaciones (id_curso, id_profesor) VALUES (?, ?)`, [curso_id, profesor_id]);

    res.redirect('/admin/asignaciones');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('No se pudo crear la asignación');
  }
};
adminController.eliminarAsignacion = async (req, res) => {
  const id = req.params.id;

  try {
    const dbRun = util.promisify(db.run).bind(db);
    await dbRun(`DELETE FROM asignaciones WHERE id = ?`, [id]);

    // Mensaje opcional usando flash o query params si lo deseas
    res.redirect('/admin/asignaciones');
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).send('No se pudo eliminar la asignación');
  }
};

adminController.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerUsuariosConContadores();
        res.render('admin/usuarios/usuarios', { 
            usuarios, 
            usuario: req.session.usuario || null, 
            appName: 'eLEARNING' // o el nombre de tu app
        });
    } catch (error) {
        res.status(500).send('Error al obtener usuarios');
    }
};

// inscripciones
adminController.inscripciones = (req, res) => {
    const sql = `
        SELECT 
            u.nombre AS alumno,
            i.alumno_id,
            i.curso_id,
            i.fecha_inscripcion
        FROM inscripciones i
        JOIN usuarios u ON i.alumno_id = u.id
        ORDER BY i.fecha_inscripcion DESC
    `;

    db.all(sql, [], (err, filas) => {
        if (err) {
            console.error('Error al obtener inscripciones:', err);
            return res.render('admin/inscripciones/index', {
                inscripciones: [],
                usuario: req.session.usuario || null,
                appName: 'Panel Admin',
                error: 'Error al obtener datos'
            });
        }

        res.render('admin/inscripciones/index', {
            inscripciones: filas,
            usuario: req.session.usuario || null,
            appName: 'Panel Admin'
        });
    });
};

adminController.listarCategorias = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.nombre, c.descripcion, 
                   COUNT(cu.id) as total_cursos
            FROM categorias c
            LEFT JOIN cursos cu ON c.id = cu.categoria_id
            GROUP BY c.id
            ORDER BY c.nombre ASC`;

        const dbAll = util.promisify(db.all).bind(db);
        const categorias = await dbAll(query);

        res.render('admin/categorias/index', {
            categorias,
            usuario: req.session.usuario || null,
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).send('Error al cargar las categorías');
    }
};

module.exports = adminController;
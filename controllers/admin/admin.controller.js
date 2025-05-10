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
        const profesores = await Usuario.listar()
            .then(users => users.filter(u => u.rol === 'profesor'));
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

    // Convertimos db.all a una función basada en promesas
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

module.exports = adminController;
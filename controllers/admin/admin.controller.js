const adminController = {};
const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const cursoSchema = require('../../validators/curso.schema');

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
    
    // Validar con Joi
    const { error } = cursoSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        return res.status(400).render('admin/crear-curso/index', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            valores: req.body // Para mantener los valores ingresados
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

//Asignar profesores
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
            profesores: await Usuario.listar()
                .then(users => users.filter(u => u.rol === 'profesor')),
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
            profesores: await Usuario.listar()
                .then(users => users.filter(u => u.rol === 'profesor')),
            cursos: await Curso.listarDisponibles(),
            usuario: req.session.usuario || null
        });
    }
};

module.exports = adminController;
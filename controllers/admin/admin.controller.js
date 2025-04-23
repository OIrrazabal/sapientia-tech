const adminController = {};
const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');

adminController.home = (req, res) => {
    res.render('admin/home/index', {
        usuario: req.session.usuario || null
    });
};


adminController.mostrarFormulario = async (req, res) => {
    try {
        const profesores = await Usuario.listar()
            .then(users => users.filter(u => u.rol === 'profesor'));
        
        res.render('admin/crear-curso/index', {
            profesores,
            usuario: req.session.usuario || null,
            error: null
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/crear-curso/index', {
            error: 'Error al cargar el formulario',
            profesores: [],
            usuario: req.session.usuario || null
        });
    }
};

adminController.crearCurso = async (req, res) => {
    const { nombre, descripcion, profesor_id } = req.body;
    
    if (!nombre || !descripcion || !profesor_id) {
        return res.status(400).render('admin/crear-curso/index', {
            error: 'Todos los campos son requeridos',
            profesores: await Usuario.listar()
                .then(users => users.filter(u => u.rol === 'profesor')),
            usuario: req.session.usuario || null
        });
    }

    try {
        await Curso.crear({ nombre, descripcion, profesor_id });
        res.redirect('/admin/home');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/crear-curso/index', {
            error: 'Error al crear el curso',
            profesores: await Usuario.listar()
                .then(users => users.filter(u => u.rol === 'profesor')),
            usuario: req.session.usuario || null
        });
    }
};

module.exports = adminController;
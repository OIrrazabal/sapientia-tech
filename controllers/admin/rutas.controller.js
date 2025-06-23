const rutasController = {};
const RutaAprendizaje = require('../../models/ruta_aprendizaje.model');
const Curso = require('../../models/curso.model');
const { adminLogger } = require('../../logger');
const { validarNuevaRuta } = require('../../validators/ruta_aprendizaje.schema');

// Mostrar listado de rutas
rutasController.index = async (req, res) => {
    try {
        const rutas = await RutaAprendizaje.listar();
        
        // Verificar si hay mensaje o error en la sesión
        let mensaje = null;
        let error = null;
        
        if (req.session.mensaje) {
            mensaje = req.session.mensaje;
            delete req.session.mensaje; // Limpiar después de usar
        } else {
            mensaje = req.query.mensaje || null;
        }
        
        if (req.session.error) {
            error = req.session.error;
            delete req.session.error; // Limpiar después de usar
        } else {
            error = req.query.error || null;
        }
        
        res.render('admin/rutas/index', {
            titulo: 'Rutas de Aprendizaje',
            rutas,
            usuario: req.session.usuario,
            mensaje: mensaje,
            error: error
        });
    } catch (error) {
        adminLogger.error(`Error al listar rutas de aprendizaje: ${error.message}`);
        req.session.error = 'Error al cargar las rutas de aprendizaje';
        res.redirect('/admin/home');
    }
};

// Mostrar formulario para crear ruta
rutasController.mostrarCrearRuta = async (req, res) => {
    try {        // Verificar mensajes en la sesión
        let error = null;
        let mensaje = null;
        
        if (req.session.error) {
            error = req.session.error;
            delete req.session.error;
        } else {
            error = req.query.error || null;
        }
        
        if (req.session.mensaje) {
            mensaje = req.session.mensaje;
            delete req.session.mensaje;
        } else {
            mensaje = req.query.mensaje || null;
        }
        
        res.render('admin/rutas/nueva', {
            titulo: 'Crear Nueva Ruta de Aprendizaje',
            usuario: req.session.usuario,
            error: error,
            mensaje: mensaje,
            datos: req.session.datos ? req.session.datos : {}
        });
        delete req.session.datos;
    } catch (error) {
        adminLogger.error(`Error al mostrar formulario de crear ruta: ${error.message}`);
        res.redirect('/admin/rutas?mensaje=Error al mostrar el formulario de nueva ruta');
    }
};

// Crear nueva ruta
rutasController.crear = async (req, res) => {
    try {
        // Validación del formulario
        const validationResult = validarNuevaRuta(req.body);
        if (validationResult.error) {
            req.session.datos = req.body;
            req.session.error = validationResult.error.details[0].message;
            return res.redirect('/admin/rutas/nueva');
        }
        
        // Intentar crear la ruta en la base de datos
        const id = await RutaAprendizaje.crear({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion || ''
        });
        
        // Si se creó correctamente, registrar y redirigir al listado
        adminLogger.info(`Ruta de aprendizaje creada con ID: ${id}`);
        
        // Guardar mensaje en sesión y redirigir
        req.session.mensaje = "Ruta de aprendizaje creada correctamente";
        return res.redirect('/admin/rutas');
    } catch (error) {
        adminLogger.error(`Error al crear ruta de aprendizaje: ${error.message}`);
        
        // Log detallado para depuración
        console.log('Error detallado:', error);
        
        // Guardar los datos del formulario y el mensaje de error en la sesión
        req.session.datos = req.body;
        req.session.error = "Error al crear la ruta de aprendizaje: " + error.message;
        
        // Redireccionar sin parámetros en la URL
        return res.redirect('/admin/rutas/nueva');
    }
};
// Mostrar formulario para editar ruta
rutasController.mostrarEditarRuta = async (req, res) => {
    try {
        const id = req.params.id;
        const ruta = await RutaAprendizaje.obtenerPorId(id);
        
        if (!ruta) {
            return res.redirect('/admin/rutas?mensaje=Ruta no encontrada');
        }
        
        // Obtener los cursos de la ruta
        const cursosDeLaRuta = await RutaAprendizaje.obtenerCursos(id);
        
        // Obtener cursos que no están en ninguna ruta
        const cursosDisponibles = await Curso.listarCursosSinRuta();
        
        res.render('admin/rutas/editar', {
            titulo: 'Editar Ruta de Aprendizaje',
            usuario: req.session.usuario,
            ruta,
            cursosDeLaRuta,
            cursosDisponibles,
            error: req.query.error || null,
            mensaje: req.query.mensaje || null
        });
        
    } catch (error) {
        adminLogger.error(`Error al mostrar formulario de editar ruta: ${error.message}`);
        res.redirect('/admin/rutas?mensaje=Error al cargar el formulario de edición');
    }
};

// Actualizar ruta
rutasController.actualizar = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, descripcion } = req.body;
        
        // Validar datos
        const { error } = validarNuevaRuta({ nombre, descripcion });
        if (error) {
            return res.redirect(`/admin/rutas/${id}/editar?error=${error.details[0].message}`);
        }          // Actualizar en la base de datos
        await RutaAprendizaje.actualizar({
            id,
            nombre,
            descripcion: descripcion || ''
        });
        
        adminLogger.info(`Ruta de aprendizaje ID ${id} actualizada por admin (${req.session.usuario.email})`);
        res.redirect(`/admin/rutas/${id}/editar?mensaje=Ruta actualizada correctamente`);
        
    } catch (error) {
        adminLogger.error(`Error al actualizar ruta: ${error.message}`);
        res.redirect(`/admin/rutas/${req.params.id}/editar?error=Error al actualizar la ruta`);
    }
};

// Agregar curso a la ruta
rutasController.agregarCurso = async (req, res) => {
    try {        const rutaId = req.params.id;
        const { curso_id } = req.body;
        
        if (!curso_id) {
            return res.redirect(`/admin/rutas/${rutaId}/editar?error=Debe seleccionar un curso`);
        }
          // Verificar que el curso no esté ya en otra ruta
        const cursoRuta = await Curso.obtenerRutaAprendizaje(curso_id);
        if (cursoRuta) {
            return res.redirect(`/admin/rutas/${rutaId}/editar?error=El curso ya está asignado a otra ruta`);
        }
          // Agregar curso a la ruta
        await RutaAprendizaje.agregarCurso(rutaId, curso_id);
          adminLogger.info(`Curso ID ${curso_id} agregado a la ruta de aprendizaje ID ${rutaId} por admin (${req.session.usuario.email})`);
        res.redirect(`/admin/rutas/${rutaId}/editar?mensaje=Curso agregado correctamente`);
        
    } catch (error) {
        adminLogger.error(`Error al agregar curso a la ruta: ${error.message}`);
        res.redirect(`/admin/rutas/${req.params.id}/editar?error=Error al agregar el curso a la ruta`);
    }
};

// Quitar curso de la ruta
rutasController.quitarCurso = async (req, res) => {
    try {
        const rutaId = req.params.id;
        const cursoId = req.params.cursoId;
          // Quitar curso de la ruta
        await RutaAprendizaje.quitarCurso(rutaId, cursoId);
        
        adminLogger.info(`Curso ID ${cursoId} removido de la ruta de aprendizaje ID ${rutaId} por admin (${req.session.usuario.email})`);
        res.redirect(`/admin/rutas/${rutaId}/editar?mensaje=Curso removido correctamente`);
        
    } catch (error) {
        adminLogger.error(`Error al quitar curso de la ruta: ${error.message}`);
        res.redirect(`/admin/rutas/${req.params.id}/editar?error=Error al quitar el curso de la ruta`);
    }
};

// Eliminar ruta
rutasController.eliminar = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Primero eliminar las relaciones con cursos
        await RutaAprendizaje.quitarTodosCursos(id);
          // Luego eliminar la ruta
        await RutaAprendizaje.eliminar(id);
          adminLogger.info(`Ruta de aprendizaje ID ${id} eliminada por admin (${req.session.usuario.email})`);
        
        // Guardar mensaje en la sesión para asegurar que se muestre después de la redirección
        req.session.mensaje = "Ruta eliminada correctamente";
        res.redirect('/admin/rutas');
        
    } catch (error) {        adminLogger.error(`Error al eliminar ruta: ${error.message}`);
        
        // Guardar mensaje de error en la sesión
        req.session.error = "Error al eliminar la ruta";
        res.redirect('/admin/rutas');
    }
};

module.exports = rutasController;

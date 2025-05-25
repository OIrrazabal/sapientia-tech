const adminController = {};
const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const Categoria = require('../../models/categorias.model');
const cursoSchema = require('../../validators/curso.schema');
const categoriaSchema = require('../../validators/categoria.schema');
const db = require('../../db/conexion');
const util = require('util');
const usuarioSchema = require('../../validators/usuario.schema');
const bcrypt = require('bcrypt');

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
          u.id AS alumno_id,
          u.nombre AS alumno,
          c.nombre AS curso,
          c.id AS curso_id,
          i.fecha_inscripcion
    FROM inscripciones i
    JOIN usuarios u ON i.alumno_id = u.id
    JOIN cursos c ON i.curso_id = c.id
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
        const categorias = await Categoria.listarConTotalCursos();

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

adminController.mostrarFormularioCategoria = async (req, res) => {
    try {
        res.render('admin/categorias/nueva', {
            usuario: req.session.usuario || null,
            error: null,
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/categorias/nueva', {
            error: 'Error al cargar el formulario',
            usuario: req.session.usuario || null,
            appName: 'eLEARNING'
        });
    }
};

adminController.crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const { error } = categoriaSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).render('admin/categorias/nueva', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'eLEARNING'
        });
    }

    try {
        // Verificar si ya existe una categoría con el mismo nombre
        const existe = await Categoria.existeNombre(nombre);
        if (existe) {
            return res.status(400).render('admin/categorias/nueva', {
                error: 'Ya existe una categoría con ese nombre',
                usuario: req.session.usuario || null,
                valores: req.body,
                appName: 'eLEARNING'
            });
        }

        await Categoria.crear({ nombre, descripcion });
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/categorias/nueva', {
            error: 'Error al crear la categoría',
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'eLEARNING'
        });
    }
};

adminController.mostrarFormularioEditar = async (req, res) => {
    const id = req.params.id;
    
    try {
        const categoria = await Categoria.obtenerPorId(id);
        
        if (!categoria) {
            return res.redirect('/admin/categorias');
        }

        res.render('admin/categorias/editar', {
            categoria,
            usuario: req.session.usuario || null,
            error: null,
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/categorias');
    }
};

adminController.editarCategoria = async (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion } = req.body;
    const { error } = categoriaSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).render('admin/categorias/editar', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            categoria: { id, nombre, descripcion },
            appName: 'eLEARNING'
        });
    }

    try {
        // Verificar si existe la categoría
        const categoriaExistente = await Categoria.obtenerPorId(id);
        if (!categoriaExistente) {
            return res.redirect('/admin/categorias');
        }

        // Verificar si ya existe otra categoría con el mismo nombre
        const existe = await Categoria.existeNombreExceptoId(nombre, id);
        if (existe) {
            return res.status(400).render('admin/categorias/editar', {
                error: 'Ya existe otra categoría con ese nombre',
                usuario: req.session.usuario || null,
                categoria: { id, ...req.body },
                appName: 'eLEARNING'
            });
        }

        await Categoria.actualizar(id, { nombre, descripcion });
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/categorias/editar', {
            error: 'Error al actualizar la categoría',
            usuario: req.session.usuario || null,
            categoria: { id, ...req.body },
            appName: 'eLEARNING'
        });
    }
};

// Mostrar formulario para crear usuario
adminController.mostrarFormularioUsuario = async (req, res) => {
    try {
        res.render('admin/usuarios/nuevo', {
            usuario: req.session.usuario || null,
            error: null,
            valores: {},
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/usuarios/nuevo', {
            error: 'Error al cargar el formulario',
            usuario: req.session.usuario || null,
            valores: {},
            appName: 'eLEARNING'
        });
    }
};

// Crear usuario
adminController.crearUsuario = async (req, res) => {
    const { nombre, email, password, rol, telefono, direccion } = req.body;
    const es_admin = (rol === 'admin') ? 1 : 0;
    
    // Validar datos con Joi
    const { error } = usuarioSchema.validate({
        ...req.body,
        es_admin
    }, { abortEarly: false });
    
    if (error) {
        return res.status(400).render('admin/usuarios/nuevo', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'eLEARNING'
        });
    }
    
    try {
        // Verificar si ya existe un usuario con el mismo email
        const existeUsuario = await Usuario.obtenerPorEmail(email);
        if (existeUsuario) {
            return res.status(400).render('admin/usuarios/nuevo', {
                error: 'Ya existe un usuario con ese correo electrónico',
                usuario: req.session.usuario || null,
                valores: req.body,
                appName: 'eLEARNING'
            });
        }
        
        // Encriptar contraseña
        const contraseñaHash = await bcrypt.hash(password, 10);
        
        // Crear usuario
        await Usuario.crear({
            nombre,
            email,
            contraseña: contraseñaHash,
            es_admin,
            telefono: telefono || '',
            direccion: direccion || '',
            rol
        });
        
        res.redirect('/admin/usuarios');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).render('admin/usuarios/nuevo', {
            error: 'Error al crear el usuario',
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'eLEARNING'
        });
    }
};

// Mostrar formulario para editar usuario
adminController.mostrarFormularioEditar = async (req, res) => {
    const id = req.params.id;
    
    try {
        const usuarioData = await Usuario.obtenerPorId(id);
        
        if (!usuarioData) {
            return res.redirect('/admin/usuarios');
        }

        res.render('admin/usuarios/editar', {
            usuario: req.session.usuario || null,
            usuarioData,
            error: null,
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/usuarios');
    }
};

// Editar usuario
adminController.editarUsuario = async (req, res) => {
    const id = req.params.id;
    const { nombre, email, password, rol, telefono, direccion } = req.body;
    const es_admin = (rol === 'admin') ? 1 : 0;
    
    // Validar datos con el esquema
    const { error } = usuarioSchema.validate({
        ...req.body,
        es_admin
    }, { abortEarly: false });
    
    if (error) {
        return res.status(400).render('admin/usuarios/editar', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            usuarioData: { id, ...req.body },
            appName: 'eLEARNING'
        });
    }
    
    try {
        // Verificar si existe el usuario
        const usuarioExistente = await Usuario.obtenerPorId(id);
        if (!usuarioExistente) {
            return res.redirect('/admin/usuarios');
        }
        
        // Verificar si existe otro usuario con el mismo email
        const existeEmail = await Usuario.existeEmailExceptoId(email, id);
        if (existeEmail) {
            return res.status(400).render('admin/usuarios/editar', {
                error: 'Ya existe otro usuario con ese correo electrónico',
                usuario: req.session.usuario || null,
                usuarioData: { id, ...req.body },
                appName: 'eLEARNING'
            });
        }
        
        // Preparar objeto con datos actualizados
        const datosActualizados = {
            nombre,
            email,
            es_admin,
            telefono: telefono || '',
            direccion: direccion || '',
            rol
        };
        
        // Si hay contraseña nueva, hasheamos y actualizamos
        if (password && password.trim() !== '') {
            datosActualizados.contraseña = await bcrypt.hash(password, 10);
        }
        
        // Actualizar usuario
        await Usuario.actualizar(id, datosActualizados);
        
        res.redirect('/admin/usuarios');
    } catch (error) {
        console.error('Error al editar usuario:', error);
        res.status(500).render('admin/usuarios/editar', {
            error: 'Error al actualizar el usuario',
            usuario: req.session.usuario || null,
            usuarioData: { id, ...req.body },
            appName: 'eLEARNING'
        });
    }
};

module.exports = adminController;
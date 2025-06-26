const adminController = {};
const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const Categoria = require('../../models/categorias.model');
const Correlatividad = require('../../models/correlatividad.model');
const cursoSchema = require('../../validators/curso.schema');
const categoriaSchema = require('../../validators/categoria.schema');
const db = require('../../db/conexion');
const util = require('util');
const usuarioSchema = require('../../validators/usuario.schema');
const bcrypt = require('bcrypt');
const Inscripcion = require('../../models/inscripcion.model');
const { homeLogger } = require('../../logger');
const path = require('path');
const ejs = require('ejs'); // Agrega esta línea
const fs = require('fs').promises;
const { adminLogger } = require('../../logger');
const { enviarCorreo } = require('../../utils/mailer'); // Ajusta la ruta si es diferente


// Home del Admin
adminController.home = (req, res) => {
    const usuario = req.session.usuario;
    const logMessage = usuario ? 
    `Admin home access - User ID: ${usuario.id}, Email: ${usuario.email}` :
    'Admin home access - No user session';

    homeLogger.debug(logMessage);

    res.render('admin/home/index', {
    usuario: usuario || null
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

 // 
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
    const cursoCreado = await Curso.crear({ nombre, descripcion });

    if (req.session.usuario?.es_admin) {
      adminLogger.debug(`Recurso: Curso, ID: ${cursoCreado.id} creado por admin (${req.session.usuario.email})`);
    }

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
  // Redirigir a la ruta unificada para asignar profesores
  res.redirect('/admin/asignaciones/nueva');
};

adminController.procesarAsignacionProfesor = async (req, res) => {
  try {
    const { curso_id, profesor_id } = req.body;
    
    // Redirect to the standardized route
    res.redirect(`/admin/asignaciones/crear?curso_id=${curso_id}&profesor_id=${profesor_id}`);
  } catch (error) {
    console.error('Error al asignar profesor:', error);
    res.status(500).send('Error al procesar la asignación');
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
      appName: 'Sapientia Tech Courses',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener asignaciones');
  }
};

// Formulario para nueva asignación (desde botón CREAR)
adminController.nuevaAsignacion = async (req, res) => {
  try {
    // Obtener cursos disponibles
    const cursos = await Curso.listarDisponibles();
    
    // Obtener usuarios y asegurar que sea un array
    let usuarios = await Usuario.listar();
    // Protección en caso de que no sea array
    if (!Array.isArray(usuarios)) {
      console.warn("Usuario.listar() no devolvió un array:", usuarios);
      usuarios = [];
    }
    
    // Log para depurar
    console.log("Usuarios obtenidos:", usuarios.length);
    
    res.render('admin/asignaciones/nueva', {
      cursos: Array.isArray(cursos) ? cursos : [],
      profesores: usuarios, 
      error: null,
      usuario: req.session.usuario,
      appName: 'Sapientia Tech Courses'
    });
  } catch (error) {
    console.error('Error al cargar formulario de nueva asignación:', error);
    res.status(500).send('Error al cargar el formulario');
  }
};

// Procesar creación de nueva asignación con validación
adminController.crearAsignacionDesdeListado = async (req, res) => {
  // Get params either from form body or from query params (when redirected)
  let curso_id = req.body.curso_id || req.query.curso_id;
  let profesor_id = req.body.profesor_id || req.query.profesor_id;

  // If we have query params but no body params, it's a GET request redirected from /admin/asignar-profesor
  const isRedirected = !req.body.curso_id && req.query.curso_id;

  if (!curso_id || !profesor_id) {
    // If it's just accessing the page without params, show the form
    if (isRedirected) {
      return res.redirect('/admin/asignaciones/nueva');
    }
    return res.status(400).send('Campos obligatorios');
  }

  try {
    // Primero asignar el profesor al curso (esto actualiza la tabla cursos)
    await Curso.asignarProfesor(curso_id, profesor_id);
    
    // Verificar si ya existe la asignación en la tabla asignaciones
    const dbGet = util.promisify(db.get).bind(db);
    const query = `SELECT * FROM asignaciones WHERE id_curso = ? AND id_profesor = ?`;
    const existente = await dbGet(query, [curso_id, profesor_id]);

    if (existente) {
      const profesores = await Usuario.listar();
      const cursos = await Curso.listar();
      return res.status(400).render('admin/asignaciones/nueva', {
        profesores,
        cursos,
        usuario: req.session.usuario || null,
        appName: 'Sapientia Tech Courses',
        error: 'Este profesor ya está asignado a ese curso.'
      });
    }

    // Si no existe, insertar la asignación
    const dbRun = util.promisify(db.run).bind(db);
    await dbRun(`INSERT INTO asignaciones (id_curso, id_profesor) VALUES (?, ?)`, [curso_id, profesor_id]);
    const lastInsert = await dbGet(`SELECT last_insert_rowid() AS id`);
    
    // Skip email sending to avoid the ECONNREFUSED error
    if (req.session.usuario?.es_admin) {
      adminLogger.debug(`Recurso: Asignación, ID: ${lastInsert.id} creada por admin (${req.session.usuario.email})`);
    }

    // Redirect with success message
    res.redirect('/admin/asignaciones?mensaje=Profesor asignado correctamente');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('No se pudo crear la asignación');
  }
};
adminController.eliminarAsignacion = async (req, res) => {
  const id = req.params.id;
  try {
    const dbGet = util.promisify(db.get).bind(db);
    const dbRun = util.promisify(db.run).bind(db);

    // Obtener la asignación antes de eliminarla
    const asignacion = await dbGet('SELECT id_curso FROM asignaciones WHERE id = ?', [id]);

    // Eliminar de la tabla asignaciones
    await dbRun('DELETE FROM asignaciones WHERE id = ?', [id]);

    // Actualizar profesor_id a NULL en la tabla cursos
    if (asignacion) {
      await dbRun('UPDATE cursos SET profesor_id = NULL WHERE id = ?', [asignacion.id_curso]);
    }

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
            appName: 'Sapientia Tech Courses' // o el nombre de tu app
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
            appName: 'Sapientia Tech Courses',
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
            appName: 'Sapientia Tech Courses',	
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/categorias/nueva', {
            error: 'Error al cargar el formulario',
            usuario: req.session.usuario || null,
            appName: 'Sapientia Tech Courses',
        });
    }
};

adminController.crearCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const { error } = categoriaSchema.validate(req.body, { abortEarly: false });
    let imagen = null;

    if (error) {
        return res.status(400).render('admin/categorias/nueva', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'Sapientia Tech Courses'
        });
    }

    try {
        // Si hay archivo subido, usar su nombre
        if (req.file) {
            imagen = req.file.filename;
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const existe = await Categoria.existeNombre(nombre);
        if (existe) {
            if (req.file) {
                await Categoria.eliminarImagen(req.file.path);
            }
            return res.status(400).render('admin/categorias/nueva', {
                error: 'Ya existe una categoría con ese nombre',
                usuario: req.session.usuario || null,
                valores: req.body,
                appName: 'Sapientia Tech Courses'	
            });
        }

        await Categoria.crear({ 
            nombre, 
            descripcion,
            imagen: imagen || 'default.jpg'
        });
        
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error:', error);
        if (req.file) {
            await Categoria.eliminarImagen(req.file.path);
        }
        res.status(500).render('admin/categorias/nueva', {
            error: 'Error al crear la categoría',
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'Sapientia Tech Courses'
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
            appName: 'Sapientia Tech Courses'	
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/categorias');
    }
};

adminController.mostrarFormularioEditarCategoria = async (req, res) => {
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
            appName: 'Sapientia Tech Courses'
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
            categoria: { id, ...req.body },
            appName: 'Sapientia Tech Courses'
        });
    }

    try {
        // Verificar si existe la categoría
        const categoriaExistente = await Categoria.obtenerPorId(id);
        if (!categoriaExistente) {
            if (req.file) {
                await Categoria.eliminarImagen(req.file.path);
            }
            return res.redirect('/admin/categorias');
        }

        // Verificar nombre duplicado
        const existe = await Categoria.existeNombreExceptoId(nombre, id);
        if (existe) {
            if (req.file) {
                await Categoria.eliminarImagen(req.file.path);
            }
            return res.status(400).render('admin/categorias/editar', {
                error: 'Ya existe otra categoría con ese nombre',
                usuario: req.session.usuario || null,
                categoria: { id, ...req.body },
                appName: 'Sapientia Tech Courses'
            });
        }

        let imagen = categoriaExistente.imagen;
        if (req.file) {
            if (categoriaExistente.imagen && categoriaExistente.imagen !== 'default.jpg') {
                await Categoria.eliminarImagen(
                    path.join(__dirname, '../../assets/categorias', categoriaExistente.imagen)
                );
            }
            imagen = req.file.filename;
        }
        
        await Categoria.actualizar(id, { nombre, descripcion, imagen });
        res.redirect('/admin/categorias');
    } catch (error) {
        console.error('Error:', error);
        if (req.file) {
            await Categoria.eliminarImagen(req.file.path);
        }
        res.status(500).render('admin/categorias/editar', {
            error: 'Error al actualizar la categoría',
            usuario: req.session.usuario || null,
            categoria: { id, ...req.body },
            appName: 'Sapientia Tech Courses'
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
            appName: 'Sapientia Tech Courses'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('admin/usuarios/nuevo', {
            error: 'Error al cargar el formulario',
            usuario: req.session.usuario || null,
            valores: {},
            appName: 'Sapientia Tech Courses'
        });
    }
};

// Crear usuario
adminController.crearUsuario = async (req, res) => {
    const { nombre, email, password, es_admin, telefono, direccion } = req.body;
    const admin = (es_admin === '1' || es_admin === 'true') ? 1 : 0;
    
    // Validar datos with Joi
    const { error } = usuarioSchema.validate({
        ...req.body,
        es_admin: admin
    }, { abortEarly: false });
    
    if (error) {
        return res.status(400).render('admin/usuarios/nuevo', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'Sapientia Tech Courses'
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
                appName: 'Sapientia Tech Courses'
            });
        }
        
        // Encriptar contraseña
        const contraseñaHash = await bcrypt.hash(password, 10);
        
        // Crear usuario
        await Usuario.crear({
            nombre,
            email,
            contraseña: contraseñaHash,
            es_admin: es_admin ? 1 : 0,
            telefono: telefono || '',
            direccion: direccion || ''
        });
        
        res.redirect('/admin/usuarios');
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).render('admin/usuarios/nuevo', {
            error: 'Error al crear el usuario',
            usuario: req.session.usuario || null,
            valores: req.body,
            appName: 'Sapientia Tech Courses'
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
            appName: 'Sapientia Tech Courses'
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin/usuarios');
    }
};

// Editar usuario
adminController.editarUsuario = async (req, res) => {
    const id = req.params.id;
    const { nombre, email, password, es_admin, telefono, direccion } = req.body;
    const admin = (es_admin === '1' || es_admin === 'true') ? 1 : 0;
    
    // Validar datos con el esquema
    const { error } = usuarioSchema.validate({
        ...req.body,
        es_admin: admin
    }, { abortEarly: false });
    
    if (error) {
        return res.status(400).render('admin/usuarios/editar', {
            error: error.details.map(err => err.message).join('. '),
            usuario: req.session.usuario || null,
            usuarioData: { id, ...req.body },
            appName: 'Sapientia Tech Courses'
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
                appName: 'Sapientia Tech Courses'
            });
        }
        
        // Preparar objeto con datos actualizados
        const datosActualizados = {
            nombre,
            email,
            es_admin: es_admin ? 1 : 0,
            telefono: telefono || '',
            direccion: direccion || ''
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
            appName: 'Sapientia Tech Courses'
        });
    }
};

// Eliminar inscripción
adminController.eliminarInscripcion = (req, res) => {
    const { alumno_id, curso_id } = req.params;
    const sql = `
        DELETE FROM inscripciones
        WHERE alumno_id = ? AND curso_id = ?
    `;

    db.run(sql, [alumno_id, curso_id], function (err) {
        if (err) {
            console.error('Error al eliminar inscripción:', err);
            return res.status(500).send('Error al eliminar la inscripción');
        }

        // Redirigir al listado actualizado
        res.redirect('/admin/inscripciones');
    });
};

// Nueva Inscripción - Formulario
adminController.formNuevaInscripcion = (req, res) => {
    Inscripcion.obtenerAlumnos((errAlumnos, alumnos) => {
        if (errAlumnos) {
            console.error('Error al obtener alumnos:', errAlumnos);
            return res.status(500).send('Error al cargar los alumnos');
        }

        Inscripcion.obtenerCursosPublicados((errCursos, cursos) => {
            if (errCursos) {
                console.error('Error al obtener cursos:', errCursos);
                return res.status(500).send('Error al cargar los cursos');
            }
            res.render('admin/Inscripciones/nueva', {
                alumnos,
                cursos,
                error: null,
                success: null,
                usuario: req.session.usuario || null,
                appName: 'Panel Admin'
            });
        });
    });
};

// Validar que no exista ya la inscripción
adminController.registrarInscripcion = (req, res) => {
    const { alumno_id, curso_id } = req.body;

    Inscripcion.existeInscripcion(alumno_id, curso_id, (err, existe) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al verificar inscripción existente.');
        }

        Inscripcion.obtenerAlumnos((errAlumnos, alumnos) => {
            if (errAlumnos) return res.status(500).send('Error al cargar alumnos.');

            Inscripcion.obtenerCursosPublicados((errCursos, cursos) => {
                if (errCursos) return res.status(500).send('Error al cargar cursos.');

                if (existe) {
                    return res.render('admin/Inscripciones/nueva', {
                        error: 'El alumno ya está inscrito en ese curso.',
                        success: null,
                        alumnos,
                        cursos,
                        usuario: req.session.usuario || null,
                        appName: 'Panel Admin'
                    });
                }

                Inscripcion.insertar(alumno_id, curso_id, (err2) => {
                    if (err2) {
                        console.error(err2);
                        return res.status(500).send('Error al guardar la inscripción.');
                    }

                    res.render('admin/Inscripciones/nueva', {
                        success: 'Inscripción realizada correctamente.',
                        error: null,
                        alumnos,
                        cursos,
                        usuario: req.session.usuario || null,
                        appName: 'Panel Admin'
                    });
                });
            });
        });
    });
};
const verEstadisticas = async (req, res) => {
    try {
        const [
            totalCursosPublicados,
            totalCursosNoPublicados,
            totalUsuarios,
            totalAlumnosInscriptos,
            totalProfesoresAsignados
        ] = await Promise.all([
            Curso.contarPublicados(true),
            Curso.contarPublicados(false),
            Usuario.contarTodos(),
            Curso.contarInscriptosUnicos(),
            Curso.contarProfesoresUnicos()
        ]);

        res.render('admin/estadisticas/estadisticas', {
            usuario: req.session.usuario,
            appName: 'eLEARNING',
            totalCursosPublicados,
            totalCursosNoPublicados,
            totalUsuarios,
            totalAlumnosInscriptos,
            totalProfesoresAsignados
        });
    } catch (error) {
        console.error('Error al mostrar estadísticas:', error);
        res.status(500).send('Error al cargar las estadísticas');
    }
};
adminController.verEstadisticas = verEstadisticas;

adminController.mostrarFormularioCurso = async (req, res) => {
    const id = req.params.id;

    try {
        // Obtener todas las categorías para mostrarlas en el formulario
        const categorias = await Categoria.listarConTotalCursos();

        if (id) {
            const curso = await Curso.obtenerPorId(id);
            if (!curso) return res.redirect('/admin/home');

            return res.render('admin/crear-curso/index', {
                editando: true,
                curso,
                categorias,
                usuario: req.session.usuario || null,
                appName: 'eLEARNING'
            });
        }

        res.render('admin/crear-curso/index', {
            editando: false,
            curso: {},
            categorias,
            usuario: req.session.usuario || null,
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error al cargar formulario de curso:', error);
        res.status(500).send('Error al cargar el formulario');
    }
};
adminController.guardarCurso = async (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, categoria_id } = req.body;

    try {
        let curso;

        if (id) {
            await Curso.actualizar(id, { nombre, descripcion, categoria_id });
            curso = { id, nombre, descripcion, categoria_id };
        } else {
            curso = await Curso.crear({ nombre, descripcion, categoria_id });
        }

        // Manejo de imagen
        if (req.file) {
            const path = require('path');
            const fs = require('fs').promises;

            const ext = path.extname(req.file.originalname).toLowerCase();
            const carpeta = path.join(__dirname, '../../assets/cursos');
            const nombreFinal = `${curso.id}${ext}`;
            const rutaFinal = path.join(carpeta, nombreFinal);

            const archivos = await fs.readdir(carpeta);
            for (const archivo of archivos) {
                if (archivo.startsWith(`${curso.id}.`) && archivo !== nombreFinal) {
                    await fs.unlink(path.join(carpeta, archivo));
                }
            }

            await fs.rename(req.file.path, rutaFinal);
        }

        res.redirect('/admin/home');
    } catch (error) {
        console.error('Error al guardar curso:', error);
        res.status(500).send('Error al guardar curso.');
    }
};
adminController.listarCursos = async (req, res) => {
    try {
        const cursos = await Curso.obtenerTodos(); // debe estar en curso.model.js
        res.render('admin/editar-curso/index', {
            cursos,
            usuario: req.session.usuario || null,
            appName: 'eLEARNING'
        });
    } catch (error) {
        console.error('Error al listar cursos:', error);
        res.status(500).send('No se pudieron cargar los cursos');
    }
};

// NUEVA FUNCIÓN: Sincronización automática (función interna, no una ruta)
async function sincronizarTablasAsignaciones() {
  try {
    const dbAll = util.promisify(db.all).bind(db);
    const dbRun = util.promisify(db.run).bind(db);
    
    // 1. Encontrar cursos con profesor_id pero sin registro en asignaciones
    const cursosSinAsignacion = await dbAll(`
      SELECT c.id, c.profesor_id 
      FROM cursos c 
      LEFT JOIN asignaciones a ON c.id = a.id_curso AND c.profesor_id = a.id_profesor
      WHERE c.profesor_id IS NOT NULL 
      AND c.profesor_id != 0
      AND a.id IS NULL
    `);
    
    // Crear asignaciones para estos cursos
    for (const curso of cursosSinAsignacion) {
      await dbRun(
        'INSERT INTO asignaciones (id_curso, id_profesor) VALUES (?, ?)',
        [curso.id, curso.profesor_id]
      );
    }
    
    // 2. Corregir cursos que deberían ser NULL en profesor_id
    await dbRun(`
      UPDATE cursos SET profesor_id = NULL
      WHERE id NOT IN (SELECT id_curso FROM asignaciones)
    `);
    
    console.log("Tablas sincronizadas automáticamente");
  } catch (error) {
    console.error('Error en sincronización automática:', error);
  }
}

module.exports = adminController;
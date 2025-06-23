const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const Valoracion = require('../../models/valoracion.model');
const bcrypt = require('bcrypt');
const inscripcionSchema = require('../../validators/inscripcion.schema');
const valoracionSchema = require('../../validators/valoracion.schema');
const { homeLogger } = require('../../logger');
const usuarioSchema = require('../../validators/usuario.schema');
const path = require('path');
const fs = require('fs').promises;
const FileType = require('file-type');
const multer = require('multer');
const mkdirp = require('mkdirp');
const dbHandler = require('../../db/db.handler');
const checkDiskSpace = require('check-disk-space').default;

const authController = {};

authController.redirectHome = (req, res) => {
  res.redirect('/auth/home');
};

authController.home = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const logMessage = usuario ? 
      `Auth home access - User ID: ${usuario.id}, Email: ${usuario.email}` :
      'Auth home access - No user session';

    homeLogger.debug(logMessage);

    const usuarios = await Usuario.listar();
    const profesores = await Usuario.getProfesores();
    const categoriasPopulares = await Curso.getCategoriasPopulares(4);
    const cursosPopulares = await Curso.getCursosPopulares();

    let valoraciones = [];
    try {
      valoraciones = await Valoracion.getUltimasValoraciones(10);
    } catch (error) {
      console.error("Error obteniendo valoraciones:", error);
    }

    res.render("auth/home/index", {
      usuario: req.session.usuario || null,
      appName: process.env.APP_NAME || "eLEARNING",
      profesores: profesores || [],
      cursosPopulares,
      categoriasPopulares: categoriasPopulares || [],
      valoraciones: valoraciones || []
    });
  } catch (error) {
    console.error("Error en auth/home:", error);
    res.status(500).send('server error');
  }
};

authController.loginForm = (req, res) => {
  res.render('auth/login/index', { error: req.query.error });
};

authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuarios = await Usuario.findOne({ email });
    const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;

    if (!usuario) {
      return res.redirect('/public/login?error=Usuario no encontrado');
    }

    if (usuario.activo === 0) {
      return res.redirect('/public/login?error=La cuenta está desactivada');
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

authController.confirmarBajaPaso1 = (req, res) => {
  res.render('auth/dar-de-baja', {
    paso: 1,
    usuario: req.session.usuario,
    appName: process.env.APP_NAME || 'eLEARNING'
  });
};

authController.confirmarBajaPaso2 = async (req, res) => {
  const usuario = req.session.usuario;

  if (!usuario || usuario.es_admin) {
    return res.redirect('/auth/home');
  }

  if (!req.body.confirmado) {
    return res.render('auth/dar-de-baja', {
      paso: 2,
      usuario: req.session.usuario,
      appName: process.env.APP_NAME || 'eLEARNING'
    });
  }

  try {
    await Usuario.actualizar(usuario.id, {
      nombre: usuario.nombre,
      email: usuario.email,
      contraseña: usuario.contraseña,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      es_admin: usuario.es_admin,
      activo: 0
    });

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/public/login?error=Cuenta desactivada');
    });
  } catch (error) {
    console.error('Error al dar de baja:', error);
    res.redirect('/auth/home');
  }
};

authController.darDeBajaUsuario = async (req, res) => {
  const usuario = req.session.usuario;

  if (!usuario || usuario.es_admin) {
    return res.redirect('/auth/home');
  }

  try {
    await Usuario.actualizar(usuario.id, {
      nombre: usuario.nombre,
      email: usuario.email,
      contraseña: usuario.contraseña,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      es_admin: usuario.es_admin,
      activo: 0
    });

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.redirect('/public/login?mensaje=Cuenta desactivada');
    });
  } catch (error) {
    console.error('Error al dar de baja:', error);
    res.status(500).send('Error del servidor');
  }
};

authController.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.redirect('/public/login');
  });
};

//Obtener cursos donde el usuario es profesor
authController.misCursos = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        
        // Obtener cursos donde soy profesor
        const cursos = await Curso.getCursosByProfesor(usuario.id);
        
        // Obtener cursos donde estoy inscrito como alumno
        const cursosComoAlumno = await Curso.getCursosByAlumno(usuario.id);
        
        res.render('auth/mis-cursos', { 
            cursos: cursos || [], 
            cursosComoAlumno: cursosComoAlumno || [],
            usuario: req.session.usuario 
        });
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.render('auth/mis-cursos', { 
            cursos: [],
            cursosComoAlumno: [], 
            usuario: req.session.usuario 
        });
    }
};

// Listar cursos donde el usuario es alumno
authController.misCursosAlumno = async (req, res) => {
    const usuario = req.session.usuario;
    if (!usuario) {
        return res.status(403).send("Acceso denegado");
    }
    try {
        // Busca cursos donde el usuario es alumno
        const cursos = await Curso.getCursosByAlumno(usuario.id);
        if (!cursos || cursos.length === 0) {
            return res.status(403).send("No tienes cursos como alumno");
        }
        res.render('auth/mis-cursos-alumno', { cursos, usuario });
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.render('auth/mis-cursos-alumno', { cursos: [], usuario });
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
authController.redirectMisCursos = async (req, res) => {
    if (req.session.usuario) {
        const usuario = req.session.usuario;
        // Consulta si tiene cursos como profesor
        const cursosProfesor = await Curso.getCursosByProfesor(usuario.id);
        if (cursosProfesor && cursosProfesor.length > 0) {
            return res.redirect('/auth/mis-cursos');
        }
        // Consulta si tiene cursos como alumno
        const cursosAlumno = await Curso.getCursosByAlumno(usuario.id);
        if (cursosAlumno && cursosAlumno.length > 0) {
            return res.redirect('/auth/mis-cursos-alumno');
        }
        // Si no tiene cursos, redirige al home
        return res.redirect('/auth/home');
    } else {
        return res.redirect('/public/login');
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
        
        // Obtener valoraciones del curso
        const valoraciones = await Valoracion.getValoracionesByCurso(cursoId);
        const estadisticas = await Valoracion.getPromedioByCurso(cursoId);
        
        // Verificar si el usuario ya ha valorado el curso
        const valoracionUsuario = await Valoracion.existeValoracion(cursoId, usuario.id);
        
        // Nuevo: Obtener información de la ruta de aprendizaje
        const rutaAprendizaje = await Curso.obtenerRutaAprendizaje(cursoId);
        
        res.render('auth/ver-curso', {
            usuario,
            curso,
            rutaAprendizaje, // Nueva variable en la vista
            secciones,
            esProfesor: curso.profesor_id === usuario.id,
            estaInscrito: !!inscripcion,
            valoraciones: valoraciones || [],
            estadisticas: estadisticas || { promedio: 0, total: 0 },
            yaValorado: !!valoracionUsuario
        });
    } catch (error) {
        console.error('Error al obtener curso:', error);
        res.redirect('/auth/home');
    }
};

// Mostrar formulario para agregar sección
authController.mostrarFormularioSeccion = async (req, res) => {
  const cursoId = req.params.id;
  const usuario = req.session.usuario;
  
  try {
    const curso = await Curso.getCursoById(cursoId);
    
    if (!curso || curso.profesor_id !== usuario.id) {
      return res.redirect('/auth/mis-cursos');
    }
    
    res.render('auth/secciones', {
      curso,
      usuario
    });
  } catch (error) {
    console.error("Error al cargar formulario:", error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar el formulario de secciones',
      usuario
    });
  }
};

// Configuración de almacenamiento para videos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const cursoId = req.params.id;
    // Almacenamos temporalmente hasta conocer el ID de la sección
    const uploadDir = path.join(__dirname, '../../temp');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      await mkdirp(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Guardar con nombre original
    cb(null, file.originalname);
  }
});

// Filtro de archivos para videos con validación mejorada
const fileFilter = (req, file, cb) => {
  // Verificar tipo MIME
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
    // Verificar extensión
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.mp4' || ext === '.webm') {
      cb(null, true);
    } else {
      cb(new Error('La extensión del archivo no coincide con el tipo de contenido.'), false);
    }
  } else {
    cb(new Error('Formato no permitido. Solo se aceptan MP4 o WebM.'), false);
  }
};

// Configurar multer con límite de tamaño (3MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: fileFilter
});

// Agregar sección con video opcional
authController.agregarSeccion = async (req, res) => {
  const cursoId = req.params.id;
  const usuario = req.session.usuario;
  let videoPath = null;

  try {
    // Validar que el usuario sea el profesor del curso
    const curso = await Curso.getCursoById(cursoId);
    
    if (!curso) {
      return res.status(404).render('error', { 
        mensaje: 'Curso no encontrado',
        usuario
      });
    }
    
    if (curso.profesor_id !== usuario.id) {
      return res.status(403).render('error', {
        mensaje: 'No tienes permiso para agregar secciones a este curso',
        usuario
      });
    }

    // Primero agregamos la sección a la base de datos
    const resultSeccion = await Curso.agregarSeccion(
      req.body.nombre,
      req.body.descripcion,
      cursoId,
      null // Inicialmente sin video
    );
    
    // Obtenemos el ID de la sección recién creada
    const secciones = await Curso.getSeccionesByCurso(cursoId);
    const seccionId = secciones[secciones.length - 1].id; // Última sección insertada
    
    // Si hay un archivo de video, procesarlo
    if (req.file) {
      try {
        // Crear la estructura de directorios para el video
        const videoDir = path.join(__dirname, '../../assets/videos', cursoId.toString(), seccionId.toString());
        
        // Crear el directorio si no existe (usando fs.promises correctamente)
        try {
          await fs.mkdir(videoDir, { recursive: true });
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
        
        // Ruta final del archivo
        const targetPath = path.join(videoDir, req.file.originalname);
        
        // Verificar si ya existe un archivo con ese nombre
        try {
          await fs.access(targetPath);
          // Si llegamos aquí, el archivo ya existe
          return res.render('auth/secciones', {
            curso,
            usuario,
            error: 'Ya existe un video con ese nombre en esta sección. Por favor, renombre el archivo.'
          });
        } catch (err) {
          // El archivo no existe, podemos continuar
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }
        
        // Mover el archivo desde la ubicación temporal a la final
        const srcPath = path.join(__dirname, '../../temp', req.file.originalname);
        await fs.copyFile(srcPath, targetPath);
        await fs.unlink(srcPath); // Eliminar el archivo temporal
        
        // Establecer la ruta relativa del video
        videoPath = `/assets/videos/${cursoId}/${seccionId}/${req.file.originalname}`;
        
        // Actualizar la sección con la ruta del video
        const updateQuery = 'UPDATE secciones SET video_path = ? WHERE id = ?';
        await dbHandler.ejecutarQuery(updateQuery, [videoPath, seccionId]);
      } catch (err) {
        console.error("Error al procesar el video:", err);
        return res.render('auth/secciones', {
          curso,
          usuario,
          error: 'Error al procesar el archivo de video: ' + err.message
        });
      }
    }
    
    res.redirect(`/auth/curso/${cursoId}`);
  } catch (error) {
    // Mejorar el manejo de errores para Multer
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.render('auth/secciones', {
          curso,
          usuario,
          error: 'El video excede el tamaño máximo permitido de 3MB.'
        });
      }
    }
    
    // Manejo genérico de errores existente
    console.error("Error al insertar sección:", error);
    res.status(500).render('auth/secciones', {
      curso: { id: cursoId },
      usuario,
      error: 'Error al crear la sección: ' + error.message
    });
  }
};

// Método para streaming de videos
authController.streamVideo = async (req, res) => {
  const cursoId = req.params.cursoId;
  const seccionId = req.params.seccionId;
  const fileName = req.params.fileName;
  const usuario = req.session.usuario;
  // Importar el fs normal para streaming
  const fsStream = require('fs');

  try {
    // Verificar si el usuario está autorizado
    const curso = await Curso.getCursoById(cursoId);
    if (!curso) {
      return res.status(404).send('Curso no encontrado');
    }

    // Verificar si el usuario es profesor del curso
    const esProfesor = curso.profesor_id === usuario.id;
    
    // Si no es profesor, verificar inscripción al curso
    let estaInscrito = false;
    if (!esProfesor) {
      const inscripcion = await Curso.verificarInscripcion(cursoId, usuario.id);
      estaInscrito = !!inscripcion;
    }

    // Si no es profesor ni alumno inscrito, denegar acceso
    if (!esProfesor && !estaInscrito) {
      return res.status(403).send('No tienes permiso para acceder a este recurso');
    }

    // Construir ruta de archivo
    const videoPath = path.join(__dirname, '../../assets/videos', cursoId, seccionId, fileName);
    
    // Verificar si el archivo existe
    try {
      await fs.access(videoPath);
    } catch (error) {
      return res.status(404).send('Video no encontrado');
    }

    // Obtener estadísticas del archivo
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Determinar el tipo MIME basado en la extensión
    const ext = path.extname(fileName).toLowerCase();
    const contentType = ext === '.mp4' ? 'video/mp4' : 
                        ext === '.webm' ? 'video/webm' : 
                        'application/octet-stream';

    // Manejar solicitudes de rango (para buscar en video)
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      // Usar fsStream para createReadStream
      const fileStream = fsStream.createReadStream(videoPath, { start, end });
      
      // Establecer encabezados para streaming parcial
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });
      
      // Stream del archivo
      fileStream.pipe(res);
    } else {
      // Stream del archivo completo
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });
      
      // Usar fsStream para createReadStream
      fsStream.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    res.status(500).send('Error al reproducir el video');
  }
};

// Añadir método para crear una valoración
authController.crearValoracion = async (req, res) => {
    const cursoId = req.params.id;
    const usuario = req.session.usuario;
    const { comentario, estrellas } = req.body;

    try {
        // Verificar si el usuario está inscrito
        const inscripcion = await Curso.verificarInscripcion(cursoId, usuario.id);
        if (!inscripcion) {
            return res.status(403).json({
                error: 'Debes estar inscrito en el curso para valorarlo'
            });
        }

        // Verificar si ya ha valorado el curso
        const valoracionExistente = await Valoracion.existeValoracion(cursoId, usuario.id);
        if (valoracionExistente) {
            return res.status(400).json({
                error: 'Ya has valorado este curso anteriormente'
            });
        }

        // Validar datos
        const { error } = valoracionSchema.validate({
            curso_id: parseInt(cursoId),
            alumno_id: usuario.id,
            comentario,
            estrellas: parseInt(estrellas)
        });

        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            });
        }

        // Crear la valoración
        await Valoracion.crear({
            curso_id: cursoId,
            alumno_id: usuario.id,
            comentario,
            estrellas
        });

        res.redirect('/auth/curso/' + cursoId);
    } catch (error) {
        console.error('Error al crear valoración:', error);
        res.status(500).json({
            error: 'Error al procesar la valoración'
        });
    }
};

// Agregar estos métodos al authController

// Mostrar perfil
authController.mostrarPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.obtenerPorId(req.session.usuario.id);
    // Recuperar todos los tipos de mensajes
    const error = req.session.errorPerfil;
    const success = req.session.successPerfil;
    const info = req.session.infoPerfilSinCambios;
    
    // Limpiar mensajes después de usarlos
    delete req.session.errorPerfil;
    delete req.session.successPerfil;
    delete req.session.infoPerfilSinCambios;

    res.render('auth/perfil', {
      usuario: req.session.usuario,
      usuarioData: usuario,
      error,
      success,
      info
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.redirect('/auth/home');
  }
};

authController.actualizarPerfil = async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  const id = req.session.usuario.id;
  
  try {
    // Recuperar datos actuales del usuario
    const usuarioActual = await Usuario.obtenerPorId(id);
    
    // Verificar si hay cambios reales
    const hayFotoNueva = !!req.file;
    const hayDatosNuevos = 
      nombre !== usuarioActual.nombre || 
      telefono !== usuarioActual.telefono || 
      direccion !== usuarioActual.direccion;
    
    // Si no hay cambios, mostrar mensaje de información
    if (!hayFotoNueva && !hayDatosNuevos) {
      req.session.infoPerfilSinCambios = 'No se detectaron cambios que guardar';
      return res.redirect('/auth/perfil');
    }
    
    // Si llegamos aquí, hay cambios para guardar
    const datos = { nombre, telefono, direccion };
    if (hayFotoNueva) {
      datos.foto_perfil = req.file.filename;
    }
    
    // Actualizar en BD
    await Usuario.actualizar(id, datos);
    
    // Actualizar sesión
    req.session.usuario.nombre = nombre;
    if (hayFotoNueva) {
      req.session.usuario.foto_perfil = req.file.filename;
    }
    
    req.session.successPerfil = 'Perfil actualizado correctamente';
    res.redirect('/auth/perfil');
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    req.session.errorPerfil = 'Error al actualizar el perfil';
    res.redirect('/auth/perfil');
  }
};

authController.darDeBajaCuenta = async (req, res) => {
    const usuario = req.session.usuario;

    if (!usuario) {
        return res.redirect('/public/login');
    }

    if (usuario.es_admin) {
        return res.status(403).send("Un administrador no puede darse de baja.");
    }

    try {
        await Usuario.marcarComoInactivo(usuario.id);
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            return res.redirect('/public/login');
        });
    } catch (error) {
        console.error("Error al dar de baja cuenta:", error);
        return res.status(500).send("Error al procesar la solicitud.");
    }
};

authController.formCambiarContrasena = (req, res) => {
    res.render('auth/micontrasena', {
        error: null,
        success: null,
        usuario: req.session.usuario,
    });
};

authController.cambiarContrasena = async (req, res) => {
    try {
        const { actual, nueva, repetir } = req.body;
        const id = req.session.usuario.id;

        if (!actual || !nueva || !repetir) {
            return res.render('auth/micontrasena', {
                error: 'Todos los campos son obligatorios.',
                success: null,
                usuario: req.session.usuario
            });
        }

        if (nueva.length < 6) {
            return res.render('auth/micontrasena', {
                error: 'La nueva contraseña debe tener al menos 6 caracteres.',
                success: null,
                usuario: req.session.usuario
            });
        }

        if (nueva !== repetir) {
            return res.render('auth/micontrasena', {
                error: 'Las nuevas contraseñas no coinciden.',
                success: null,
                usuario: req.session.usuario
            });
        }

        const usuario = await Usuario.obtenerPorId(id);

        if (!usuario) {
            return res.render('auth/micontrasena', {
                error: 'Usuario no encontrado.',
                success: null,
                usuario: req.session.usuario
            });
        }

        const bcrypt = require('bcryptjs');
        const match = await bcrypt.compare(actual, usuario.contraseña);

        if (!match) {
            return res.render('auth/micontrasena', {
                error: 'La contraseña actual no es correcta.',
                success: null,
                usuario: req.session.usuario
            });
        }

        const nuevoHash = await bcrypt.hash(nueva, 10);
        await Usuario.actualizar(id, { contraseña: nuevoHash });

        return res.render('auth/micontrasena', {
            success: 'Contraseña actualizada con éxito.',
            error: null,
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error("Error en cambio de contraseña:", error);
        return res.render('auth/micontrasena', {
            error: 'Error inesperado al actualizar contraseña.',
            success: null,
            usuario: req.session.usuario
        });
    }
};

// Publicar un curso
authController.publicarCurso = async (req, res) => {
  const cursoId = req.params.id;
  const usuario = req.session.usuario;

  try {
    // Verificar que el curso existe y que el usuario es el profesor
    const curso = await Curso.getCursoById(cursoId);
    
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    if (curso.profesor_id !== usuario.id) {
      return res.status(403).json({ error: 'No tienes permiso para publicar este curso' });
    }
    
    // Publicar el curso
    await Curso.publicarCurso(cursoId);
    
    // Redirigir a la página del curso
    res.redirect(`/auth/curso/${cursoId}`);
  } catch (error) {
    console.error('Error al publicar curso:', error);
    res.status(500).json({ error: 'Error al publicar el curso' });
  }
};

// Inscribir alumno a un curso
authController.inscribirAlumno = async (req, res) => {
  const cursoId = req.params.id;
  const alumnoId = req.session.usuario.id;

  try {
    // Validar datos
    const { error } = inscripcionSchema.validate({
      curso_id: parseInt(cursoId),
      alumno_id: alumnoId
    });

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    // Verificar que el curso existe
    const curso = await Curso.getCursoById(cursoId);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Verificar que el curso está publicado
    if (curso.publicado !== 1) {
      return res.status(403).json({ error: 'Este curso no está disponible para inscripción' });
    }

    // Verificar que el usuario no es el profesor del curso
    if (curso.profesor_id === alumnoId) {
      return res.status(400).json({ error: 'No puedes inscribirte a tu propio curso' });
    }

    // Verificar que no esté ya inscrito
    const inscripcion = await Curso.verificarInscripcion(cursoId, alumnoId);
    if (inscripcion) {
      return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
    }

    // Inscribir al alumno
    await Curso.inscribirAlumno(cursoId, alumnoId);
    
    // Redirigir a la página del curso
    res.redirect(`/auth/curso/${cursoId}`);
  } catch (error) {
    console.error('Error al inscribir alumno:', error);
    res.status(500).json({ error: 'Error al procesar la inscripción' });
  }
};

// Mejorar validaciones para videos
const videoFileFilter = (req, file, cb) => {
  // Verificar tipo MIME
  if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
    // Verificar extensión
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.mp4' || ext === '.webm') {
      cb(null, true);
    } else {
      cb(new Error('La extensión del archivo no coincide con el tipo de contenido.'), false);
    }
  } else {
    cb(new Error('Formato no permitido. Solo se aceptan MP4 o WebM.'), false);
  }
};

// Agregar función para eliminar videos
authController.eliminarVideo = async (req, res) => {
  const seccionId = req.params.seccionId;
  const cursoId = req.params.cursoId;
  const usuario = req.session.usuario;
  
  try {
    // Verificar que el usuario sea el profesor
    const curso = await Curso.getCursoById(cursoId);
    if (!curso || curso.profesor_id !== usuario.id) {
      return res.status(403).json({error: 'No tienes permiso para realizar esta acción'});
    }
    
    // Obtener información de la sección
    const secciones = await Curso.getSeccionesByCurso(cursoId);
    const seccion = secciones.find(s => s.id == seccionId);
    
    if (!seccion || !seccion.video_path) {
      return res.status(404).json({error: 'No se encontró el video'});
    }
    
    // Eliminar el archivo físico
    const videoFilePath = path.join(__dirname, '../../', seccion.video_path);
    await fs.unlink(videoFilePath);
    
    // Actualizar la base de datos
    await dbHandler.ejecutarQuery('UPDATE secciones SET video_path = NULL WHERE id = ?', [seccionId]);
    
    res.json({success: true, message: 'Video eliminado correctamente'});
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({error: 'Error al eliminar el video'});
  }
};

// Eliminar una sección
authController.eliminarSeccion = async (req, res) => {
  const seccionId = req.params.seccionId;
  const cursoId = req.params.cursoId;
  const usuario = req.session.usuario;
  
  try {
    // Verificar que el usuario sea el profesor
    const curso = await Curso.getCursoById(cursoId);
    if (!curso || curso.profesor_id !== usuario.id) {
      return res.status(403).json({error: 'No tienes permiso para realizar esta acción'});
    }
    
    // Obtener información de la sección
    const secciones = await Curso.getSeccionesByCurso(cursoId);
    const seccion = secciones.find(s => s.id == seccionId);
    
    if (!seccion) {
      return res.status(404).json({error: 'No se encontró la sección'});
    }
    
    // Si hay un video asociado, eliminarlo del sistema de archivos
    if (seccion.video_path) {
      try {
        const videoFilePath = path.join(__dirname, '../../', seccion.video_path);
        await fs.unlink(videoFilePath);
        
        // También eliminar el directorio si está vacío
        const videoDir = path.dirname(videoFilePath);
        const files = await fs.readdir(videoDir);
        if (files.length === 0) {
          await fs.rmdir(videoDir);
        }
      } catch (err) {
        console.error('Error al eliminar archivo de video:', err);
        // Continuamos aunque haya error al eliminar el archivo
      }
    }
    
    // Eliminar la sección de la base de datos
    await dbHandler.ejecutarQuery('DELETE FROM secciones WHERE id = ?', [seccionId]);
    
    res.redirect(`/auth/curso/${cursoId}`);
  } catch (error) {
    console.error('Error al eliminar sección:', error);
    res.status(500).json({error: 'Error al eliminar la sección'});
  }
};

module.exports = authController;
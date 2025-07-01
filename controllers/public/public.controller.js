const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const Valoracion = require('../../models/valoracion.model');
const Categoria = require('../../models/categorias.model');
const bcrypt = require('bcrypt');
const loginSchema = require('../../validators/login.schema');
const usuarioSchema = require('../../validators/usuario.schema');
const db = require('../../db/conexion');
const { homeLogger, loginLogger } = require('../../logger');

// Función para registrar intentos de login en logs/auth.log
function registrarIntentoLogin({ username, rol, exito, motivo = '' }) {
    const estado = exito ? 'ÉXITO' : `FALLÓ - ${motivo}`;
    const rolTexto = rol === 'admin' ? 'Admin' : 'Usuario';
    const mensaje = `Login ${estado} | Usuario: ${username} | Rol: ${rolTexto}`;
    loginLogger.warn(mensaje);
}

const publicController = {};

publicController.showHome = async (req, res) => {
  try {
    const usuario = req.session.usuario;
    const logMessage = usuario ? 
      `Public home access - User ID: ${usuario.id}, Email: ${usuario.email}` :
      'Public home access - No user session';
    
    homeLogger.debug(logMessage);

    const dbAll = require('util').promisify(db.all).bind(db);

    // Obtener profesores asignados con el nombre del curso
    const resultados = await dbAll(`
      SELECT u.id, u.nombre, u.email, c.nombre AS curso
      FROM usuarios u
      JOIN asignaciones a ON u.id = a.id_profesor
      JOIN cursos c ON a.id_curso = c.id
    `);

    // Agrupar por profesor
    const profesoresAgrupados = [];
    const mapa = new Map();

    for (const p of resultados) {
      if (!mapa.has(p.id)) {
        mapa.set(p.id, {
          id: p.id,
          nombre: p.nombre,
          email: p.email,
          cursos: [p.curso]
        });
      } else {
        mapa.get(p.id).cursos.push(p.curso);
      }
    }    for (const entry of mapa.values()) {
      profesoresAgrupados.push(entry);
    }

    const categoriasPopulares = await Curso.getCategoriasPopulares(6);
    const cursosPopulares = await Curso.getCursosPopulares(8);
    
    // Obtener las últimas valoraciones para testimoniales
    const ultimasValoraciones = await Valoracion.getUltimasValoraciones(10);

    res.render("public/home/index", {
      usuario: usuario || null,
      profesores: profesoresAgrupados,
      cursosPopulares,
      categoriasPopulares: categoriasPopulares || [],
      valoraciones: ultimasValoraciones || []
    });
  } catch (error) {
    console.error("Error cargando profesores en home:", error);
    res.render("public/home/index", {
      usuario: req.session.usuario || null,
      profesores: [],
      cursosPopulares: [],
      categoriasPopulares: [],
      valoraciones: []
    });
  }
};


publicController.redirectToHome = (req, res) => {
    res.redirect('/public/home');
};

publicController.showAdminLogin = (req, res) => {
    res.render('public/admin-login/index', {
        error: null,
        usuario: req.session.usuario || null
    });
};

publicController.showLogin = (req, res) => {
    // Verificar si hay un mensaje de éxito de registro
    const mensajeExito = req.session.mensajeExito;
    if (req.session.mensajeExito) {
        delete req.session.mensajeExito;  // Limpiar mensaje después de usarlo
    }
    
    res.render('public/login/index', { 
        error: req.query.error || null,
        mensajeExito: mensajeExito || null,
        usuario: req.session.usuario || null,
        appName: process.env.APP_NAME || 'Sapientia Tech'
    });
};

publicController.loginTry = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario
        const usuario = await Usuario.findOne({ email });

                 // Validar datos recibidos usando Joi
                const { error } = loginSchema.validate(req.body);
                if (error) {
                const mensajeError = error.details[0].message;
                return res.render('public/login/index', { error: mensajeError, usuario:"" });
                }
        
        if (!usuario) {
            registrarIntentoLogin({ username: email, rol: 'usuario', exito: false, motivo: 'Usuario no encontrado' });
            return res.redirect('/public/login?error=Usuario no encontrado');
        }

        if (usuario.es_admin === 1) {
            registrarIntentoLogin({ username: email, rol: 'admin', exito: false, motivo: 'Admin intentando login desde usuario' });
            return res.redirect('/public/login?error=Los administradores deben usar el login de administrador');
        }

        // Verificar contraseña
        const match = await bcrypt.compare(password, usuario.contraseña);
        if (!match) {
            registrarIntentoLogin({ username: email, rol: 'usuario', exito: false, motivo: 'Contraseña incorrecta' });
            return res.redirect('/public/login?error=Contraseña incorrecta');
        }

        // Login exitoso
        registrarIntentoLogin({ username: email, rol: 'usuario', exito: true });

        req.session.usuario = usuario;
        req.session.userId = usuario.id;
        req.session.isAdmin = usuario.es_admin === 1;

        res.redirect('/auth/home');
    } catch (error) {
        console.error('Error en login:', error);
        res.redirect('/public/login?error=Error del servidor');
    }
};

publicController.adminLoginTry = async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        registrarIntentoLogin({ username: email, rol: 'admin', exito: false, motivo: 'Campos vacíos' });
        return res.status(400).send('contraseña o email vacio');
    }

    if (password.length < 6) {
        registrarIntentoLogin({ username: email, rol: 'admin', exito: false, motivo: 'Contraseña muy corta' });
        return res.status(400).send('contraseña muy corta');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        registrarIntentoLogin({ username: email, rol: 'admin', exito: false, motivo: 'Email inválido' });
        return res.status(400).send('Email invalido');
    }

    try {
        const usuario = await Usuario.findOne({ email });
        
        if (!usuario) {
            registrarIntentoLogin({ username: email, rol: 'admin', exito: false, motivo: 'Usuario no encontrado' });
            return res.redirect('/public/admin-login?error=Usuario no encontrado');
        }

        // Verificar que sea un admin
        if (usuario.es_admin !== 1) {
            registrarIntentoLogin({ username: email, rol: 'usuario', exito: false, motivo: 'Usuario no es admin' });
            return res.redirect('/public/admin-login?error=Acceso denegado. Use el login de usuario normal');
        }

        // Verificar contraseña
        const match = await bcrypt.compare(password, usuario.contraseña);
        if (!match) {
            registrarIntentoLogin({ username: email, rol: 'admin', exito: false, motivo: 'Contraseña incorrecta' });
            return res.redirect('/public/admin-login?error=Contraseña incorrecta');
        }

        registrarIntentoLogin({ username: email, rol: 'admin', exito: true });

        req.session.usuario = usuario;
        req.session.userId = usuario.id;
        req.session.isAdmin = true;

        res.redirect('/admin/home');
    } catch (error) {
        console.error('Error en admin login:', error);
        res.redirect('/public/admin-login?error=Error del servidor');
    }
};

publicController.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.redirect('/?error=Error al cerrar sesión');
        }
        
        res.clearCookie('is3-session-name');
        res.redirect('/public/login');
    });
};

publicController.showAbout = (req, res) => {
    res.render('about', {
        title: 'Acerca de Nosotros',
        usuario: req.session.usuario || null
    });
};

publicController.showTestimonial = async (req, res) => {
    try {
        // Obtener todos los usuarios y filtrar por rol estudiante
        let estudiantes = (await Usuario.listar()).filter(u => u.rol === 'estudiante');

        // Eliminar duplicados por ID
        const estudiantesUnicos = Array.from(new Map(estudiantes.map(e => [e.id, e])).values());
        
        // Obtener las últimas valoraciones/testimonios
        const valoraciones = await Valoracion.getUltimasValoraciones(10);
        
        res.render('testimonial', {
            title: 'Testimoniales',
            usuario: req.session.usuario || null,
            alumnos: estudiantesUnicos,
            valoraciones: valoraciones,
            appName: process.env.APP_NAME || 'Sapientia Tech'
        });
    } catch (error) {
        console.error("Error al cargar estudiantes en testimonial:", error);
        res.render('testimonial', {
            title: 'Testimonial',
            usuario: req.session.usuario || null,
            alumnos: []
        });
    }
};


publicController.showContact = (req, res) => {
    res.render('contact', {
        title: 'Contacto',
        usuario: req.session.usuario || null
    });
};

publicController.team = (req, res) => {
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
/*
publicController.showHome = async (req, res) => {
    try {
        let profesores = (await Usuario.listar()).filter u => u.rol === 'profesor';        // Eliminar duplicados por ID
        const profesoresUnicos = Array.from(new Map(profesores.map(p => [p.id, p])).values());

        const categoriasPopulares = await Curso.getCategoriasPopulares(6);
        const cursosPopulares = await Curso.getCursosPopulares?.(8) || [];

        res.render('public/home/index', {
            usuario: req.session.usuario || null,
            profesores: profesoresUnicos,
            categoriasPopulares: categoriasPopulares || [],
            cursosPopulares
        });
    } catch (error) {
        console.error("Error al cargar datos en home:", error);
        res.render('public/home/index', {
            usuario: req.session.usuario || null,
            profesores: [],
            categoriasPopulares: [],
            cursosPopulares: []
        });
    }
};
*/
publicController.verProfesores = async (req, res) => {
  try {
    const dbAll = require('util').promisify(db.all).bind(db);

    // Usar la vista ya definida en la base
    const resultados = await dbAll(`SELECT * FROM vista_profesores_con_cursos`);

    // Agrupar por profesor
    const profesoresAgrupados = [];
    const mapa = new Map();

    for (const p of resultados) {
      if (!mapa.has(p.id)) {
        mapa.set(p.id, {
          id: p.id,
          nombre: p.nombre,
          email: p.email,
          cursos: [p.curso]
        });
      } else {
        mapa.get(p.id).cursos.push(p.curso);
      }
    }

    for (const entry of mapa.values()) {
      profesoresAgrupados.push(entry);
    }

    res.render('public/profesores', {
      profesores: profesoresAgrupados,
      appName: 'eLEARNING',
      usuario: req.session.usuario || null
    });
  } catch (error) {
    console.error('Error al obtener profesores desde la vista:', error);
    res.status(500).send('Error al cargar los profesores');
  }
};

publicController.showPrivacy = (req, res) => {
    res.render('privacy', {
    title: 'Política de Privacidad',
    usuario: req.session.usuario || null
    });
};

publicController.showTerms = (req, res) => {
    res.render('terms', {
        title: 'Términos y Condiciones',
        usuario: req.session.usuario || null
    });
};

publicController.showFaqs = (req, res) => {
    res.render('faqs', {
        title: 'Preguntas Frecuentes',
        usuario: req.session.usuario || null
    });
};

publicController.showCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.listarTodasDetalladas();
    
    res.render('public/categorias', {
      categorias: categorias || [],
      appName: process.env.APP_NAME || "eLEARNING",
      usuario: req.session.usuario || null
    });
  } catch (error) {
    console.error('Error al mostrar categorías:', error);
    res.status(500).send('Error del servidor');
  }
};

publicController.showCategoria = async (req, res) => {
  try {
    const categoriaId = req.params.id;
    const categoria = await Categoria.obtenerPorId(categoriaId);
    
    if (!categoria) {
      return res.status(404).render('404', { 
        mensaje: 'Categoría no encontrada',
        usuario: req.session.usuario || null,
        appName: process.env.APP_NAME || "eLEARNING"
      });
    }
    
    const cursos = await Curso.getCursosByCategoria(categoriaId);
    
    res.render('public/categoria', {
      categoria,
      cursos: cursos || [],
      usuario: req.session.usuario || null,
      appName: process.env.APP_NAME || "eLEARNING"
    });
  } catch (error) {
    console.error('Error al mostrar categoría:', error);
    res.status(500).send('Error del servidor');
  }
};

publicController.verCurso = async (req, res) => {
    const cursoId = req.params.id;
    
    // Verificar si el usuario está autenticado
    if (req.session.usuario) {
        // Si está autenticado, redirigir a la versión autenticada
        return res.redirect(`/auth/curso/${cursoId}`);
    }

    try {
        // Continuar con el código existente para usuarios no autenticados
        const curso = await Curso.getCursoById(cursoId);
        
        if (!curso || curso.publicado !== 1) {
            return res.redirect('/public/home');
        }

        const secciones = await Curso.getSeccionesByCurso(cursoId);
        const valoraciones = await Valoracion.getValoracionesByCurso(cursoId);
        const estadisticas = await Valoracion.getPromedioByCurso(cursoId);
        
        // Nuevo: Obtener información de la ruta de aprendizaje
        const rutaAprendizaje = await Curso.obtenerRutaAprendizaje(cursoId);
        
        res.render('public/ver-curso', {
            curso,
            rutaAprendizaje, // Nueva variable en la vista
            secciones: secciones || [],
            valoraciones: valoraciones || [],
            estadisticas: estadisticas || { promedio: 0, total: 0 },
            usuario: null
        });
    } catch (error) {
        console.error('Error al obtener curso:', error);
        res.redirect('/public/home');
    }
};
publicController.formRegistro = (req, res) => {
  res.render('public/registro', {
    errores: [],
    datos: {},
    usuario: null,
    appName: process.env.APP_NAME || 'Sapientia Tech'
  });
};

publicController.procesarRegistro = async (req, res) => {
  const { nombre, email, contraseña, repetir_contraseña, telefono, direccion } = req.body;
  const errores = [];
  const bcrypt = require('bcrypt');

  try {
    // Validación de campos
    if (!nombre || !email || !contraseña || !repetir_contraseña) {
      errores.push("Todos los campos obligatorios deben estar completos.");
    }

    if (contraseña !== repetir_contraseña) {
      errores.push("Las contraseñas no coinciden.");
    }
    
    if (contraseña && contraseña.length < 6) {
      errores.push("La contraseña debe tener al menos 6 caracteres.");
    }
    
    // Validar formato de email con regex simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errores.push("Por favor, ingresa un correo electrónico válido.");
    }

    // Verificar si el email ya está registrado
    const existe = await Usuario.obtenerPorEmail(email);
    if (existe) {
      errores.push("El correo electrónico ya está registrado.");
    }

    if (errores.length > 0) {
      return res.render('public/registro', {
        errores,
        datos: req.body,
        usuario: null,
        appName: process.env.APP_NAME || 'Sapientia Tech'
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hash = await bcrypt.hash(contraseña, saltRounds);

    // Crear usuario
    await Usuario.crear({
      nombre,
      email,
      contraseña: hash,
      telefono,
      direccion,
      es_admin: 0
    });

    // Redireccionar a login con mensaje de éxito
    req.session.mensajeExito = "¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.";
    res.redirect('/login');
  } catch (error) {
    console.error('Error en registro:', error);
    errores.push("Ha ocurrido un error en el registro. Intente nuevamente.");
    
    return res.render('public/registro', {
      errores,
      datos: req.body,
      usuario: null,
      appName: process.env.APP_NAME || 'Sapientia Tech'
    });
  }
};

// Mostrar formulario de registro
publicController.showRegistro = (req, res) => {
  res.render('public/registro/index', { 
    error: null,
    formData: {},
    appName: process.env.APP_NAME || "eLEARNING",
    usuario: req.session.usuario || null
  });
};

// Procesar registro de usuario
publicController.registroTry = async (req, res) => {
  try {
    const { nombre, email, password, confirmPassword, telefono, direccion } = req.body;
    
    // Validaciones personalizadas
    if (password !== confirmPassword) {
      return res.render('public/registro/index', {
        error: 'Las contraseñas no coinciden',
        formData: { nombre, email, telefono, direccion },
        appName: process.env.APP_NAME || "eLEARNING",
        usuario: req.session.usuario || null
      });
    }
    
    // Validar con Joi
    const { error } = usuarioSchema.validate({
      nombre,
      email,
      password,
      telefono,
      direccion,
      es_admin: 0
    });
    
    if (error) {
      return res.render('public/registro/index', {
        error: error.details[0].message,
        formData: { nombre, email, telefono, direccion },
        appName: process.env.APP_NAME || "eLEARNING",
        usuario: req.session.usuario || null
      });
    }
    
    // Verificar si el email ya existe
    const existeUsuario = await Usuario.buscarPorEmail(email);
    if (existeUsuario) {
      return res.render('public/registro/index', {
        error: 'Este correo electrónico ya está registrado',
        formData: { nombre, telefono, direccion },
        appName: process.env.APP_NAME || "eLEARNING",
        usuario: req.session.usuario || null
      });
    }
    
    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear usuario
    await Usuario.crear({
      nombre,
      email,
      contraseña: hashedPassword,
      es_admin: 0, // Por defecto, no es admin
      telefono,
      direccion
    });
    
    // Redireccionar al login con mensaje de éxito
    return res.redirect('/public/login?mensaje=Registro exitoso. Ahora puedes iniciar sesión.');
    
  } catch (error) {
    console.error('Error en registro:', error);
    return res.render('public/registro/index', {
      error: 'Error al registrar el usuario. Intente nuevamente.',
      formData: req.body,
      appName: process.env.APP_NAME || "eLEARNING",
      usuario: req.session.usuario || null
    });
  }
};

// Mostrar página de profesores
publicController.profesores = async (req, res) => {
  try {
    const dbAll = require('util').promisify(db.all).bind(db);

    // Obtener profesores asignados con el nombre del curso
    const resultados = await dbAll(`
      SELECT u.id, u.nombre, u.email, c.nombre AS curso
      FROM usuarios u
      JOIN asignaciones a ON u.id = a.id_profesor
      JOIN cursos c ON a.id_curso = c.id
    `);

    // Agrupar por profesor
    const profesoresAgrupados = [];
    const mapa = new Map();

    for (const p of resultados) {
      if (!mapa.has(p.id)) {
        mapa.set(p.id, {
          id: p.id,
          nombre: p.nombre,
          email: p.email,
          cursos: [p.curso]
        });
      } else {
        mapa.get(p.id).cursos.push(p.curso);
      }
    }
    
    for (const entry of mapa.values()) {
      profesoresAgrupados.push(entry);
    }

    res.render("public/profesores", {
      profesores: profesoresAgrupados,
      appName: process.env.APP_NAME || "eLEARNING",
      usuario: req.session.usuario || null
    });
  } catch (error) {
    console.error("Error cargando profesores:", error);
    res.render("public/profesores", {
      profesores: [],
      appName: process.env.APP_NAME || "eLEARNING",
      usuario: req.session.usuario || null
    });
  }
};

module.exports = publicController;
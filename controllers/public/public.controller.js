const Usuario = require('../../models/usuario.model');
const Curso = require('../../models/curso.model');
const Valoracion = require('../../models/valoracion.model');
const bcrypt = require('bcrypt');
const loginSchema = require('../../validators/login.schema');
const db = require('../../db/conexion');
const { homeLogger } = require('../../logger');

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
    }

    for (const entry of mapa.values()) {
      profesoresAgrupados.push(entry);
    }

    const categoriasPopulares = await Curso.getCategoriasPopulares(4);
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
    res.render('public/login/index', { 
        error: req.query.error || null,
        usuario: req.session.usuario || null
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
            return res.redirect('/public/login?error=Usuario no encontrado');
        }

        if (usuario.es_admin === 1) {
            return res.redirect('/public/login?error=Los administradores deben usar el login de administrador');
        }

        // Verificar contraseña
        const match = await bcrypt.compare(password, usuario.contraseña);
        if (!match) {
            return res.redirect('/public/login?error=Contraseña incorrecta');
        }

        // Crear sesión
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
        return res.status(400).send('contraseña o email vacio');
    }

    if (password.length < 6) {
        return res.status(400).send('contraseña muy corta');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send('Email invalido');
    }

    try {
        const usuario = await Usuario.findOne({ email });
        
        if (!usuario) {
            return res.redirect('/public/admin-login?error=Usuario no encontrado');
        }

        // Verificar que sea un admin
        if (usuario.es_admin !== 1) {
            return res.redirect('/public/admin-login?error=Acceso denegado. Use el login de usuario normal');
        }

        // Verificar contraseña
        const match = await bcrypt.compare(password, usuario.contraseña);
        if (!match) {
            return res.redirect('/public/admin-login?error=Contraseña incorrecta');
        }

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

        res.render('testimonial', {
            title: 'Testimonial',
            usuario: req.session.usuario || null,
            alumnos: estudiantesUnicos
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
        let profesores = (await Usuario.listar()).filter(u => u.rol === 'profesor');

        // Eliminar duplicados por ID
        const profesoresUnicos = Array.from(new Map(profesores.map(p => [p.id, p])).values());

        const categoriasPopulares = await Curso.getCategoriasPopulares(4);
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
        
        res.render('public/ver-curso', {
            curso,
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

module.exports = publicController;
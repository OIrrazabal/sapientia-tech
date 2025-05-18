const Usuario = require('../../models/usuario.model');
const bcrypt = require('bcrypt');
const loginSchema = require('../../validators/login.schema');

const publicController = {};
/*
publicController.showHome = (req, res) => {
    res.render('public/home/index', {
        usuario: req.session.usuario || null
    });
};
*/
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

publicController.showHome = async (req, res) => {
    try {
        let profesores = (await Usuario.listar()).filter(u => u.rol === 'profesor');

        // Eliminar duplicados por ID (o usar 'email' si preferís)
        const profesoresUnicos = Array.from(new Map(profesores.map(p => [p.id, p])).values());

        res.render('public/home/index', {
            usuario: req.session.usuario || null,
            profesores: profesoresUnicos
        });
    } catch (error) {
        console.error("Error al cargar profesores en home:", error);
        res.render('public/home/index', {
            usuario: req.session.usuario || null,
            profesores: []
        });
    }
};
publicController.profesores = async (req, res) => {
    try {
        let profesores = (await Usuario.listar()).filter(u => u.rol === 'profesor');
        res.render('public/profesores', {
            profesores,
            usuario: req.session.usuario || null,
        });
    } catch (error) {
        console.error('Error al cargar profesores:', error);
        res.render('public/profesores', {
            profesores: [],
            usuario: req.session.usuario || null,
        });
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


module.exports = publicController;
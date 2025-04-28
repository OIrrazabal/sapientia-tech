const Usuario = require('../../models/usuario.model');
const bcrypt = require('bcrypt');

const publicController = {};

publicController.showHome = (req, res) => {
    res.render('public/home/index', {
        usuario: req.session.usuario || null
    });
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
        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        
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

publicController.showTestimonial = (req, res) => {
    res.render('testimonial', {
        title: 'Testimonial',
        usuario: req.session.usuario || null
    });
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

publicController.profesores = async (req, res) => {
    try {
      let profesores = (await Usuario.listar()).filter(u => u.rol === 'profesor');
      if (!Array.isArray(profesores)) profesores = [];
      res.render('public/profesores', { 
        profesores,
        active: 'profesores',
        usuario: req.session.usuario || null
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.render('public/profesores', { 
        profesores: [],
        active: 'profesores',
        usuario: req.session.usuario || null
      });
    }
};

module.exports = publicController;
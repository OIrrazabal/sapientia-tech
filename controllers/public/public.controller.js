const Usuario = require('../../models/usuario.model');
const bcrypt = require('bcrypt');

const publicController = {};

publicController.showAdminLogin = (req, res) => {
    res.render('public/admin-login/index');
};

publicController.showLogin = (req, res) => {
    res.render('public/login/index', { 
        error: req.query.error || null 
    });
};

publicController.loginTry = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        
        if (!usuario) {
            return res.redirect('/public/login?error=Usuario no encontrado');
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
        const user = await Usuario.loginAdmin(email, password);
        
        if (!user || !user.success) {
            return res.redirect('/public/admin-login?error=Credenciales incorrectas');
        }

        if (!Usuario.es_admin === 1) {
            return res.redirect('/public/admin-login?error=No autorizado');
        }

        req.session.usuario = user.user;
        req.session.userId = user.user.id;
        req.session.isAdmin = true;

        res.redirect('/auth/home');
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

module.exports = publicController;
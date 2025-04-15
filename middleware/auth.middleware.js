const checkLogin = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/public/login?error=Debe iniciar sesión');
    }
    next();
};

module.exports = { checkLogin };
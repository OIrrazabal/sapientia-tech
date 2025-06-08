const checkLogin = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/public/login?error=Debe iniciar sesión');
    }
    next();
};
function verificarAutenticacion(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  } else {
    return res.redirect('/public/login');
  }
}
module.exports = { checkLogin, verificarAutenticacion };

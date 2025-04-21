const checkProfesor = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isProfesor) {
        next();
    } else {
        res.redirect('/public/login'); 
    }
};

module.exports = {
    checkProfesor
};
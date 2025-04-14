const checkLogin = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/public/login');
    }
};

module.exports = {
    checkLogin
};
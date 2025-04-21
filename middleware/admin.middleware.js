const checkAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/public/admin-login'); 
    }
};

module.exports = {
    checkAdmin
};
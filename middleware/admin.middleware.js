const checkAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/public/login'); 
    }
};

module.exports = {
    checkAdmin
};
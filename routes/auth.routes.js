const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/auth/home');
});

router.get('/home', (req, res) => {
    res.render('auth/home/index');
});

module.exports = router;
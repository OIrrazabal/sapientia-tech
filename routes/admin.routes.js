const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
    res.render('admin/home/index');
});

router.get('/crear-curso', (req, res) => {
    res.render('admin/crear-curso');
});

module.exports = router;
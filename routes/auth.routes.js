const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db/db.handler');

router.get('/', (req, res) => {
    res.redirect('/auth/home');
});

router.get('/home', async (req, res) => {
    try {
        // query de prueba que selecciona todos los usuarios
        const users = await executeQuery('SELECT * FROM usuarios WHERE id = 1');
        console.log(users);
        
        res.render('auth/home/index');
    } catch (error) {
        console.error('error al consultar usuarios:', error);
        res.status(500).send('server error');
    }
});

module.exports = router;
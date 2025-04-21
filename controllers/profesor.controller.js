// controllers/auth/auth.controller.js

const db = require('../db/conexion');
const Curso = require('../models/curso.model');

const profesorController = {};

profesorController.index = async (req, res) => {
    try {
        const profesor_id = req.session.userId || 1;
        const cursos = await Curso.listarProfesor(profesor_id);
        cursos.forEach(curso => {
            curso.fecha_creacion = new Date(curso.fecha_creacion).toLocaleString('es-PY');
        });

        res.render('profesor/cursos/index', { cursos });
    } catch (error) {
        console.error ('Error: ', error);
        res.redirect('/auth/home?error=Error al obtener cursos');
    }
}

profesorController.show = async (req, res) => {
    try {
        const curso_id = req.params.id;
        const curso = await Curso.findOne(curso_id);
    
        if (!curso) {
          return res.status(404).send('Curso no encontrado');
        }
  
        curso.fecha_creacion = new Date(curso.fecha_creacion).toLocaleString('es-PY');
    
        res.render('admin/cursos/ver', { curso }); // Renderizar la vista con los datos del curso
      } catch (error) {
        console.error('Error al obtener el curso:', error);
        res.status(500).send('Error al obtener el curso');
      }
}

profesorController.publish = async (req, res) => {
    try {
        const curso_id = req.params.id;
        const publicado = 1;

        await Curso.publicar(curso_id, publicado);

        res.redirect('/profesor/mis_cursos'); // o res.json({ ok: true }) si es API    
    } catch (error) {
        console.error('Error en guardado:', error);
        res.redirect('/admin/cursos?error=Error al guardar');
    }
};

module.exports = profesorController;

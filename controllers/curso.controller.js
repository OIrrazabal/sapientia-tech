// controllers/auth/auth.controller.js

const db = require('../db/conexion');
const Curso = require('../models/curso.model');

const cursoController = {};

cursoController.index = async (req, res) => {
    try {
        const cursos = await Curso.listar();
        cursos.forEach(curso => {
            curso.fecha_creacion = new Date(curso.fecha_creacion).toLocaleString('es-PY');
        });

        res.render('admin/cursos/index', { cursos });
    } catch (error) {
        console.error ('Error: ', error);
        res.redirect('/auth/home?error=Error al obtener cursos');
    }
}

cursoController.show = async (req, res) => {
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

cursoController.create = async (req, res) => {
    try {
        const sql = 'SELECT * FROM categorias';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).send('Error al consultar la base de datos');
            }
            // Mandás los datos a la vista
            res.render('admin/cursos/crear', { categorias: rows });
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar la pantalla');
      }
}

cursoController.store = async (req, res) => {
    try {
        const { titulo, descripcion, categoria_id } = req.body;
        const creador_id = req.session.userId || 1;
        const fecha_creacion = new Date().toISOString();
        const publicado = 0;

        await Curso.guardar(titulo, categoria_id, descripcion, creador_id, fecha_creacion, publicado);

        res.redirect('/admin/cursos'); // o res.json({ ok: true }) si es API    
    } catch (error) {
        console.error('Error en guardado:', error);
        res.redirect('/admin/cursos/crear?error=Error al guardar');
    }
};

cursoController.create_teacher = async (req, res) => {
    try {
        const curso_id = req.params.id;
        const curso = await Curso.findOne(curso_id);
    
        if (!curso) {
          return res.status(404).send('Curso no encontrado');
        }

        const sql = 'SELECT * FROM usuarios WHERE rol = 1';
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(500).send('Error al consultar la base de datos');
            }
            // Mandás los datos a la vista
            res.render('admin/cursos/asignar_profesor', { curso, usuarios:rows });
        });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al cargar la pantalla');
      }
}

cursoController.store_teacher = async (req, res) => {
    try {
        const curso_id = req.params.id;
        const { profesor_id } = req.body;

        await Curso.asignarProfesor(curso_id, profesor_id);

        res.redirect('/admin/cursos'); // o res.json({ ok: true }) si es API    
    } catch (error) {
        console.error('Error en guardado:', error);
        res.redirect('/admin/cursos?error=Error al guardar');
    }
};

module.exports = cursoController;

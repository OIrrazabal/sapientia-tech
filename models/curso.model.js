const dbHandler = require('../db/db.handler');
const db = require('../db/conexion'); // necesario para db.get
const { promisify } = require('util');
const dbAll = promisify(db.all).bind(db);

const Curso = {
  listarDisponibles: async () => {
    const query = 'SELECT * FROM cursos WHERE profesor_id IS NULL OR profesor_id = 0';
    return dbHandler.ejecutarQueryAll(query);
  },

  listar: async () => {
    const query = 'SELECT * FROM cursos';
    return dbHandler.ejecutarQueryAll(query);
  },

  getCursosByProfesor: async (profesorId) => {
    const query = `
      SELECT c.*, u.nombre AS profesor_nombre
      FROM cursos c
      INNER JOIN usuarios u ON u.id = c.profesor_id
      WHERE c.profesor_id = ?`;
    return dbHandler.ejecutarQueryAll(query, [profesorId]);
  },

obtenerTodos: async () => {
  const sql = 'SELECT * FROM cursos ORDER BY id DESC';
  return await dbHandler.ejecutarQueryAll(sql);
},
obtenerPorId: async (id) => {
  const query = 'SELECT * FROM cursos WHERE id = ?';
  return await dbHandler.ejecutarQuery(query, [id]);
},
  getCursosByAlumno: async (alumnoId) => {
    const query = `
      SELECT c.*, u.nombre AS profesor_nombre
      FROM cursos c
      INNER JOIN inscripciones i ON i.curso_id = c.id
      INNER JOIN usuarios u ON u.id = c.profesor_id
      WHERE i.alumno_id = ?`;
    return dbHandler.ejecutarQueryAll(query, [alumnoId]);
  },

  buscarCursos: async (busqueda) => {
    const query = `
      SELECT c.*, u.nombre as profesor_nombre 
      FROM cursos c
      LEFT JOIN usuarios u ON c.profesor_id = u.id
      WHERE c.publicado = 1 
      AND LOWER(c.nombre) LIKE LOWER(?)`;
    return dbHandler.ejecutarQueryAll(query, [`%${busqueda}%`]);
  },

  getCursoById: async (cursoId) => {
    const query = `
      SELECT c.*, u.nombre as profesor_nombre 
      FROM cursos c
      LEFT JOIN usuarios u ON u.id = c.profesor_id
      WHERE c.id = ?`;
    return dbHandler.ejecutarQuery(query, [cursoId]);
  },

  getSeccionesByCurso: async (cursoId) => {
    const query = 'SELECT * FROM secciones WHERE curso_id = ? ORDER BY orden';
    return dbHandler.ejecutarQueryAll(query, [cursoId]);
  },

  verificarInscripcion: async (cursoId, alumnoId) => {
    const query = 'SELECT * FROM inscripciones WHERE curso_id = ? AND alumno_id = ?';
    return dbHandler.ejecutarQuery(query, [cursoId, alumnoId]);
  },

  agregarSeccion: async (nombre, descripcion, cursoId) => {
    const query = 'INSERT INTO secciones (nombre, descripcion, curso_id) VALUES (?, ?, ?)';
    return dbHandler.ejecutarQuery(query, [nombre, descripcion, cursoId]);
  },

  crear: async (curso) => {
    const { nombre, descripcion } = curso;
    const query = 'INSERT INTO cursos (nombre, descripcion, publicado) VALUES (?, ?, ?)';
    const resultado = await dbHandler.ejecutarQueryConResultado(query, [nombre, descripcion, 0]);
    return { id: resultado.lastID };
  },

  asignarProfesor: async (curso_id, profesor_id) => {
    const query = 'UPDATE cursos SET profesor_id = ? WHERE id = ?';
    return dbHandler.ejecutarQuery(query, [profesor_id, curso_id]);
  },

  publicarCurso: async (cursoId) => {
    const query = 'UPDATE cursos SET publicado = 1 WHERE id = ? AND publicado = 0';
    return dbHandler.ejecutarQuery(query, [cursoId]);
  },

  inscribirAlumno: async (cursoId, alumnoId) => {
    const query = 'INSERT INTO inscripciones (alumno_id, curso_id) VALUES (?, ?)';
    return dbHandler.ejecutarQuery(query, [alumnoId, cursoId]);
  },

  getCursosPopulares: async (limite = 8) => {
    const query = `
      SELECT c.*, COUNT(i.alumno_id) AS inscriptos
      FROM cursos c
      LEFT JOIN inscripciones i ON c.id = i.curso_id
      WHERE c.publicado = 1
      GROUP BY c.id
      HAVING COUNT(i.alumno_id) > 0
      ORDER BY inscriptos DESC
      LIMIT ?`;
    return dbHandler.ejecutarQueryAll(query, [limite]);
  },

  getCategoriasPopulares: async (limite = 4) => {
    const query = `
      SELECT cat.id, cat.nombre, cat.imagen, COUNT(c.id) as total_cursos
      FROM categorias cat
      JOIN cursos c ON c.categoria_id = cat.id
      WHERE c.publicado = 1
      GROUP BY cat.id
      ORDER BY total_cursos DESC
      LIMIT ?
    `;
    return dbHandler.ejecutarQueryAll(query, [limite]);
  },

  getCursosByCategoria: async (categoriaId) => {
    const query = `
      SELECT c.*, u.nombre as profesor_nombre,
          (SELECT COUNT(*) FROM inscripciones i WHERE i.curso_id = c.id) as inscriptos
      FROM cursos c
      LEFT JOIN asignaciones a ON c.id = a.id_curso
      LEFT JOIN usuarios u ON a.id_profesor = u.id
      WHERE c.categoria_id = ? AND c.publicado = 1
      ORDER BY c.nombre ASC
    `;
    return await dbHandler.ejecutarQueryAll(query, [categoriaId]);
  },

  contarPublicados: async (publicado) => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as total FROM cursos WHERE publicado = ?`,
        [publicado ? 1 : 0],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });
  },

  contarProfesoresUnicos: async () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(DISTINCT profesor_id) as total FROM cursos WHERE profesor_id IS NOT NULL`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });
  },

  contarInscriptosUnicos: async () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(DISTINCT alumno_id) as total FROM inscripciones`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });
  },

  actualizar: async (id, datos) => {
    const { nombre, descripcion } = datos;
    const query = 'UPDATE cursos SET nombre = ?, descripcion = ? WHERE id = ?';
    return dbHandler.ejecutarQuery(query, [nombre, descripcion, id]);
  },
};

module.exports = Curso;
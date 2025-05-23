const dbHandler = require('../db/db.handler');

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
        return dbHandler.ejecutarQuery(query, [nombre, descripcion, 0]);
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
        SELECT cat.id, cat.nombre, COUNT(c.id) as total_cursos
        FROM categorias cat
        JOIN cursos c ON c.categoria_id = cat.id
        GROUP BY cat.id
        ORDER BY total_cursos DESC
        LIMIT ?
    `;
    return dbHandler.ejecutarQueryAll(query, [limite]);
}

};

module.exports = Curso;
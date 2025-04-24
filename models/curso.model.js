const dbHandler = require('../db/db.handler');

class Curso {
    static async listarDisponibles() {
        const query = 'SELECT * FROM cursos WHERE profesor_id IS NULL OR profesor_id = 0';
        return dbHandler.ejecutarQueryAll(query);
    }

    static async getCursosByProfesor(profesorId) {
        const query = `
            SELECT c.*, u.nombre AS profesor_nombre
            FROM cursos c
            INNER JOIN usuarios u ON u.id = c.profesor_id
            WHERE c.profesor_id = ?`;
        return dbHandler.ejecutarQueryAll(query, [profesorId]);
    }

    static async getCursosByAlumno(alumnoId) {
        const query = `
            SELECT c.*, u.nombre AS profesor_nombre
            FROM cursos c
            INNER JOIN inscripciones i ON i.curso_id = c.id
            INNER JOIN usuarios u ON u.id = c.profesor_id
            WHERE i.alumno_id = ?`;
        return dbHandler.ejecutarQueryAll(query, [alumnoId]);
    }

    static async buscarCursos(busqueda) {
        const query = `
            SELECT c.*, u.nombre as profesor_nombre 
            FROM cursos c
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            WHERE c.publicado = 1 
            AND LOWER(c.nombre) LIKE LOWER(?)`;
        return dbHandler.ejecutarQueryAll(query, [`%${busqueda}%`]);
    }

    static async getCursoById(cursoId) {
        const query = `
            SELECT c.*, u.nombre as profesor_nombre 
            FROM cursos c
            LEFT JOIN usuarios u ON u.id = c.profesor_id
            WHERE c.id = ?`;
        return dbHandler.ejecutarQuery(query, [cursoId]);
    }

    static async getSeccionesByCurso(cursoId) {
        const query = 'SELECT * FROM secciones WHERE curso_id = ? ORDER BY orden';
        return dbHandler.ejecutarQueryAll(query, [cursoId]);
    }

    static async verificarInscripcion(cursoId, alumnoId) {
        const query = 'SELECT * FROM inscripciones WHERE curso_id = ? AND alumno_id = ?';
        return dbHandler.ejecutarQuery(query, [cursoId, alumnoId]);
    }

    static async agregarSeccion(nombre, descripcion, cursoId) {
        const query = 'INSERT INTO secciones (nombre, descripcion, curso_id) VALUES (?, ?, ?)';
        return dbHandler.ejecutarQuery(query, [nombre, descripcion, cursoId]);
    }

    static crear(curso) {
        const { nombre, descripcion, profesor_id } = curso;
        
        const query = 'INSERT INTO cursos (nombre, descripcion, publicado) VALUES (?, ?, ?)';
        const params = [nombre, descripcion, 0];
        
        return dbHandler.ejecutarQuery(query, params)
            .then(result => result)
            .catch(err => {
                console.error('Error al crear curso:', err);
                throw err;
            });
    }

    static async asignarProfesor(curso_id, profesor_id) {
        const query = 'UPDATE cursos SET profesor_id = ? WHERE id = ?';
        const params = [profesor_id, curso_id];
        
        return dbHandler.ejecutarQuery(query, params)
            .then(result => result)
            .catch(err => {
                console.error('Error al asignar profesor:', err);
                throw err;
            });
    }
}

module.exports = Curso;
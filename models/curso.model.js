const dbHandler = require('../db/db.handler');
const db = require('../db/conexion');

class Curso {
    static async listarDisponibles() {
        const query = 'SELECT * FROM cursos WHERE profesor_id IS NULL OR profesor_id = 0';
        return dbHandler.ejecutarQueryAll(query);
    }

    // Método para listar todos los cursos
    static async listar() {
        const query = 'SELECT * FROM cursos';
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

    static async publicarCurso(cursoId) {
        const query = 'UPDATE cursos SET publicado = 1 WHERE id = ? AND publicado = 0';
        return dbHandler.ejecutarQuery(query, [cursoId]);
    }

    static async inscribirAlumno(cursoId, alumnoId) {
        const query = 'INSERT INTO inscripciones (alumno_id, curso_id) VALUES (?, ?)';
        return dbHandler.ejecutarQuery(query, [alumnoId, cursoId]);
    }

    static getCursosPopulares = async function (limite = 8) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT c.*, COUNT(i.alumno_id) AS inscriptos
                FROM cursos c
                LEFT JOIN inscripciones i ON c.id = i.curso_id
                WHERE c.publicado = 1
                GROUP BY c.id
                ORDER BY inscriptos DESC
                LIMIT ?
            `;
            db.all(sql, [limite], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    };
}

module.exports = Curso;
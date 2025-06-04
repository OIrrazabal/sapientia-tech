const db = require('../db/conexion');
const dbHandler = require('../db/db.handler');

const Valoracion = {};

// Verificar si un usuario ya ha valorado un curso
Valoracion.existeValoracion = async (curso_id, alumno_id) => {
    const query = 'SELECT * FROM valoraciones WHERE curso_id = ? AND alumno_id = ?';
    return dbHandler.ejecutarQuery(query, [curso_id, alumno_id]);
};

// Crear una nueva valoración
Valoracion.crear = async (valoracion) => {
    const { curso_id, alumno_id, comentario, estrellas } = valoracion;
    const query = 'INSERT INTO valoraciones (curso_id, alumno_id, comentario, estrellas) VALUES (?, ?, ?, ?)';

    return new Promise((resolve, reject) => {
        require('../db/conexion').run(query, [curso_id, alumno_id, comentario, estrellas], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
};

// Obtener todas las valoraciones de un curso
Valoracion.getValoracionesByCurso = async (curso_id) => {
    const query = `
        SELECT v.*, u.nombre as alumno_nombre 
        FROM valoraciones v
        INNER JOIN usuarios u ON v.alumno_id = u.id
        WHERE v.curso_id = ?
        ORDER BY v.fecha_creacion DESC`;
    return dbHandler.ejecutarQueryAll(query, [curso_id]);
};

// Obtener el promedio de valoraciones de un curso
Valoracion.getPromedioByCurso = async (curso_id) => {
    const query = `
        SELECT AVG(estrellas) as promedio, COUNT(*) as total 
        FROM valoraciones 
        WHERE curso_id = ?`;
    return dbHandler.ejecutarQuery(query, [curso_id]);
};

// Obtener las últimas valoraciones
Valoracion.getUltimasValoraciones = async (limite = 10) => {
    try {
        const query = `
            SELECT 
                v.*,
                u.nombre as alumno_nombre,
                c.nombre as curso_nombre,
                c.id as curso_id
            FROM valoraciones v
            INNER JOIN usuarios u ON v.alumno_id = u.id
            INNER JOIN cursos c ON v.curso_id = c.id
            ORDER BY v.fecha_creacion DESC
            LIMIT ?`;
            
        return await dbHandler.ejecutarQueryAll(query, [limite]);
    } catch (error) {
        console.error("Error al obtener últimas valoraciones:", error);
        return [];
    }
};

module.exports = Valoracion;
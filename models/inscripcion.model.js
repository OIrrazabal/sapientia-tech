const db = require('../db/conexion');

const Inscripcion = {};

Inscripcion.obtenerAlumnos = (callback) => {
    // Modificado para obtener todos los usuarios independientemente de su rol
    const sql = `SELECT id, nombre, rol FROM usuarios ORDER BY nombre`;
    db.all(sql, [], callback);
};

Inscripcion.obtenerCursosPublicados = (callback) => {
    const sql = `SELECT id, nombre FROM cursos WHERE publicado = 1`;
    db.all(sql, [], callback);
};
// Verifica si ya existe una inscripción para ese alumno y curso
Inscripcion.existeInscripcion = (alumno_id, curso_id, callback) => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM inscripciones
        WHERE alumno_id = ? AND curso_id = ?
    `;
    db.get(sql, [alumno_id, curso_id], (err, row) => {
        if (err) return callback(err);
        callback(null, row.total > 0); // true si ya existe
    });
};

// Inserta una nueva inscripción
Inscripcion.insertar = (alumno_id, curso_id, callback) => {
    const sql = `
        INSERT INTO inscripciones (alumno_id, curso_id, fecha_inscripcion)
        VALUES (?, ?, DATETIME('now'))
    `;
    db.run(sql, [alumno_id, curso_id], callback);
};


module.exports = Inscripcion;

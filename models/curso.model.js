const dbHandler = require('../db/db.handler');

class Curso {
    static async listarDisponibles() {
        const query = 'SELECT * FROM cursos WHERE profesor_id IS NULL OR profesor_id = 0';
        return dbHandler.ejecutarQueryAll(query);
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
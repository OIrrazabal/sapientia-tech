const dbHandler = require('../db/db.handler');

class Curso {
    static crear(curso) {
        const { nombre, descripcion, profesor_id } = curso;
        
        const query = 'INSERT INTO cursos (nombre, descripcion, profesor_id, publicado) VALUES (?, ?, ?, ?)';
        const params = [nombre, descripcion, profesor_id, 0];
        
        return dbHandler.ejecutarQuery(query, params)
            .then(result => result)
            .catch(err => {
                console.error('Error al crear curso:', err);
                throw err;
            });
    }
}

module.exports = Curso;
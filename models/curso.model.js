const dbHandler = require('../db/db.handler');

const Curso = {
    listar: async () => {
        const query = `SELECT 
                        cursos.id,
                        cursos.titulo,
                        cursos.fecha_creacion,
                        cursos.publicado,
                        categorias.nombre AS categoria,
                        usuarios.nombre as profesor
                        FROM cursos
                        LEFT JOIN categorias ON cursos.categoria_id = categorias.id
                        LEFT JOIN usuarios ON cursos.profesor_id = usuarios.id;`;

        return await dbHandler.ejecutarQueryAll(query);
    },

    findOne: async (id) => {
        const query = `SELECT 
                        cursos.id,
                        cursos.titulo,
                        cursos.descripcion,
                        cursos.fecha_creacion,
                        cursos.publicado,
                        categorias.nombre AS categoria,
                        usuarios.nombre as creador
                        FROM cursos
                        LEFT JOIN categorias ON cursos.categoria_id = categorias.id
                        LEFT JOIN usuarios ON cursos.creador_id = usuarios.id
                        WHERE cursos.id = ?;`;
        return await dbHandler.ejecutarQuery(query, [id]);
      },

    buscarCurso: async (titulo) => {
        return await dbHandler.ejecutarQuery(
            'SELECT * FROM cursos WHERE titulo = ?', 
            [titulo]
        );
    },

    guardar: async (titulo, categoria_id, descripcion, creador_id, fecha_creacion, publicado) => {
        const query = `INSERT INTO cursos (titulo, descripcion, categoria_id, creador_id, fecha_creacion, publicado)
                        VALUES (?, ?, ?, ?, ?, ?)`;
        const valores = [titulo, descripcion, categoria_id, creador_id, fecha_creacion, publicado];
        return await dbHandler.ejecutarQuery(query, valores);
    },

    asignarProfesor: async (curso_id, profesor_id) => {
        const query = `UPDATE cursos
                        SET profesor_id = ?
                        WHERE id = ?`;
        const valores = [profesor_id, curso_id];
        return await dbHandler.ejecutarQuery(query, valores);
    },

    listarProfesor: async (id) => {
        const query = `SELECT 
                        cursos.id,
                        cursos.titulo,
                        cursos.publicado,
                        categorias.nombre AS categoria
                        FROM cursos
                        LEFT JOIN categorias ON cursos.categoria_id = categorias.id
                        WHERE profesor_id = ?;`;

        return await dbHandler.ejecutarQueryAll(query, [id]);
    },

    publicar: async (curso_id, publicado) => {
        const query = `UPDATE cursos
                        SET publicado = ?
                        WHERE id = ?`;
        const valores = [publicado, curso_id];
        return await dbHandler.ejecutarQuery(query, valores);
    }
};

module.exports = Curso;
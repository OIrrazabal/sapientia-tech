const dbHandler = require('../db/db.handler');

const Categoria = {
    listarConTotalCursos: async () => {
        const query = `
            SELECT c.id, c.nombre, c.descripcion, 
                   COUNT(cu.id) as total_cursos
            FROM categorias c
            LEFT JOIN cursos cu ON c.id = cu.categoria_id
            GROUP BY c.id
            ORDER BY c.nombre ASC`;
            
        return await dbHandler.ejecutarQueryAll(query);
    },

    crear: async (categoria) => {
        const query = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
        return await dbHandler.ejecutarQuery(query, [categoria.nombre, categoria.descripcion]);
    },

    existeNombre: async (nombre) => {
        const query = 'SELECT id FROM categorias WHERE nombre = ?';
        const result = await dbHandler.ejecutarQuery(query, [nombre]);
        return result !== undefined;
    },

    obtenerPorId: async (id) => {
        const query = 'SELECT id, nombre, descripcion FROM categorias WHERE id = ?';
        return await dbHandler.ejecutarQuery(query, [id]);
    },

    actualizar: async (id, categoria) => {
        const query = 'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?';
        return await dbHandler.ejecutarQuery(query, [categoria.nombre, categoria.descripcion, id]);
    },

    existeNombreExceptoId: async (nombre, id) => {
        const query = 'SELECT id FROM categorias WHERE nombre = ? AND id != ?';
        const result = await dbHandler.ejecutarQuery(query, [nombre, id]);
        return result !== undefined;
    }
};

module.exports = Categoria;
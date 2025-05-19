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
    }
};

module.exports = Categoria;
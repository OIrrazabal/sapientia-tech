const dbHandler = require('../db/db.handler');
const fs = require('fs').promises;
const path = require('path');

const Categoria = {
    listarTodasDetalladas: async () => {
        const query = `
            SELECT c.id, c.nombre, c.descripcion, c.imagen,
                   COUNT(DISTINCT cu.id) as total_cursos,
                   COUNT(DISTINCT i.alumno_id) as total_inscripciones
            FROM categorias c
            LEFT JOIN cursos cu ON c.id = cu.categoria_id AND cu.publicado = 1
            LEFT JOIN inscripciones i ON i.curso_id = cu.id
            GROUP BY c.id
            ORDER BY total_inscripciones DESC, total_cursos DESC, c.nombre ASC
        `;
        
        return await dbHandler.ejecutarQueryAll(query);
    },

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
        const query = 'INSERT INTO categorias (nombre, descripcion, imagen) VALUES (?, ?, ?)';
        return await dbHandler.ejecutarQuery(query, [
            categoria.nombre, 
            categoria.descripcion,
            categoria.imagen || 'default.jpg'
        ]);
    },

    existeNombre: async (nombre) => {
        const query = 'SELECT id FROM categorias WHERE nombre = ?';
        const result = await dbHandler.ejecutarQuery(query, [nombre]);
        return result !== undefined;
    },

    obtenerPorId: async (id) => {
        const query = 'SELECT id, nombre, descripcion, imagen FROM categorias WHERE id = ?';
        return await dbHandler.ejecutarQuery(query, [id]);
    },

    actualizar: async (id, categoria) => {
        const query = 'UPDATE categorias SET nombre = ?, descripcion = ?, imagen = ? WHERE id = ?';
        return await dbHandler.ejecutarQuery(query, [
            categoria.nombre, 
            categoria.descripcion, 
            categoria.imagen || 'default.jpg',
            id
        ]);
    },

    existeNombreExceptoId: async (nombre, id) => {
        const query = 'SELECT id FROM categorias WHERE nombre = ? AND id != ?';
        const result = await dbHandler.ejecutarQuery(query, [nombre, id]);
        return result !== undefined;
    },

    eliminarImagen: async (imagePath) => {
        try {
            const exists = await fs.access(imagePath).then(() => true).catch(() => false);
            if (exists) {
                await fs.unlink(imagePath);
            }
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
        }
    }
};

module.exports = Categoria;
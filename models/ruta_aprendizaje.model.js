const db = require('../db/conexion');
const util = require('util');

class RutaAprendizaje {
    // Listar todas las rutas de aprendizaje
    static async listar() {
        const dbAll = util.promisify(db.all).bind(db);
        const rutas = await dbAll(`
            SELECT 
                r.id, 
                r.nombre, 
                r.descripcion,
                r.fecha_creacion,
                COUNT(rc.curso_id) AS total_cursos
            FROM rutas_aprendizaje r
            LEFT JOIN ruta_curso rc ON r.id = rc.ruta_id
            GROUP BY r.id
            ORDER BY r.nombre
        `);
        return rutas;
    }

    // Obtener una ruta por su ID
    static async obtenerPorId(id) {
        const dbGet = util.promisify(db.get).bind(db);
        const ruta = await dbGet('SELECT * FROM rutas_aprendizaje WHERE id = ?', [id]);
        return ruta;
    }

    // Verificar si ya existe una ruta con el mismo nombre
    static async existeNombre(nombre, idExcluir = null) {
        const dbGet = util.promisify(db.get).bind(db);
        let query = 'SELECT COUNT(*) as count FROM rutas_aprendizaje WHERE nombre = ?';
        const params = [nombre];

        if (idExcluir) {
            query += ' AND id != ?';
            params.push(idExcluir);
        }

        const result = await dbGet(query, params);
        return result.count > 0;
    }    // Crear una nueva ruta de aprendizaje
    static async crear({ nombre, descripcion }) {
        try {
            // Primero verificamos si la tabla existe
            const dbGet = util.promisify(db.get).bind(db);
            const tableCheck = await dbGet("SELECT name FROM sqlite_master WHERE type='table' AND name='rutas_aprendizaje'");
            
            if (!tableCheck) {
                throw new Error("La tabla rutas_aprendizaje no existe. Por favor ejecute el script de creación de tablas.");
            }
            
            // Usamos db.handler para garantizar que tenemos el lastID
            const { ejecutarQueryConResultado } = require('../db/db.handler');
            const result = await ejecutarQueryConResultado(
                'INSERT INTO rutas_aprendizaje (nombre, descripcion) VALUES (?, ?)',
                [nombre, descripcion || null]
            );
            
            // El resultado de ejecutarQueryConResultado debe tener lastID
            if (result && result.lastID) {
                return result.lastID;
            }
            
            // Como último recurso, si no tenemos lastID, consultamos el último ID insertado
            const lastInsert = await dbGet('SELECT last_insert_rowid() as id');
            return lastInsert.id;
        } catch (error) {
            console.error('Error al crear ruta de aprendizaje:', error);
            throw new Error(`Error al crear ruta de aprendizaje: ${error.message}`);
        }
    }// Actualizar una ruta existente
    static async actualizar({ id, nombre, descripcion }) {
        const dbRun = util.promisify(db.run).bind(db);
        await dbRun(
            'UPDATE rutas_aprendizaje SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion || null, id]
        );
        return id;
    }

    // Eliminar una ruta
    static async eliminar(id) {
        const dbRun = util.promisify(db.run).bind(db);
        
        // Primero eliminar las relaciones con cursos
        await dbRun('DELETE FROM ruta_curso WHERE ruta_id = ?', [id]);
        
        // Luego eliminar la ruta
        await dbRun('DELETE FROM rutas_aprendizaje WHERE id = ?', [id]);
        return true;
    }

    // Obtener todos los cursos de una ruta
    static async obtenerCursos(rutaId) {
        const dbAll = util.promisify(db.all).bind(db);
        const cursos = await dbAll(`
            SELECT 
                c.id, 
                c.nombre, 
                c.descripcion,
                rc.orden,
                cat.nombre AS categoria
            FROM cursos c
            JOIN ruta_curso rc ON c.id = rc.curso_id
            LEFT JOIN categorias cat ON c.categoria_id = cat.id
            WHERE rc.ruta_id = ?
            ORDER BY rc.orden, c.nombre
        `, [rutaId]);
        return cursos;
    }

    // Agregar un curso a una ruta
    static async agregarCurso(rutaId, cursoId, orden = 0) {
        const dbRun = util.promisify(db.run).bind(db);
        try {
            await dbRun(
                'INSERT INTO ruta_curso (ruta_id, curso_id, orden) VALUES (?, ?, ?)',
                [rutaId, cursoId, orden]
            );
            return true;
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('Este curso ya está asignado a otra ruta de aprendizaje');
            }
            throw error;
        }
    }

    // Eliminar un curso de una ruta
    static async eliminarCurso(rutaId, cursoId) {
        const dbRun = util.promisify(db.run).bind(db);
        await dbRun(
            'DELETE FROM ruta_curso WHERE ruta_id = ? AND curso_id = ?',
            [rutaId, cursoId]
        );
        return true;
   }

    // Alias para eliminarCurso (usado en el controlador)
    static async quitarCurso(rutaId, cursoId) {
        return this.eliminarCurso(rutaId, cursoId);
    }

    // Quitar todos los cursos de una ruta
    static async quitarTodosCursos(rutaId) {
        const dbRun = util.promisify(db.run).bind(db);
        await dbRun('DELETE FROM ruta_curso WHERE ruta_id = ?', [rutaId]);
        return true;
    }

    // Obtener cursos disponibles (que no están en ninguna ruta)
    static async cursosDisponibles() {
        const dbAll = util.promisify(db.all).bind(db);
        const cursos = await dbAll(`
            SELECT 
                c.id, 
                c.nombre, 
                c.descripcion,
                cat.nombre AS categoria
            FROM cursos c
            LEFT JOIN ruta_curso rc ON c.id = rc.curso_id
            LEFT JOIN categorias cat ON c.categoria_id = cat.id
            WHERE rc.id IS NULL
            ORDER BY c.nombre
        `);
        return cursos;
    }

    // Obtener la ruta de un curso específico
    static async obtenerRutaDeCurso(cursoId) {
        const dbGet = util.promisify(db.get).bind(db);
        const ruta = await dbGet(`
            SELECT 
                r.id, 
                r.nombre, 
                r.descripcion
            FROM rutas_aprendizaje r
            JOIN ruta_curso rc ON r.id = rc.ruta_id
            WHERE rc.curso_id = ?
        `, [cursoId]);
        return ruta || null;
    }
}

module.exports = RutaAprendizaje;

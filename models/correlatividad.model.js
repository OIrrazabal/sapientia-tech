const db = require('../db/conexion');
const util = require('util');

class Correlatividad {
    // Obtener todas las correlatividades de un curso
    static async obtenerCorrelatividades(cursoId) {
        const dbAll = util.promisify(db.all).bind(db);
        try {
            const correlatividades = await dbAll(`
                SELECT 
                    c.id,
                    c.correlativo_id,
                    curso.nombre AS curso_nombre,
                    correlativo.nombre AS correlativo_nombre,
                    c.fecha_creacion
                FROM correlatividades c
                JOIN cursos curso ON c.curso_id = curso.id
                JOIN cursos correlativo ON c.correlativo_id = correlativo.id
                WHERE c.curso_id = ?
            `, [cursoId]);
            return correlatividades;
        } catch (error) {
            console.error('Error al obtener correlatividades:', error);
            return [];
        }
    }

    // Verificar si un curso ya tiene una correlatividad específica
    static async existeCorrelatividad(cursoId, correlativoId) {
        const dbGet = util.promisify(db.get).bind(db);
        try {
            const correlatividad = await dbGet(`
                SELECT COUNT(*) as count
                FROM correlatividades
                WHERE curso_id = ? AND correlativo_id = ?
            `, [cursoId, correlativoId]);
            return correlatividad.count > 0;
        } catch (error) {
            console.error('Error al verificar correlatividad:', error);
            return false;
        }
    }

    // Agregar una correlatividad
    static async agregarCorrelatividad(cursoId, correlativoId) {
        const dbRun = util.promisify(db.run).bind(db);
        try {
            // Verificar que el correlativo no sea el mismo curso
            if (cursoId === correlativoId) {
                throw new Error('Un curso no puede ser correlativo de sí mismo');
            }

            // Insertar la correlatividad
            await dbRun(`
                INSERT INTO correlatividades (curso_id, correlativo_id)
                VALUES (?, ?)
            `, [cursoId, correlativoId]);
            return true;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Esta correlatividad ya existe');
            }
            throw error;
        }
    }

    // Eliminar una correlatividad
    static async eliminarCorrelatividad(cursoId, correlativoId) {
        const dbRun = util.promisify(db.run).bind(db);
        try {
            await dbRun(`
                DELETE FROM correlatividades
                WHERE curso_id = ? AND correlativo_id = ?
            `, [cursoId, correlativoId]);
            return true;
        } catch (error) {
            console.error('Error al eliminar correlatividad:', error);
            throw error;
        }
    }

    // Verificar si un curso es correlativo de otros cursos en la misma ruta
    // Devuelve TRUE si el curso es un prerrequisito (correlativo_id) para otros cursos,
    // lo que significa que no debería poder eliminarse de la ruta
    static async esCursoCorrelatividad(cursoId) {
        const dbGet = util.promisify(db.get).bind(db);
        try {
            const resultado = await dbGet(`
                SELECT COUNT(*) as count
                FROM correlatividades
                WHERE correlativo_id = ?
            `, [cursoId]);
            return resultado.count > 0;
        } catch (error) {
            console.error('Error al verificar si el curso es correlatividad:', error);
            return false;
        }
    }

    // Verificar si el alumno cumple con todas las correlatividades de un curso
    static async verificarCorrelatividades(cursoId, alumnoId) {
        const dbAll = util.promisify(db.all).bind(db);
        try {
            // Obtener todas las correlatividades del curso
            const correlatividades = await dbAll(`
                SELECT 
                    c.correlativo_id,
                    co.nombre as curso_nombre
                FROM correlatividades c
                JOIN cursos co ON c.correlativo_id = co.id
                WHERE c.curso_id = ?
            `, [cursoId]);

            if (!correlatividades.length) {
                // Si no hay correlatividades, cumple por defecto
                return { 
                    cumple: true,
                    correlativasPendientes: []
                };
            }

            // Verificar si está inscrito en todos los cursos correlativos
            const correlatividadesPendientes = [];
            for (const correlatividad of correlatividades) {
                const inscripcion = await dbAll(`
                    SELECT * FROM inscripciones
                    WHERE alumno_id = ? AND curso_id = ?
                `, [alumnoId, correlatividad.correlativo_id]);

                if (!inscripcion.length) {
                    correlatividadesPendientes.push({
                        id: correlatividad.correlativo_id,
                        nombre: correlatividad.curso_nombre
                    });
                }
            }

            return { 
                cumple: correlatividadesPendientes.length === 0,
                correlativasPendientes: correlatividadesPendientes
            };
        } catch (error) {
            console.error('Error al verificar correlatividades para inscripción:', error);
            throw error;
        }
    }
}

module.exports = Correlatividad;

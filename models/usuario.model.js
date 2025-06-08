const dbHandler = require('../db/db.handler');
const db = require('../db/conexion');
const util = require('util');

const Usuario = {
    listar: async () => {
        try {
            // Asegúrate de hacer await y devolver el resultado, no la conexión
            const usuarios = await dbHandler.ejecutarQueryAll("SELECT * FROM usuarios");
            return usuarios; // Esto debería ser un array
        } catch (error) {
            console.error("Error al listar usuarios:", error);
            return []; // Devuelve array vacío en caso de error
        }
    },

    findOne: async ({ email }) => {
        return await dbHandler.ejecutarQuery(
            'SELECT * FROM usuarios WHERE email = ?', 
            [email]
        );
    },

    buscarUsuario: async (username, password) => {
        return await dbHandler.ejecutarQuery(
            'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?', 
            [username, password]
        );
    },

    loginAdmin: async (email, password) => {
        const user = await dbHandler.ejecutarQuery(
            'SELECT * FROM usuarios WHERE email = ? AND es_admin = 1 AND contraseña = ?', 
            [email, password]
        );
        return user ? { success: true, user } : { success: false, message: 'Usuario no encontrado' };
    },

    comparePassword: async (inputPassword, storedPassword) => {
        return inputPassword === storedPassword;
    },

    obtenerUsuariosConContadores: async function() {
        const sql = `
            SELECT 
                u.id, u.nombre, u.email, u.es_admin,
                COUNT(DISTINCT c_prof.id) AS cursos_profesor,
                COUNT(DISTINCT i.curso_id) AS cursos_alumno,
                GROUP_CONCAT(DISTINCT c_prof.nombre) AS materias_profesor,
                GROUP_CONCAT(DISTINCT c_alum.nombre) AS materias_alumno
            FROM usuarios u
            LEFT JOIN cursos c_prof ON c_prof.profesor_id = u.id
            LEFT JOIN inscripciones i ON i.alumno_id = u.id
            LEFT JOIN cursos c_alum ON c_alum.id = i.curso_id
            GROUP BY u.id
        `;
        
        return dbHandler.ejecutarQueryAll(sql);
    },

    // Obtener usuario por email
    obtenerPorEmail: async (email) => {
        try {
            const query = 'SELECT * FROM usuarios WHERE email = ?';
            const dbGet = util.promisify(db.get).bind(db);
            return await dbGet(query, [email]);
        } catch (error) {
            console.error('Error al obtener usuario por email:', error);
            throw error;
        }
    },

    // Crear usuario
    crear: async (usuario) => {
        try {
            const { nombre, email, contraseña, es_admin, telefono, direccion } = usuario;
            const query = `
                INSERT INTO usuarios 
                (nombre, email, contraseña, es_admin, telefono, direccion) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const dbRun = util.promisify(db.run).bind(db);
            return await dbRun(
                query, 
                [nombre, email, contraseña, es_admin, telefono || '', direccion || '']
            );
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    },

    // Obtener usuario por id
    obtenerPorId: async (id) => {
        try {
            const query = 'SELECT * FROM usuarios WHERE id = ?';
            const dbGet = util.promisify(db.get).bind(db);
            return await dbGet(query, [id]);
        } catch (error) {
            console.error('Error al obtener usuario por id:', error);
            throw error;
        }
    },

    // Verificar si existe email excepto para un id
    existeEmailExceptoId: async (email, id) => {
        try {
            const query = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ? AND id != ?';
            const dbGet = util.promisify(db.get).bind(db);
            const result = await dbGet(query, [email, id]);
            return result.count > 0;
        } catch (error) {
            console.error('Error al verificar email:', error);
            throw error;
        }
    },

    // Actualizar usuario
    actualizar: async (id, usuario) => {
        try {
            const { nombre, email, contraseña, es_admin, telefono, direccion } = usuario;
            
            // Si hay contraseña nueva, actualizarla también
            if (contraseña) {
                const query = `
                    UPDATE usuarios 
                    SET nombre = ?, email = ?, contraseña = ?, es_admin = ?, telefono = ?, direccion = ?
                    WHERE id = ?
                `;
                const dbRun = util.promisify(db.run).bind(db);
                return await dbRun(
                    query, 
                    [nombre, email, contraseña, es_admin, telefono || '', direccion || '', id]
                );
            } else {
                // Si no hay contraseña nueva, mantener la existente
                const query = `
                    UPDATE usuarios 
                    SET nombre = ?, email = ?, es_admin = ?, telefono = ?, direccion = ?
                    WHERE id = ?
                `;
                const dbRun = util.promisify(db.run).bind(db);
                return await dbRun(
                    query, 
                    [nombre, email, es_admin, telefono || '', direccion || '', id]
                );
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },

    getProfesores: async () => {
        const sql = `
            SELECT u.*, GROUP_CONCAT(c.nombre, ', ') AS cursos
            FROM usuarios u
            JOIN cursos c ON c.profesor_id = u.id
            GROUP BY u.id
        `;
        const rows = await dbHandler.ejecutarQueryAll(sql);
        return rows.map(row => ({
            ...row,
            cursos: row.cursos ? row.cursos.split(', ') : []
        }));
    },
};
marcarComoInactivo: async (id) => {
    const db = require('../db/conexion');
    return new Promise((resolve, reject) => {
        db.run('UPDATE usuarios SET activo = 0 WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}



module.exports = Usuario;
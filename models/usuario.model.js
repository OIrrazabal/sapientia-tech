const dbHandler = require('../db/db.handler');
const db = require('../db/conexion');
const util = require('util');
const util = require('util');

const Usuario = {
    listar: async () => {
        return await dbHandler.ejecutarQueryAll('SELECT * FROM usuarios');
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

    getProfesores: async () => {
        return await dbHandler.ejecutarQueryAll(
            'SELECT * FROM usuarios WHERE rol = ?', 
            ['profesor']
        );
    },

    obtenerUsuariosConContadores: async function() {
        const sql = `
            SELECT u.id, u.nombre, u.email, u.rol,
                (SELECT COUNT(*) FROM inscripciones i WHERE i.alumno_id = u.id) AS cursos_alumno,
                (SELECT COUNT(*) FROM cursos c WHERE c.profesor_id = u.id) AS cursos_profesor,
                (SELECT GROUP_CONCAT(c2.nombre, ', ') 
                    FROM inscripciones i2 
                    JOIN cursos c2 ON i2.curso_id = c2.id 
                    WHERE i2.alumno_id = u.id
                ) AS materias_alumno,
                (SELECT GROUP_CONCAT(c3.nombre, ', ') 
                    FROM cursos c3 
                    WHERE c3.profesor_id = u.id
                ) AS materias_profesor
            FROM usuarios u
        `;
        return new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
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
            const { nombre, email, contraseña, es_admin, telefono, direccion, rol } = usuario;
            const query = `
                INSERT INTO usuarios 
                (nombre, email, contraseña, es_admin, telefono, direccion, rol) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const dbRun = util.promisify(db.run).bind(db);
            return await dbRun(
                query, 
                [nombre, email, contraseña, es_admin, telefono || '', direccion || '', rol]
            );
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
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
            const { nombre, email, contraseña, es_admin, telefono, direccion, rol } = usuario;
            const query = `
                INSERT INTO usuarios 
                (nombre, email, contraseña, es_admin, telefono, direccion, rol) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            const dbRun = util.promisify(db.run).bind(db);
            return await dbRun(
                query, 
                [nombre, email, contraseña, es_admin, telefono || '', direccion || '', rol]
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
            const { nombre, email, contraseña, es_admin, telefono, direccion, rol } = usuario;
            
            // Si hay contraseña nueva, actualizarla también
            if (contraseña) {
                const query = `
                    UPDATE usuarios 
                    SET nombre = ?, email = ?, contraseña = ?, es_admin = ?, telefono = ?, direccion = ?, rol = ?
                    WHERE id = ?
                `;
                const dbRun = util.promisify(db.run).bind(db);
                return await dbRun(
                    query, 
                    [nombre, email, contraseña, es_admin, telefono || '', direccion || '', rol, id]
                );
            } else {
                // Si no hay contraseña nueva, mantener la existente
                const query = `
                    UPDATE usuarios 
                    SET nombre = ?, email = ?, es_admin = ?, telefono = ?, direccion = ?, rol = ?
                    WHERE id = ?
                `;
                const dbRun = util.promisify(db.run).bind(db);
                return await dbRun(
                    query, 
                    [nombre, email, es_admin, telefono || '', direccion || '', rol, id]
                );
            }
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },
};


module.exports = Usuario;
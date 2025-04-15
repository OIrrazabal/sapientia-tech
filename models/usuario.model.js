const db = require('../db/conexion');

const Usuario = {
    // Método para listar todos los usuarios
    listar: async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM usuarios', [], (err, rows) => {
                if (err) {
                reject(err);
                } else {
                  resolve(rows); // <- acá sí está bien definido
                }
            });
        });
    },

    // Método para login del administrador
    loginAdmin: async (username, password) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE nombre = ? AND tipo = "administrador" AND contraseña = ?', [username, password], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve({ success: false, message: 'Usuario no encontrado' });
                } else {
                    resolve({ success: true, user: row });
                }
            });
        });
    },

    // Buscar usuario por usuario y contraseña
    buscarUsuario: async (username, password) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ?', [username, password], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null); // Retorna el usuario si la contraseña es válida
                }
            });
        });
    },




};

module.exports = Usuario;
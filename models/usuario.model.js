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
    }
};

module.exports = Usuario;
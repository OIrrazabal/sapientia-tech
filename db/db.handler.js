const db = require('./conexion');

const dbHandler = {
    ejecutarQuery: (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(query, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    ejecutarQueryAll: (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // ✅ ESTA ES LA NUEVA FUNCIÓN DENTRO DEL OBJETO
    ejecutarQueryConResultado: (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(query, params, function (err) {
                if (err) reject(err);
                else resolve(this); // this contiene lastID
            });
        });
    }
};

module.exports = dbHandler;
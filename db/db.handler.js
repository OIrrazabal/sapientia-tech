const db = require('./conexion');

const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (error, rows) => {
            if (error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    executeQuery
};
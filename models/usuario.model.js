const dbHandler = require('../db/db.handler');

const Usuario = {
    listar: async () => {
        return await dbHandler.ejecutarQueryAll('SELECT * FROM usuarios');
    },

    findOne: async ( email ) => {
        console.log('Email:', email);
        return await dbHandler.ejecutarQuery(
            "SELECT * FROM usuarios WHERE email = ?", 
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
    }
};

module.exports = Usuario;
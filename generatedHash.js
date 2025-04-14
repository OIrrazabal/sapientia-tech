const bcrypt = require('bcrypt');

// Generar el hash de la contraseña
const password = '123456';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log(hashedPassword);
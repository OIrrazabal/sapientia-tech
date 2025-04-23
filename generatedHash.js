const bcrypt = require('bcrypt');

const password = '123456';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error generando hash:', err);
        return;
    }
    console.log('Hash para usar en el SQL:', hash);
});
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets/categorias');
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const id = req.params.id || Date.now();
        cb(null, `${id}${extension}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no válido. Solo se permiten: ' + allowedTypes.join(', ')));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
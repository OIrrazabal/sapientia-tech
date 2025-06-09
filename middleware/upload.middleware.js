const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Configuración para fotos de perfil
const storageProfile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../assets/profile'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, req.session.usuario.id + ext);
    }
});
const uploadProfile = multer({ storage: storageProfile });

// Configuración para otras imágenes (ej: categorías)
const storageCategoria = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../assets/categorias'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const uploadCategoria = multer({ storage: storageCategoria });

// Middleware para eliminar fotos anteriores de perfil
function deleteOldProfilePhotos(req, res, next) {
    const usuarioId = req.session.usuario.id;
    const exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const profileDir = path.join(__dirname, '../assets/profile');
    for (const ext of exts) {
        const filePath = path.join(profileDir, `${usuarioId}.${ext}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    next();
}

module.exports = {
    uploadProfile,    // Para fotos de perfil
    uploadCategoria,  // Para imágenes de categorías
    deleteOldProfilePhotos // Para limpiar fotos viejas antes de subir una nueva
};
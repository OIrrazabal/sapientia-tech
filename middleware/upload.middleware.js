const fs = require('fs');
const fsPromises = require('fs').promises;
const multer     = require('multer');
const path       = require('path');

// extensiones y MIMEs
const EXTENSIONES_PERMITIDAS = ['.jpg','.jpeg','.png','.webp'];
const MIMES_PERMITIDOS       = ['image/jpeg','image/png','image/webp'];

// storage
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, '../assets/profile')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, req.session.usuario.id + ext);
  }
});

// filtro
function fileFilterProfile(req, file, cb) {
  const ext  = path.extname(file.originalname).toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.includes(ext))
    return cb(new Error('Solo se aceptan Formatos Permitidos: JPG, JPEG, PNG Y WEBP'), false);
  if (!MIMES_PERMITIDOS.includes(file.mimetype))
    return cb(new Error('Tipo de archivo no válido'), false);
  cb(null, true);
}

const uploadProfile = multer({
  storage: storageProfile,
  fileFilter: fileFilterProfile,
  limits: { fileSize: 2*1024*1024 }
});

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

// borrar antiguas
async function deleteOldProfilePhotos(req, res, next) {
  if (!req.file) return next();
  const id  = req.session.usuario.id;
  const dir = path.join(__dirname, '../assets/profile');
  const keep = req.file.filename;
  const all  = await fsPromises.readdir(dir);
  await Promise.all(
    all
      .filter(f => f.startsWith(id + '.') && f !== keep)
      .map(f => fsPromises.unlink(path.join(dir, f)))
  );
  next();
}

module.exports = {
  uploadProfile,    
  uploadCategoria,  
  deleteOldProfilePhotos 
};
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

// Configuración para imágenes de categorías
const storageCategoria = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../assets/categorias'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Filtro para categorías y cursos
function fileFilterGeneral(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!EXTENSIONES_PERMITIDAS.includes(ext))
    return cb(new Error('Solo se aceptan Formatos Permitidos: JPG, JPEG, PNG Y WEBP'), false);
  if (!MIMES_PERMITIDOS.includes(file.mimetype))
    return cb(new Error('Tipo de archivo no válido'), false);
  cb(null, true);
}

const uploadCategoria = multer({ 
  storage: storageCategoria,
  fileFilter: fileFilterGeneral,
  limits: { fileSize: 5*1024*1024 } // 5MB 
});

// Configuración para imágenes de cursos
const storageCurso = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../assets/cursos');
    // Asegurar que el directorio existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Si estamos editando, usamos el id como nombre base
    if (req.params && req.params.id) {
      // Para curso existente, usar su ID
      console.log(`Editando curso ID: ${req.params.id}, asignando nombre: ${req.params.id}${ext}`);
      return cb(null, req.params.id + ext);
    } else {
      // Para nuevos cursos, usar un timestamp temporal
      const tempName = 'temp_' + Date.now() + ext;
      console.log(`Nuevo curso, asignando nombre temporal: ${tempName}`);
      cb(null, tempName);
    }
  }
});

const uploadCurso = multer({ 
  storage: storageCurso,
  fileFilter: fileFilterGeneral,
  limits: { fileSize: 5*1024*1024 } // 5MB
});

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
  uploadCurso,
  deleteOldProfilePhotos,
  uploadCurso,
  deleteOldProfilePhotos
};
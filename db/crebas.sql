CREATE TABLE "usuarios" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    contraseña TEXT NOT NULL,
    es_admin INTEGER DEFAULT 0, -- 0: usuario normal, 1: administrador
    telefono TEXT,
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rol TEXT
    activo INTEGER DEFAULT 1 -- 1: activo, 0: dado de baja (borrado lógico)
);

CREATE TABLE inscripciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    imagen TEXT
);

CREATE TABLE cursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    profesor_id INTEGER,
    categoria_id INTEGER,
    publicado INTEGER DEFAULT 0,
    FOREIGN KEY (profesor_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE secciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    curso_id INTEGER NOT NULL,
    orden INTEGER DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE asignaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_curso INTEGER NOT NULL,
    id_profesor INTEGER NOT NULL
);

CREATE TABLE valoraciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL,
    alumno_id INTEGER NOT NULL,
    comentario TEXT NOT NULL,
    estrellas INTEGER NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id),
    UNIQUE (curso_id, alumno_id)
);

CREATE VIEW vista_profesores_con_cursos AS
SELECT 
  u.id, 
  u.nombre, 
  u.email, 
  c.nombre AS curso
FROM usuarios u
JOIN asignaciones a ON u.id = a.id_profesor
JOIN cursos c ON a.id_curso = c.id;

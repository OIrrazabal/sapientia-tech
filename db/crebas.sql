
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    contraseña TEXT NOT NULL,
    es_admin INTEGER DEFAULT 0, -- 0: usuario normal, 1: administrador
    telefono TEXT,
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


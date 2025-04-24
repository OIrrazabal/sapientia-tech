-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, email, contraseña, es_admin, telefono, direccion, rol) VALUES 
('Admin Sistema', 'admin@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 1, '0991234567', 'Dirección Admin 123', 'admin'),
('Juan Profesor', 'profesor@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0997654321', 'Dirección Profesor 456', 'profesor'),
('Ana Profesora', 'ana.prof@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0997654322', 'Dirección Profesor 457', 'profesor'),
('Carlos Profesor', 'carlos.prof@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0997654323', 'Dirección Profesor 458', 'profesor'),
('Maria Estudiante', 'estudiante@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0993334444', 'Dirección Estudiante 789', 'estudiante'),
('Pedro Estudiante', 'pedro.est@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0993334445', 'Dirección Estudiante 790', 'estudiante'),
('Laura Estudiante', 'laura.est@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0993334446', 'Dirección Estudiante 791', 'estudiante'),
('José Estudiante', 'jose.est@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0993334447', 'Dirección Estudiante 792', 'estudiante');

INSERT INTO cursos (nombre, descripcion, profesor_id, publicado) VALUES
('Inteligencia Artificial', 'Introducción al aprendizaje automático', NULL, 0),
('Desarrollo de Aplicaciones Móviles', 'Creación de apps para Android e iOS', NULL, 0),
('Bases de Datos Avanzadas', 'Optimización y administración de bases de datos', NULL, 0),
('Programación en Python', 'Fundamentos y aplicaciones prácticas', NULL, 0),
('Algoritmos y Estructuras de Datos', 'Análisis y diseño de algoritmos eficientes', NULL, 0),
('Ciberseguridad', 'Protección de sistemas y redes informáticas', NULL, 0),
('Diseño UX/UI', 'Principios de diseño centrado en el usuario', NULL, 0),
('Desarrollo Web', 'Frontend con React y backend con Node.js', NULL, 0),
('Cálculo 2', 'Derivadas e integrales de funciones de varias variables', NULL, 0),
('Redes de Computadoras', 'Conceptos básicos de redes, protocolos y topologías', NULL, 0),
('Sistemas Operativos', 'Gestión de procesos, memoria y archivos', NULL, 0),
('Psicología Cognitiva', 'Estudio de los procesos mentales del aprendizaje', NULL, 0),
('Emprendimiento Digital', 'Cómo lanzar y escalar productos tecnológicos', NULL, 0),
('Estadística Aplicada', 'Métodos estadísticos en el análisis de datos reales', NULL, 0);

INSERT INTO inscripciones (alumno_id, curso_id, fecha_inscripcion) VALUES
(1, 1, '2025-04-24 20:00:00'),
(2, 2, '2025-04-24 20:05:00'),
(3, 3, '2025-04-24 20:10:00');
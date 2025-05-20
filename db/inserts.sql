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

INSERT INTO cursos (nombre, descripcion, profesor_id, publicado, categoria_id) VALUES
-- Cursos publicados (publicado = 1)
('Inteligencia Artificial', 'Introducción al aprendizaje automático', 2, 1, 1),
('Desarrollo de Aplicaciones Móviles', 'Creación de apps para Android e iOS', 3, 1, 2),
('Bases de Datos Avanzadas', 'Optimización y administración de bases de datos', 4, 1, 3),
('Machine Learning con Python', 'Modelos supervisados y no supervisados con scikit-learn', 2, 1, 1),
('Desarrollo Web Avanzado', 'Construcción de APIs REST con Node.js y Express', 3, 1, 2),
('Administración de Bases de Datos', 'Tareas comunes de mantenimiento y tuning', 4, 1, 3),
('Ciberseguridad Aplicada', 'Análisis de vulnerabilidades y pruebas de penetración', 2, 1, 5),
('Diseño de Interfaces Responsivas', 'Adaptación de interfaces a dispositivos móviles', 3, 1, 6),
('Estadística para Ciencia de Datos', 'Probabilidades, distribuciones y regresiones', 4, 1, 4),
('Gestión de Proyectos Tecnológicos', 'Scrum, Kanban y herramientas de colaboración', 2, 1, 11),

-- Cursos no publicados con profesor asignado (publicado = 0)
('Fundamentos de Redes', 'Modelo OSI, TCP/IP, cableado y direccionamiento', 3, 0, 9),
('Introducción a la Psicología', 'Procesos básicos del comportamiento humano', 4, 0, 10),
('Diseño Gráfico Digital', 'Uso de herramientas como Photoshop e Illustrator', 2, 0, 6),
('Matemáticas Discretas', 'Lógica, conjuntos, grafos y estructuras algebraicas', 3, 0, 7),
('Modelado de Datos', 'Diseño conceptual, lógico y físico de bases de datos', 4, 0, 3),
-- cursos no publicados y sin profesor asignado
('Ética Profesional', 'Principios éticos aplicados al ámbito laboral', NULL, 0, 10),
('Introducción al Emprendimiento', 'Fundamentos para iniciar un negocio propio', NULL, 0, 11),
('Cálculo 1', 'Funciones, límites y derivadas', NULL, 0, 7),
('Fundamentos de UX', 'Psicología y diseño orientado a la experiencia de usuario', NULL, 0, 6),
('Big Data', 'Procesamiento de grandes volúmenes de datos con Hadoop y Spark', NULL, 0, 4);

INSERT INTO inscripciones (alumno_id, curso_id, fecha_inscripcion) VALUES
(5, 1, '2025-04-24 20:00:00'),
(6, 2, '2025-04-24 20:05:00'),
(7, 3, '2025-04-24 20:10:00');

INSERT INTO categorias (nombre, descripcion) VALUES
('Inteligencia Artificial', 'Cursos relacionados con machine learning, redes neuronales y sistemas inteligentes'),
('Desarrollo de Software', 'Programación, frameworks, desarrollo web y móvil'),
('Bases de Datos', 'Diseño, administración y optimización de bases de datos'),
('Ciencia de Datos', 'Análisis estadístico, big data y visualización de datos'),
('Ciberseguridad', 'Protección de datos, hacking ético y gestión de riesgos'),
('Diseño', 'Diseño UX/UI, herramientas visuales y experiencia de usuario'),
('Matemáticas', 'Cálculo, álgebra, estadística y fundamentos matemáticos'),
('Sistemas Operativos', 'Administración, procesos, memoria y sistemas UNIX'),
('Redes', 'Protocolos de comunicación, infraestructura y redes informáticas'),
('Psicología', 'Procesos cognitivos, aprendizaje y comportamiento humano'),
('Negocios y Emprendimiento', 'Gestión de productos, startups y modelos de negocio');

INSERT INTO secciones (nombre, descripcion, curso_id, orden) VALUES
-- Curso 1: Inteligencia Artificial
('Introducción a la IA', 'Conceptos básicos y aplicaciones iniciales', 1, 1),
('Aprendizaje Supervisado', 'Clasificación y regresión con algoritmos clásicos', 1, 2),
('Redes Neuronales', 'Fundamentos de redes neuronales artificiales', 1, 3),

-- Curso 2: Desarrollo de Aplicaciones Móviles
('Fundamentos de Apps Móviles', 'Plataformas, lenguajes y herramientas', 2, 1),
('Desarrollo con Flutter', 'Creación de interfaces multiplataforma', 2, 2),
('Consumo de APIs', 'Integración de servicios web en apps móviles', 2, 3),

-- Curso 3: Bases de Datos Avanzadas
('Modelado Avanzado', 'Normalización y esquemas complejos', 3, 1),
('Optimización de Consultas', 'Técnicas para mejorar el rendimiento SQL', 3, 2),
('Replicación y Respaldo', 'Estrategias para alta disponibilidad y seguridad', 3, 3),

-- Curso 4: Machine Learning con Python
('Preprocesamiento de Datos', 'Limpieza, normalización y encoding', 4, 1),
('Modelos Supervisados', 'Clasificación y regresión en Python', 4, 2),
('Modelos No Supervisados', 'Clustering y reducción de dimensionalidad', 4, 3),

-- Curso 5: Desarrollo Web Avanzado
('APIs RESTful', 'Estructura de APIs con Express.js', 5, 1),
('Autenticación', 'JWT y OAuth en backend', 5, 2),
('Testing de API', 'Pruebas con Postman y frameworks de testing', 5, 3),

-- Curso 6: Administración de Bases de Datos
('Instalación y Configuración', 'PostgreSQL, MySQL y MongoDB', 6, 1),
('Backups y Seguridad', 'Respaldo, cifrado y permisos', 6, 2),
('Monitoreo de Rendimiento', 'Herramientas de tuning y logging', 6, 3),

-- Curso 7: Ciberseguridad Aplicada
('Fundamentos de Ciberseguridad', 'Tipos de amenazas y vectores de ataque', 7, 1),
('Pruebas de Penetración', 'Herramientas como Metasploit y Nmap', 7, 2),
('Mitigación de Riesgos', 'Planificación de seguridad y respuesta a incidentes', 7, 3),

-- Curso 8: Diseño de Interfaces Responsivas
('Mobile First', 'Diseño adaptable desde dispositivos pequeños', 8, 1),
('Grid y Flexbox', 'Técnicas modernas de maquetación', 8, 2),
('Testing UI', 'Pruebas de usabilidad y accesibilidad', 8, 3),

-- Curso 9: Estadística para Ciencia de Datos
('Estadística Descriptiva', 'Medidas de centralización y dispersión', 9, 1),
('Inferencia Estadística', 'Intervalos de confianza y pruebas de hipótesis', 9, 2),
('Regresión Lineal', 'Ajuste de modelos y evaluación', 9, 3),

-- Curso 10: Gestión de Proyectos Tecnológicos
('Metodologías Ágiles', 'Scrum, Kanban y Lean', 10, 1),
('Herramientas de Gestión', 'Jira, Trello y GitHub Projects', 10, 2),
('Seguimiento y Métricas', 'Velocidad, burndown y KPIs', 10, 3);


INSERT INTO asignaciones (id_curso, id_profesor) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 2),
(5, 3),
(6, 4),
(7, 2),
(8, 3),
(9, 4),
(10, 2),
(11, 3),
(12, 4),
(13, 2),
(14, 3),
(15, 4);
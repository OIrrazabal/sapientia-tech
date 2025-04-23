-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, email, contraseña, es_admin, telefono, direccion, rol) VALUES 
('Admin Sistema', 'admin@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 1, '0991234567', 'Dirección Admin 123', 'admin'),
('Juan Profesor', 'profesor@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0997654321', 'Dirección Profesor 456', 'profesor'),
('Maria Estudiante', 'estudiante@test.com', '$2b$10$GOGGjXEhFRnZNXnLo.idJeB9HddkWq60lesMH.XQbKaO88DWqRbpi', 0, '0993334444', 'Dirección Estudiante 789', 'estudiante');


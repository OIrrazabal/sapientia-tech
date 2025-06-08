const dbHandler = require('../db/db.handler');
const db = require('../db/conexion');
const util = require('util');

const Usuario = {
  listar: async () => {
    try {
      return await dbHandler.ejecutarQueryAll("SELECT * FROM usuarios");
    } catch (error) {
      console.error("Error al listar usuarios:", error);
      return [];
    }
  },

  findOne: async ({ email }) => {
    return await dbHandler.ejecutarQuery(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );
  },

  buscarUsuario: async (username, password) => {
    return await dbHandler.ejecutarQuery(
      'SELECT * FROM usuarios WHERE nombre = ? AND contraseña = ? AND activo = 1',
      [username, password]
    );
  },

  loginAdmin: async (email, password) => {
    const user = await dbHandler.ejecutarQuery(
      'SELECT * FROM usuarios WHERE email = ? AND es_admin = 1 AND contraseña = ? AND activo = 1',
      [email, password]
    );
    return user ? { success: true, user } : { success: false, message: 'Usuario no encontrado' };
  },

  obtenerUsuariosConContadores: async () => {
    const sql = `
      SELECT 
        u.id, u.nombre, u.email, u.es_admin,
        COUNT(DISTINCT c_prof.id) AS cursos_profesor,
        COUNT(DISTINCT i.curso_id) AS cursos_alumno,
        GROUP_CONCAT(DISTINCT c_prof.nombre) AS materias_profesor,
        GROUP_CONCAT(DISTINCT c_alum.nombre) AS materias_alumno
      FROM usuarios u
      LEFT JOIN cursos c_prof ON c_prof.profesor_id = u.id
      LEFT JOIN inscripciones i ON i.alumno_id = u.id
      LEFT JOIN cursos c_alum ON c_alum.id = i.curso_id
      GROUP BY u.id
    `;
    return dbHandler.ejecutarQueryAll(sql);
  },

  obtenerPorEmail: async (email) => {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const dbGet = util.promisify(db.get).bind(db);
    return await dbGet(query, [email]);
  },

  obtenerPorId: async (id) => {
    const query = 'SELECT * FROM usuarios WHERE id = ?';
    const dbGet = util.promisify(db.get).bind(db);
    return await dbGet(query, [id]);
  },

  existeEmailExceptoId: async (email, id) => {
    const query = 'SELECT COUNT(*) as count FROM usuarios WHERE email = ? AND id != ?';
    const dbGet = util.promisify(db.get).bind(db);
    const result = await dbGet(query, [email, id]);
    return result.count > 0;
  },

  crear: async (usuario) => {
    const { nombre, email, contraseña, es_admin, telefono, direccion } = usuario;
    const query = `
      INSERT INTO usuarios (nombre, email, contraseña, es_admin, telefono, direccion, activo)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    const dbRun = util.promisify(db.run).bind(db);
    return await dbRun(query, [nombre, email, contraseña, es_admin, telefono || '', direccion || '']);
  },

  actualizar: async (id, usuario) => {
    const { nombre, email, contraseña, es_admin, telefono, direccion, activo } = usuario;
    const campos = [];
    const valores = [];

    if (nombre !== undefined) { campos.push("nombre = ?"); valores.push(nombre); }
    if (email !== undefined) { campos.push("email = ?"); valores.push(email); }
    if (contraseña !== undefined) { campos.push("contraseña = ?"); valores.push(contraseña); }
    if (es_admin !== undefined) { campos.push("es_admin = ?"); valores.push(es_admin); }
    if (telefono !== undefined) { campos.push("telefono = ?"); valores.push(telefono); }
    if (direccion !== undefined) { campos.push("direccion = ?"); valores.push(direccion); }
    if (activo !== undefined) { campos.push("activo = ?"); valores.push(activo); }

    const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    const dbRun = util.promisify(db.run).bind(db);
    return await dbRun(query, [...valores, id]);
  },

  marcarComoInactivo: async (id) => {
    const query = 'UPDATE usuarios SET activo = 0 WHERE id = ?';
    const dbRun = util.promisify(db.run).bind(db);
    await dbRun(query, [id]);
  },

  getProfesores: async () => {
    const sql = `
      SELECT u.*, GROUP_CONCAT(c.nombre, ', ') AS cursos
      FROM usuarios u
      JOIN cursos c ON c.profesor_id = u.id
      GROUP BY u.id
    `;
    const rows = await dbHandler.ejecutarQueryAll(sql);
    return rows.map(row => ({
      ...row,
      cursos: row.cursos ? row.cursos.split(', ') : []
    }));
  },

  contarTodos: async () => {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as total FROM usuarios`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        }
      );
    });
  }

};
//Modificar contraseña
Usuario.obtenerPorId = async (id) => {
    try {
        const query = 'SELECT * FROM usuarios WHERE id = ?';
        const dbGet = util.promisify(db.get).bind(db);
        return await dbGet(query, [id]);
    } catch (error) {
        console.error('Error al obtener usuario por id:', error);
        throw error;
    }
};

module.exports = Usuario;
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "db/database.sqlite",
  sqlite3.OPEN_READWRITE,
  (error) => {
    if (error) {
      console.error("Ocurrió un error abriendo la base de datos: ", error);
    } else {
      console.log("Conexión exitosa");

      // CONSULTA PARA MOSTRAR USUARIOS
      /* db.all("SELECT * FROM usuarios", (err, rows) => {
        if (err) {
          console.error("Error al hacer SELECT:", err.message);
        } else {
          console.log("Usuarios registrados:");
          console.table(rows);
        }
      }); */
    }
  }
);

module.exports = db;

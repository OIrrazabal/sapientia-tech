//Para la conexion a la base de datos
const db = require("./db/conexion");

//Para uso de dotenv
require("dotenv").config();

//importar express
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

const path = require("path");

//crear app express
const app = express();
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
app.locals.appName = process.env.APP_NAME;
//importar rutas
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");

app.use(express.static(path.join(__dirname, "assets")));
app.use("/assets", express.static("assets"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
	session({
		name: "is3-session-name",
		store: new SQLiteStore({
			db: "database.sqlite",
			dir: "./db",
		}),
		secret: "clave-aleatoria-y-secreta",
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 24 * 60 * 60 * 1000 },
	})
);

app.use(express.urlencoded({ extended: true }));

//rutas
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/public", publicRoutes);
const Usuario = require("./models/usuario.model");
const Curso = require("./models/curso.model");
app.get("/", async (req, res) => {
    try {
        const profesores = (await Usuario.listar()).filter(u => u.rol === 'profesor');
        const profesoresUnicos = Array.from(new Map(profesores.map(p => [p.id, p])).values());

        // Obtener los 8 cursos más populares (publicados y con más inscriptos)
        const cursosPopulares = await Curso.getCursosPopulares(8);

        res.render("public/home/index", {
            usuario: req.session.usuario || null,
            profesores: profesoresUnicos,
            cursosPopulares // <-- enviar a la vista
        });
    } catch (error) {
        console.error("Error cargando profesores:", error);
        res.render("public/home/index", {
            usuario: req.session.usuario || null,
            profesores: [],
            cursosPopulares: []
        });
    }
});

// Ruta para manejar errores 404
app.all("*", (req, res) => {
	res.status(404).render("404", {
		usuario: req.session.usuario || null,
	});
});

// iniciar app escuchando puerto parametro
const port = process.env.PORT;
app.listen(port, () => {
	console.log("Servidor corriendo en el puerto:" + port);
});

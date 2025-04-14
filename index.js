//Para la conexion a la base de datos
const db = require("./db/conexion");

//importar express
const express = require("express");
const session = require("express-session");

const path = require("path")

//crear app express
const app = express();

//importar rutas
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");

app.use(express.static(path.join(__dirname, "assets")))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(session({
    name: 'is3-session-name',
    secret: 'clave-aleatoria-y-secreta',
    resave: false,
    httpOnly: true,
    saveUninitialized: false,
}))

//rutas
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/public", publicRoutes);

//ruta inicio
app.get("/", (req, res) => {
	res.redirect("/auth/home");
});

// iniciar app escuchando puerto parametro
const port = 3000;
app.listen(port, () => {
    console.log("Servidor corriendo en el puerto 3000");
});





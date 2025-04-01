//importar express
const express = require("express");

//creamos la aplicacion express
const app = express();

const port = 3000;

const path = require("path")

app.use(express.static(path.join(__dirname, "assets")))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

//ruta inicio
app.get("/", (req, res) => {
	res.render("auth/home/index");
});

// iniciar app escuchando puerto parametro
app.listen(port, () => {
    console.log("Servidor corriendo en el puerto 3000");
});





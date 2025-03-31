//importar express
const express = require("express");

//creamos la aplicacion express
const app = express();

const port = 3000;

const path = require("path")

app.use(express.static(path.join(__dirname, "assets")))

//ruta inicio
app.get("/", (req, res) => {
	res.send("index.html");
});

// iniciar app escuchando puerto parametro
app.listen(port, () => {
    console.log("Servidor corriendo en el puerto 3000");
});





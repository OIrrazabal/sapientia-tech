//importar express
const express = require("express");

//creamos la aplicacion express
const app = express();

port = 3000;

//ruta inicio
app.get("/", (req, res) => {
	res.send("Hola Mundo Morado");
});

// iniciar app escuchando puerto parametro
app.listen(port, () => {
    console.log("Servidor corriendo en el puerto 3000");
});





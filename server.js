require("dotenv").config();
const app = require("./index");
const { serverLogger } = require('./logger');

const puerto = process.env.PORT || 3000;
app.listen(puerto, () => {
  console.log(`Servidor corriendo en el puerto ${puerto}`);
});

// Manejadores para cierre graceful del servidor
process.on('SIGINT', () => {
    serverLogger.info('Servidor finalizado - SIGINT');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    serverLogger.info('Servidor finalizado - SIGTERM');
    server.close(() => {
        process.exit(0);
    });
});
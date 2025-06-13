require("dotenv").config();
const app = require("./index");
const { serverLogger } = require('./logger');

const puerto = process.env.PORT || 3000;
const server = app.listen(puerto, () => {  // 1. Guardar referencia en 'server'
  console.log(`Servidor corriendo en el puerto ${puerto}`);
  serverLogger.info(`Servidor iniciado en puerto ${puerto}`);  // 2. Registrar el inicio
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
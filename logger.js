const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Definir la ruta para la carpeta logs
const logDir = path.join(__dirname, 'logs');

// Crear la carpeta logs si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Logger para servidor
const serverLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'server.log')
    })
  ]
});

// Logger para accesos a home
const homeLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'home.log')
    })
  ]
});

module.exports = {
  serverLogger,
  homeLogger
};
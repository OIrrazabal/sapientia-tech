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
    }),
    new winston.transports.Console() // <- añadimos esta linea para mostrar logs en consola
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

// Logger para intentos de login
const loginLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'auth.log')
    })
  ]
});
// Logger para creaciones del admin
const adminLogger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'admin.log'),
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
      )
    })
  ]
});

module.exports = {
  serverLogger,
  homeLogger,
  loginLogger,
  adminLogger 
};
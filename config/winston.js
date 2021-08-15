/* eslint-disable space-before-function-paren */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-vars */
const winston = require('winston');
const appRoot = require('app-root-path');


const options = {
    file: {
        level: 'info',
        name: 'file.info',
        filename: `${appRoot}/logs/ihawk-app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 100,
        colorize: true
    },
    errorFile: {
        level: 'error',
        name: 'file.error',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 100,
        colorize: true
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: true,
        colorize: true
    }
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new (winston.transports.Console)(options.console),
        new (winston.transports.File)(options.errorFile)
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
        // winston.format.prettyPrint()
    ),

    meta: true,
    expressFormat: true,
    colorize: true,
    msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    exitOnError: false // do not exit on handled exceptions
});



logger.stream = {
    write(message, encoding) {
        logger.info(message.replace(/\n$/, ''));
    }

};

logger.combinedFormat = function(error, req, res) {
    return `${error.status || 500} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`;
  };

module.exports = logger;
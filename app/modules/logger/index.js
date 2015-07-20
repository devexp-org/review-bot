var winston = require('winston');
var isProduction = process.env.NODE_ENV === 'production';
var transports = [];

if (isProduction) {
    transports.push(
        new (winston.transports.File)({
            filename: 'logs/error.log',
            level: 'error',
            timestamp: true,
            maxsize: 5e6,
            maxFiles: 5
        })
    );
} else {
    transports.push(
        new (winston.transports.Console)({
            exitOnError: false,
            colorize: true
        })
    );
}

module.exports = new winston.Logger({ transports: transports });

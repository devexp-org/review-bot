import winston from 'winston';

var isProduction = process.env.NODE_ENV === 'production',
    transports = [];

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

export default new winston.Logger({ transports });

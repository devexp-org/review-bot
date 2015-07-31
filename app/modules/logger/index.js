import winston from 'winston';

const transports = [];
const isProduction = process.env.NODE_ENV === 'production';
const isTesting = process.env.NODE_ENV === 'testing';

if (!isTesting) {
    if (isProduction) {
        transports.push(
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                timestamp: true,
                maxsize: 5e6,
                maxFiles: 5
            })
        );
    } else {
        transports.push(
            new winston.transports.Console({
                exitOnError: false,
                colorize: true
            })
        );
    }
}

const logger = new winston.Logger({ transports });

function pullInfoMsg(pullRequest) {
    return `${pullRequest.title} — ${pullRequest.number} [${pullRequest.html_url}]`;
}

export default logger;

export function pullInfoLogger(msg, pullRequest) {
    logger.info(msg, pullInfoMsg(pullRequest));
}

export function pullErrorLogger(msg, pullRequest) {
    logger.error(msg, pullInfoMsg(pullRequest));
}

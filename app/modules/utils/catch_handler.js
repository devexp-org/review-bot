import logger from 'app/modules/logger';

export default function catchHandler(err) {
    if (!err.logged) {
        logger.error(err);
        err.logged = true;
    }

    throw err;
}

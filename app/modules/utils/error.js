import _ from 'lodash';

/**
 * Format meta for error with pull request info.
 *
 * @param {Object|Number|String} pullRequest - pull request or pull request id.
 *
 * @returns {String}
 */
function pullInfo(pullRequest) {
    if (_.isObject(pullRequest)) {
        return `— #${pullRequest.number} ${pullRequest.title} [ ${pullRequest.html_url} ]`;
    }

    return `— #pull_id: ${pullRequest.html_url}`;
}

/**
 * Format meta for error with cmd + pull request info.
 *
 * @param {Array} cmd
 * @param {[type]} pullRequest - pull request or pull request id.
 *
 * @returns {String}
 */
function cmd(cmd, pullRequest) {
    return `— ${JSON.stringify(cmd)} ${pullInfo(pullRequest)}`;
}

/**
 * Maps error codes to error's meta formaters.
 *
 * @type {Object}
 */
const CODE_MAP = {
    PULL: pullInfo,
    CMD: cmd
};

/**
 * Creates DevExp custom error.
 *
 * @param {String} scope
 *
 * @returns {Function}
 */
export default function createError(scope) {
    function DevExpErr(code, msg, ...meta) {
        if (arguments.length === 2) {
            meta = [msg];
            msg = code;
            code = null;
        }

        msg = msg || '';

        if (!(meta[0] instanceof Error)) {
            meta = JSON.stringify(meta);
        }

        Error.captureStackTrace(this);

        this.name = 'DevExpErr';
        this.message = `[ ${scope} ] ${msg} ${(CODE_MAP[code] ? CODE_MAP[code](...meta) : meta)}`;
    }

    DevExpErr.prototype = Object.create(Error.prototype);
    DevExpErr.constructor = DevExpErr;

    return DevExpErr;
}

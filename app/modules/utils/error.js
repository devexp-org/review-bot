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

    return `— #pull_id: ${pullRequest}`;
}

/**
 * Format meta for error with cmd + pull request info.
 *
 * @param {Array} cmd
 * @param {[type]} pullRequest - pull request or pull request id.
 *
 * @returns {String}
 */
function command(cmd, pullRequest) {
    cmd = _.isEmpty(cmd) ? '' : `— ${JSON.stringify(cmd)}`;

    return `${cmd} ${pullInfo(pullRequest)}`;
}

/**
 * Maps error codes to error's meta formaters.
 *
 * @type {Object}
 */
const CODE_MAP = {
    PULL: pullInfo,
    CMD: command
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

        if (!(meta[0] instanceof Error) && !CODE_MAP[code]) {
            meta = JSON.stringify(meta);
        }

        if (CODE_MAP[code]) {
            meta = CODE_MAP[code](...meta);
        }

        Error.captureStackTrace(this);

        this.name = 'DevExpErr';
        this.message = `[ ${scope} ] ${msg} ${meta}`;
    }

    DevExpErr.prototype = Object.create(Error.prototype);
    DevExpErr.constructor = DevExpErr;

    return DevExpErr;
}

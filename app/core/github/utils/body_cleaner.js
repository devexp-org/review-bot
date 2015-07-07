import * as config from 'app/core/config';

var { regex } = config.load('github').content;

/**
 * Clears Pull Request body from generated content.
 *
 * @param {String} body
 *
 * @returns {String} clear body
 */
export default function bodyCleaner(body) {
    return body.replace(regex, '');
}

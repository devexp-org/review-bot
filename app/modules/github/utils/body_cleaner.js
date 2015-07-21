import config from 'app/modules/config';

const githubConfig = config.load('github');

/**
 * Clears Pull Request body from generated content.
 *
 * @param {String} body
 *
 * @returns {String} clear body
 */
export default function (body) {
    return body.replace(githubConfig.content.regex, '');
}

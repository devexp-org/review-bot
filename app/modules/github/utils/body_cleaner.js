import config from 'config';

const githubConfig = config.get('github');

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

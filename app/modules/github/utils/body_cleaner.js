var config = require('app/modules/config');
var githubConfig = config.load('github');

/**
 * Clears Pull Request body from generated content.
 *
 * @param {String} body
 *
 * @returns {String} clear body
 */
module.exports = function bodyCleaner(body) {
    return body.replace(githubConfig.content.regex, '');
};

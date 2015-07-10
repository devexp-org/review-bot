var bodyCleaner = require('app/core/github/utils/body_cleaner');

/**
 * Extender for PullRequest model which adds extra body content field.
 * Extra body entry format: { uniqId: 'content' }.
 *
 * @returns {Object}
 */
module.exports.extender = function extender() {
    return {
        extra_body: Object
    };
};

/**
 * Pre save hook for PullRequest model which clear body from additional content.
 *
 * @returns {Function}
 */
module.exports.hook = function hook() {
    return function (model) {
        return new Promise(function (resolve) {
            model.body = bodyCleaner(model.body);
            resolve();
        });
    };
};

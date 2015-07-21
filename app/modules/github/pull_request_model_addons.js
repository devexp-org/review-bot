import bodyCleaner from 'app/modules/github/utils/body_cleaner';

/**
 * Pre save hook for PullRequest model which clear body from additional content.
 *
 * @returns {Function}
 */
export function hook() {
    return function (model) {
        return new Promise(resolve => {
            model.body = bodyCleaner(model.body);
            resolve();
        });
    };
}

/**
 * Extender for PullRequest model which adds extra body content field.
 * Extra body entry format: { uniqId: 'content' }.
 *
 * @returns {Object}
 */
export function extender() {
    return {
        extra_body: Object
    };
}

import bodyCleaner from './cleaner';

/**
 * Extender for PullRequest model which adds extra body content field.
 * Extra body entry format: [{ id: 'uniqId', content: 'content' }].
 *
 * @returns {Object}
 */
export function extender() {
    return {
        extra_body: Array
    };
}

/**
 * Pre save hook for PullRequest model which clear body from additional content.
 *
 * @returns {Function}
 */
export function hook() {
    return function (model) {
        return new Promise((resolve) => {
            console.log('Raw model body: ', model.body);
            model.body = bodyCleaner(model.body);
            console.log('Clear model body: ', model.body);

            resolve();
        });
    };
}

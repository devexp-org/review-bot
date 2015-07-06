import { _bodyCleaner } from './api';

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

/**
 * Pre save hook for PullRequest model which clear body from additional content.
 *
 * @returns {Function}
 */
export function hook() {
    return function (model) {
        return new Promise((resolve) => {
            model.body = _bodyCleaner(model.body);
            resolve();
        });
    };
}

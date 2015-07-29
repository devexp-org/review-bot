import badgsMiddleware from 'badgs/lib/middleware';
import Badgs from 'badgs';

/**
 * Creates route for badges.
 *
 * @param {Object} options
 *
 * @returns {Function}
 */
export default function badgesRoute(options) {
    return badgsMiddleware(new Badgs(options.style || 'flat'));
}

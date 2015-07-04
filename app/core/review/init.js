import ranking from './ranking';
import listeners from './listeners';

/**
 * Inits review module.
 *
 * @param {Object} options
 */
export function init(options) {
    ranking.init(options);
    listeners.init(options);
}

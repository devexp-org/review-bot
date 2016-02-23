import parseLogins from './parse-logins';

/**
 * Parse Logins service.
 *
 * @param {Object} options
 * @param {Boolean} options.isStrictAt
 *
 * @return {Function}
 */
export default function parseLoginsService(options) {
  return function parseLoginsWrap(str, startFrom) {
    return parseLogins(str, startFrom, options.isStrcitAt);
  };
}

import { isString, isNumber, isArray } from 'lodash';

const LOGIN_REGEXP = /^@?(?![0-9-])([a-zA-Z0-9-—]+)/i; // Matches @login and login
const STRICT_AT_LOGIN_REGEXP = /^@(?![0-9-])([a-zA-Z0-9-—]+)/; // Matches only @login

/**
 * Calculates start from index for cutting string.
 *
 * @param {String} str
 * @param {String|Number|String[]} [startFrom]
 *
 * @return {Array}
 */
export function getStartFromIndex(str, startFrom) {
  let startFromIndex = 0;

  if (isNumber(startFrom)) {
    startFromIndex = startFrom;
  } else if (isString(startFrom)) {
    const idx = str.indexOf(startFrom);
    startFromIndex = idx >= 0 ? idx + startFrom.length : startFromIndex;
  } else if (isArray(startFrom)) {
    startFromIndex = startFrom
      .map(s => {
        const idx = str.indexOf(s);

        return idx >= 0 ? idx + s.length : idx;
      })
      .find(i => i >= 0) || startFromIndex;
  }

  return startFromIndex;
}

/**
 * Calculates end index for cutting string.
 *
 * @param {String} str
 * @param {Number} startFromIndex
 *
 * @return {Array}
 */
export function getEndIndex(str, startFromIndex) {
  let endIndex = str.indexOf('\n', startFromIndex) - startFromIndex;

  if (endIndex < 0) {
    endIndex = str.length;
  }

  return endIndex;
}

/**
 * Function for parsing words similar to logins out of the given string.
 * Rules:
 * 	Login should not start with digit
 * 	Login should not be splited by space
 * 	Login may conatin only english letters from a to Z, digits from 0 to 9 and -.
 *
 * @param {String} str
 * @param {String|Number|String[]} [startFrom]
 * @param {Boolean} [isStrcitAt] - should match only logis started with @
 *
 * @return {Array}
 */
export default function parseLogins(str, startFrom, isStrcitAt) {
  if (!isString(str)) return [];

  const startFromIndex = getStartFromIndex(str, startFrom);
  const endIndex = getEndIndex(str, startFromIndex);

  return str
    .substr(startFromIndex, endIndex)
    .split(/\s/)
    .reduce((result, word) => {
      const match = word.match(isStrcitAt ? STRICT_AT_LOGIN_REGEXP : LOGIN_REGEXP) || [];

      if (match[1]) {
        result.push(match[1]);
      }

      return result;
    }, []);
}

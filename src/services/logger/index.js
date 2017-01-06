import intel from 'intel';

/**
 * @param {Object} options
 *
 * @return {Logger}
 */
export default function setup(options) {

  intel.config(options);

  return intel;

}

/**
 * @classdesc Class for writing to log.
 *   Each log entry has a date, a severity, and a message body.
 *
 * @name Logger
 * @class
 */

/**
 * Writes a message of the given severity.
 *
 * @name Logger#log
 * @method
 *
 * @param {String} severity - string value which specifies the severity of the log message.
 * @param {String} message - log message containing zero or more format items.
 * @param {...} [parameters] - message parameters.
 *
 * @return {void}
 */

/**
 * Writes an informational message.
 *
 * @name Logger#info
 * @method
 *
 * @param {String} message - log message containing zero or more format items.
 * @param {...} [parameters] - message parameters.
 *
 * @return {void}
 */

/**
 * Writes a warning message.
 *
 * @name Logger#warn
 * @method
 *
 * @param {String} message - log message containing zero or more format items.
 * @param {...} [parameters] - message parameters.
 *
 * @return {void}
 */

/**
 * Writes an error message.
 *
 * @name Logger#error
 * @method
 *
 * @param {String} message - log message containing zero or more format items.
 * @param {...} [parameters] - message parameters.
 *
 * @return {void}
 */

/**
 * Returns a new logger with the given name.
 * The names are used to build an hierarchy of loggers.
 * Child loggers can inherit their parents' handlers and log level.
 *
 * @name Logger#getLogger
 * @method
 *
 * @param {String} name - the logger name.
 *
 * @return {Logger}
 */

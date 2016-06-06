import { forEach } from 'lodash';

export default class CommandDispatcher {

  /**
   * @constructor
   *
   * @param {Array.<Command>} store - list of commands
   */
  constructor(store) {
    this.store = store || [];
  }

  /**
   * Dispatch command to handler.
   *
   * @param {String} comment - user comment
   * @param {Object} payload - payload is passed as-is to handler
   *
   * @return {Promise}
   */
  dispatch(comment, payload) {
    const promise = [];

    forEach(this.store, (command) => {

      forEach(comment.split('\n'), (line) => {
        const matches = line.match(command.test);

        if (matches && matches.length > 0) {
          const arglist = matches.slice(1);

          forEach(command.handlers, (handler) => {
            promise.push(handler(line.trim(), payload, arglist));
          });
        }

      });

    });

    return Promise.all(promise);
  }

}

/**
 * @typedef {Object} Command
 *
 * @property {RegExp} test - check that the command is present
 * @property {Array.<CommandHandler>} handlers - array of handlers.
 */

/**
 * @callback CommandHandler
 *
 * @param {String} comment - comment line with command.
 * @param {Object} payload - issue payload from github.
 * @param {Array}  arglist - parsed arguments for command.
 */

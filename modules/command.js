'use strict';

import _ from 'lodash';

export default class CommandDistatcher {

  /**
   * @constructor
   *
   * @param {Array<Command>} store - list of commands
   */
  constructor(store) {
    this.store = store || [];
  }

  /**
   * Dispatch command to handler.
   *
   * @param {String} comment - user comment
   * @param {Object} payload
   *
   * @return {Promise}
   */
  dispatch(comment, payload) {
    const promise = [];

    _.forEach(this.store, command => {
      _.forEach(comment.split('\n'), line => {
        if (command.test.test(line)) {
          _.forEach(command.handlers, handler => {
            const commentCommand = line.trim().toLowerCase();
            promise.push(handler(commentCommand, payload));
          });
        }
      });
    });

    return Promise.all(promise).then(() => {});
  }

}

/**
 * @typedef {Object} Command
 * @property {RegExp} test
 * @property {Array<Function>} handlers - array of handlers.
 */

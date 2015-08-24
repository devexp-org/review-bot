'use strict';

import { forEach, isEmpty } from 'lodash';

export default class CommandDispatcher {

  /**
   * @constructor
   *
   * @param {Array<Command>} store - list of commands
   */
  constructor(store) {
    this.store = store || [];
    this.queue = {};
  }

  /**
   * Add command to queue.
   *
   * @param {Function} handler
   * @param {String} commentCommand
   * @param {Object} payload
   *
   * @return {Promise}
   */
  enqueue(handler, commentCommand, payload) {
    const pullId = payload.pullRequest.id;

    return new Promise((resolve, reject) => {
      this.queue[pullId] = this.queue[pullId] || { active: false, queue: [] };
      this.queue[pullId].queue.push({ handler, commentCommand, payload, resolve, reject });
    });
  }

  /**
   * Queue step.
   *
   * @param {Object} pullRequest
   */
  step(pullRequest) {
    const pullId = pullRequest.id;

    if (!this.queue[pullId] || this.queue[pullId].active) {
      return;
    }

    const item = this.queue[pullId];
    const itemQueueStep = item.queue.shift();

    item.active = true;
    itemQueueStep.payload.pullRequest = pullRequest;

    itemQueueStep
      .handler(itemQueueStep.commentCommand, itemQueueStep.payload)
      .catch(err => {
        itemQueueStep.reject(err);

        return pullRequest;
      })
      .then(pullRequestUpdated => {
        item.active = false;
        itemQueueStep.resolve();

        if (isEmpty(item.queue)) {
          this.queue[pullId] = null;
        }

        this.step(pullRequestUpdated);
      });
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
    const promiseList = [];

    forEach(this.store, command => {
      forEach(comment.split('\n'), line => {
        if (command.test.test(line)) {
          forEach(command.handlers, handler => {
            const commentCommand = line.trim().toLowerCase();

            promiseList.push(this.enqueue(handler, commentCommand, payload));
          });
        }
      });
    });

    this.step(payload.pullRequest);

    return Promise.all(promiseList);
  }

}

/**
 * @typedef {Object} Command
 * @property {RegExp} test
 * @property {Array<Function>} handlers - array of handlers.
 */

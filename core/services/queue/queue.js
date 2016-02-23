'use strict';

import { isEmpty } from 'lodash';

export default class Queue {

  /**
   * @constructor
   */
  constructor() {
    this.queue = {};
  }

  /**
   * Add a new item to the queue.
   *
   * @param {String} id - uniq key
   * @param {Function} callback
   *
   * @return {Promise}
   */
  enqueue(id, callback) {
    return new Promise((resolve, reject) => {
      this.queue[id] = this.queue[id] || { active: false, queue: [] };
      this.queue[id].queue.push({ id, callback, resolve, reject });
    });
  }

  /**
   * Queue step.
   *
   * @param {String} id
   */
  step(id) {
    if (!this.queue[id] || this.queue[id].active) {
      return;
    }

    const section = this.queue[id];
    const item = section.queue.shift();

    section.active = true;

    let fulfilled = false;
    item
      .callback()
      .catch(err => {
        item.reject(err);
        fulfilled = true;
      })
      .then(() => {
        section.active = false;

        fulfilled || item.resolve();

        if (isEmpty(section.queue)) {
          this.queue[id] = null;
        }

        this.step(id);
      });
  }

  /**
   * Add a new item to the queue and run the queue.
   *
   * @param {String} id - uniq key
   * @param {Function} callback
   *
   * @return {Promise}
   */
  dispatch(id, callback) {
    const promise = this.enqueue(id, callback);

    this.step(id);

    return promise;
  }

}

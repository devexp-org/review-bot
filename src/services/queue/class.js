/* @flow */

import { isEmpty } from 'lodash';

export default class Queue {

  queue: {
    [key: string]: {
      queue: Array<{
        id: string,
        reject: () => void,
        resolve: () => void,
        callback: () => void
      }>,
      active: boolean,
    }
  }

  /**
   * @constructor
   */
  constructor() {
    this.queue = {};
  }

  /**
   * Inserts a new element at the end of the queue.
   *
   * @protected
   *
   * @param {String} id
   * @param {Function} callback
   *
   * @return {Promise}
   */
  enqueue(id: string, callback: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue[id] = this.queue[id] || { active: false, queue: [] };
      this.queue[id].queue.push({ id, callback, resolve, reject });
    });
  }

  /**
   * Queue step.
   *
   * @protected
   * @param {String} id
   */
  step(id: string) {
    if (!this.queue[id] || this.queue[id].active) {
      return;
    }

    const section = this.queue[id];
    const queueItem = section.queue.shift();

    let fulfilled = false;
    section.active = true;

    Promise.resolve()
      .then(() => queueItem.callback())
      .catch(err => {
        fulfilled = true;
        queueItem.reject(err);
      })
      .then(() => {
        section.active = false;

        fulfilled || queueItem.resolve();

        if (isEmpty(section.queue)) {
          delete this.queue[id];
        }

        this.step(id);
      });
  }

  /**
   * Inserts a new element at the end of the queue and run the queue.
   *
   * @param {String} id - uniq key
   * @param {Function} callback
   *
   * @return {Promise}
   */
  dispatch(id: string, callback: () => void) {
    const promise = this.enqueue(id, callback);

    this.step(id);

    return promise;
  }

}

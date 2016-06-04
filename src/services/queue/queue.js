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
   * @protected
   *
   * @param {String} id
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
   * @protected
   * @param {String} id
   */
  step(id) {
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

'use strict';

import { isEmpty } from 'lodash';

export default class PullBodySectionDispatcher {

  /**
   * @constructor
   *
   * @param {Object} github
   */
  constructor(github) {
    this.github = github;
    this.queue = {};
  }

  /**
   * Add new section to queue.
   *
   * @param {String} id - pull request id
   * @param {String} sectionId
   * @param {String} content
   * @param {Number} pos
   *
   * @return {Promise}
   */
  enqueue(id, sectionId, content, pos) {
    return new Promise((resolve, reject) => {
      this.queue[id] = this.queue[id] || { active: false, queue: [] };
      this.queue[id].queue.push({ id, sectionId, content, pos, resolve, reject });
    });
  }

  /**
   * Queue step.
   *
   * @param {String} pullId - pull request id
   */
  step(pullId) {
    if (!this.queue[pullId] || this.queue[pullId].active) {
      return;
    }

    const item = this.queue[pullId];
    const itemQueueStep = item.queue.shift();

    item.active = true;

    this.github
      .setBodySection(pullId, itemQueueStep.sectionId, itemQueueStep.content, itemQueueStep.pos)
      .catch(err => {
        itemQueueStep.reject(err);

        return pullId;
      }).then(() => {
        item.active = false;
        itemQueueStep.resolve();

        if (isEmpty(item.queue)) {
          this.queue[pullId] = null;
        }

        this.step(pullId);
      });
  }

  /**
   * Dispatch pull request body update to queue
   *
   * @param {String} id - pull request id
   * @param {String} sectionId
   * @param {String} content
   * @param {Number} pos
   *
   * @return {Promise}
   */
  setSection(id, sectionId, content, pos = 99999) {
    const promiseList = [];

    promiseList.push(this.enqueue(id, sectionId, content, pos));

    this.step(id);

    return Promise.all(promiseList);
  }

}

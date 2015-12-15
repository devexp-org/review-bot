'use strict';

import _ from 'lodash';

export class PullRequestAction {

  /**
   * @constructor
   *
   * @param {Object} pullRequest
   * @param {Object} events
   * @param {Object} logger
   */
  constructor(pullRequest, events, logger) {
    this.events = events;
    this.logger = logger;
    this.pullRequest = pullRequest;
  }

  /**
   * Save review.
   *
   * @param {Object} review
   * @param {Number} pullId
   *
   * @return {Promise}
   */
  save(review, pullId) {

    let startReview = false;

    return new Promise((resolve, reject) => {

      this.pullRequest
        .findById(pullId).exec()
        .then(pullRequest => {

          if (!pullRequest) {
            throw new Error('Pull request `' + pullId + '` not found');
          }

          review = _.assign({}, pullRequest.review, review);

          if (!review.status) {
            review.status = 'notstarted';
          }

          if (review.status === 'inprogress' && _.isEmpty(review.reviewers)) {
            throw new Error(
              'Try to start review where reviewers were not selected,' +
              ' id - ' + pullId + ', title - ' + pullRequest.title
            );
          }

          if (pullRequest.review.status !== 'inprogress' && review.status === 'inprogress') {
            startReview = true;
            review.started_at = new Date();
          }

          pullRequest.set('review', review);

          return new Promise((resolve, reject) => pullRequest.save().then(resolve, reject));

        }).then(pullRequest => {

          const eventName = startReview ? 'review:started' : 'review:updated';

          this.events.emit(eventName, { pullRequest });
          this.logger.info('review saved: %s %s', eventName, pullId);

          return pullRequest;

        }).then(resolve, reject);

    });

  }

  /**
   * Approve and complete review if approved reviewers equal `approveCount`.
   *
   * @param {String} login - user which approves pull.
   * @param {String} pullId
   *
   * @return {Promise}
   */
  approveReview(login, pullId) {

    let approvedCount = 0;

    return new Promise((resolve, reject) => {

      this.pullRequest
        .findById(pullId).exec()
        .then(pullRequest => {

          if (!pullRequest) {
            throw new Error('Pull request `' + pullId + '` not found');
          }

          const review = pullRequest.get('review');

          review.reviewers.forEach(reviewer => {
            if (reviewer.login === login) {
              reviewer.approved = true;
            }

            if (reviewer.approved) {
              approvedCount += 1;
            }

            if (approvedCount === 2) {
              review.status = 'complete';
            }
          });

          review.updated_at = new Date();
          if (review.status === 'complete') {
            review.completed_at = new Date();
          }

          pullRequest.set('review', review);

          return pullRequest.save();

        }).then(pullRequest => {

          if (pullRequest.review.status === 'complete') {
            this.logger.info('review complete #%s', pullId);
            this.events.emit('review:complete', { pullRequest });
          } else {
            this.logger.info('review approved #%s by %s', pullId, login);
            this.events.emit('review:approved', { pullRequest, login });
          }

          return pullRequest;

        }).then(resolve, reject);

    });

  }

}

export default function (options, imports) {

  const model = imports.model;
  const events = imports.events;
  const logger = imports.logger;

  const service = new PullRequestAction(
    model.get('pull_request'),
    events,
    logger
  );

  return Promise.resolve({ service });

}

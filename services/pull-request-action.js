'use strict';

import { get, assign, isEmpty } from 'lodash';

export class PullRequestAction {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, imports) {
    this.options = options;

    this.events = imports.events;
    this.logger = imports.logger;
    this.pullRequest = imports.pullRequest;
    this.team = imports.team;
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

          review = assign({}, pullRequest.review, review);

          if (!review.status) {
            review.status = 'notstarted';
          }

          if (review.status === 'inprogress' && isEmpty(review.reviewers)) {
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

    return new Promise((resolve, reject) => {

      let approvedCount = 0;

      this.pullRequest
        .findById(pullId).exec()
        .then(pullRequest => {

          if (!pullRequest) {
            throw new Error('Pull request `' + pullId + '` not found');
          }

          const review = pullRequest.get('review');
          const requiredApprovedCount = this.getRequiredApproveCount(pullRequest);

          review.reviewers.forEach(reviewer => {
            if (reviewer.login === login) {
              reviewer.approved = true;
            }

            if (reviewer.approved) {
              approvedCount += 1;
            }

            if (approvedCount >= requiredApprovedCount) {
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

  /**
   * Returns number of approved reviews after which review will be marked as completed.
   *
   * @param {Object} pullRequest
   *
   * @return {Number}
   */
  getRequiredApproveCount(pullRequest) {
    const teamName = this.team.getTeamName(pullRequest);

    return get(this.options, [teamName, 'approveCount'], this.options.defaultApproveCount);
  }

}

export default function (options, imports) {

  const { model, events, logger, 'choose-team': team } = imports;
  const service = new PullRequestAction(options, {
    pullRequest: model.get('pull_request'),
    events,
    logger,
    team
  });

  return service;

}

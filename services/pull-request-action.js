'use strict';

import { get, assign, isEmpty, cloneDeep } from 'lodash';

export class PullRequestAction {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} team
   * @param {Object} events
   * @param {Object} logger
   * @param {Object} pullRequest
   */
  constructor(options, team, events, logger, pullRequest) {
    this.options = options;

    this.team = team;
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
   * @return {Promise<PullRequest>}
   */
  saveReview(review, pullId) {

    return this.pullRequest.findById(pullId)
      .then(pullRequest => {

        if (!pullRequest) {
          throw new Error(`Pull request #${pullId} not found`);
        }

        review = assign({}, cloneDeep(pullRequest.review), cloneDeep(review));

        if (!review.status) {
          review.status = 'notstarted';
        }

        if (review.status === 'inprogress' && isEmpty(review.reviewers)) {
          throw new Error(
            `Try to start review where reviewers were not selected, ` +
            `#${pullRequest.number} – ${pullRequest.title} ${pullRequest.html_url}`
          );
        }

        if (review.status === 'inprogress' && !pullRequest.get('review.started_at')) {
          review.started_at = new Date();
        }

        pullRequest.set('review', review);

        return new Promise((resolve, reject) => {
          pullRequest.save().then(resolve, reject);
        });

      }).then(pullRequest => {

        const startReview =
          review.status === 'inprogress' &&
          pullRequest.get('review.status') !== 'inprogress';

        const eventName = startReview ? 'review:started' : 'review:updated';

        this.events.emit(eventName, { pullRequest });

        this.logger.info('Review saved %s [%s – %s] %s',
          eventName,
          pullRequest.number,
          pullRequest.title,
          pullRequest.html_url
        );

        return pullRequest;

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

    return this.pullRequest.findById(pullId)
      .then(pullRequest => {

        if (!pullRequest) {
          throw new Error(`Pull request ${pullId} not found`);
        }

        const review = cloneDeep(pullRequest.get('review'));

        const requiredApprovedCount = this.getRequiredApproveCount(pullRequest);

        (review.reviewers || []).forEach(reviewer => {

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

        return new Promise((resolve, reject) => {
          pullRequest.save().then(resolve, reject);
        });

      }).then(pullRequest => {

        this.events.emit('review:approved', { pullRequest, login });

        this.logger.info('Review approved by %s [%s – %s] %s',
          login,
          pullRequest.number,
          pullRequest.title,
          pullRequest.html_url
        );

        if (pullRequest.get('review.status') === 'complete') {
          this.events.emit('review:complete', { pullRequest });

          this.logger.info('Review complete [%s – %s] %s',
            pullRequest.number,
            pullRequest.title,
            pullRequest.html_url
          );
        }

        return pullRequest;

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
    const teamName = this.team.findTeamNameByPullRequest(pullRequest);

    return get(
      this.options,
      [teamName, 'approveCount'],
      this.options.defaultApproveCount || 2
    );
  }

}

export default function (options, imports) {

  const { model, events, logger, 'choose-team': team } = imports;

  const service = new PullRequestAction(
    options, team, events, logger, model.get('pull_request')
  );

  return service;

}

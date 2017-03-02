import util from 'util';
import { forEach, isEmpty } from 'lodash';

export default class PullRequestReview {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, imports) {
    this.events = imports.events;
    this.logger = imports.logger;

    this.options = options;
  }

  /**
   * Start review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  startReview(pullRequest) {

    const review = pullRequest.get('review');

    if (!pullRequest.hasReviewers()) {
      return Promise.reject(new Error(util.format(
        'Try to start review where reviewers were not selected. %s',
        pullRequest
      )));
    }

    if (review.status !== 'notstarted') {
      return Promise.reject(new Error(util.format(
        'Try to start is not `notstarted` review. Current status is %s. %s',
        review.status,
        pullRequest
      )));
    }

    review.status = 'inprogress';

    if (!review.started_at) {
      review.started_at = new Date();
    }

    review.updated_at = new Date();

    pullRequest.set('review', review);

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info('Review started. %s', pullRequest);
        this.events.emit('review:started', { pullRequest });

        return pullRequest;
      });

  }

  /**
   * Stop review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  stopReview(pullRequest) {

    const review = pullRequest.get('review');

    if (review.status !== 'inprogress' && review.status !== 'changesneeded') {
      return Promise.reject(new Error(util.format(
        'Try to stop is not `inprogress` review. Current status is %s. %s',
        review.status,
        pullRequest
      )));
    }

    review.status = 'notstarted';
    review.updated_at = new Date();

    delete review.completed_at;

    pullRequest.set('review', review);

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info('Review stopped. %s', pullRequest);
        this.events.emit('review:updated', { pullRequest });

        return pullRequest;
      });

  }

  /**
   * Deny review.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  denyReview(pullRequest) {

    const review = pullRequest.get('review');

    review.status = 'inprogress';
    review.updated_at = new Date();
    delete review.completed_at;

    forEach(review.reviewers, (reviewer) => {
      reviewer.approved = false;
    });

    pullRequest.set('review', review);

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info('Review denied. %s', pullRequest);
        this.events.emit('review:updated', { pullRequest });

        return pullRequest;
      });

  }

  /**
   * Approve and complete review if approved reviewers equal `approveCount`.
   *
   * @param {PullRequest} pullRequest
   * @param {String} login - user which approves pull.
   *
   * @return {Promise}
   */
  approveReview(pullRequest, login) {

    let complete = false;
    let approveCount = 0;

    const review = pullRequest.get('review');
    const requiredApproveCount = review.approveCount ||
      review.reviewers.length ||
      1;

    if (!review.approveCount) {
      this.logger.warn('approveCount is undefined %s', pullRequest);
    }

    forEach(review.reviewers, (reviewer) => {
      if (reviewer.login === login) {
        if (reviewer.approved) {
          this.logger.info(
            '%s was approved pull request before. %s',
            reviewer.login,
            pullRequest
          );
        }

        reviewer.approved = true;
      }

      if (reviewer.approved) {
        approveCount += 1;
      }

      if (approveCount >= requiredApproveCount) {
        review.status = 'complete';
      }
    });

    review.updated_at = new Date();

    if (review.status === 'complete' && !review.completed_at) {
      complete = true;
      review.completed_at = new Date();
    }

    pullRequest.set('review', review);

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info('Review approved by %s. %s', login, pullRequest);
        this.events.emit('review:approved', { pullRequest, login });

        if (complete) {
          this.logger.info('Review complete. %s', pullRequest);
          this.events.emit('review:complete', { pullRequest });
        }

        return pullRequest;
      });

  }

  /**
   * Mark pull request as `changes needed`.
   *
   * @param {PullRequest} pullRequest
   * @param {String} login - user which approves pull.
   *
   * @return {Promise}
   */
  changesNeeded(pullRequest, login) {

    const review = pullRequest.get('review');

    forEach(review.reviewers, (reviewer) => {
      if (reviewer.login === login) {
        reviewer.approved = false;
      }
    });

    review.status = 'changesneeded';
    review.updated_at = new Date();

    delete review.completed_at;

    pullRequest.set('review', review);

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info(
          'Pull request marked as `changes needed` by %s. %s', login, pullRequest
        );

        this.events.emit('review:changesneeded', { pullRequest, login });

        return pullRequest;
      });

  }

  /**
   * Mark pull request as `fixed` after `changes needed`.
   *
   * @param {PullRequest} pullRequest
   *
   * @return {Promise}
   */
  fixedReview(pullRequest) {

    const review = pullRequest.get('review');

    if (review.status !== 'changesneeded') {
      return Promise.reject(new Error(util.format(
        'Try to mark pull request as `fixed` but status is %s. %s',
        review.status,
        pullRequest
      )));
    }

    review.status = 'inprogress';
    review.updated_at = new Date();

    pullRequest.set('review', review);

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info(
          'Pull request marked as `fixed`. %s', pullRequest
        );

        this.events.emit('review:fixed', { pullRequest });

        return pullRequest;
      });

  }

  /**
   * Update reviewers list.
   *
   * @param {PullRequest} pullRequest
   * @param {Object} review
   *
   * @return {Promise}
   */
  updateReview(pullRequest, review) {

    if ('reviewers' in review) {
      if (isEmpty(review.reviewers)) {
        return Promise.reject(new Error(util.format(
          'Cannot drop all reviewers from pull request. %s',
          pullRequest
        )));
      }

      pullRequest.set('review.reviewers', review.reviewers);
    }

    if ('approveCount' in review) {
      pullRequest.set('review.approveCount', review.approveCount);
    }

    pullRequest.set('review.updated_at', new Date());

    return pullRequest.save()
      .then(pullRequest => {
        this.logger.info('Review updated. %s', pullRequest);
        this.events.emit('review:updated', { pullRequest });

        return pullRequest;
      });

  }

}

import util from 'util';
import { forEach, isEmpty } from 'lodash';

export default class PullRequestReview {

  /**
   * @constructor
   *
   * @param {Object} options
   * @param {Object} imports
   */
  constructor(options, { events, logger, teamDispatcher }) {
    this.options = options;

    this.events = events;
    this.logger = logger;
    this.teamDispatcher = teamDispatcher;
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

    if (review.status !== 'notstarted' && review.status !== 'changesneeded') {
      return Promise.reject(new Error(util.format(
        'Try to start is not opened review. Status is %s %s',
        review.status,
        pullRequest
      )));
    }

    if (isEmpty(review.reviewers)) {
      return Promise.reject(new Error(util.format(
        'Try to start review where reviewers were not selected %s',
        pullRequest
      )));
    }

    review.status = 'inprogress';

    if (!review.started_at) {
      review.started_at = new Date();
    }

    review.updated_at = new Date();

    pullRequest.set('review', review);

    this.logger.info('Review started %s', pullRequest);
    this.events.emit('review:started', { pullRequest });

    return Promise.resolve(pullRequest);
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
      this.logger.info(
        'Try to stop is not in progress review. Status is %s %s',
        review.status,
        pullRequest
      );
    }

    review.status = 'notstarted';
    review.updated_at = new Date();

    pullRequest.set('review', review);

    this.logger.info('Review stopped %s', pullRequest);
    this.events.emit('review:updated', { pullRequest });

    return Promise.resolve(pullRequest);
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

    let approvedCount = 0;
    let requiredApprovedCount;

    const review = pullRequest.get('review');

    try {
      requiredApprovedCount = this.getRequiredApproveCount(pullRequest);
    } catch (error) {
      return Promise.reject(error);
    }

    forEach(review.reviewers, (reviewer) => {
      if (reviewer.login === login) {
        if (reviewer.approved) {
          this.logger.info(
            '%s was approved pull request before %s',
            reviewer.login,
            pullRequest
          );
        }

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

    this.logger.info('Review approved by %s %s', login, pullRequest);

    this.events.emit('review:approved', { pullRequest, login });

    if (pullRequest.get('review.status') === 'complete') {
      this.logger.info('Review complete %s', pullRequest);
      this.events.emit('review:complete', { pullRequest });
    }

    return Promise.resolve(pullRequest);

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
        delete reviewer.approved;
      }
    });

    review.status = 'changesneeded';
    review.updated_at = new Date();

    pullRequest.set('review', review);

    this.logger.info(
      'Pull request marked as `changes needed` by %s %s', login, pullRequest
    );

    this.events.emit('review:changesneeded', { pullRequest, login });

    return Promise.resolve(pullRequest);
  }

  /**
   * Update reviewers list.
   *
   * @param {PullRequest} pullRequest
   * @param {Object} reviewers
   *
   * @return {Promise}
   */
  updateReviewers(pullRequest, reviewers) {
    if (isEmpty(reviewers)) {
      return Promise.reject(new Error(util.format(
        'Cannot drop all reviewers from pull request %s',
        pullRequest
      )));
    }

    pullRequest.set('review.reviewers', reviewers);
    pullRequest.set('review.updated_at', new Date());

    this.logger.info('Reviewers updated %s', pullRequest);
    this.events.emit('review:updated', { pullRequest });

    return Promise.resolve(pullRequest);
  }

  /**
   * Returns number of approved reviews after which review will be marked as completed.
   *
   * @param {Object} pullRequest
   *
   * @return {Number}
   */
  getRequiredApproveCount(pullRequest) {
    const team = this.teamDispatcher.findTeamByPullRequest(pullRequest);

    if (!team) {
      throw new Error(`Team is not found for pull request ${pullRequest}`);
    }

    return team.getOption('approveCount', this.options.approveCount);
  }

}

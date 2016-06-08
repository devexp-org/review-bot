import BadgeBase from '../base-badge';

export default class ReviewBadgeBuilder extends BadgeBase {

  /**
   * Map review status to color.
   *
   * @param {String} status
   *
   * @return {String}
   */
  statusToColor(status) {
    switch (status) {
      case 'changesneeded':
        return 'yellow';
      case 'inprogress':
        return 'yellow';
      case 'complete':
        return 'green';
      default:
        return 'lightgrey';
    }
  }

  /**
   * Map review status to badge title.
   *
   * @param {String} status
   *
   * @return {String}
   */
  statusToTitle(status) {
    switch (status) {
      case 'changesneeded':
        return 'changes needed';
      case 'inprogress':
        return 'in progress';
      case 'notstarted':
        return 'not started';
      default:
        return status;
    }
  }

  /**
   * Create review status badge.
   *
   * @param {Object} review
   * @param {String} review.status
   *
   * @return {String}
   */
  buildStatusBadge(review) {
    return this.create(
      'review',
      this.statusToTitle(review.status),
      this.statusToColor(review.status)
    );
  }

  /**
   * Create reviewer badge.
   *
   * @param {Object}  reviewer
   * @param {String}  reviewer.login
   * @param {Boolean} reviewer.approved
   * @param {String}  reviewer.html_url
   *
   * @return {String}
   */
  buildReviewerBadge(reviewer) {
    return this.create(
      reviewer.login,
      reviewer.approved ? 'ok' : '...',
      reviewer.approved ? 'green' : 'yellow',
      reviewer.html_url
    );
  }

  /**
   * Concat review status badge and reviewers badges.
   *
   * @param {Object} review
   *
   * @return {String}
   */
  build(review) {
    const status = this.buildStatusBadge(review);

    const reviewers = review.reviewers
      .map(this.buildReviewerBadge.bind(this))
      .join(' ');

    return status + ' ' + reviewers;
  }

}

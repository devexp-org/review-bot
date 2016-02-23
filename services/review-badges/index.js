import BadgeBase from '../../modules/badge-base';

export class ReviewBadgeBuilder extends BadgeBase {

  /**
   * @constructor
   *
   * @param {String} url
   */
  constructor(url) {
    super(url);
  }

  /**
   * Map review status to color.
   *
   * @param {String} status
   *
   * @return {String}
   */
  statusToColor(status) {
    switch (status) {
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
      .map(::this.buildReviewerBadge)
      .join(' ');

    return status + ' ' + reviewers;
  }

}


export default function (options, imports) {
  const events = imports.events;
  const bodyUpdateDispatcher = imports['pull-request-body-queue'];

  const builder = new ReviewBadgeBuilder(options.url);

  /**
   * Call method for updating pull request body with review badges.
   *
   * @param {Object} payload
   */
  function updateReviewBadges(payload) {
    const badgeContent = builder.build(payload.pullRequest.review);

    bodyUpdateDispatcher.setSection(
      payload.pullRequest.id,
      'review:badge',
      badgeContent,
      100 // position
    );
  }

  // Subscribe on events for creating review badges.
  events.on('review:updated', updateReviewBadges);
  events.on('review:started', updateReviewBadges);
  events.on('review:approved', updateReviewBadges);
  events.on('review:complete', updateReviewBadges);

  return builder;
}

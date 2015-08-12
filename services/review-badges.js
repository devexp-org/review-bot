export class ReviewBadgeBuilder {

  /**
   * @constructor
   *
   * @param {String} url
   * @param {String} [style] - default flat
   */
  constructor(url) {
    this.url = url;
  }

  /**
   * Creates badge. [subject|status].
   *
   * @param {String} subject
   * @param {String} status
   * @param {String} color - color of badge
   * @param {String} url - url from badge
   *
   * @return {String} img or a tag with propper url and img src.
   */
  create(subject, status, color, url) {
    if (!subject) {
      throw new Error('Badge should have at least subject!');
    }

    status = status
      .replace(/-/g, '--')
      .replace(/\s/g, '_');
    subject = subject
      .replace(/-/g, '--')
      .replace(/\s/g, '_');

    const img = `<img src="${this.url}${subject}-${status}-${color}.svg" />`;

    if (url) {
      return `<a href="${url}">${img}</a>`;
    }

    return img;
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
   * @returns {String}
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
  const github = imports['pull-request-github'];

  const builder = new ReviewBadgeBuilder(options.url);

  /**
   * Call method for updating pull request body with review badges.
   *
   * @param {Object} payload
   */
  function updateReviewBadges(payload) {
    const badgeContent = builder.build(payload.pullRequest.review);

    github.setBodySection(
      payload.pullRequest.id,
      'review:badge',
      badgeContent
    );
  }

  // Subscribe on events for creating review badges.
  events.on('review:updated', updateReviewBadges);
  events.on('review:started', updateReviewBadges);
  events.on('review:approved', updateReviewBadges);
  events.on('review:complete', updateReviewBadges);

  return Promise.resolve({ service: builder });
}

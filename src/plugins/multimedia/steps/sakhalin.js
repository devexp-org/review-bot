import { find } from 'lodash';

/**
 * Create review sakhalin processor.
 *
 * @return {Function}
 * @param {Object} options
 * @param {Number} options.upRankCount
 */
export default function sakhalin(options) {

  /**
   * Up rank to one reviewer from images and one from video.
   *
   * @param {Review} review
   *
   * @return {Review} review
   */
  function sakhalinUp(review) {
    const upRankCount = options.upRankCount;

    if (review.pullRequest.title.includes('SAKHALIN')) {
      find(review.members, user => user.mmTeam === 'images').rank += upRankCount;
      find(review.members, user => user.mmTeam === 'video').rank += upRankCount;
    }

    return Promise.resolve(review);
  }

  return sakhalinUp;
}

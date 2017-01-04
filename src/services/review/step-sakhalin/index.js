import { find } from 'lodash';
import AbstractReviewStep from '../step';

export class SakhalinReviewStep extends AbstractReviewStep
{

  /**
   * Up rank to one reviewer from images and one from video.
   *
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   * @param {Number} [options.upRankCount]
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {

    const upRankCount = options.upRankCount;

    if (review.pullRequest.title.includes('SAKHALIN')) {
      const videoMember = find(review.members, (user) => user.mmTeam === 'video');
      const imagesMember = find(review.members, (user) => user.mmTeam === 'images');

      if (videoMember) {
        videoMember.rank += upRankCount;
      }

      if (imagesMember) {
        imagesMember.rank += upRankCount;
      }
    }

    return Promise.resolve(review);
  }

}

/**
 * Create review `sakhalin` step.
 *
 * @return {AbstractReviewStep}
 */
export default function setup() {
  return new SakhalinReviewStep();
}

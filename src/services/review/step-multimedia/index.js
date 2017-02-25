import { includes, remove, forEach } from 'lodash';
import AbstractReviewStep from '../step';

const VIDEO_RE = /^VIDEOUI|^MOBVIDEO/;
const IMAGES_RE = /^IMAGESUI/;

export class MultimediaReviewStep extends AbstractReviewStep {

  constructor(teamManager) {
    super();

    this.teamManager = teamManager;
  }

  /**
   * @override
   */
  config() {
    return {
      videoTeam: { type: 'string' },
      imagesTeam: { type: 'string' }
    };
  }

  setTeam(review, groupId, teamName) {
    forEach(review.members, (member) => {
      if (includes(groupId, Number(member.staffGroupId))) {
        member.mmTeam = teamName;
      }
    });

    return Promise.resolve(review);
  }

  /**
   * @override
   *
   * @param {Review} review
   * @param {Object} options
   *
   * @return {Promise.<Review>}
   */
  process(review, options) {

    let teamName;

    const pullRequest = review.pullRequest;

    if (VIDEO_RE.test(pullRequest.title)) {
      teamName = 'video';
    }

    if (IMAGES_RE.test(pullRequest.title)) {
      teamName = 'images';
    }

    const videoGroupId = options.videoTeam.split(',').map(Number);
    const imagesGroupId = options.imagesTeam.split(',').map(Number);

    return Promise.resolve(review)
      .then(review => this.setTeam(review, videoGroupId, 'video'))
      .then(review => this.setTeam(review, imagesGroupId, 'images'))
      .then(review => {
        if (teamName) {
          remove(review.members, (member) => member.mmTeam !== teamName);
        }

        return review;
      });

  }

}

/**
 * Create review `multimedia` step.
 *
 * @param {Object} options
 * @param {Object} imports
 *
 * @return {AbstractReviewStep}
 */
export default function setup(options, imports) {
  const teamManager = imports.teamManager;

  return new MultimediaReviewStep(teamManager);
}

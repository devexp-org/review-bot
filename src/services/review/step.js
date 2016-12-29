export default class AbstractReviewStep {

  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * Returns config for step.
   *
   * @return {Object}
   */
  config() {
    return {};
  }

  /**
   * @param {Review} review
   *
   * @return {Promise}
   */
  process(review) {
    return Promise.resolve(review);
  }

}

export default class AbstractReviewStep {

  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * Returns name of step.
   *
   * @return {String}
   */
  name() {
    return '';
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

import { Schema } from 'mongoose';
import { isEmpty } from 'lodash';

export default function setup(options, imports) {

  return function plugin(schema, modelName) {

    const Reviewer = new Schema({
      login: String,
      html_url: String,
      approved: Boolean
    });

    schema.add({
      review: {
        status: {
          type: String,
          'enum': [
            'notstarted',
            'inprogress',
            'changesneeded',
            'complete'
          ],
          'default': 'notstarted'
        },
        reviewers: [Reviewer],
        started_at: Date,
        updated_at: Date,
        completed_at: Date,
        approveCount: Number
      }
    });

    /**
     * Returns true if pull request has reviewers
     *
     * @return {Boolean}
     */
    schema.methods.hasReviewers = function () {
      return !isEmpty(this.get('review.reviewers'));
    };

    /**
     * Finds pull requests by reviewer
     *
     * @param {String} login
     * @param {Number} skip
     * @param {Number} limit
     *
     * @return {Promise.<Array.<PullRequest>>}
     */
    schema.statics.findByReviewer = function (login, skip = 0, limit = 50) {
      return this
        .model(modelName)
        .find({ 'review.reviewers.login': login })
        .sort('-updated_at')
        .skip(skip)
        .limit(limit)
        .exec();
    };

    /**
     * Finds open reviews
     *
     * @param {Number} skip
     * @param {Number} limit
     *
     * @return {Promise.<Array.<PullRequest>>}
     */
    schema.statics.findInReview = function (skip = 0, limit = 50) {
      const req = {
        state: 'open',
        'review.status': 'inprogress'
      };

      return this
        .model(modelName)
        .find(req)
        .skip(skip)
        .limit(limit)
        .exec();
    };

    /**
     * Finds open reviews by reviewer
     *
     * @param {String} login
     * @param {Number} skip
     * @param {Number} limit
     *
     * @return {Promise.<PullRequest>}
     */
    schema.statics.findInReviewByReviewer = function (login, skip = 0, limit = 50) {
      const req = {
        state: 'open',
        'review.status': 'inprogress',
        'review.reviewers.login': login
      };

      return this
        .model(modelName)
        .find(req)
        .skip(skip)
        .limit(limit)
        .exec();
    };

  };

}

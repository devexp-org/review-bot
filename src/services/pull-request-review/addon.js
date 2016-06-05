import { Schema } from 'mongoose';

export default function setup(options, imports) {

  return {

    mixin(model, modelName) {

      /**
       * Find pull requests by reviewer
       *
       * @param {String} login
       *
       * @return {Promise.<PullRequest>}
       */
      model.statics.findByReviewer = function (login) {
        return this
          .model(modelName)
          .find({ 'review.reviewers.login': login })
          .sort('-updated_at')
          .limit(50)
          .exec();
      };

      /**
       * Find open reviews
       *
       * @param {String} login
       *
       * @return {Promise.<PullRequest>}
       */
      model.statics.findInReview = function () {
        const req = {
          state: 'open',
          'review.status': 'inprogress'
        };

        return this
          .model(modelName)
          .find(req)
          .limit(50)
          .exec();
      };

      /**
       * Find open reviews by reviewer
       *
       * @param {String} login
       *
       * @return {Promise.<PullRequest>}
       */
      model.statics.findInReviewByReviewer = function (login) {
        const req = {
          state: 'open',
          'review.status': 'inprogress',
          'review.reviewers.login': login
        };

        return this
          .model(modelName)
          .find(req)
          .limit(50)
          .exec();
      };

    },

    /**
     * Extend pull_request model to add extra `review` field.
     *
     * @return {Object}
     */
    extender() {
      const Reviewer = new Schema({
        login: String
      });

      return {
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
          completed_at: Date
        }
      };
    }

  };

}

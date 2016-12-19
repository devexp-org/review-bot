import { merge, withApp } from './app';
import { withModel } from './model/';
import { withTeamModel } from './model/model-team';
import { withUserModel } from './model/model-user';
import { withPullRequestModel } from './model/model-pull-request';
import { withTeamManager } from './team-manager/';
import { withTeamDriverStatic } from './team-manager/driver-static';

export function withPullRequestReview(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        events: {
          path: './src/services/events'
        },
        model: {
          options: {
            plugins: {
              pull_request: ['pull-request-review-plugin']
            }
          },
          dependencies: ['mongoose', 'pull-request-review-plugin']
        },
        'pull-request-review': {
          path: './src/services/pull-request-review',
          options: { approveCount: 1 },
          dependencies: ['team-manager', 'events', 'logger']
        },
        'pull-request-review-plugin': {
          path: './src/services/pull-request-review/addon'
        }
      }
    }, config);

    next(imports => {
      const pullRequest = imports.pullRequest;
      pullRequest.set('review.reviewers', [{ login: 'foo' }]);
      pullRequest.set('review.approveCount', 1);

      return test(imports);
    }, config, done);

  };

}

describe('services/pull-request-review', function () {

  const test = withPullRequestReview(
    withTeamDriverStatic(
      withTeamManager(
        withTeamModel(
          withUserModel(
            withPullRequestModel(
              withModel(
                withApp
              )
            )
          )
        )
      )
    )
  );

  describe('addon', function () {

    describe('#findByReviewer', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          pullRequest.set('review', {
            reviewers: [
              { login: 'sbmaxx' },
              { login: 'mishanga' }
            ]
          });

          return pullRequest.save()
            .then(() => PullRequestModel.findByReviewer('sbmaxx'))
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 1);
            });
        }, {}, done);

      });

    });

    describe('#findInReview', function () {

      it('should return all opened pull requests', function (done) {

        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          pullRequest.set('review', {
            status: 'inprogress',
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save()
            .then(() => PullRequestModel.findInReview())
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 1);
            });
        }, {}, done);

      });

    });

    describe('#findInReviewByReviewer', function () {

      it('should return opened pull requests filtered by reviewer', function (done) {

        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          pullRequest.set('review', {
            status: 'inprogress',
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save()
            .then(() => PullRequestModel.findInReviewByReviewer('sbmaxx'))
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 1);
            });
        }, {}, done);

      });

    });

  });

  describe('class', function () {

    const saveAndLoad = function (PullRequestModel) {
      return function (pullRequest) {
        return pullRequest.save()
          .then(() => PullRequestModel.findById(pullRequest.id));
      };
    };

    describe('#startReview', function () {

      it('should change status of pull request to "inprogress"', function (done) {
        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];

          pullRequest.set('review.status', 'notstarted');

          return pullRequestReview.startReview(pullRequest)
            .then(saveAndLoad(PullRequestModel))
            .then(pullRequestLoaded => {
              assert.equal(pullRequestLoaded.get('review.status'), 'inprogress');
            });
        }, {}, done);
      });

    });

    describe('#stopReview', function () {

      it('should change status of pull request to "notstarted"', function (done) {
        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];

          pullRequest.set('review.status', 'inprogress');

          return pullRequestReview.stopReview(pullRequest)
            .then(saveAndLoad(PullRequestModel))
            .then(pullRequestLoaded => {
              assert.equal(pullRequestLoaded.get('review.status'), 'notstarted');
            });
        }, {}, done);
      });

    });

    describe('#approveReview', function () {

      it('should change status of pull request to "complete"', function (done) {
        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];

          pullRequest.set('review.status', 'inprogress');

          return pullRequestReview.approveReview(pullRequest, 'foo')
            .then(saveAndLoad(PullRequestModel))
            .then(pullRequestLoaded => {
              assert.equal(pullRequestLoaded.get('review.status'), 'complete');
            });
        }, {}, done);
      });

    });

    describe('#updateReview', function () {

      it('should change reviewers of pull request', function (done) {
        test(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];

          pullRequest.set('review.status', 'notstarted');

          return pullRequestReview.updateReview(pullRequest, { reviewers: [{ login: 'bar' }] })
            .then(saveAndLoad(PullRequestModel))
            .then(pullRequestLoaded => {
              const reviewers = pullRequestLoaded.get('review.reviewers');

              assert.isArray(reviewers);
              assert.lengthOf(reviewers, 1);
              assert.property(reviewers[0], 'login', 'bar');
            });
        }, {}, done);

      });

    });

  });

});

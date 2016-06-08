import _ from 'lodash';
import { withPullRequest } from './model';

export function withPullRequestReview(test, config, done) {

  config = _.merge({
    services: {
      events: {
        path: './src/services/events'
      },
      model: {
        options: {
          addons: {
            pull_request: ['pull-request-review-addon']
          }
        },
        dependencies: ['mongoose', 'pull-request-review-addon']
      },
      'team-dispatcher': {
        path: './src/services/team-dispatcher',
        options: {
          routes: [{ 'team-static': ['*/*'] }]
        },
        dependencies: ['team-static']
      },
      'team-static': {
        path: './src/services/team-dispatcher/static',
        options: { members: ['foo', 'bar'] }
      },
      'pull-request-review': {
        path: './src/services/pull-request-review',
        options: { approveCount: 1 },
        dependencies: ['team-dispatcher', 'events', 'logger']
      },
      'pull-request-review-addon': {
        path: './src/services/pull-request-review/addon'
      }
    }
  }, config);

  withPullRequest(imports => {
    imports.pullRequest.set('review.reviewers', [{ login: 'foo' }]);
    return test(imports);
  }, config, done);

}

describe('services/pull-request-review', function () {

  describe('addon', function () {

    describe('#findByReviewer', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          pullRequest.set('review', {
            reviewers: [
              { login: 'sbmaxx' },
              { login: 'mishanga' }
            ]
          });

          return pullRequest.save()
            .then(() => {
              return PullRequestModel.findByReviewer('sbmaxx')
                .then(result => {
                  assert.isArray(result);
                  assert.lengthOf(result, 1);
                });
            });
        }, {}, done);

      });

    });

    describe('#findInReview', function () {

      it('should return all opened pull requests', function (done) {

        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          pullRequest.set('review', {
            status: 'inprogress',
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save()
            .then(() => {
              return PullRequestModel.findInReview()
                .then(result => {
                  assert.isArray(result);
                  assert.lengthOf(result, 1);
                });
            });
        }, {}, done);

      });

    });

    describe('#findInReviewByReviewer', function () {

      it('should return opened pull requests filtered by reviewer', function (done) {

        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;

          pullRequest.set('review', {
            status: 'inprogress',
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save()
            .then(() => {
              return PullRequestModel.findInReviewByReviewer('sbmaxx')
                .then(result => {
                  assert.isArray(result);
                  assert.lengthOf(result, 1);
                });
            });
        }, {}, done);

      });

    });

  });

  describe('class', function () {

    const afterSaveAndLoad = function (PullRequestModel, test) {
      return function (pullRequest) {
        return pullRequest.save()
          .then(() => PullRequestModel.findById(pullRequest.id))
          .then(test);
      };
    };

    describe('#startReview', function () {

      it('should change status of pull request to "inprogress"', function (done) {
        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];
          pullRequest.set('review.status', 'notstarted');

          return pullRequestReview.startReview(pullRequest)
            .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
              assert.equal(pullRequestLoaded.get('review.status'), 'inprogress');
            }));
        }, {}, done);
      });

    });

    describe('#stopReview', function () {

      it('should change status of pull request to "notstarted"', function (done) {
        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];
          pullRequest.set('review.status', 'inprogress');

          return pullRequestReview.stopReview(pullRequest)
            .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
              assert.equal(pullRequestLoaded.get('review.status'), 'notstarted');
            }));
        }, {}, done);
      });

    });

    describe('#approveReview', function () {

      it('should change status of pull request to "complete"', function (done) {
        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];
          pullRequest.set('review.status', 'inprogress');

          return pullRequestReview.approveReview(pullRequest, 'foo')
            .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
              assert.equal(pullRequestLoaded.get('review.status'), 'complete');
            }));
        }, {}, done);
      });

    });

    describe('#updateReviewers', function () {

      it('should change reviewers of pull request', function (done) {
        withPullRequestReview(imports => {
          const pullRequest = imports.pullRequest;
          const PullRequestModel = imports.PullRequestModel;
          const pullRequestReview = imports['pull-request-review'];
          pullRequest.set('review.status', 'notstarted');

          return pullRequestReview.updateReviewers(pullRequest, [{ login: 'bar' }])
            .then(afterSaveAndLoad(PullRequestModel, pullRequestLoaded => {
              const reviewers = pullRequestLoaded.get('review.reviewers');
              assert.isArray(reviewers);
              assert.lengthOf(reviewers, 1);
              assert.property(reviewers[0], 'login', 'bar');
            }));
        }, {}, done);

      });

    });

  });

});

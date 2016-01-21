'use strict';

import { withPullRequest } from './common';

describe('model', function () {

  describe('modules/model/pull_request', function () {

    it('should setup model', function (done) {

      withPullRequest(imports => {
        const pullRequest = imports.pullRequest;
        assert.equal(pullRequest.id, pullRequest._id);
      }, done);

    });

    describe('#findByUser', function () {

      it('should return pull requests filtered by user', function (done) {

        withPullRequest(imports => {
          const { PullRequest } = imports;

          PullRequest.findByUser('d4rkr00t')
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 1);
            });
        }, done);

      });

      it('should return an empty array if pulls not found', function (done) {

        withPullRequest(imports => {
          const { PullRequest } = imports;

          return PullRequest
            .findByUser('sbmaxx')
            .then(result => {
              assert.isArray(result);
              assert.lengthOf(result, 0);
            });
        }, done);

      });

    });

    describe('#findByReviewer', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        withPullRequest(imports => {
          const { pullRequest, PullRequest } = imports;

          pullRequest.set('review', {
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save().then(() => {
            return PullRequest
              .findByReviewer('sbmaxx')
              .then(result => {
                assert.isArray(result);
                assert.lengthOf(result, 1);
              });
          });
        }, done);

      });

    });

    describe('#findByRepositoryAndNumber', function () {

      it('should return pull requests filtered by reviewer', function (done) {

        withPullRequest(imports => {
          const { PullRequest } = imports;

          return PullRequest
            .findByRepositoryAndNumber('devexp-org/devexp', 49)
            .then(result => {
              assert.equal(result.number, 49);
            });
        }, done);

      });

    });

    describe('#findInReviewByReviewer', function () {

      it('should return open pull requests filtered by reviewer', function (done) {

        withPullRequest(imports => {
          const { pullRequest, PullRequest } = imports;

          pullRequest.set('review', {
            status: 'inprogress',
            reviewers: [{ login: 'sbmaxx' }, { login: 'mishanga' }]
          });

          return pullRequest.save().then(() => {
            return PullRequest
              .findInReviewByReviewer('sbmaxx')
              .then(result => {
                assert.isArray(result);
                assert.lengthOf(result, 1);
              });
          });
        }, done);

      });

    });

  });

});

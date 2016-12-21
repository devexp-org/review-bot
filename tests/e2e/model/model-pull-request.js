import { withModel } from '../model/';
import { merge, withApp } from '../app';
import pullRequestHook from '../data/pull_request_webhook';

export function withPullRequestModel(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        model: {
          options: {
            models: {
              pull_request: 'model-pull-request'
            }
          },
          dependencies: ['model-pull-request']
        },
        'model-pull-request': {
          path: './src/services/model/model-pull-request'
        }
      }
    }, config);

    next(imports => {

      let pullRequest;
      const PullRequestModel = imports.model('pull_request');

      return PullRequestModel
        .remove({})
        .then(() => {
          pullRequest = new PullRequestModel();
          pullRequestHook.pull_request.repository = pullRequestHook.repository;
          pullRequest.set(pullRequestHook.pull_request);

          return pullRequest.save();
        })
        .then(() => {
          imports.pullRequest = pullRequest;
          imports.PullRequestModel = PullRequestModel;

          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe('services/model/model-pull-request', function () {

  const test = withPullRequestModel(withModel(withApp));

  it('should setup pull request', function (done) {

    test(imports => {
      const pullRequest = imports.pullRequest;
      const PullRequestModel = imports.PullRequestModel;

      assert.property(pullRequest, 'owner');
      assert.property(pullRequest, 'toString');
      assert.property(PullRequestModel, 'findById');
      assert.property(PullRequestModel, 'findByUser');
      assert.property(PullRequestModel, 'findByRepositoryAndNumber');

    }, {}, done);

  });

  describe('#owner', function () {

    it('should return pullRequest repository owner', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        assert.equal(pullRequest.owner, 'artems');
      }, {}, done);

    });

    it('should return an empty string if pullRequest broken', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        pullRequest.set('repository', {});
        assert.equal(pullRequest.owner, '');
      }, {}, done);

    });

  });

  describe('#toString', function () {

    it('should return text representation of pull request', function (done) {

      test(imports => {
        const result = '[73491907 – Right deps] https://github.com/artems/devkit/pull/1';
        const pullRequest = imports.pullRequest;

        assert.equal(pullRequest.toString(), result);
      }, {}, done);

    });

  });

  describe('#findById', function () {

    it('should return pull request filtered by id', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;

        return PullRequestModel
          .findById(73491907)
          .then(result => assert.equal(result.id, pullRequest.id));
      }, {}, done);

    });

  });
  describe('#findByUser', function () {

    it('should return pull requests filtered by user', function (done) {

      test(imports => {
        const PullRequestModel = imports.PullRequestModel;

        return Promise.resolve()
          .then(() => PullRequestModel.findByUser('artems'))
          .then(result => {
            assert.isArray(result);
            assert.lengthOf(result, 1);
            assert.equal(result[0].id, 73491907);
          });
      }, {}, done);

    });

    it('should return an empty array if pulls were not found', function (done) {

      test(imports => {
        const PullRequestModel = imports.PullRequestModel;

        return Promise.resolve()
          .then(() => PullRequestModel.findByUser('sbmaxx'))
          .then(result => {
            assert.isArray(result);
            assert.lengthOf(result, 0);
          });
      }, {}, done);

    });

  });

  describe('#findByNumberAndRepository', function () {

    it('should return pull requests filtered by number', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        const PullRequestModel = imports.PullRequestModel;

        return PullRequestModel
          .findByRepositoryAndNumber('artems/devkit', 1)
          .then(result => {
            assert.equal(result.id, pullRequest.id);
          });
      }, {}, done);

    });

  });

});

import { merge, withApp, withInitial } from '../app';
import { withModel } from '../model';
import { withGitHub } from '../github';
import { withPullRequestModel } from '../model/model-pull-request';

export function withPullRequestGitHub(next) {

  return function (test, config, done) {

    config = merge(config, {
      services: {
        model: {
          options: {
            plugins: {
              pull_request: ['pull-request-github-addon']
            }
          },
          dependencies: ['pull-request-github-addon']
        },
        'pull-request-github': {
          path: './src/services/pull-request-github',
          options: {
            separator: {
              top: '<div id=\'devexp-content-top\'></div><hr>',
              bottom: '<div id=\'devexp-content-bottom\'></div>'
            }
          },
          dependencies: ['logger', 'github']
        },
        'pull-request-github-addon': {
          path: './src/services/pull-request-github/addon'
        }
      }
    });

    next(test, config, done);

  };

}

describe('services/pull-request-github', function () {

  this.timeout(5000);

  const test = withPullRequestGitHub(
    withPullRequestModel(
      withModel(
        withGitHub(
          withInitial(
            withApp
          )
        )
      )
    )
  );

  let date, time;

  beforeEach(function () {
    date = new Date();
    time = date.getFullYear() + '-' +
      (date.getMonth() + 1) + '-' +
      date.getDate() + ' ' +
      date.getHours() + ':' +
      date.getMinutes() + ':' +
      date.getSeconds() + '.' +
      date.getMilliseconds();
  });

  describe('#loadPullRequestFromGitHub', function () {

    it('should load pull request from github', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .loadPullRequestFromGitHub(pullRequest)
          .then(pullRequestLoaded => {
            assert.isObject(pullRequestLoaded);
            assert.property(pullRequestLoaded, 'body');
            assert.property(pullRequestLoaded, 'title');
            assert.property(pullRequestLoaded, 'section');
          });
      }, {}, done);

    });

  });

  describe('#updatePullRequestOnGitHub', function () {

    it('should update pull request title and body on github', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        pullRequest.body = time;

        return pullRequestGitHub
          .updatePullRequestOnGitHub(pullRequest)
          .then(pullRequestSaved => {
            return pullRequestGitHub.loadPullRequestFromGitHub(pullRequest);
          })
          .then(pullRequestLoaded => {
            assert.equal(pullRequestLoaded.body, time);
          });
      }, {}, done);

    });

  });

  describe('#loadPullRequestFiles', function () {

    it('should load files from github and set them to pull request', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        assert.isArray(pullRequest.files);
        assert.lengthOf(pullRequest.files, 0);

        return pullRequestGitHub
          .loadPullRequestFiles(pullRequest)
          .then(pullRequestLoaded => {
            assert.isAbove(pullRequestLoaded.files.length, 0);
            assert.property(pullRequestLoaded.files[0], 'status');
            assert.property(pullRequestLoaded.files[0], 'changes');
            assert.property(pullRequestLoaded.files[0], 'filename');
            assert.property(pullRequestLoaded.files[0], 'additions');
            assert.property(pullRequestLoaded.files[0], 'deletions');
          });
      }, {}, done);

    });

  });

  describe('#setBodySection with #updatePullRequestOnGitHub', function () {

    it('should update body section, save it and then update pull request on github', function (done) {

      test(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        pullRequestGitHub.setBodySection(pullRequest, 'time', time);

        return pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
          .then(pullRequestSaved => {
            return pullRequestGitHub.loadPullRequestFromGitHub(pullRequest);
          })
          .then(pullRequestLoaded => {
            assert.include(pullRequestLoaded.body, time);
          });
      }, {}, done);

    });

  });

  describe('#syncPullRequestWithGitHub', function () {

    it('should load pull request body from github, keep user text but replace generated sections and then update it on github again', function (done) {
      this.timeout(10000);

      test(imports => {
        const pullRequest = imports.pullRequest;
        const pullRequestGitHub = imports['pull-request-github'];

        pullRequest.body = 'FooBar';
        return pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
          .then(pullRequestSaved => {
            pullRequestSaved.body = 'BarFoo';
            pullRequestGitHub.setBodySection(pullRequestSaved, 'time', time);
            return pullRequestGitHub.syncPullRequestWithGitHub(pullRequestSaved);
          })
          .then(pullRequestSaved => {
            return pullRequestGitHub.loadPullRequestFromGitHub(pullRequestSaved);
          })
          .then(pullRequestLoaded => {
            assert.include(pullRequestLoaded.body, time);
            assert.include(pullRequestLoaded.body, 'FooBar');
            assert.notInclude(pullRequestLoaded.body, 'BarFoo');
          });
      }, {}, done);

    });

  });

});

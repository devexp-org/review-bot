import _ from 'lodash';
import secret from '../../config/secret';
import { withPullRequest } from './model';

export function withGitHub(test, config, done) {

  config = _.merge(config, {
    services: {
      github: {
        path: './src/services/github',
        options: {
          host: 'api.github.com',
          debug: false,
          version: '3.0.0',
          timeout: 2000,
          protocol: 'https',
          headers: { 'user-agent': 'DevExp-App' }
        },
        dependencies: []
      },
      model: {
        options: {
          addons: {
            pull_request: [
              'pull-request-github-addon'
            ]
          }
        },
        dependencies: ['mongoose', 'pull-request-github-addon']
      },
      'pull-request-github': {
        path: './src/services/pull-request-github',
        dependencies: ['logger', 'github']
      },
      'pull-request-github-addon': {
        path: './src/services/pull-request-github/addon'
      }
    }
  });

  config.services.github = _.merge({}, config.services.github, secret.services.github);

  withPullRequest(test, config, done);

}

describe('services/pull-request-github', function () {

  this.timeout(5000);

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

      withGitHub(imports => {
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

      withGitHub(imports => {
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

      withGitHub(imports => {
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

      withGitHub(imports => {
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

      withGitHub(imports => {
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

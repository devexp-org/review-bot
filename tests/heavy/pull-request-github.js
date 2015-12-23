'use strict';

import { withApp } from './common';
import pullRequestMock from '../../services/pull-request-github/__mocks__/pull_request';

function withAppAndPullRequest(test, done) {
  withApp(imports => {
    const pullRequestData = pullRequestMock();
    const PullRequestModel = imports.model.get('pull_request');

    const pullRequest = new PullRequestModel(pullRequestData);

    return pullRequest
      .remove({})
      .then(() => {
        return pullRequest.save();
      })
      .then(() => test(imports))
      .then(() => pullRequest.remove({}));
  }, done);
}

describe('services/pull-request-github', function () {

  describe('#loadPullRequestFromGitHub', function () {

    it('should load pull request from github', function (done) {

      withApp(imports => {
        const pullRequest = pullRequestMock();
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .loadPullRequestFromGitHub(pullRequest)
          .then(pullRequestLoaded => {
            assert.isObject(pullRequestLoaded);
          });
      }, done);

    });

  });

  describe('#updatePullRequestOnGitHub', function () {

    it('should update pull request description on github', function (done) {

      withApp(imports => {
        const pullRequest = pullRequestMock();
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .updatePullRequestOnGitHub(pullRequest)
          .then(pullRequestSaved => {
            assert.isObject(pullRequestSaved);
          });
      }, done);

    });

  });

  describe('#loadPullRequestFiles', function () {

    it('should load files from github and set them to pull request', function (done) {

      withApp(imports => {
        const pullRequest = pullRequestMock();
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .loadPullRequestFiles(pullRequest)
          .then(files => {
            assert.isArray(files);
          });
      }, done);

    });

  });

  describe('#savePullRequestToDatabase', function () {

    it('should save pull request to mongodb', function (done) {

      withAppAndPullRequest(imports => {
        const pullRequest = pullRequestMock();
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .savePullRequestToDatabase(pullRequest)
          .then(pullRequestSaved => {
            assert.isObject(pullRequestSaved);
          });
      }, done);

    });

  });

  describe('#setBodySection', function () {

    it('should update 1 body section, save it and then update pull request on github', function (done) {

      withAppAndPullRequest(imports => {
        const pullRequest = pullRequestMock();
        const pullRequestGitHub = imports['pull-request-github'];

        return pullRequestGitHub
          .setBodySection(pullRequest.id, 'test', 'TEST')
          .then(pullRequestSaved => {
            assert.isObject(pullRequestSaved);
          });
      }, done);

    });

  });

});

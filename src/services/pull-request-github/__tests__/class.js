import PullRequestGitHub from '../class';

import githubMock from '../../github/__mocks__/';
import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';

describe('services/pull-request-github/class', function () {

  let github, pullRequest, pullRequestGitHub, options;

  beforeEach(function () {
    github = githubMock();
    pullRequest = pullRequestMock();

    options = {
      separator: {
        top: '<!-- BEGIN -->',
        bottom: '<!-- END -->'
      }
    };

    pullRequestGitHub = new PullRequestGitHub(github, options);
  });

  describe('#loadPullRequestFromGitHub', function () {

    it('should send a request to github for the pull request', function (done) {
      pullRequestGitHub.loadPullRequestFromGitHub(pullRequest)
        .then(() => {
          assert.calledWith(
            github.pullRequests.get,
            sinon.match({
              repo: sinon.match.string,
              user: sinon.match.string,
              number: sinon.match.number
            })
          );
        })
        .then(done, done);
    });

    it('should update the pull request', function (done) {
      const data = {};
      github.pullRequests.get.callsArgWith(1, null, data);

      pullRequestGitHub.loadPullRequestFromGitHub(pullRequest)
        .then(result => assert.calledWith(pullRequest.set, data))
        .then(done, done);
    });

    it('should throw an error if github return error', function (done) {
      const err = new Error('just error');
      github.pullRequests.get.callsArgWith(1, err);

      pullRequestGitHub.loadPullRequestFromGitHub(pullRequest)
        .then(() => assert.fail())
        .catch(e => {
          assert.match(e.message, /just error/i);
          assert.match(e.message, /cannot.*github/i);
        })
        .then(done, done);
    });

  });

  describe('#updatePullRequestOnGitHub', function () {

    it('should send a request to github to update the pull request', function (done) {
      pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
        .then(() => {
          assert.calledWith(
            github.pullRequests.update,
            sinon.match({
              repo: sinon.match.string,
              user: sinon.match.string,
              number: sinon.match.number
            })
          );
        })
        .then(done, done);
    });

    it('should throw an error if github return error', function (done) {
      const err = new Error('just error');
      github.pullRequests.update.callsArgWith(1, err);

      pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
        .then(() => assert.fail())
        .catch(e => {
          assert.match(e.message, /just error/i);
          assert.match(e.message, /cannot update/i);
        })
        .then(done, done);
    });

    it('should not update pull request in silent mode', function (done) {
      options.silent = true;
      pullRequestGitHub = new PullRequestGitHub(github, options);

      pullRequestGitHub.updatePullRequestOnGitHub(pullRequest)
        .then(() => assert.notCalled(github.pullRequests.update))
        .then(done, done);
    });

  });

  describe('#loadPullRequestFiles', function () {

    beforeEach(function () {
      github.pullRequests.getFiles
        .callsArgWith(1, null, []);
    });

    it('should send a request to github for the pull request files', function (done) {
      pullRequestGitHub.loadPullRequestFiles(pullRequest)
        .then(() => {
          assert.calledWith(
            github.pullRequests.getFiles,
            sinon.match({
              repo: sinon.match.string,
              user: sinon.match.string,
              number: sinon.match.number,
              per_page: sinon.match.number
            })
          );
        })
        .then(done, done);
    });

    it('should update pull request files', function (done) {
      const data = [{ fiilename: 'a.txt' }];
      github.pullRequests.getFiles
        .callsArgWith(1, null, data);

      pullRequestGitHub.loadPullRequestFiles(pullRequest)
        .then(result => assert.calledWith(pullRequest.set, 'files', data))
        .then(done, done);
    });

    it('should throw an error if github return error', function (done) {
      const err = new Error('just error');
      github.pullRequests.getFiles.callsArgWith(1, err);

      pullRequestGitHub.loadPullRequestFiles(pullRequest)
        .then(() => assert.fail())
        .catch(e => {
          assert.match(e.message, /just error/i);
          assert.match(e.message, /cannot.*files/i);
        })
        .then(done, done);
    });

  });

  describe('#syncPullRequestWithGitHub', function () {

    it('should load pull request from github and then save it to database', function (done) {
      sinon.stub(pullRequestGitHub, 'loadPullRequestFromGitHub')
        .returns(Promise.resolve(pullRequest));
      sinon.stub(pullRequestGitHub, 'updatePullRequestOnGitHub')
        .returns(Promise.resolve(pullRequest));

      pullRequestGitHub.syncPullRequestWithGitHub(pullRequest)
        .then(() => {
          assert(
            pullRequestGitHub.loadPullRequestFromGitHub.calledBefore(
              pullRequestGitHub.updatePullRequestOnGitHub
            )
          );
          assert(
            pullRequestGitHub.updatePullRequestOnGitHub.calledBefore(
              pullRequest.save
            )
          );
        })
        .then(done, done);
    });

  });

  describe('#setPayload', function () {

    it('should update pull request from payload', function () {
      const payload = { pull_request: {}, repository: {}, organization: {} };
      pullRequestGitHub.setPayload(pullRequest, payload);

      assert.calledWith(pullRequest.set, payload.pull_request);
    });

  });

  describe('#setBodySection', function () {

    beforeEach(function () {
      const section = {};
      pullRequest.section = section;
    });

    it('should updated property `section`', function () {
      pullRequestGitHub.setBodySection(pullRequest, 'section', 'body');

      assert.calledWith(
        pullRequest.set,
        sinon.match('section'),
        sinon.match({ section: { content: 'body', position: sinon.match.number } })
      );
    });

    it('should not throw an error if section does not exists in the pull request', function () {
      pullRequest.section = null;

      assert.doesNotThrow(() => {
        pullRequestGitHub.setBodySection(pullRequest, 'section', 'body', 100);
      });
    });

  });

  describe('#cleanPullRequestBody', function () {

    it('should be able to clean pull request body from end', function () {
      const body = 'BODY TEXT\n<!-- BEGIN -->\nEXTRA BODY TEXT\n<!-- END -->';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT');
    });

    it('should able to clean pull request body from begin', function () {
      const body = '<!-- BEGIN -->\nEXTRA BODY TEXT\n<!-- END -->\nBODY TEXT';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT');
    });

    it('should able to clean pull request body from middle', function () {
      const body = 'BODY TEXT 1\n<!-- BEGIN -->\nEXTRA BODY TEXT\n<!-- END -->\nBODY TEXT 2';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT 1\nBODY TEXT 2');
    });

    it('should clean empty lines', function () {
      const body = 'BODY TEXT 1\n\n<!-- BEGIN -->\nEXTRA BODY TEXT\n<!-- END -->\n';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, 'BODY TEXT 1');
    });

    it('should not perform any edits if no separators exist', function () {
      const body = 'BODY TEXT 1\nBODY TEXT 2';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, body);
    });

    it('should not perform any edits if only 1 separator exists', function () {
      const body = 'BODY TEXT 1\n<!-- BEGIN -->\nEXTRA BODY TEXT\nBODY TEXT 2';

      const result = pullRequestGitHub.cleanPullRequestBody(body);

      assert.equal(result, body);
    });

  });

  describe('#fillPullRequestBody', function () {

    it('should be able to replace pull request body', function () {
      const body = 'BODY TEXT\n<!-- BEGIN -->\n<div>EXTRA BODY TEXT</div>\n<!-- END -->';

      const pullRequest = {
        body: body,
        section: {
          id1: 'ID1',
          id2: 'ID2'
        }
      };

      pullRequestGitHub.fillPullRequestBody(pullRequest);

      const expected = 'BODY TEXT\n<!-- BEGIN -->\n----\nID1\nID2\n<!-- END -->';

      assert.equal(pullRequest.body, expected);
    });

    it('should not add divining line if body is an empty', function () {
      const body = '';

      const pullRequest = {
        body: body,
        section: {
          id1: 'ID1',
          id2: 'ID2'
        }
      };

      pullRequestGitHub.fillPullRequestBody(pullRequest);

      const expected = '<!-- BEGIN -->\nID1\nID2\n<!-- END -->';

      assert.equal(pullRequest.body, expected);
    });

  });

  describe('#buildBodyContent', function () {

    it('should put sections in correct order in body content', function () {
      const sections = {
        id1: 'content 1',
        id2: {
          content: 'content 2',
          position: 1
        },
        id3: {
          content: 'content 3',
          position: 10
        }
      };

      assert.equal(
        pullRequestGitHub.buildBodyContent(sections),
        'content 2\ncontent 3\ncontent 1'
      );
    });

  });

});

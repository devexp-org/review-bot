import service from '../';

import githubMock from '../../../github/__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/commiters', function () {

  let step, imports, members, logger, github, commit, files, pullRequest;
  let ignorePatterns = [];

  const filesToCheck = 10;
  const commitsCount = 2;

  beforeEach(function () {

    commit = sinon.stub();
    commit.callsArgWithAsync(1, null, []);

    logger = loggerMock();

    github = githubMock();
    github.repos.getCommits = commit;

    files = [
      { filename: 'a.txt' },
      { filename: 'b.txt' },
      { filename: 'c.txt' }
    ];

    members = reviewMock();

    pullRequest = pullRequestMock();
    pullRequest.files = files;
    pullRequest.repository = { name: 'hubot', owner: { login: 'github' } };

    imports = { github, logger };

    step = service({}, imports);

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  describe('#getFiles', function () {

    it('should return an empty array if a pull request has no files', function (done) {
      pullRequest.files = [];

      step.getFiles(pullRequest, ignorePatterns, filesToCheck)
        .then(result => assert.deepEqual(result, []))
        .then(done, done);
    });

    it('should return files without ignored', function (done) {
      ignorePatterns = ['a.txt', 'b.txt'];

      step.getFiles(pullRequest, ignorePatterns, filesToCheck)
        .then(result => assert.deepEqual(result, [{ filename: 'c.txt' }]))
        .then(done, done);
    });

    it('should return no more then `filesToCheck` files', function (done) {
      step.getFiles(pullRequest, ignorePatterns, 1)
        .then(result => assert.lengthOf(result, 1))
        .then(done, done);
    });

  });

  describe('#getCommits', function () {

    let helper, since;

    beforeEach(function () {
      since = '2015-01-01T01:00:00Z';
      helper = step.getCommits(pullRequest, since, commitsCount);
    });

    it('should return commits associated with files', function (done) {

      commit
        .withArgs(sinon.match({ path: 'a.txt' }))
        .callsArgWithAsync(1, null, [
          { author: { login: 'Captain America' } }
        ]);

      commit
        .withArgs(sinon.match({ path: 'b.txt' }))
        .callsArgWithAsync(1, null, [
          { author: { login: 'Captain America' } },
          { author: { login: 'Hawkeye' } },
          { author: { login: 'Thor' } }
        ]);

      const expected = [
        { author: { login: 'Captain America' } },
        { author: { login: 'Captain America' } },
        { author: { login: 'Hawkeye' } },
        { author: { login: 'Thor' } }
      ];

      helper(files)
        .then(result => assert.deepEqual(result, expected))
        .then(done, done);
    });

    it('should resolve promise even when github return error', function (done) {
      commit
        .withArgs(sinon.match({ path: 'a.txt' }))
        .callsArgWithAsync(1, new Error('just error'));

      helper(files)
        .then(result => assert.deepEqual(result, []))
        .then(done, done);
    });

  });

  describe('#getCommiters', function () {

    let commits;

    beforeEach(function () {
      commits = [
        { author: { login: 'Captain America' } },
        { author: { login: 'Hawkeye' } },
        { author: { login: 'Thor' } },
        { author: { login: 'Captain America' } },
        { author: { login: 'Captain America' } },
        { author: { login: 'Hawkeye' } },
        { author: { login: 'Thor' } }
      ];
    });

    it('should return hash: `members` with number of commits', function (done) {
      const expected = { 'Captain America': 3, Hawkeye: 2, Thor: 2 };

      step.getCommiters(commits)
        .then(result => assert.deepEqual(result, expected))
        .then(done, done);
    });

    it('should skip commits without author', function (done) {
      commits.push({});
      commits.unshift({});

      step.getCommiters(commits)
        .then(() => null)
        .then(done, done);
    });

  });

  describe('#getSinceDate', function () {

    it('should property format date', function () {
      const date = +new Date(step.getSinceDate([2, 'days']));
      assert.isAbove(date, +new Date() - 3 * 24 * 3600 * 1000);
      assert.isBelow(date, +new Date() - 1 * 24 * 3600 * 1000);
    });

    it('should count days by default', function () {
      const date = +new Date(step.getSinceDate([2]));
      assert.isAbove(date, +new Date() - 3 * 24 * 3600 * 1000);
      assert.isBelow(date, +new Date() - 1 * 24 * 3600 * 1000);
    });

    it('should return an empty string if no date is given', function () {
      assert.equal(step.getSinceDate(), '');
    });

  });

  it('should return high rank for member if the member is an author of the last commits', function (done) {

    const review = { members, pullRequest };
    const commit = sinon.stub();
    const options = {
      max: 4,
      ignore: ignorePatterns,
      commitsCount,
      filesToCheck
    };

    commit.callsArgWith(1, null, []);

    commit
      .withArgs(sinon.match({ path: 'a.txt' }))
      .callsArgWith(1, null, [
        { author: { login: 'Captain America' } },
        { author: { login: 'Iron Man' } }
      ]);

    commit
      .withArgs(sinon.match({ path: 'b.txt' }))
      .callsArgWith(1, null, [
        { author: { login: 'Iron Man' } }
      ]);

    github.repos.getCommits = commit;

    const expected = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 7 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 11 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Thor', rank: 3 }
    ];

    step.process(review, options)
      .then(actual => assert.sameDeepMembers(actual.members, expected))
      .then(done, done);

  });

  it('should do nothing if there is no team in a review object', function (done) {
    const review = { members: [] };

    step.process(review, {})
      .then(actual => assert.deepEqual(actual.members, []))
      .then(done, done);
  });

});

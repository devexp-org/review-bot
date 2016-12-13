import ProjectConfig from '../class';

import loggerMock from '../../../services/logger/__mocks__/';
import githubMock from '../../../services/github/__mocks__/';
import teamManagerMock from '../../../services/team-manager/__mocks__/';
import { teamDriverMock } from '../../../services/team-manager/__mocks__/';
import { pullRequestMock } from '../../../services/model/model-pull-request/__mocks__/';
import { pullRequestModelReviewMixin } from '../../../services/pull-request-review/__mocks__/';

describe('services/project-config/config', function () {

  let team, logger, github, options, config;
  let pullRequest, teamManager, projectConfig;

  const encode = (config) => {
    return new Buffer(JSON.stringify(config)).toString('base64');
  };

  beforeEach(function () {

    logger = loggerMock();
    github = githubMock();

    pullRequest = pullRequestMock(pullRequestModelReviewMixin);

    pullRequest.files = [
      { filename: '1.txt' },
      { filename: '2.html' },
      { filename: '3.json' },
      { filename: '4.css' },
      { filename: '5.txt' }
    ];

    team = teamDriverMock();

    team.findTeamMember
      .withArgs('foo').returns(Promise.resolve({ login: 'foo' }));
    team.findTeamMember
      .withArgs('bar').returns(Promise.resolve({ login: 'bar' }));
    team.findTeamMember
      .withArgs('baz').returns(Promise.resolve({ login: 'baz' }));

    teamManager = teamManagerMock();
    teamManager.findTeamByPullRequest.returns(team);

    options = {};
    projectConfig = new ProjectConfig(logger, github, teamManager, options);

  });

  describe('#readConfig', function () {

    it('should get and then parse config from the repository', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            addMembers: ['foo', 'bar'],
            membersToAdd: 2,
            doNotChooseOther: true
          },
          {
            pattern: ['*.doc'],
            addMembers: ['qux']
          },
          {
            pattern: ['*.css'],
            removeMembers: ['foo', 'baz']
          }
        ]
      };

      github.repos.getContent
        .withArgs({
          user: 'repository.owner.login',
          repo: 'repository.name',
          path: '.devexp.json'
        })
        .callsArgWith(1, null, { content: encode(config) });

      const expected = {
        addMembers: [
          { login: 'bar', pattern: '*.txt' }
        ],
        removeMembers: [
          { login: 'foo', pattern: '*.css' },
          { login: 'baz', pattern: '*.css' }
        ],
        addOnlySpecial: true
      };

      projectConfig.readConfig(pullRequest)
        .then(patch => assert.deepEqual(patch, expected))
        .then(done, done);

    });

    it('should ignore user if he is not in team', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            addMembers: ['foo', 'bar'],
            membersToAdd: 2
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      team.findTeamMember
        .withArgs('bar').returns(Promise.resolve(null));

      const expected = {
        addMembers: [{ login: 'foo', pattern: '*.txt' }],
        removeMembers: [],
        addOnlySpecial: false
      };

      projectConfig.readConfig(pullRequest)
        .then(patch => assert.deepEqual(patch, expected))
        .then(done, done);

    });

    it('should return resolved promise even if config is not found', function (done) {

      github.repos.getContent
        .callsArgWith(1, new Error('just error'));

      const expected = {
        addMembers: [],
        removeMembers: [],
        addOnlySpecial: false
      };

      projectConfig.readConfig(pullRequest)
        .then(patch => assert.deepEqual(patch, expected))
        .then(done, done);

    });

    it('should return resolved promise even if config is an empty', function (done) {

      github.repos.getContent
        .callsArgWith(1, null, { content: encode({}) });

      const expected = {
        addMembers: [],
        removeMembers: [],
        addOnlySpecial: false
      };

      projectConfig.readConfig(pullRequest)
        .then(patch => assert.deepEqual(patch, expected))
        .then(done, done);

    });

    it('should return rejected promise if team is not found', function (done) {

      teamManager.findTeamByPullRequest
        .returns(null);

      github.repos.getContent
        .callsArgWith(1, null, { content: encode({ specialReviewers: [] }) });

      projectConfig.readConfig(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);

    });

  });

  describe('#process', function () {

    it('should promote reviewers listed in config', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            addMembers: ['foo', 'bar'],
            membersToAdd: 2
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      const expected = [
        { login: 'foo', rank: 1000, special: true },
        { login: 'bar', rank: 1000, special: true }
      ];

      projectConfig.process(pullRequest)
        .then(patch => assert.sameDeepMembers(patch, expected))
        .then(done, done);

    });

    it('should exclude reviewers listed in config', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            removeMembers: ['foo', 'bar']
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      const expected = [
        { login: 'foo', rank: -1000 },
        { login: 'bar', rank: -1000 }
      ];

      projectConfig.process(pullRequest)
        .then(patch => assert.sameDeepMembers(patch, expected))
        .then(done, done);

    });

    it('should promote and exclude reviewers listed in config', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            addMembers: ['foo', 'bar'],
            membersToAdd: 2
          },
          {
            pattern: ['*.css'],
            removeMembers: ['foo', 'baz']
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      const expected = [
        { login: 'bar', rank: 1000, special: true },
        { login: 'foo', rank: -1000 },
        { login: 'baz', rank: -1000 }
      ];

      projectConfig.process(pullRequest)
        .then(patch => assert.deepEqual(patch, expected))
        .then(done, done);

    });

  });

});

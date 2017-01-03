import service from '../';
import { find } from 'lodash';

import { reviewMock } from '../../__mocks__/';
import loggerMock from '../../../logger/__mocks__/';
import githubMock from '../../../github/__mocks__/';
import teamManagerMock from '../../../team-manager/__mocks__/';
import { teamDriverMock } from '../../../team-manager/__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import { pullRequestModelReviewMixin } from '../../../pull-request-review/__mocks__/';

describe('services/review/steps/project-config', function () {

  let step, team, logger, github, config, teamManager, pullRequest;
  let encode, review, members, options, imports;

  beforeEach(function () {

    team = teamDriverMock();

    members = reviewMock();

    encode = (config) => {
      return new Buffer(JSON.stringify(config)).toString('base64');
    };

    logger = loggerMock();
    github = githubMock();
    teamManager = teamManagerMock(team);

    options = {};
    imports = { logger, github, 'team-manager': teamManager };

    pullRequest = pullRequestMock(pullRequestModelReviewMixin);

    pullRequest.files = [
      { filename: '1.txt' },
      { filename: '2.html' },
      { filename: '3.json' },
      { filename: '4.css' },
      { filename: '5.txt' }
    ];

    team.findTeamMember
      .withArgs('foo')
      .returns(Promise.resolve({ login: 'foo' }));
    team.findTeamMember
      .withArgs('bar')
      .returns(Promise.resolve({ login: 'bar' }));
    team.findTeamMember
      .withArgs('baz')
      .returns(Promise.resolve({ login: 'baz' }));
    team.findTeamMember
      .withArgs('Hulk')
      .returns(Promise.resolve({ login: 'Hulk' }));

    review = { members, pullRequest };

    step = service(options, imports);
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

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
        addMembers: ['bar'],
        removeMembers: ['foo', 'baz'],
        addOnlySpecial: true
      };

      step.readConfig(pullRequest)
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
        .withArgs('bar')
        .returns(Promise.resolve(null));

      const expected = {
        addMembers: ['foo'],
        removeMembers: [],
        addOnlySpecial: false
      };

      step.readConfig(pullRequest)
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

      step.readConfig(pullRequest)
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

      step.readConfig(pullRequest)
        .then(patch => assert.deepEqual(patch, expected))
        .then(done, done);

    });

    it('should return rejected promise if team is not found', function (done) {

      teamManager.findTeamByPullRequest
        .returns(Promise.resolve(null));

      github.repos.getContent
        .callsArgWith(1, null, { content: encode({ specialReviewers: [] }) });

      step.readConfig(pullRequest)
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
            addMembers: ['foo', 'Hulk'],
            membersToAdd: 2
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      step.process(review, {})
        .then(actual => {
          const fooMember = find(actual.members, { login: 'foo' });
          const hulkMember = find(actual.members, { login: 'Hulk' });

          assert.isObject(fooMember);
          assert.isObject(hulkMember);
          assert.propertyVal(fooMember, 'rank', 1000);
          assert.propertyVal(fooMember, 'special', true);
          assert.propertyVal(hulkMember, 'rank', 1008);
          assert.propertyVal(hulkMember, 'special', true);
          assert.lengthOf(actual.members, 8);
        })
        .then(done, done);

    });

    it('should exclude reviewers listed in config', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            removeMembers: ['foo', 'bar', 'Hulk']
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      step.process(review, {})
        .then(actual => {
          const fooMember = find(actual.members, { login: 'foo' });
          const halkMember = find(actual.members, { login: 'Hulk' });

          assert.isUndefined(fooMember);
          assert.isUndefined(halkMember);
          assert.lengthOf(actual.members, 6);
        })
        .then(done, done);

    });

    it('should promote and exclude reviewers listed in config', function (done) {

      config = {
        specialReviewers: [
          {
            pattern: ['*.txt'],
            addMembers: ['foo'],
            membersToAdd: 1
          },
          {
            pattern: ['*.css'],
            removeMembers: ['Hulk']
          }
        ]
      };

      github.repos.getContent
        .callsArgWith(1, null, { content: encode(config) });

      step.process(review, {})
        .then(actual => {
          const fooMember = find(actual.members, { login: 'foo' });
          const halkMember = find(actual.members, { login: 'Hulk' });

          assert.isObject(fooMember);
          assert.isUndefined(halkMember);
          assert.lengthOf(actual.members, 7);
        })
        .then(done, done);

    });

  });

});

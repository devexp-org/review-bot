import Review from '../class';

import loggerMock from '../../logger/__mocks__/';
import { membersMock } from '../../command/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/class';
import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';
import { teamDriverMock } from '../../team-manager/__mocks__/';

describe('services/review/class', function () {

  let logger, teamDriver, teamManager, pullRequest;
  let imports, options;

  beforeEach(function () {

    logger = loggerMock();

    teamDriver = teamDriverMock();
    teamDriver.getCandidates.returns(Promise.resolve(membersMock()));

    teamManager = teamManagerMock();
    teamManager.findTeamByPullRequest.returns(Promise.resolve(teamDriver));

    pullRequest = pullRequestMock();

    options = {
      steps: ['step1', 'step2'],
      totalReviewers: 4
    };

    imports = { logger, 'team-manager': teamManager };

  });

  describe('#getSteps', function () {

    let review;

    beforeEach(function () {
      imports['review-step-step1'] = '1';
      imports['review-step-step2'] = '2';

      review = new Review(options, imports);
    });

    it('should return rejected promise if there are no steps for team', function (done) {
      delete options.steps;

      review.getSteps({ team: teamDriver, pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /steps/))
        .then(done, done);
    });

    it('should return rejected promise if there is no step with given name', function (done) {
      delete imports['review-step-step2'];

      review.getSteps({ team: teamDriver, pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /no step/))
        .then(done, done);
    });

    it('should return resolved promise with steps array', function (done) {
      review.getSteps({ team: teamDriver, pullRequest })
        .then(resolved => {
          assert.sameDeepMembers(resolved, [
            { name: 'step1', ranker: '1' },
            { name: 'step2', ranker: '2' }
          ]);
        })
        .then(done, done);
    });

  });

  describe('#stepsQueue', function () {

    let review;

    beforeEach(function () {
      review = new Review(options, imports);
    });

    it('should iterate through steps', function (done) {
      const order = [];

      const createStep = function (name) {
        return {
          name: name,
          ranker: function (review) {
            order.push(name);
            return Promise.resolve([]);
          }
        };
      };

      const _steps = [
        createStep('1'),
        createStep('2'),
        createStep('3'),
        createStep('4')
      ];

      review.stepsQueue({ team: teamDriver, steps: _steps, members: [] })
        .then(() => assert.deepEqual(order, ['1', '2', '3', '4']))
        .then(done, done);
    });

    describe('each step', function () {

      it('should receive a team and a pullRequest', function (done) {
        const stub = sinon.stub();

        const steps = [
          {
            name: 'step',
            ranker: function (review) {
              stub();

              assert.equal(review.pullRequest, pullRequest);

              assert.sameDeepMembers(review.members, membersMock());

              return Promise.resolve(review);
            }
          }
        ];

        review.stepsQueue({ team: teamDriver, steps, pullRequest, members: membersMock() })
          .then(() => assert.called(stub))
          .then(done, done);
      });

      it('should be able to change the team', function (done) {
        const stub1 = sinon.stub();
        const stub2 = sinon.stub();

        const steps = [
          {
            name: 'step1',
            ranker: function (review) {
              stub1();
              return Promise.resolve([]);
            }
          },
          {
            name: 'step2',
            ranker: function (review) {
              stub2();
              return Promise.resolve([{ login: 'foo', rank: 1 }]);
            }
          }
        ];

        review.stepsQueue({ team: teamDriver, steps, pullRequest, members: membersMock() })
          .then(() => {
            assert.called(stub1);
            assert.called(stub2);
          })
          .then(done, done);
      });

    });

  });

  describe('#choose', function () {

    let review;

    beforeEach(function () {

      imports['review-step-step1'] = function (review) {
        return Promise.resolve([{ rank: 1, login: 'Spider-Man' }]);
      };
      imports['review-step-step2'] = function (review) {
        return Promise.resolve([{ rank: 2, login: 'Black Widow' }]);
      };

      review = new Review(options, imports);

    });

    it('should return rejected promise if team is not found', function (done) {
      teamManager.findTeamByPullRequest.returns(Promise.resolve(null));

      review.choose(pullRequest)
        .then(() => { throw new Error('should reject promise'); })
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

    it('should return resolved promise with chosen reviewers', function (done) {
      review.choose(pullRequest)
        .then(review => {
          assert.isArray(review.members);
          assert.isAbove(review.members.length, 0);
          assert.isArray(review.reviewers);
          assert.isAbove(review.reviewers.length, 0);
        })
        .then(done, done);
    });

    it('should return resolved promise with chosen reviewers ordered by rank', function (done) {

      imports['review-step-step1'] = function (review) {
        return Promise.resolve([
          { rank: 1, login: 'Spider-Man' },
          { rank: Infinity, login: 'Thor' }
        ]);
      };

      imports['review-step-step2'] = function (review) {
        return Promise.resolve([
          { rank: -Infinity, login: 'Hulk' },
          { rank: 2, login: 'Black Widow' },
          { rank: 0, login: 'Thor' }
        ]);
      };

      review.choose(pullRequest)
        .then(review => {
          assert.lengthOf(review.reviewers, 3);
          assert.equal(review.reviewers[0].login, 'Thor');
          assert.equal(review.reviewers[1].login, 'Black Widow');
          assert.equal(review.reviewers[2].login, 'Spider-Man');
        })
        .then(done, done);
    });

    it('should return resolved promise even when reviewers are not selected', function (done) {
      imports['review-step-step1'] = function (review) {
        return Promise.resolve([]);
      };
      imports['review-step-step2'] = function (review) {
        return Promise.resolve([]);
      };

      review.choose(pullRequest)
        .then(review => {
          assert.lengthOf(review.reviewers, 0);
        })
        .then(done, done);
    });

  });

});

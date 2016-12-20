import Review from '../class';

import { memberMock } from '../__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import teamManagerMock from '../../team-manager/__mocks__/class';
import { teamDriverMock } from '../../team-manager/__mocks__/';
import { pullRequestMock } from '../../model/model-pull-request/__mocks__/';
import reviewStepMock from '../__mocks__/step';

describe('services/review/class', function () {

  let logger, teamDriver, teamManager, pullRequest, step1, step2;
  let imports, options;

  beforeEach(function () {

    logger = loggerMock();

    teamDriver = teamDriverMock();
    teamDriver.getCandidates.returns(Promise.resolve([]));

    teamManager = teamManagerMock();
    teamManager.findTeamByPullRequest.returns(Promise.resolve(teamDriver));

    pullRequest = pullRequestMock();

    step1 = reviewStepMock();
    step2 = reviewStepMock();

    teamDriver.getOption
      .withArgs('steps')
      .returns([]);

    options = {
      steps: ['step1', 'step2'],
      totalReviewers: 4
    };

    imports = { logger, teamManager, step1, step2 };

  });

  describe('#loadSteps', function () {

    let steps, review;

    beforeEach(function () {
      steps = { step1, step2 };

      review = new Review(steps, options, imports);
    });

    it('should return rejected if there is no step with given name', function (done) {
      delete steps.step2;

      review.loadSteps({ team: teamDriver, pullRequest })
        .then(() => new Error('should reject promise'))
        .catch(error => assert.match(error.message, /no step/))
        .then(done, done);
    });

    it('should return rejected if there are no steps for team', function (done) {
      delete options.steps;

      review.loadSteps({ team: teamDriver, pullRequest })
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /steps/))
        .then(done, done);
    });

    it('should get steps from team options if option `steps` exists', function (done) {
      teamDriver.getOption
        .withArgs('steps')
        .returns(['step1']);

      review.loadSteps({ team: teamDriver, pullRequest })
        .then(resolved => {
          assert.sameDeepMembers(resolved, [
            { name: 'step1', ranker: step1 }
          ]);
        })
        .then(done, done);
    });

    it('should return resolved promise with steps array', function (done) {
      review.loadSteps({ team: teamDriver, pullRequest })
        .then(resolved => {
          assert.sameDeepMembers(resolved, [
            { name: 'step1', ranker: step1 },
            { name: 'step2', ranker: step2 }
          ]);
        })
        .then(done, done);
    });

  });

  describe('#stepQueue', function () {

    let review;

    beforeEach(function () {
      review = new Review({}, options, imports);
    });

    it('should iterate through steps', function (done) {
      const order = [];

      const createStep = function (name) {
        return {
          name: name,
          ranker: {
            process: function (review) {
              order.push(name);
              return Promise.resolve(review);
            }
          }
        };
      };

      const steps = [
        createStep('1'),
        createStep('2'),
        createStep('3'),
        createStep('4')
      ];

      review.stepQueue({ team: teamDriver, steps, members: memberMock() })
        .then(() => assert.deepEqual(order, ['1', '2', '3', '4']))
        .then(done, done);
    });

    describe('each step', function () {

      it('should receive a team and a pullRequest', function (done) {
        const stub = sinon.stub();

        const steps = [
          {
            name: 'step',
            ranker: {
              process: function (review) {
                stub();
                assert.equal(review.team, teamDriver);
                assert.equal(review.pullRequest, pullRequest);
                return Promise.resolve(review);
              }
            }
          }
        ];

        review.stepQueue({ team: teamDriver, steps, pullRequest, members: [] })
          .then(() => assert.called(stub))
          .then(done, done);
      });

      it('should be able to change the team', function (done) {
        const stub1 = sinon.stub();
        const stub2 = sinon.stub();

        const steps = [
          {
            name: 'step1',
            ranker: {
              process: function (review) {
                stub1();
                review.members.splice(0, 5);
                return Promise.resolve(review);
              }
            }
          },
          {
            name: 'step2',
            ranker: {
              process: function (review) {
                stub2();
                assert.lengthOf(review.members, 12);
                return Promise.resolve(review);
              }
            }
          }
        ];

        review.stepQueue({ team: teamDriver, steps, pullRequest, members: memberMock() })
          .then(review => {
            assert.called(stub1);
            assert.called(stub2);
          })
          .then(done, done);
      });

    });

  });

  describe('#choose', function () {

    let steps, review;

    beforeEach(function () {
      const reviewData = { team: teamDriver, members: memberMock(), pullRequest };

      steps = { step1, step2 };

      step1.process.returns(Promise.resolve(reviewData));
      step2.process.returns(Promise.resolve(reviewData));

      teamDriver.getCandidates.returns(Promise.resolve(memberMock()));

      review = new Review(steps, options, imports);

    });

    it('should return rejected promise if team is not found', function (done) {
      teamManager.findTeamByPullRequest.returns(Promise.resolve(null));

      review.choose(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

    it('should return resolved promise with chosen reviewers', function (done) {
      review.choose(pullRequest)
        .then(review => {
          assert.isArray(review.members);
          assert.isAbove(review.members.length, 0);
        })
        .then(done, done);
    });

    it('should return resolved promise even when reviewers are not selected', function (done) {
      step2.process = function (review) {
        review.members = [];
        return Promise.resolve(review);
      };

      review.choose(pullRequest)
        .then(review => assert.lengthOf(review.members, 0))
        .then(done, done);
    });

  });

});

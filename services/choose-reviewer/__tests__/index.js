import service, { ChooseReviewer } from '../../choose-reviewer';
import teamMock, { membersMock } from '../../choose-team/__mocks__/index';
import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import pullRequestMock from '../../model/__mocks__/pull_request';

describe('services/choose-reviewer', function () {

  describe('ChooseReviewer', function () {
    let team, model, logger, pullRequest, PullRequestModel, steps, payload;

    beforeEach(function () {
      team = teamMock();
      team.findByPullRequest.returns(Promise.resolve(membersMock()));

      steps = sinon.stub();

      model = modelMock();
      logger = loggerMock();

      pullRequest = pullRequestMock();

      PullRequestModel = model.get('pull_request');
      PullRequestModel.findById.returns(Promise.resolve(pullRequest));

      payload = { team, steps, logger, PullRequestModel };
    });

    describe('#start', () => {

      it('should throws error if pull request is not found', done => {
        const review = new ChooseReviewer(payload);

        PullRequestModel.findById.returns(Promise.resolve(null));

        review.start(123456)
          .catch(error => {
            assert.instanceOf(error, Error);
            assert.match(error.toString(), /not found/);
            done();
          })
          .catch(done);
      });

    });

    describe('#findSteps', () => {

      it('should be rejected if there is no steps for team for pull request', done => {
        const review = new ChooseReviewer(payload);

        steps.returns(Promise.reject());

        review.findSteps({ pullRequest: {} }).catch(() => done());
      });

      it('should be resolved with review which includes steps for pull request', done => {
        const _steps = [];
        const review = new ChooseReviewer(payload);

        steps.returns(Promise.resolve(_steps));

        review.findSteps({ pullRequest: {} })
          .then(resolved => {
            assert.equal(resolved.steps, _steps);
            done();
          })
          .catch(done);
      });

    });

    describe('#stepsQueue', () => {

      it('should iterate through steps', done => {
        const order = [];

        const createStep = function (name) {
          return function (review) {
            order.push(name);
            return Promise.resolve(review);
          };
        };

        const _steps = [
          createStep('one'),
          createStep('two'),
          createStep('three'),
          createStep('four')
        ];

        const review = new ChooseReviewer(payload);

        review.stepsQueue({ steps: _steps })
          .then(() => {
            assert.deepEqual(order, ['one', 'two', 'three', 'four']);
          })
          .then(done, done);
      });

      describe('each step', () => {

        it('should receive team and pullRequest', done => {
          const steps = [
            function (review) {
              assert.equal(review.pullRequest, pullRequest);
              assert.deepEqual(review.team, membersMock());

              return Promise.resolve(review);
            }
          ];

          const review = new ChooseReviewer(payload);

          review.stepsQueue({ steps, pullRequest, team: membersMock() })
            .then(() => null)
            .then(done, done);
        });

        it('should be able to change the team', done => {
          const steps = [
            function (review) {
              review.team.splice(0, 5);
              return Promise.resolve(review);
            },
            function (review) {
              assert.lengthOf(review.team, 12);
              return Promise.resolve(review);
            }
          ];

          const review = new ChooseReviewer(payload);

          review.stepsQueue({ steps, pullRequest, team: membersMock() })
            .then(() => null)
            .then(done, done);
        });

      });

    });

    describe('#review', () => {

      it('should not throw error if reviewers will not selected', done => {
        const _steps = [
          function (review) {
            review.team = [];
            return Promise.resolve(review);
          }
        ];

        steps.returns(Promise.resolve(_steps));

        const review = new ChooseReviewer(payload);

        review.review(123456)
          .then(() => null)
          .then(done, done);
      });

    });

  });

  describe('service', () => {

    it('should be resolved to ChooseReviewer', function () {
      const model = { get: sinon.stub().returns({}) };
      const options = { steps: ['step1', 'step2'] };
      const requireDefault = sinon.stub();
      const imports = { model, requireDefault };

      requireDefault.returns(function step() {});

      service(options, imports);
    });

  });

});

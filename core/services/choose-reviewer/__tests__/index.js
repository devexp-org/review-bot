import service, { Review } from '../../choose-reviewer';

describe('services/choose-reviewer', function () {

  describe('Review', function () {
    let team, logger, members, pullRequest, pullRequestModel, payload, steps; // eslint-disable-line

    beforeEach(function () {
      members = [
        { login: 'Black Panther' },
        { login: 'Black Widow' },
        { login: 'Captain America' },
        { login: 'Captain Marvel' },
        { login: 'Falcon' },
        { login: 'Hank Pym' },
        { login: 'Hawkeye' },
        { login: 'Hulk' },
        { login: 'Iron Man' },
        { login: 'Luke Cage' },
        { login: 'Quicksilver' },
        { login: 'Scarlet Witch' },
        { login: 'Spider-Woman' },
        { login: 'Thor' },
        { login: 'Vision' },
        { login: 'Wasp' },
        { login: 'Wonder Man' }
      ];

      team = {
        findByPullRequest: sinon.stub().returns(Promise.resolve(members))
      };

      logger = { info: sinon.stub() };

      pullRequest = {
        id: 123987,
        title: 'Pull Request Title',
        html_url: 'https://github.com/github/pulls/12345/'
      };

      pullRequestModel = {
        findById: sinon.stub().returns(Promise.resolve(pullRequest))
      };

      steps = sinon.stub();

      payload = { team, logger, pullRequestModel, steps };
    });

    describe('#start', () => {

      it('should throws error if pull request is not found', done => {
        const review = new Review(payload);

        pullRequestModel.findById.returns(Promise.resolve(null));

        review.start(123456)
          .catch(error => {
            assert.instanceOf(error, Error);
            done();
          });
      });

    });

    describe('#findSteps', () => {

      it('should be rejected if there is no steps for team for pull request', done => {
        const review = new Review(payload);

        steps.returns(Promise.reject());

        review.findSteps({ pullRequest: {} }).catch(() => done());
      });

      it('should be resolved with review which includes steps for pull request', done => {
        const review = new Review(payload);
        const _steps = [];

        steps.returns(Promise.resolve(_steps));

        review.findSteps({ pullRequest: {} }).then(resolved => {
          assert.equal(resolved.steps, _steps);
          done();
        });
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

        const review = new Review(payload);

        review.stepsQueue({ steps: _steps })
          .then(() => {
            assert.deepEqual(order, ['one', 'two', 'three', 'four']);
          })
          .then(done)
          .catch(done);
      });

      describe('each step', () => {

        it('should receive team and pullRequest', done => {
          const steps = [
            function (review) {
              assert.equal(review.pullRequest, pullRequest);
              assert.deepEqual(review.team, members);

              return Promise.resolve(review);
            }
          ];

          const review = new Review(payload);

          review.stepsQueue({ steps, pullRequest, team: members })
            .then(() => null)
            .then(done)
            .catch(done);
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

          const review = new Review(payload);

          review.stepsQueue({ steps, pullRequest, team: members })
            .then(() => null)
            .then(done)
            .catch(done);
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

        const review = new Review(payload);

        review.review(123456)
          .then(() => done())
          .catch(done);
      });

    });

  });

  describe('service', () => {

    it('should return service', function () {
      const model = { get: sinon.stub().returns({}) };
      const options = { steps: ['step1', 'step2'] };
      const requireDefault = sinon.stub();
      const imports = { model, requireDefault };

      requireDefault.returns(function step() {});

      service(options, imports);
    });

  });

});

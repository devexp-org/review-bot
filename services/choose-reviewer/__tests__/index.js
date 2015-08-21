import service, { Review } from '../../choose-reviewer';

describe('services/choose-reviewer', function () {

  describe('Review', function () {
    let team, logger, members, pullRequest, pullRequestModel, payload;

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

      payload = { team, logger, pullRequestModel };
    });

    it('should throws error if steps is not passed', function () {
      const incompleteReview = function () {
        return new Review();
      };

      assert.throws(incompleteReview);
    });

    describe('#start', function () {

      it('should throws error if pull request is not found', function (done) {
        const steps = [
          function (review) { return Promise.resolve(review); }
        ];

        const review = new Review(steps, payload);

        pullRequestModel.findById.returns(Promise.resolve(null));

        review.review(123456)
          .catch(error => {
            assert.instanceOf(error, Error);
            done();
          });
      });

      it('should iterate through steps', function (done) {
        const order = [];

        const createStep = function (name) {
          return function (review) {
            order.push(name);
            return Promise.resolve(review);
          };
        };

        const steps = [
          createStep('one'),
          createStep('two'),
          createStep('three'),
          createStep('four')
        ];

        const review = new Review(steps, payload);

        review.review(123456)
          .then(() => {
            assert.deepEqual(order, ['one', 'two', 'three', 'four']);
          })
          .then(done)
          .catch(done);
      });

      it('should not throw error if reviewers will not selected', function (done) {
        const steps = [
          function (review) {
            review.team = [];
            return Promise.resolve(review);
          }
        ];

        const review = new Review(steps, payload);

        review.review(123456)
          .then(() => done())
          .catch(done);
      });

    });

    describe('each step', function () {

      it('should receive team and pullRequest', function (done) {
        const steps = [
          function (review) {
            assert.equal(review.pullRequest, pullRequest);
            assert.deepEqual(review.team, members);

            return Promise.resolve(review);
          }
        ];

        const review = new Review(steps, payload);

        review.review(123456)
          .then(() => null)
          .then(done)
          .catch(done);
      });

      it('should be able to change the team', function (done) {
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

        const review = new Review(steps, payload);

        review.review(123456)
          .then(() => null)
          .then(done)
          .catch(done);
      });

    });

  });

  describe('service', function (done) {

    it('should return resolved promise', function () {
      const model = { get: sinon.stub().returns({}) };
      const options = { steps: ['step1', 'step2'] };
      const requireDefault = sinon.stub();
      const imports = {
        model,
        requireDefault
      };

      requireDefault.returns(function step() {});

      service(options, imports)
        .then(() => null)
        .then(done)
        .catch(done);

    });

  });

});

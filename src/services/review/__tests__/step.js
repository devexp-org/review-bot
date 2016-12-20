import AbstractReviewStep from '../step';

describe('services/review/step', function () {

  let step;

  beforeEach(function () {
    step = new AbstractReviewStep();
  });

  describe('#name', function () {

    it('should return ``', function () {
      assert.equal(step.name(), '');
    });

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  describe('#process', function () {

    it('should return promise with review', function (done) {
      const review = {};
      step.process(review)
        .then(result => assert.equal(result, review))
        .then(done, done);
    });

  });

});

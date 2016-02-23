import _ from 'lodash';

import * as complexity from '../complexity';

describe('services/complexity', function () {

  describe('#additionsComplexity', function () {

    it('should return 0', function () {
      assert.equal(complexity.additionsComplexity(0), 0);
    });

    it('should calculate complexity', function () {
      _.range(0, 2000, 50).reduce((acc, v) => {
        assert.ok(complexity.additionsComplexity(v) >=
          complexity.additionsComplexity(acc));
        return v;
      }, 0);

      assert.isBelow(
        complexity.additionsComplexity(50),
        complexity.additionsComplexity(200)
      );
    });

  });

  describe('#deletionsComplexity', function () {

    it('should return 0', function () {
      assert.equal(complexity.deletionsComplexity(0), 0);
    });

    it('should calculate complexity', function () {
      _.range(0, 2000, 50).reduce((acc, v) => {
        assert.ok(complexity.deletionsComplexity(v) >=
          complexity.deletionsComplexity(acc));
        return v;
      }, 0);

      assert.isBelow(
        complexity.deletionsComplexity(50),
        complexity.deletionsComplexity(200)
      );
    });

  });

  describe('#commitsComplexity', function () {

    it('should return 0', function () {
      assert.equal(complexity.commitsComplexity(0), 0);
    });

    it('should calculate complexity', function () {
      _.range(0, 100, 3).reduce((acc, v) => {
        assert.ok(complexity.commitsComplexity(v) >=
          complexity.commitsComplexity(acc));
        return v;
      }, 0);

      assert.isBelow(
        complexity.commitsComplexity(1),
        complexity.commitsComplexity(5)
      );
    });

  });

});

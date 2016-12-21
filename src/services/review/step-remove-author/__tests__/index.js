import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/remove_author', function () {

  let step, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMock();

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  describe('#name', function () {

    it('should return `remove-author`', function () {
      assert.equal(step.name(), 'remove-author');
    });

  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should remove author from candidates', function (done) {
    const review = { members, pullRequest };

    const expected = [
      'Captain America',
      'Hawkeye',
      'Hulk',
      'Iron Man',
      'Spider-Man',
      'Thor'
    ];

    step.process(review)
      .then(actual => {
        assert.deepEqual(actual.members.map(x => x.login), expected);
      })
      .then(done, done);
  });

  it('should do nothing if there are no candidates', function (done) {
    const review = { members: [], pullRequest };

    step.process(review)
      .then(actual => assert.deepEqual(actual.members, []))
      .then(done, done);
  });

});

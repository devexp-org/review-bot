import service from '../';

import { reviewMock } from '../../__mocks__/';
import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';

describe('services/review/steps/ignore', function () {

  let step, members, pullRequest, options;

  beforeEach(function () {
    step = service();

    members = reviewMock();

    options = { list: ['Captain America', 'Hulk', 'Thor'] };

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  describe('#config', function () {

    it('should return step config', function () {
      assert.isObject(step.config());
    });

  });

  it('should remove candidates which logins are in ignore list', function (done) {
    const review = { members, pullRequest };

    const expected = [
      'Black Widow',
      'Hawkeye',
      'Iron Man',
      'Spider-Man'
    ];

    step.process(review, options)
      .then(actual => {
        assert.sameDeepMembers(actual.members.map(x => x.login), expected);
      })
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step.process(review, options)
      .then(actual => assert.deepEqual(actual.members, []))
      .then(done, done);
  });

  it('should do nothing if there are no ignore list', done => {
    const review = { members, pullRequest };

    step.process(review, {})
      .then(actual => assert.deepEqual(actual.members, members))
      .then(done, done);
  });

});

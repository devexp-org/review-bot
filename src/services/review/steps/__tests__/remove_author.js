import service from '../../steps/remove_author';

import { pullRequestMock } from '../../../model/pull-request/__mocks__/';
import { reviewMembersMock } from '../../__mocks__/';

describe('services/review/steps/remove_author', function () {

  let step, members, pullRequest;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  it('should remove author from team', function (done) {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Black Widow', rank: -Infinity }
    ];

    step(review)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { members: [], pullRequest };

    step(review)
      .then(actual => assert.deepEqual(actual, []))
      .then(done, done);
  });

});

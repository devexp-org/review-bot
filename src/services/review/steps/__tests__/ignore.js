import service from '../ignore';

import { pullRequestMock } from '../../../model/model-pull-request/__mocks__/';
import { reviewMembersMock } from '../../__mocks__/';

describe('services/review/steps/ignore', function () {

  let step, members, pullRequest, options;

  beforeEach(function () {
    step = service();

    members = reviewMembersMock();

    options = { list: ['Captain America', 'Hulk', 'Thor'] };

    pullRequest = pullRequestMock();

    pullRequest.user.login = 'Black Widow';
  });

  it('should remove members from team which logins are in ignore list', function (done) {
    const review = { members, pullRequest };

    const expected = [
      { login: 'Hulk', rank: -Infinity },
      { login: 'Thor', rank: -Infinity },
      { login: 'Captain America', rank: -Infinity }
    ];

    step(review, options)
      .then(actual => assert.sameDeepMembers(actual, expected))
      .then(done, done);
  });

  it('should do nothing if there are no team', done => {
    const review = { members: [], pullRequest };

    step(review, options)
      .then(actual => assert.sameDeepMembers(actual, []))
      .then(done, done);
  });

  it('should do nothing if there are no ignore list', done => {
    const review = { members, pullRequest };

    step(review, {})
      .then(actual => assert.sameDeepMembers(actual, []))
      .then(done, done);
  });

});

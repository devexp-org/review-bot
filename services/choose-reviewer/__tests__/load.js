import _ from 'lodash';

import { mockMembers } from './mocks/index';
import load from '../load';

describe('services/choose-reviewer/remove_already_reviewers', function () {

  let members, step, pullRequest;
  beforeEach(function () {
    step = load({ max: 1 });
    members = _.clone(mockMembers, true);
    pullRequest = {};
  });

  it('should decrease rank if member has active reviews', function (done) {
    const find = sinon.stub();

    const review = { team: members, pullRequest };
    const payload = {
      pullRequestModel: {
        findOpenReviewsByUser: find
      }
    };

    const activePull1 = {
      id: 1,
      review: {
        reviewers: [
          { login: 'Black Widow' },
          { login: 'Hulk' }
        ]
      }
    };

    const activePull2 = {
      id: 2,
      review: {
        reviewers: [
          { login: 'Hulk' },
          { login: 'Batman' }
        ]
      }
    };

    const membersAltered = [
      { login: 'Black Widow', rank: 9 },
      { login: 'Captain America', rank: 5 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Hulk', rank: 6 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Thor', rank: 3 }
    ];

    find.returns(Promise.resolve([]));

    find.withArgs('Black Widow')
      .returns(Promise.resolve([activePull1]));
    find.withArgs('Hulk')
      .returns(Promise.resolve([activePull1, activePull2]));

    step(review, payload)
      .then(review => {
        assert.deepEqual(review.team, membersAltered);
        done();
      })
      .catch(done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    const review = { team: [], pullRequest };

    step(review, {})
      .then(review => {
        assert.deepEqual(review.team, []);
        done();
      })
      .catch(done);
  });

});

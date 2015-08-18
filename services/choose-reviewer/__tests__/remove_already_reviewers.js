import _ from 'lodash';

import { mockMembers } from './mocks/index';
import removeAlreadyReviewers from '../remove_already_reviewers';

describe('services/choose-reviewer/remove_already_reviewers', function () {

  let members, step, pullRequest;
  beforeEach(function () {
    step = removeAlreadyReviewers();
    members = _.clone(mockMembers, true);
    pullRequest = {
      get(path) {
        assert.equal(path, 'review.reviewers');
        return this.review.reviewers;
      },
      review: {
        reviewers: [
          { login: 'Hulk' },
          { login: 'Spider-Man' }
        ]
      }
    };
  });

  it('should remove reviewers from team', function (done) {
    const review = { team: members, pullRequest };

    const membersAltered = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Thor', rank: 3 }
    ];

    step(review)
      .then(review => {
        assert.deepEqual(review.team, membersAltered);
        done();
      })
      .catch(done);
  });

  it('should do nothing if there are no reviewers', function (done) {
    pullRequest.review.reviewers = [];
    const review = { team: members, pullRequest };
    const membersClone = _.clone(members, true);

    step(review)
    .then(review => {
      assert.deepEqual(review.team, membersClone);
      done();
    })
    .catch(done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = { team: [], pullRequest };

    step(review)
      .then(review => {
        assert.deepEqual(review.team, []);
        done();
      })
      .catch(done);
  });

});

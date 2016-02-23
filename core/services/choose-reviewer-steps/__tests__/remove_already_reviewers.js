import _ from 'lodash';

import { mockMembers } from './mocks/index';
import service from '../steps/remove_already_reviewers';

describe('services/choose-reviewer-steps/remove_already_reviewers', () => {

  let members, step, pullRequest;

  beforeEach(() => {
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

    step = service();
  });

  it('should remove reviewers from team', done => {
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

  it('should do nothing if there are no reviewers', done => {
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

  it('should do nothing if there are no team', done => {
    const review = { team: [], pullRequest };

    step(review)
      .then(review => {
        assert.deepEqual(review.team, []);
        done();
      })
      .catch(done);
  });

});

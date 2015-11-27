import _ from 'lodash';

import { mockMembers } from './mocks/index';
import service from '../sort';

describe('services/choose-reviewer-steps/sort', () => {

  let members, step, pullRequest;
  beforeEach(done => {
    members = _.clone(mockMembers, true);
    pullRequest = {};

    service().then(resolved => {
      step = resolved.service;

      done();
    });
  });

  it('should sort members by rank descending', done => {
    const review = { team: members, pullRequest };
    const membersSorted = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Hulk', rank: 8 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 },
      { login: 'Captain America', rank: 5 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Thor', rank: 3 }
    ];

    step(review)
      .then(review => {
        assert.deepEqual(review.team, membersSorted);
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

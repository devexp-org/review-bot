import _ from 'lodash';

import { mockMembers } from './mocks/index';
import sort from '../sort';

describe('services/choose-reviewer/sort', function () {

  let members, step, pullRequest;
  beforeEach(function () {
    step = sort();
    members = _.clone(mockMembers, true);
    pullRequest = {};
  });

  it('should sort members by rank descending', function (done) {
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

import _ from 'lodash';

import { mockMembers } from './mocks/index';
import ignore from '../ignore';

describe('services/choose-reviewer/ignore', function () {

  let members, step;
  beforeEach(function () {
    step = ignore({ list: ['Captain America', 'Hulk', 'Thor'] });
    members = _.clone(mockMembers, true);
  });

  it('should remove members from team which is in ignore list', function (done) {
    const review = {
      team: members,
      pullRequest: { user: { login: 'Black Widow' } }
    };

    const membersAltered = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Hawkeye', rank: 3 },
      { login: 'Iron Man', rank: 7 },
      { login: 'Spider-Man', rank: 6 }
    ];

    step(review)
      .then(review => {
        assert.deepEqual(review.team, membersAltered);
        done();
      })
      .catch(done);
  });

  it('should do nothing if there are no team', function (done) {
    const review = {
      team: [],
      pullRequest: { user: { login: 'Black Widow' } }
    };

    step(review)
      .then(review => {
        assert.deepEqual(review.team, []);
        done();
      })
      .catch(done);
  });

});

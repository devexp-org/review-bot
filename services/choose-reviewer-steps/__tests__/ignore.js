import _ from 'lodash';

import { mockMembers } from '../__mocks__/index';
import service from '../ignore';

describe('services/choose-reviewer-steps/ignore', function () {

  let members, step;
  beforeEach(() => {
    members = _.clone(mockMembers, true);

    step = service({ list: ['Captain America', 'Hulk', 'Thor'] });
  });

  it('should remove members from team which is in ignore list', done => {
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

  it('should do nothing if there are no team', done => {
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

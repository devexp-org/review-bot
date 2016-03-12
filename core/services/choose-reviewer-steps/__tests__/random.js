import _ from 'lodash';

import { mockMembers } from './mocks/index';
import service from '../steps/random';

describe('services/choose-reviewer-steps/random', () => {

  let members, step, pullRequest;

  beforeEach(() => {
    members = _.cloneDeep(mockMembers);
    pullRequest = {};

    step = service({ max: 2 });
  });

  it('should add random value to rank to each member', done => {
    const review = { team: members, pullRequest };
    const membersClone = _.cloneDeep(members);

    step(review)
      .then(review => {
        assert.notDeepEqual(review.team, membersClone);

        assert.isAbove(review.team[0].rank, 9);
        assert.isBelow(review.team[0].rank, 13);

        assert.isAbove(review.team[1].rank, 4);
        assert.isBelow(review.team[1].rank, 8);

        assert.isAbove(review.team[2].rank, 2);
        assert.isBelow(review.team[2].rank, 6);
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

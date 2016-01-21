import _ from 'lodash';

import { mockMembers } from '../__mocks__/index';
import service from '../total_number';

describe('services/choose-reviewer-steps/total_number', () => {

  let members, step, pullRequest;

  beforeEach(() => {
    members = _.clone(mockMembers, true);
    pullRequest = {};

    step = service({ max: 2 });
  });

  it('should keep only `option.max` members', done => {
    const review = { team: members, pullRequest };
    const reviewers = [
      { login: 'Black Widow', rank: 10 },
      { login: 'Captain America', rank: 5 }
    ];

    step(review)
      .then(review => {
        assert.deepEqual(review.team, reviewers);
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

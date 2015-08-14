import _ from 'lodash';

import { mockMembers } from './mocks/index';
import totalNumber from '../total_number';

describe('services/choose-reviewer/total_number', function () {

  let members, step, pullRequest;
  beforeEach(function () {
    step = totalNumber({ max: 2 });
    members = _.clone(mockMembers, true);
    pullRequest = {};
  });

  it('should keep only `option.max` members', function (done) {
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

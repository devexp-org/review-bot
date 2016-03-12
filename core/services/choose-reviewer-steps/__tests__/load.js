import _ from 'lodash';

import { mockMembers } from './mocks/index';
import service from '../steps/load';

describe('services/choose-reviewer-steps/load', () => {

  let members, pullRequest, pullRequestModel, model, find; // eslint-disable-line

  beforeEach(() => {
    members = _.cloneDeep(mockMembers);
    pullRequest = {};

    find = sinon.stub();
    pullRequestModel = { findOpenReviewsByUser: find };
    model = { get: sinon.stub().returns(pullRequestModel) };
  });

  it('should decrease rank if member has active reviews', done => {
    const review = { team: members, pullRequest };

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

    find.withArgs('Black Widow').returns(Promise.resolve([activePull1]));
    find.withArgs('Hulk').returns(Promise.resolve([activePull1, activePull2]));

    const step = service({ max: 1 }, { model });

    step(review)
      .then(review => {
        assert.deepEqual(review.team, membersAltered);
        done();
      })
      .catch(done);
  });

  it('should do nothing if there are no reviewers', done => {
    const review = { team: [], pullRequest };

    const step = service({ max: 1 }, { model });
    step(review, {})
      .then(review => {
        assert.deepEqual(review.team, []);
        done();
      })
      .catch(done);
  });

});

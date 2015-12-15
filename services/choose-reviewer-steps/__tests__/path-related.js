import { clone, filter, forEach } from 'lodash';
import { mockMembers } from './mocks/index';
import { isMatch, getFiles, incRank, decRank, pathRelatedCreator } from '../path-related';

describe('services/choose-reviewer-steps/path-related', () => {
  it('should always be resolved', done => {
    const pathRelated = pathRelatedCreator({});
    const pullRequest = {
      get: sinon.stub().returns([])
    };

    pathRelated({ pullRequest })
      .then(() => done())
      .catch(done);
  });

  describe('#isMatch', () => {
    it('should return true if pattern match files pathes', () => {
      assert.isTrue(isMatch(['test.js', 'test.priv.js'], '*.js'));
    });

    it('should return false if pattern doesn`t match files pathes', () => {
      assert.isFalse(isMatch(['test.js', 'test.priv.js'], '*.css'));
    });
  });

  describe('#getFiles', () => {
    it('should be resolved with files', done => {
      const files = ['', '', ''];
      const pullRequest = {
        get: sinon.stub().returns(files)
      };

      getFiles(pullRequest)
        .then(result => {
          assert.equal(files, result);
          done();
        })
        .catch(done);
    });

    it('should be rejected if there is not any files', done => {
      const pullRequest = {
        get: sinon.stub().returns([])
      };

      getFiles(pullRequest)
        .catch(() => done());
    });
  });

  describe('incRank', () => {
    const members = ['Hulk', 'Hawkeye'];
    const origMembers = filter(mockMembers, m => members.indexOf(m.login) !== -1);
    const opts = { pattern: '*.js', max: 5, members };

    it('should increment rank for one random member of team', done => {
      const reviewers = clone(mockMembers, true);
      const step = incRank(opts, { reviewers });

      step(['test.js'])
        .then(() => {
          const changedMembers = filter(reviewers, m => members.indexOf(m.login) !== -1);

          forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank >= origMembers[index].rank);
          });

          done();
        })
        .catch(done);
    });

    it('should not change rank if there is no matched pathes', done => {
      const reviewers = clone(mockMembers, true);
      const step = incRank(opts, { reviewers });

      step(['test.css'])
        .then(() => {
          const changedMembers = filter(reviewers, m => members.indexOf(m.login) !== -1);

          forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank === origMembers[index].rank);
          });

          done();
        })
        .catch(done);
    });
  });

  describe('decRank', () => {
    const members = ['Hulk', 'Hawkeye'];
    const origMembers = filter(mockMembers, m => members.indexOf(m.login) !== -1);
    const opts = { pattern: '*.js', max: 5, members };

    it('should decrement rank for all members specified in options', done => {
      const reviewers = clone(mockMembers, true);
      const step = decRank(opts, { reviewers });

      step(['test.js'])
        .then(() => {
          const changedMembers = filter(reviewers, m => members.indexOf(m.login) !== -1);

          forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank < origMembers[index].rank);
          });

          done();
        })
        .catch(done);
    });

    it('should not change rank if there is no matched pathes', done => {
      const reviewers = clone(mockMembers, true);
      const step = decRank(opts, { reviewers });

      step(['test.css'])
        .then(() => {
          const changedMembers = filter(reviewers, m => members.indexOf(m.login) !== -1);

          forEach(changedMembers, (changed, index) => {
            assert.isTrue(changed.rank === origMembers[index].rank);
          });

          done();
        })
        .catch(done);
    });
  });
});

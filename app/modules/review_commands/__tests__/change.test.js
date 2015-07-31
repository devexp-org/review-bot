describe('app/modules/review_commands/change', function () {
    const _ = require('lodash');
    const proxyquire = require('proxyquire');

    let change, pullRequest, cmd, comment;

    beforeEach(function () {
        change = proxyquire('../change', {
            'app/modules/review/actions/save': _.identity,
            'app/modules/team': {
                get: function () {
                    return Promise.resolve([
                        { login: 'new_reviewer' },
                        { login: 'other_reviewer' },
                        { login: 'old_reviewer' }
                    ]);
                }
            }
        })();

        pullRequest = {
            id: 1234,
            title: 'pull request title',
            html_url: 'http://github.com',
            state: 'open',
            user: { login: 'user1' },
            get: _.constant([{ login: 'old_reviewer' }])
        };

        comment = {
            user: { login: 'user1' }
        };

        cmd = ['old_reviewer', 'to', 'new_reviewer'];
    });

    it('should throw an error if pull request isn`t open', function () {
        pullRequest.state = 'closed';

        return assert.isRejected(change(cmd, { pullRequest }));
    });

    it('should throw an error if pull request author isn`t equal to comment author', function () {
        comment.user.login = 'user2';

        return assert.isRejected(change(cmd, { pullRequest, comment }));
    });

    it('should throw an error if new reviewer is equals to pull request author', function () {
        return assert.isRejected(change(['old_reviewer', 'to', 'user1'], { pullRequest, comment }));
    });

    it('should throw an error if new reviewer isn`t found in team for this pull request', function () {
        return assert.isRejected(change(
            ['old_reviewer', 'to', 'old_reviewer2'],
            { pullRequest, comment }
        ));
    });

    it('should change reviewer', function (done) {
        change(cmd, { pullRequest, comment })
            .then(function ({ reviewers }) {
                assert.deepEqual(reviewers, [{ login: 'new_reviewer' }]);
                done();
            });
    });

    it('should change reviewer even without to', function (done) {
        change(['old_reviewer', 'new_reviewer'], { pullRequest, comment })
            .then(function ({ reviewers }) {
                assert.deepEqual(reviewers, [{ login: 'new_reviewer' }]);
                done();
            });
    });

    it('should throw an error if there is no old reviewer in reviewers list', function () {
        return assert.isRejected(change(['old_reviewer3', 'to', 'old_reviewer'], { pullRequest, comment }));
    });
});

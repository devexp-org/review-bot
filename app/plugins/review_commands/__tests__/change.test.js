describe('app/plugins/review_commands/change', function () {
    var _ = require('lodash');
    var proxyquire = require('proxyquire');
    var change;
    var pullRequest;
    var cmd;
    var comment;

    beforeEach(function () {
        change = proxyquire('../change', {
            'app/core/review/actions/save': _.identity,
            'app/core/team': {
                get: function () {
                    return Promise.resolve([
                        { login: 'new_reviewer' },
                        { login: 'other_reviewr' }
                    ]);
                }
            }
        })();

        pullRequest = {
            id: 1234,
            title: 'pull request title',
            html_url: 'http://github.com',
            state: 'open',
            user: {
                login: 'user1'
            },
            get: _.constant([{ login: 'old_reviewer' }])
        };

        comment = {
            user: {
                login: 'user1'
            }
        };

        cmd = ['old_reviewer', 'to', 'new_reviewer'];
    });

    it('should throw an error if pull request isn`t open', function () {
        pullRequest.state = 'closed';

        assert.throw(function () {
            change(cmd, { pullRequest: pullRequest });
        });
    });

    it('should throw an error if pull request author isn`t equal to comment author', function () {
        comment.user.login = 'user2';

        assert.throw(function () {
            change(cmd, { pullRequest: pullRequest, comment: comment });
        });
    });

    it('should throw an error if new reviewer is equals to pull request author', function () {
        assert.throw(function () {
            change(['old_reviewer', 'to', 'user1'], { pullRequest: pullRequest, comment: comment });
        });
    });

    it('should throw an error if new reviewer is already in reviewers list', function () {
        assert.throw(function () {
            change(['other_reviewer', 'to', 'old_reviewer'], { pullRequest: pullRequest, comment: comment });
        });
    });

    it('should throw an error if new reviewer isn`t found in team for this pull request', function () {
        return assert.isRejected(change(
            ['other_reviewer', 'to', 'old_reviewer2'],
            { pullRequest: pullRequest, comment: comment }
        ));
    });

    it('should change reviewer', function (done) {
        change(cmd, { pullRequest: pullRequest, comment: comment })
            .then(function (reviewers) {
                assert.deepEqual(reviewers, { reviewers: [{ login: 'new_reviewer' }] });
                done();
            });
    });

    it('should change reviewer even without to', function (done) {
        change(['old_reviewer', 'new_reviewer'], { pullRequest: pullRequest, comment: comment })
            .then(function (reviewers) {
                assert.deepEqual(reviewers, { reviewers: [{ login: 'new_reviewer' }] });
                done();
            });
    });
});

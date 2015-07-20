describe('app/modules/review/review', function () {
    var _ = require('lodash');
    var proxyquire = require('proxyquire');
    var review, PullRequest, pullRequest, processors, team;

    beforeEach(function () {
        pullRequest = {};
        team = [{ login: 'user', rank: 0 }];
        PullRequest = { findById: _.constant(Promise.resolve(pullRequest)) };
        processors = [
            sinon.stub().returns(Promise.resolve({ pull: pullRequest, team: team })),
            sinon.stub().returns(Promise.resolve({ pull: pullRequest, team: team })),
            sinon.stub().returns(Promise.resolve({ pull: pullRequest, team: team })),
            sinon.stub().returns(Promise.resolve({ pull: pullRequest, team: team }))
        ];

        review = proxyquire('../review', {
            'app/modules/models': {
                get: _.constant(PullRequest)
            },
            './ranking': {
                get: function () {
                    return processors;
                }
            },
            'app/modules/team': {
                get: function () {
                    return Promise.resolve(team);
                }
            }
        });
    });

    it('should be rejected if pull request not found', function () {
        PullRequest.findById = _.constant(Promise.resolve());

        return assert.isRejected(review());
    });

    it('should call all ranking processors', function (done) {
        review().then(function () {
            processors.forEach(function (p) {
                assert.calledOnce(p);
            });

            done();
        }, function (err) {
            done(err);
        });
    });
});

describe('GitHub PullRequest Model', function () {
    var pullRequestMock = require('../mocks/pull_request.json'),
        PullRequest = require('../../models').PullRequest;

    beforeEach(function (done) {
        var pullRequest = new PullRequest(pullRequestMock);
        pullRequest.save().then(done);
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    it('should find pull request by it`s id', function (done) {
        PullRequest.findById(37112129).then(function (pr) {
            assert.isObject(pr);

            done();
        });
    });

    it('should find pull request by it`s number and repo', function (done) {
        PullRequest.findByNumberAndRepo(5, 'devexp-org/devexp').then(function (pr) {
            assert.isObject(pr);

            done();
        });
    });
});

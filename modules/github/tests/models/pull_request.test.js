describe('GitHub PullRequest Model', function () {
    var pullRequestMock = require('../mocks/pull_request.json'),
        PullRequest = require('../../models').PullRequest;

    before(function (done) {
        require('mongoose').connection.on('connected', function () {
            done();
        });
    });

    beforeEach(function (done) {
        var pullRequest = new PullRequest(pullRequestMock);
        pullRequest.save().then(function (pr) {
            done();
        }, console.error.bind(console));
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    it('should find pull request by it`s number', function (done) {

    });
});

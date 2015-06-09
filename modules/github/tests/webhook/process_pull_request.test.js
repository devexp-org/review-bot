describe('GitHub Webhook process pull request', function () {
    var PullRequest = require('../../models').PullRequest,
        github, processPullRequest, pullRequestOpenedPayload;

    beforeEach(function () {
        github = {
            models: {
                PullRequest: PullRequest
            },
            emit: sinon.stub()
        };

        pullRequestOpenedPayload = require('../mocks/payloads/pull_request.opened.json');
        processPullRequest = require('../../webhook/process_pull_request')(github);
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    describe('Action: opened', function () {
        describe('Add pull request', function () {
            beforeEach(function (done) {
                processPullRequest(pullRequestOpenedPayload).then(function () {
                    done();
                });
            });

            it('should add entry to db', function (done) {
                PullRequest.findByPrId(36578482).then(function (pullRequest) {
                    assert.isObject(pullRequest);

                    done();
                });
            });

            it('should emit pull_request event', function () {
                assert.calledWith(github.emit, 'pull_request');
            });
        });

        describe('Update pull request if exists', function () {
            beforeEach(function (done) {
                processPullRequest(pullRequestOpenedPayload).then(function () {
                    done();
                });
            });

            it('should update pull request', function (done) {
                pullRequestOpenedPayload.pull_request.title = 'new title';

                processPullRequest(pullRequestOpenedPayload).then(function (pullRequest) {
                    assert.propertyVal(pullRequest, 'title', 'new title');

                    done();
                });
            });
        });
    });
});

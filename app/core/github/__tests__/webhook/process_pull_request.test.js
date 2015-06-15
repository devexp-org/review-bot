describe('core/github/webhook/process_pull_request', function () {
    var proxyquire = require('proxyquire'),
        PullRequest = require('../../models').PullRequest,
        ee,
        payload,
        processPullRequest;

    beforeEach(function () {
        ee = { emit: sinon.stub() };

        payload = require('../mocks/payloads/pull_request.opened.json');

        processPullRequest = proxyquire('../../webhook/process_pull_request', { 'app/core/github/events': ee });
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    describe('Action: opened', function () {
        describe('Add pull request', function () {
            beforeEach(function (done) {
                processPullRequest(payload).then(() => done());
            });

            it('should add entry to db', function (done) {
                PullRequest.findById(36578482).then(function (pullRequest) {
                    assert.isObject(pullRequest);

                    done();
                });
            });

            it('should emit pull_request event', function () {
                assert.calledWith(ee.emit, 'github:pull_request');
            });
        });

        describe('Update pull request if exists', function () {
            beforeEach(function (done) {
                processPullRequest(payload).then(() => done());
            });

            it('should update pull request', function (done) {
                payload.pull_request.title = 'new title';

                processPullRequest(payload).then(function (pullRequest) {
                    assert.propertyVal(pullRequest, 'title', 'new title');

                    done();
                });
            });
        });
    });
});

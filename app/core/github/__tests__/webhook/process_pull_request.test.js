describe('core/github/webhook/process_pull_request', function () {
    var proxyquire = require('proxyquire');
    var PullRequest = require('app/core/models').get('PullRequest');
    var events, payload, processPullRequest;

    beforeEach(function () {
        events = { emit: sinon.stub() };

        payload = require('../mocks/payloads/pull_request.opened.json');

        processPullRequest = proxyquire('../../webhook/process_pull_request', {
            'app/core/events': events,
            '../api': {
                _updatePullRequestBody: sinon.stub(),
                getPullRequestFiles: function () {
                    return Promise.resolve([]);
                }
            }
        });
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    describe('Action: opened', function () {
        describe('Add pull request', function () {
            beforeEach(function (done) {
                processPullRequest(payload).then(function () { done(); });
            });

            it('should add entry to db', function (done) {
                PullRequest.findById(36578482).then(function (pullRequest) {
                    assert.isObject(pullRequest);

                    done();
                });
            });

            it('should emit pull_request event', function () {
                assert.calledWith(events.emit, 'github:pull_request:opened');
            });
        });

        describe('Update pull request if exists', function () {
            beforeEach(function (done) {
                processPullRequest(payload).then(function () { done(); });
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

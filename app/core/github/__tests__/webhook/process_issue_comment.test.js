describe('core/github/webhook/process_issue_comment', function () {
    var proxyquire = require('proxyquire');
    var PullRequest = require('app/core/models').get('PullRequest');
    var events, payload, proccessIssueComment, pullRequest;

    beforeEach(function (done) {
        events = { emit: sinon.stub() };

        payload = require('../mocks/payloads/issue_comment.json');
        proccessIssueComment = proxyquire('../../webhook/process_issue_comment', {
            'app/core/events': events,
            '../api': {
                _updatePullRequestBody: sinon.stub()
            }
        });

        new PullRequest(require('app/core/models/__tests__/mocks/pull_request.json'))
            .save()
            .then(function () {
                return proccessIssueComment(payload);
            })
            .then(function (pr) {
                pullRequest = pr;
                done();
            });
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    it('should update pull request title', function () {
        assert.propertyNotVal(pullRequest, 'title', 'Типа DI');
    });

    it('should emit github:issue_comment event', function () {
        assert.calledWith(events.emit, 'github:issue_comment');
    });
});

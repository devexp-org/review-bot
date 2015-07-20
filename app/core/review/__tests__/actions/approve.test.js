describe('app/core/review/actions/save', function () {
    var _ = require('lodash');
    var proxyquire = require('proxyquire');
    var PullRequest = require('app/core/models').get('PullRequest');
    var saveReview = require('../../actions/save');
    var pullId = 37112129;
    var events, reviewConfig, approveReview, review;

    beforeEach(function (done) {
        reviewConfig = {
            approveCount: 2
        };

        events = { emit: sinon.stub() };

        approveReview = proxyquire('../../actions/approve', {
            'app/core/events': events,
            'app/core/config': {
                load: _.constant(reviewConfig)
            }
        });

        review = {
            status: 'inprogress',
            reviewers: [{ login: 'user' }, { login: 'user2' }, { login: 'user3' }]
        };

        new PullRequest(require('app/core/models/__tests__/mocks/pull_request.json'))
            .save()
            .then(function (pr) {
                return saveReview(review, pr._id);
            }).then(function (pr) {
                pullId = pr._id;
                done();
            });
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    it('should be rejected if pull request not found', function () {
        return assert.isRejected(approveReview('user', 0));
    });

    it('should approve review for passed user name', function (done) {
        approveReview('user', pullId)
            .then(function (pr) {
                assert.deepPropertyVal(pr, 'review.reviewers.0.approved', true);
                done();
            }, done);
    });

    it('should emit review:approved if review approved by user', function (done) {
        approveReview('user', pullId)
            .then(function () {
                assert.calledWith(events.emit, 'review:approved');
                done();
            }, done);
    });

    it('should complete review if reached approve count', function (done) {
        approveReview('user', pullId)
            .then(function () {
                return approveReview('user2', pullId);
            })
            .then(function (pr) {
                assert.deepPropertyVal(pr, 'review.reviewers.0.approved', true);
                assert.deepPropertyVal(pr, 'review.reviewers.1.approved', true);
                assert.deepPropertyVal(pr, 'review.status', 'complete');
                assert.ok(pr.review.completed_at);
                done();
            }, done);
    });

    it('should emit review:complete event if reached approve count', function (done) {
        approveReview('user', pullId)
            .then(function () {
                return approveReview('user2', pullId);
            })
            .then(function () {
                assert.calledWith(events.emit, 'review:complete');
                done();
            }, done);
    });
});

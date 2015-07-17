describe('app/core/review/actions/save', function () {
    var _ = require('lodash');
    var proxyquire = require('proxyquire');
    var PullRequest = require('app/core/models').get('PullRequest');
    var events;
    var saveReview;
    var pullRequest;
    var review;

    beforeEach(function (done) {
        events = { emit: sinon.stub() };

        saveReview = proxyquire('../../actions/save', {
            'app/core/events': events
        });

        review = {
            status: 'inprogress',
            reviewers: [{ login: 'user' }, { login: 'user2' }]
        };

        new PullRequest(require('app/core/models/__tests__/mocks/pull_request.json'))
            .save()
            .then(function (pr) {
                pullRequest = pr;
                done();
            });
    });

    afterEach(function (done) {
        PullRequest.remove({}, done);
    });

    it('should be rejected if pull request not found', function () {
        assert.isRejected(saveReview({}, 0));
    });

    it('should set status to notstarted if empty status passed to review', function (done) {
        saveReview({ status: '' }, pullRequest._id)
            .then(function (pr) {
                assert.equal(pr.review.status, 'notstarted');
                done();
            }, done);
    });

    it('should save assigned reviewers', function (done) {
        saveReview(review, pullRequest._id)
            .then(function (pr) {
                assert.isTrue(_.isEqual(pr.review.reviewers, review.reviewers));
                done();
            }, done);
    });

    it('should keep already assigned reviewers if passed only review status', function (done) {
        saveReview({ status: '', reviewers: review.reviewers }, pullRequest._id)
            .then(function (pr) {
                return saveReview({ status: 'inprogress' }, pr._id);
            }).then(function (pr) {
                assert.isTrue(_.isEqual(pr.review.reviewers, review.reviewers));
                assert.equal(pr.review.status, 'inprogress');
                done();
            }, done);
    });

    it('should be rejected if unknown status', function () {
        assert.isRejected(
            saveReview({ status: 'my custom status', reviewers: review.reviewers }, pullRequest._id)
        );
    });

    describe('status === inprogress', function () {
        it('should be rejected when trying to start review without reviewers', function () {
            assert.isRejected(saveReview({ status: 'inprogress' }, pullRequest._id));
        });

        it('should set start date if there is no reviewers', function (done) {
            saveReview(review, pullRequest._id)
                .then(function (pr) {
                    assert.equal(pr.review.started_at.getDate(), (new Date()).getDate());
                    done();
                }, done);
        });

        it('should emit review:started event if wasn`t started yet', function (done) {
            saveReview(review, pullRequest._id)
                .then(function () {
                    assert.calledWith(events.emit, 'review:started');
                    done();
                }, done);
        });

        it('should emit review:updated event otherwise', function (done) {
            saveReview(review, pullRequest._id)
                .then(function () {
                    return saveReview(review, pullRequest._id);
                })
                .then(function () {
                    assert.calledWith(events.emit, 'review:updated');
                    done();
                }, done);
        });
    });
});

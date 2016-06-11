import PullRequestReview from '../class';

import loggerMock from '../../logger/__mocks__/';
import eventsMock from '../../events/__mocks__/';
import { pullRequestMock } from '../../model/pull-request/__mocks__/';

describe('services/pull-request-review/class', function () {

  let pullRequest, pullRequestReview, review;
  let logger, events, options, imports;

  beforeEach(function () {
    logger = loggerMock();
    events = eventsMock();

    pullRequest = pullRequestMock();

    options = {};
    imports = { events, logger };

    pullRequestReview = new PullRequestReview(options, imports);

    review = {
      status: 'notstarted',
      reviewers: [{ login: 'foo' }, { login: 'bar' }]
    };

    pullRequest.review = review;

  });

  describe('#startReview', function () {

    it('should emit event `review:started`', function (done) {
      review.status = 'notstarted';

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.calledWith(events.emit, 'review:started'))
        .then(done, done);
    });

    it('should set status to "inprogress"', function (done) {
      review.status = 'notstarted';

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match({ status: 'inprogress' })
        ))
        .then(done, done);
    });

    it('should update property "updated_at"', function (done) {
      review.status = 'notstarted';

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match.has('updated_at')
        ))
        .then(done, done);
    });

    it('should set property "started_at" if the review is starting the first time', function (done) {
      review.status = 'notstarted';

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match.has('started_at')
        ))
        .then(done, done);
    });

    it('should not update the property "started_at" if that property already exists', function (done) {
      const sometime = new Date();

      review.status = 'notstarted';
      review.started_at = sometime;

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match.has('started_at', sometime)
        ))
        .then(done, done);
    });

    it('should not reject a promise if pull request status is "changesneeded"', function (done) {
      review.status = 'changesneeded';

      pullRequestReview.startReview(pullRequest)
        .then(() => {})
        .then(done, done);
    });

    it('should reject a promise if pull request status is "notstarted"', function (done) {
      review.status = 'inprogress';

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /is not opened/))
        .then(done, done);
    });

    it('should reject promise if reviewers were not selected', function (done) {
      review.reviewers = [];

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not selected/))
        .then(done, done);
    });

  });

  describe('#stopReview', function () {

    it('should emit event `review:updated`', function (done) {
      review.status = 'inprogress';

      pullRequestReview.stopReview(pullRequest)
        .then(() => assert.calledWith(events.emit, 'review:updated'))
        .then(done, done);
    });

    it('should set status to "notstarted"', function (done) {
      review.status = 'inprogress';

      pullRequestReview.stopReview(pullRequest)
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match({ status: 'notstarted' })
        ))
        .then(done, done);
    });

    it('should update property "updated_at"', function (done) {
      review.status = 'inprogress';

      pullRequestReview.stopReview(pullRequest)
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match.has('updated_at')
        ))
        .then(done, done);
    });

    it('should not reject promise when pull request status is "notstarted"', function (done) {
      review.status = 'notstarted';

      pullRequestReview.stopReview(pullRequest)
        .then(() => {})
        .then(done, done);
    });

    it('should not reject promise when pull request status is "changesneeded"', function (done) {
      review.status = 'changesneeded';

      pullRequestReview.stopReview(pullRequest)
        .then(() => {})
        .then(done, done);
    });

    it('should reject promise if pull request status is not "notstarted"', function (done) {
      review.status = 'inprogress';

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /is not opened/))
        .then(done, done);
    });

    it('should reject promise if reviewers were not selected', function (done) {
      review.status = 'notstarted';
      review.reviewers = [];

      pullRequestReview.startReview(pullRequest)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not selected/))
        .then(done, done);
    });

  });

  describe('#approveReview', function () {

    it('should emit event `review:approved`', function (done) {
      pullRequestReview.approveReview(pullRequest, 'foo')
        .then(() => assert.calledWith(events.emit, 'review:approved'))
        .then(done, done);
    });

    it('should change reviewer status to "approved"', function (done) {
      pullRequestReview.approveReview(pullRequest, 'foo')
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match(
            { reviewers: [{ login: 'foo', approved: true }, { login: 'bar' }] }
          )
        ))
        .then(done, done);
    });

    it('should update property "updated_at"', function (done) {
      pullRequestReview.approveReview(pullRequest, 'foo')
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match.has('updated_at')
        ))
        .then(done, done);
    });

    it('should not reject promise if reviewer approve pull request twice', function (done) {
      review.reviewers = [{ login: 'foo', approved: true }, { login: 'bar' }];

      pullRequestReview.approveReview(pullRequest, 'foo')
        .then(() => {})
        .then(done, done);
    });

    describe('when review is complete', function () {

      beforeEach(function () {
        review.status = 'inprogress';
        review.reviewers = [{ login: 'foo' }, { login: 'bar', approved: true }];
        review.approveCount = 2;
      });

      it('should emit events `review:approve` and `review:complete`', function (done) {
        pullRequestReview.approveReview(pullRequest, 'foo')
          .then(() => {
            assert.calledWith(events.emit, 'review:approved');
            assert.calledWith(events.emit, 'review:complete');
          })
          .then(done, done);
      });

      it('should set status to "complete"', function (done) {
        pullRequestReview.approveReview(pullRequest, 'foo')
          .then(() => assert.calledWith(
            pullRequest.set, 'review', sinon.match.has('status', 'complete')
          ))
          .then(done, done);
      });

      it('should set property "complete_at"', function (done) {
        pullRequestReview.approveReview(pullRequest, 'foo')
          .then(() => assert.calledWith(
            pullRequest.set, 'review', sinon.match.has('completed_at')
          ))
          .then(done, done);
      });
    });

  });

  describe('#changesNeeded', function () {

    it('should emit event `review:changesneeded`', function (done) {
      pullRequestReview.changesNeeded(pullRequest, 'foo')
        .then(() => assert.calledWith(events.emit, 'review:changesneeded'))
        .then(done, done);
    });

    it('should change reviewer status to "not approved"', function (done) {
      review.reviewers = [{ login: 'foo', approved: true }, { login: 'bar' }];

      pullRequestReview.changesNeeded(pullRequest, 'foo')
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match({
            reviewers: [{ login: 'foo' }, { login: 'bar' }]
          })
        ))
        .then(done, done);
    });

    it('should update property "updated_at"', function (done) {
      pullRequestReview.changesNeeded(pullRequest, 'foo')
        .then(() => assert.calledWith(
          pullRequest.set, 'review', sinon.match.has('updated_at')
        ))
        .then(done, done);
    });

  });

  describe('#updateReview', function () {

    it('should emit event `review:updated`', function (done) {
      pullRequestReview.updateReview(
          pullRequest, { reviewers: [{ login: 'baz' }] }
        )
        .then(() => assert.calledWith(events.emit, 'review:updated'))
        .then(done, done);
    });

    it('should update reviewers in pull request', function (done) {
      pullRequestReview.updateReview(
          pullRequest, { reviewers: [{ login: 'baz' }] }
        )
        .then(() => assert.calledWith(
          pullRequest.set, 'review.reviewers', [{ login: 'baz' }]
        ))
        .then(done, done);
    });

    it('should update reviewer ranks in pull request', function (done) {
      pullRequestReview.updateReview(
          pullRequest, { ranks: [{ login: 'baz', rank: 1 }] }
        )
        .then(() => assert.calledWith(
          pullRequest.set, 'review.ranks', [{ login: 'baz', rank: 1 }]
        ))
        .then(done, done);
    });

    it('should update banned reviewers in pull request', function (done) {
      pullRequestReview.updateReview(
          pullRequest, { banned: [{ login: 'baz' }] }
        )
        .then(() => assert.calledWith(
          pullRequest.set, 'review.banned', [{ login: 'baz' }]
        ))
        .then(done, done);
    });

    it('should update property "updated_at"', function (done) {
      pullRequestReview.updateReview(
          pullRequest, { reviewers: [{ login: 'baz' }] }
        )
        .then(() => assert.calledWith(pullRequest.set, 'review.updated_at'))
        .then(done, done);
    });

    it('should reject promise if all reviewers were dropped', function (done) {
      pullRequestReview.updateReview(pullRequest, { reviewers: [] })
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /cannot drop all/i))
        .then(done, done);
    });

  });

});

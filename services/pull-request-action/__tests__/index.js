'use strict';

import service from '../../pull-request-action';

import teamMock from '../../choose-team/__mocks__/index';
import modelMock from '../../model/__mocks__/index';
import loggerMock from '../../logger/__mocks__/index';
import eventsMock from '../../events/__mocks__/index';
import pullRequestMock from '../../model/__mocks__/pull_request';

describe('services/pull-request-action', function () {

  let options, imports;
  let team, model, logger, events;

  const promise = function (x) {
    return Promise.resolve(x);
  };

  beforeEach(function () {
    options = {};

    team = teamMock();
    model = modelMock();
    logger = loggerMock();
    events = eventsMock();

    imports = { 'choose-team': team, model, logger, events };

  });

  it('should be resolved to pull-request-action', function () {

    const action = service(options, imports);

    assert.property(action, 'saveReview');
    assert.property(action, 'approveReview');

  });

  describe('#saveReview', function () {

    let pullRequest, PullRequestModel;

    beforeEach(function () {
      pullRequest = pullRequestMock();
      pullRequest.get.withArgs('review.started_at').returns(new Date());

      PullRequestModel = model.get('pull_request');
      PullRequestModel.findById.withArgs(42).returns(promise(pullRequest));
    });

    it('should emit event `review:updated` when review saved', function (done) {
      const review = { status: 'notstarted' };
      const action = service(options, imports);

      action.saveReview(review, 42)
        .then(() => {
          assert.called(pullRequest.save);
          assert.calledWithExactly(pullRequest.set, 'review', review);

          assert.calledWith(events.emit, 'review:updated');

          done();
        })
        .catch(done);
    });

    it('should emit event `review:started` when review started', function (done) {
      pullRequest.get.withArgs('review.status').returns('notstarted');

      const review = { status: 'inprogress', reviewers: ['foo', 'bar'] };
      const action = service(options, imports);

      action.saveReview(review, 42)
        .then(() => {
          assert.called(pullRequest.save);
          assert.calledWithExactly(pullRequest.set, 'review', review);

          assert.calledWith(events.emit, 'review:started');

          done();
        })
        .catch(done);
    });

    it('should set status `notstarted` if review has no status', function (done) {
      const review = {};
      const action = service(options, imports);

      action.saveReview(review, 42)
        .then(pullRequest => {
          assert.calledWith(pullRequest.set, 'review', { status: 'notstarted' });
          done();
        })
        .catch(done);
    });

    it('should set `started_at` when review change status to `inprogress`', function (done) {
      pullRequest.get.withArgs('review.started_at').returns(null);

      const review = { status: 'inprogress', reviewers: ['foo', 'bar'] };
      const action = service(options, imports);

      action.saveReview(review, 42)
        .then(pullRequest => {
          assert.calledWithMatch(
            pullRequest.set, 'review', sinon.match.hasOwn('started_at')
          );
          done();
        })
        .catch(done);
    });

    it('should fail if pull request not found', function (done) {
      PullRequestModel.findById.withArgs(42).returns(promise(null));

      const review = {};
      const action = service(options, imports);

      action.saveReview(review, 42)
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(String(e), /not found/);

          done();
        })
        .catch(done);
    });

    it('should fail if start review without reviewers', function (done) {
      const review = { status: 'inprogress', reviewers: [] };
      const action = service(options, imports);

      action.saveReview(review, 42)
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(String(e), /reviewers .* not selected/);

          done();
        })
        .catch(done);
    });

  });

  describe('#approveReview', function () {

    let pullRequest, PullRequestModel;

    beforeEach(function () {
      options = {
        defaultApproveCount: 2
      };

      pullRequest = pullRequestMock();

      PullRequestModel = model.get('pull_request');
      PullRequestModel.findById.withArgs(42).returns(promise(pullRequest));
    });

    it('should emit event `review:approved`', function (done) {
      const review = {
        reviewers: [{ login: 'foo' }, { login: 'bar' }]
      };

      pullRequest.get.withArgs('review').returns(review);

      const action = service(options, imports);

      action.approveReview('foo', 42)
        .then(() => {
          assert.called(pullRequest.save);
          assert.calledWithMatch(
            pullRequest.set,
            'review',
            sinon.match({
              reviewers: [{ login: 'foo', approved: true }, { login: 'bar' }]
            })
          );

          assert.calledWithMatch(
            pullRequest.set, 'review', sinon.match.has('updated_at')
          );

          assert.calledWith(events.emit, 'review:approved');

          done();
        })
        .catch(done);

    });

    it('should emit event `review:complete` when review completed', function (done) {
      const review = {
        reviewers: [{ login: 'foo' }, { login: 'bar', approved: true }]
      };

      pullRequest.get.withArgs('review').returns(review);
      pullRequest.get.withArgs('review.status').returns('complete');

      const action = service(options, imports);

      action.approveReview('foo', 42)
        .then(() => {
          assert.calledWith(events.emit, 'review:approved');
          assert.calledWith(events.emit, 'review:complete');

          assert.calledWithMatch(
            pullRequest.set, 'review', sinon.match.has('status', 'complete')
          );
          assert.calledWithMatch(
            pullRequest.set, 'review', sinon.match.has('completed_at')
          );

          done();
        })
        .catch(done);

    });

    it('should fail if pull request not found', function (done) {
      PullRequestModel.findById.withArgs(42).returns(promise(null));

      const action = service(options, imports);

      action.approveReview('foo', 42)
        .catch(e => {
          assert.instanceOf(e, Error);
          assert.match(String(e), /not found/);

          done();
        })
        .catch(done);
    });

  });

});

import proxyquire from 'proxyquire';

import eventsMock from '../../events/__mocks__/';
import loggerMock from '../../logger/__mocks__/';
import { pullRequestMock, pullRequestModelMock } from
  '../../model/pull-request/__mocks__/';

describe('services/schedule', function () {

  let service, schedule, pullRequest, PullRequestModel;

  beforeEach(function () {

    schedule = {
      cancelJob: sinon.stub(),
      scheduleJob: sinon.stub(),
      scheduledJobs: {}
    };

    pullRequest = pullRequestMock();

    PullRequestModel = pullRequestModelMock();

    service = proxyquire('../index', {
      'node-schedule': schedule
    });

  });

  describe('#cancelJob', function () {

    let cancelJob;

    beforeEach(function () {
      cancelJob = service.cancelJob;
    });

    it('should cancel job', function (done) {
      pullRequest.id = 1;

      cancelJob(pullRequest)
        .then(() => assert.calledWith(schedule.cancelJob, 'pull-1'))
        .then(done, done);
    });

  });

  describe('#createJob', function () {

    let now, clock, createJob;

    beforeEach(function () {
      now = +new Date(2000, 1, 15);
      clock = sinon.useFakeTimers(now);
      createJob = service.createJob;
    });

    afterEach(function () {
      clock.restore();
    });

    it('should create job', function (done) {
      pullRequest.id = 1;
      pullRequest.reivew = { started_at: new Date(2000, 1, 1) };

      const trigger = () => {};
      const timeShift = 1;
      const expirationTime = new Date(2000, 1, 16);

      createJob(pullRequest, timeShift, trigger)
        .then(() => assert.calledWith(schedule.cancelJob, 'pull-1'))
        .then(() => {
          assert.calledWith(
            schedule.scheduleJob, 'pull-1', expirationTime, trigger
          );
        })
        .then(done, done);
    });

    it('should not set expiration time to weekend', function (done) {
      pullRequest.id = 1;
      pullRequest.reivew = { started_at: new Date(2000, 1, 1) };

      const trigger = () => {};
      const timeShift = 4; // 15 Feb 2000 is Tuesday
      const expirationTime = new Date(2000, 1, 21);

      createJob(pullRequest, timeShift, trigger)
        .then(() => assert.calledWith(schedule.cancelJob, 'pull-1'))
        .then(() => {
          assert.calledWith(
            schedule.scheduleJob, 'pull-1', expirationTime, trigger
          );
        })
        .then(done, done);
    });

  });

  describe('#scheduleInReview', function () {

    let scheduleInReview, pullRequestA, pullRequestB;

    beforeEach(function () {
      scheduleInReview = service.scheduleInReview;

      pullRequestA = pullRequestMock();
      pullRequestB = pullRequestMock();

      pullRequestA.id = 100;
      pullRequestB.id = 200;

      PullRequestModel.findInReview.returns(Promise.resolve([
        pullRequestA, pullRequestB
      ]));
    });

    it('should set timer for `in review` pull requests', function (done) {
      const trigger = () => {};
      const timeShift = 1;

      scheduleInReview(PullRequestModel, timeShift, trigger)
        .then(() => {
          assert.calledWith(schedule.scheduleJob, 'pull-100');
          assert.calledWith(schedule.scheduleJob, 'pull-200');
        })
        .then(done, done);
    });

  });

  describe('#trigger', function () {

    let options, imports, scheduleService;
    let logger, events;

    beforeEach(function () {

      events = eventsMock();
      logger = loggerMock();

      options = {};
      imports = { events, logger, 'pull-request-model': PullRequestModel };

      PullRequestModel.findById
        .withArgs(1).returns(Promise.resolve(pullRequest));

      scheduleService = service.default(options, imports);
    });

    it('should emit event `review:schedule:ping` and reset timer if no comments in pull request', function (done) {
      scheduleService.trigger(1);

      setTimeout(() => {
        assert.calledWith(events.emit, 'review:schedule:ping');
        assert.calledWith(schedule.scheduleJob, 'pull-1');
        done();
      }, 0);
    });

    it('should do nothing if pull request has comments', function (done) {
      pullRequest.review_comments = [null, null];

      scheduleService.trigger(1);

      setTimeout(() => {
        assert.neverCalledWith(events.emit, 'review:schedule:ping');
        assert.neverCalledWith(schedule.scheduleJob, 'pull-1');
        done();
      }, 0);
    });

  });

  describe('#shutdown', function () {

    let options, imports, scheduleService;
    let logger, events;

    beforeEach(function () {

      events = eventsMock();
      logger = loggerMock();

      options = {};
      imports = { events, logger, 'pull-request-model': PullRequestModel };

      schedule.scheduledJobs = {
        'pull-1': { cancel: sinon.stub() },
        'pull-2': { cancel: sinon.stub() },
        'pull-3': { cancel: sinon.stub() }
      };

      scheduleService = service.default(options, imports);
    });

    it('should cancel all jobs', function () {
      scheduleService.shutdown();

      assert.called(schedule.scheduledJobs['pull-1'].cancel);
      assert.called(schedule.scheduledJobs['pull-2'].cancel);
      assert.called(schedule.scheduledJobs['pull-3'].cancel);
    });

  });

  describe('service', function () {

    let options, imports;
    let logger, events, payload;

    beforeEach(function () {

      events = eventsMock();
      logger = loggerMock();

      payload = { pullRequest };

      options = {};
      imports = { events, logger, 'pull-request-model': PullRequestModel };

      PullRequestModel.findInReview.returns(Promise.resolve([]));
    });

    it('should set timer when review is starting', function (done) {
      events.on.withArgs('review:command:start').callsArgWith(1, payload);

      service.default(options, imports);

      setTimeout(() => {
        assert.calledWith(schedule.scheduleJob, 'pull-1');
        done();
      }, 0);
    });

    it('should cancel timer when review is done', function () {
      events.on.withArgs('review:complete').callsArgWith(1, payload);

      service.default(options, imports);

      assert.calledWith(schedule.cancelJob, 'pull-1');
    });

  });

});

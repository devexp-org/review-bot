import { cancelJob, createJob } from '../index';

function createScheduler(id, cancel) {
  return {
    scheduleJob() {},
    scheduledJobs: {
      [id]: { cancel }
    }
  };
}

describe('core/services/review-reminder', () => {
  describe('#cancelJob', () => {
    it('should cancel job for scheduled pull request', () => {
      const stub = sinon.stub();
      const scheduler = createScheduler('pull-1', stub);

      cancelJob(scheduler, 1);

      assert.calledOnce(stub);
    });

    it('should not do anything if pull request is not found', () => {
      const stub = sinon.stub();
      const scheduler = createScheduler('pull-1', stub);

      cancelJob(scheduler, 2);

      assert.notCalled(stub);
    });
  });

  describe('#createJob', () => {
    const options = {
      frequency: 1,
      ignoreWeekends: true
    };

    let imports, pullRequest;
    beforeEach(() => {
      imports = {
        logger: { error() {}, info() {} },
        events: { emit() {} },
        scheduler: createScheduler('pull-1', () => {}),
        PullRequestModel: {
          findById() { return Promise.resolve(); }
        }
      };

      pullRequest = {
        review: {
          started_at: new Date()
        },
        id: 1
      };
    });

    it('should cancel job if already exists', () => {
      const stub = sinon.stub();
      imports.scheduler = createScheduler('pull-1', stub);

      createJob(imports, options, pullRequest);

      assert.calledOnce(stub);
    });

    it('should schedule new job', (done) => {
      imports.scheduler.scheduleJob = (id, date, cb) => {
        assert.equal(id, 'pull-1');
        assert.ok(date);
        assert.isFunction(cb);
        done();
      };

      createJob(imports, options, pullRequest);
    });

    it('should cancel job if there`s review comments', (done) => {
      const stub = sinon.stub();
      imports.scheduler = createScheduler('pull-1', stub);
      imports.PullRequestModel = {
        findById() {
          pullRequest.review_comments = true;
          return Promise.resolve(pullRequest);
        }
      };
      imports.scheduler.scheduleJob = (id, date, cb) => {
        cb().then(() => {
          assert.calledTwice(stub);
          done();
        }).catch(done);
      };

      createJob(imports, options, pullRequest);
    });

    it('should emit event when schedule callback is being called', (done) => {
      const stub = sinon.stub();
      imports.PullRequestModel = {
        findById() { return Promise.resolve(pullRequest); }
      };
      imports.scheduler.scheduleJob = (id, date, cb) => {
        imports.scheduler.scheduleJob = () => {};
        cb().then(() => {
          assert.calledWith(stub, 'review:reminder', pullRequest);
          done();
        }).catch(done);
      };

      imports.events.emit = stub;

      createJob(imports, options, pullRequest);
    });
  });
});

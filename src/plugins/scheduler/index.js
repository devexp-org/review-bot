import moment from 'moment';
import schedule from 'node-schedule';
import { forEach } from 'lodash';

export const EVENT_NAME = 'review:schedule:ping';

export function cancelJob(pullRequest) {
  const pullId = pullRequest.id;

  return Promise.resolve(schedule.cancelJob('pull-' + pullId));
}

export function createJob(pullRequest, timeShift, trigger) {

  const pullId = pullRequest.id;
  const startAt = moment(pullRequest.get('review.started_at'));
  const fullDays = moment.duration(moment().diff(startAt)).asDays();
  const expirationTime = startAt.add(fullDays + timeShift, 'days');

  // exclude weekend
  while (expirationTime.isoWeekday() > 5) {
    expirationTime.add(1, 'days');
  }

  return cancelJob(pullRequest)
    .then(() => {
      return schedule.scheduleJob(
        'pull-' + pullId, expirationTime.toDate(), trigger
      );
    });

}

export function scheduleInReview(PullRequestModel, timeShift, trigger) {

  return PullRequestModel.findInReview()
    .then(result => {
      const promise = result.map(pullRequest => {
        return createJob(pullRequest, timeShift, trigger);
      });

      return Promise.all(promise);
    });

}

/**
 * Service for sending notification by time
 *
 * @param {Object} options
 * @param {Number} options.days How often to send a reminder.
 * @param {Object} imports
 *
 * @return {Promise}
 */
export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('schedule');
  const PullRequestModel = imports['pull-request-model'];

  function trigger(pullId) {
    return PullRequestModel
      .findById(pullId)
      .then(pullRequest => {
        if (!pullRequest.review_comments && pullRequest.state !== 'closed') {
          events.emit(EVENT_NAME, { pullRequest });
          createJob(pullRequest);
        }
      });
  }

  function onReviewDone(payload) {
    return cancelJob(payload.pullRequest)
      .catch(logger.error.bind(logger));
  }

  function onReviewStart(payload) {
    const pullId = payload.pullRequest.id;

    return createJob(payload.pullRequest, options.days, trigger(pullId))
      .catch(logger.error.bind(logger));
  }

  function shutdown() {
    logger.info('Shutdown start');

    forEach(schedule.scheduledJobs, (x) => x.cancel());

    logger.info('Shutdown finish');
  }

  events.on('review:approved', onReviewDone);
  events.on('review:complete', onReviewDone);

  events.on('review:command:stop', onReviewDone);
  events.on('review:command:start', onReviewStart);

  events.on('github:pull_request:close', onReviewDone);

  scheduleInReview(PullRequestModel, options.days, trigger)
    .then(jobs => logger.info('Scheduling %s jobs', jobs.length));

  return { trigger, shutdown };

}

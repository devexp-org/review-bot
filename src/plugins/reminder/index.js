import moment from 'moment';
import schedule from 'node-schedule';
import { forEach } from 'lodash';

export const EVENT_NAME = 'review:command:ping';

export function cancelJob(pullRequest) {
  const key = 'pull-' + pullRequest.id;

  return Promise.resolve(schedule.cancelJob(key));
}

export function createJob(pullRequest, timeShift, trigger) {

  const key = 'pull-' + pullRequest.id;
  const startAt = moment(pullRequest.get('review.started_at'));
  const fullDays = moment.duration(moment().diff(startAt)).asDays();
  const expirationTime = startAt.add(fullDays + timeShift, 'days');

  // exclude weekend
  while (expirationTime.isoWeekday() > 5) {
    expirationTime.add(1, 'days');
  }

  return cancelJob(pullRequest).then(() => {
    return schedule.scheduleJob(
      key, expirationTime.toDate(), trigger
    );
  });

}

export function scheduleInReview(PullRequestModel, timeShift, trigger) {

  return PullRequestModel.findInReview(0, 1000)
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
  const logger = imports.logger.getLogger('reminder');
  const PullRequestModel = imports.model('pull_request');

  function trigger(id) {
    return PullRequestModel
      .findById(id)
      .then(pullRequest => {
        if (pullRequest.state !== 'closed' && !pullRequest.review_comments) {
          events.emit(EVENT_NAME, { pullRequest });
          return createJob(pullRequest);
        }
      });
  }

  function onReviewDone(payload) {
    return cancelJob(payload.pullRequest)
      .catch(logger.error.bind(logger));
  }

  function onReviewStart(payload) {
    return createJob(payload.pullRequest, options.days, trigger)
      .catch(logger.error.bind(logger));
  }

  function shutdown() {
    logger.info('Shutdown start');

    forEach(schedule.scheduledJobs, (x) => x.cancel());

    logger.info('Shutdown finish');
  }

  events.on('review:complete', onReviewDone);

  events.on('review:command:stop', onReviewDone);
  events.on('review:command:start', onReviewStart);

  events.on('github:pull_request:close', onReviewDone);

  scheduleInReview(PullRequestModel, options.days, trigger)
    .then(jobs => logger.info('Scheduling %s jobs', jobs.length));

  return { trigger, shutdown };

}

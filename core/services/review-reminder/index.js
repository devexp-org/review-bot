import moment from 'moment';
import scheduler from 'node-schedule';

const EVENT_NAME = 'review:reminder';

/**
 * Logs out when reminder happens.
 *
 * @param {Object} logger
 * @param {Object} pullRequest
 */
export function logReminder(logger, pullRequest) {
  logger.info(
    'Review reminder: [%s – %s] %s.',
    pullRequest.number,
    pullRequest.title,
    pullRequest.html_url
  );
}

/**
 * Unschedules reminder for given pull request.
 *
 * @param {Object} scheduler
 * @param {Number} pullId
 */
export function cancelJob(scheduler, pullId) {
  const job = scheduler.scheduledJobs['pull-' + pullId];

  if (job) job.cancel();
}

/**
 * Schedules reminder for given pull request.
 *
 * @param {Object} imports
 * @param {ReviewReminderOptions} options
 * @param {Object} pullRequest
 */
export function createJob(imports, options, pullRequest) {
  const { frequency, ignoreWeekends } = options;
  const { scheduler, logger, events, PullRequestModel } = imports;
  const id = pullRequest.id;
  const reviewStartTime = moment(pullRequest.review.started_at);
  const reviewDowntimeFullDays = Number(moment.duration(moment().diff(reviewStartTime)).asDays());
  const expirationTime = reviewStartTime.add(reviewDowntimeFullDays + frequency, 'days');

  // exclude weekend
  if (ignoreWeekends) {
    while (expirationTime.isoWeekday() > 5) {
      expirationTime.add(1, 'days');
    }
  }

  cancelJob(scheduler, id);

  scheduler.scheduleJob('pull-' + id, expirationTime.toDate(), function () {
    return PullRequestModel
      .findById(id)
      .then(pullRequest => {
        // nobody cares about review
        if (pullRequest && !pullRequest.review_comments) {
          logReminder(logger, pullRequest);
          events.emit(EVENT_NAME, pullRequest);
          createJob(imports, options, pullRequest);
        } else {
          cancelJob(scheduler, id);
        }
      })
      .catch(::logger.error);
  });
}

/**
 * Review done handler, removes pull request from scheduler.
 *
 * @param {Object} scheduler
 * @param {Object} payload
 */
export function onReviewDone(scheduler, payload) {
  cancelJob(scheduler, payload.pullRequest.id);
}

/**
 * Review start handler, adds pull request to scheduler.
 *
 * @param {Object} imports
 * @param {ReviewReminderOptions} options
 * @param {Object} payload
 */
export function onReviewStart(imports, options, payload) {
  createJob(imports, options, payload.pullRequest);
}

/**
 * Service for reminding reviewers about forgotten reviews.
 *
 * @param {ReviewReminderOptions} options
 * @param {Object} imports
 */
export default function reviewReminder(options, imports) {
  const { model, events, logger } = imports;
  const PullRequestModel = model.get('pull_request');
  const createJobImports = { PullRequestModel, events, logger, scheduler };

  events.on('review:approved', onReviewDone.bind(null, scheduler));
  events.on('review:complete', onReviewDone.bind(null, scheduler));

  events.on('review:command:start', onReviewStart.bind(null, createJobImports, options));
  events.on('review:command:stop', onReviewDone.bind(null, scheduler));

  PullRequestModel
    .find({
      state: 'open',
      'review.status': 'inprogress'
    })
    .then(result =>
      result.forEach(pullRequest => createJob(createJobImports, options, pullRequest))
    );
}

/**
 * Options for review reminder service.
 *
 * @typedef {Object} ReviewReminderOptions
 * @property {Number} frequency - how often remind in days
 * @property {Boolean} ignoreWeekends - do not remind on weekends
 */

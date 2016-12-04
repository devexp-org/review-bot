import PullRequestReview from './class';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('review');

  return new PullRequestReview(options, { events, logger });

}

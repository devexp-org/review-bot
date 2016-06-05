import PullRequestReview from './class';

export default function setup(options, imports) {

  const events = imports.events;
  const logger = imports.logger.getLogger('review');
  const teamDispatcher = imports['team-dispatcher'];

  return new PullRequestReview(options, { events, logger, teamDispatcher });

}

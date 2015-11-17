import util from 'util';
import { find, cloneDeep } from 'lodash';

const COMMAND_REGEXP = new RegExp(
  '(?:^|\\W)' + '\\+@?([\\w]+)' + '(?:\\W|$)|' + // +username +@username
  '(?:^|\\W)' + '\/?add\\s+@?([\\w]+)' + '(?:\\W|$)', // /add username /add @username
  'i'
);
const EVENT_NAME = 'review:command:add';

export function getParticipant(command) {
  const participant = command.match(COMMAND_REGEXP);

  return participant[1] || participant[2];
}

export default function addCommand(command, payload) {

  const team = payload.team;
  const action = payload.action;
  const logger = payload.logger;
  const events = payload.events;
  const pullRequest = payload.pullRequest;
  const reviewers = pullRequest.get('review.reviewers');

  let newReviewer;

  logger.info(
    '"/add" [%s – %s]',
    pullRequest.number,
    pullRequest.title
  );

  const newReviewerLogin = getParticipant(command);

  if (find(reviewers, { login: newReviewerLogin })) {
    return Promise.reject(new Error(util.format(
      '%s tried to add reviewer %s but he is already in reviewers list',
      payload.comment.user.login,
      newReviewerLogin
    )));
  }

  return team
    .findTeamMemberByPullRequest(pullRequest, newReviewerLogin)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(util.format(
          '%s tried to set %s, but there are no user with the same login in team',
          payload.comment.user.login,
          newReviewerLogin
        )));
      }

      const newReviewer = cloneDeep(user);

      reviewers.push(newReviewer);

      return action.save({ reviewers }, pullRequest.id);
    }).then(pullRequest => {
      events.emit(EVENT_NAME, { pullRequest, newReviewer });

      return pullRequest;
    });
}

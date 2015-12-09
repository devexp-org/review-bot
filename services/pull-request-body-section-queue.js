import PullBodySectionDispatcher from '../modules/pull-request-body-section-queue';

export default function pullRequestBodySectionQueue(options = {}, imports) {
  const github = imports['pull-request-github'];
  const dispatcher = new PullBodySectionDispatcher(options, github);

  return dispatcher;
}

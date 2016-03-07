import PullBodySectionDispatcher from './dispatcher';

export default function pullRequestBodySectionQueue(options = {}, imports) {
  const github = imports['pull-request-github'];
  const dispatcher = new PullBodySectionDispatcher(options, github);

  return dispatcher;
}

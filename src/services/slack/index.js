import Slack from './class';

export default function (options, imports) {

  const logger = imports.logger.getLogger('slack');
  options.info = logger.info.bind(logger);

  const slack = new Slack(options);

  slack.connect();

  return slack;

}

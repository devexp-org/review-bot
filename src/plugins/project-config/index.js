import ProjectConfig from './class';

export default function setup(options, imports) {

  const github = imports.github;
  const logger = imports.logger.getLogger('pconfig');
  const teamDispatcher = imports['team-dispatcher'];

  return new ProjectConfig(logger, github, teamDispatcher);

}

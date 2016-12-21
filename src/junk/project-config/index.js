import ProjectConfig from './class';

export default function setup(options, imports) {

  const github = imports.github;
  const logger = imports.logger.getLogger('review.step.project-config');
  const teamManager = imports['team-manager'];

  return new ProjectConfig(logger, github, teamManager);

}

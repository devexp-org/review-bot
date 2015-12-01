import util from 'util';
import { isEmpty, get } from 'lodash';

export default function getStepsFactory(opts, imports) {
  const { team } = imports;

  /**
   * Get steps for team.
   *
   * @param {Object} pullRequest
   *
   * @return {Object} { steps, stepOptions }
   */
  return function getChooseReviewerSteps(pullRequest) {
    const teamName = team.getTeamName(pullRequest);

    if (!teamName) {
      return Promise.reject(new Error(util.format(
        'Team not found for pull request [%s – %s] %s',
        pullRequest.number,
        pullRequest.title,
        pullRequest.html_url
      )));
    }

    const stepsList = get(opts, [teamName, 'steps']) || get(opts, ['default', 'steps']);

    if (isEmpty(stepsList)) {
      return Promise.reject(new Error(util.format(
        'There aren`t any choose reviewer steps for given team — %s',
        team
      )));
    }

    const steps = stepsList.map(name => {
      const ranker = imports[name];

      if (!ranker) throw new Error(`There is no choose reviewers step with name — ${name}`);

      return ranker;
    });

    return Promise.resolve(steps);
  };
}

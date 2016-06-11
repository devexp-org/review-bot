export function buildHeader(id, issues) {

  const tasksSection = issues
    .map(id => `Task: https://st.yandex-team.ru/${id}`);

  return tasksSection.concat([
    '\n',
    'Автоботы:',
    'report-report:',
    `http://buildfarm-d-pull-${id}.ti.balancer.serp.yandex.ru/`,
    'node-report:',
    `http://pull-${id}.mm-fol.serp.yandex.ru/\n`,
    `[Посмотреть или запустить](http://quigon.yandex.ru/project.html?projectId=Multimedia_Fiji_Pr&branch_Multimedia_Fiji_Pr=${id}) сборку в TeamCity для данного PR`
  ]).join('\n');
}

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const startrek = imports.startrek;
  const pullRequestGitHub = imports['pull-request-github'];

  /**
   * Call method for updating pull request body with mm-header.
   *
   * @param {Object} payload
   *
   * @return {Promise}
   */
  function updateHeader(payload) {
    const pullRequest = payload.pullRequest;

    if (pullRequest.repository.full_name !== 'mm-interfaces/fiji') {
      return;
    }

    const issues = startrek.parseIssue(pullRequest.title, options.queues);

    return queue.dispatch('pull-request#' + pullRequest.id, () => {
      pullRequestGitHub.setBodySection(
        pullRequest, 'pull-header-mm', buildHeader(pullRequest.id, issues), 25
      );
      return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
    });
  }

  events.on('review:updated', updateHeader);

  return {};

}

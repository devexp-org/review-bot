function build(id, tasks) {

  const tasksSection = tasks.map(task => `Task: https://st.yandex-team.ru/${task}`);

  return tasksSection.concat([
    '\nАвтоботы:',
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
    const pullId = pullRequest.id;

    if (pullRequest.repository.full_name !== 'mm-interfaces/fiji') {
      return;
    }

    const tasks = startrek.parseIssue(pullRequest.title, options.queues);

    return queue.dispatch('pull-request#' + pullId, () => {
      pullRequestGitHub.setBodySection(
        pullRequest, 'pull-header-mm', build(pullId, tasks), 25
      );
      return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
    });
  }

  events.on('review:updated', updateHeader);

  return {};

}

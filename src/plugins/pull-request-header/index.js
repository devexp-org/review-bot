
function normalizePlatformPath(platform) {
  if (platform === 'desktop') {
    return '';
  }

  return platform + '/';
}

function getPerlReportLink(id, service, platform) {
  platform = normalizePlatformPath(platform);
  return `[perl-report](https://buildfarm-d-pull-${id}.mm-proxy.serp.yandex.ru/${service}/${platform}?noredirect=1)`;
}

function getTemplarLink(id, service, platform) {
  platform = normalizePlatformPath(platform);
  return `[templar](https://pull-${id}.mm-fol.serp.yandex.ru/${service}/${platform}?noredirect=1)`;
}

function getRRLink(id, service, platform) {
  platform = normalizePlatformPath(platform);
  return `[RR](https://fiji-pull-${id}-rr-templates.hamster.yandex.ru/${service}/${platform}?noredirect=1)`;
}

function getPRLink(id, service, platform) {
  return `${getPerlReportLink(id, service, platform)} \\| ${getTemplarLink(id, service, platform)} \\| ${getRRLink(id, service, platform)}`;
}

function build(id, tasks) {
  const tasksSection = tasks.map(task => `Task: https://st.yandex-team.ru/${task}`);

  /* eslint-disable quotes */

  return tasksSection.concat([
    ``,
    `Платформа    |                 Images                |                 Video               `,
    `-------------|---------------------------------------|-------------------------------------`,
    `desktop      | ${getPRLink(id, 'images', 'desktop')} | ${getPRLink(id, 'video', 'desktop')}`,
    `touch-phone  | ${getPRLink(id, 'images', 'touch')}   | ${getPRLink(id, 'video', 'touch')}  `,
    `touch-pad    | ${getPRLink(id, 'images', 'pad')}     | ${getPRLink(id, 'video', 'pad')}    `,
    `\nmm-proxy.serp.yandex.ru проксирует запросы в ti.balancer.serp.yandex.ru`,
    `\n\n`,
    `[Посмотреть или запустить](http://quigon.yandex.ru/project.html?projectId=Multimedia_Fiji_Pr&branch_Multimedia_Fiji_Pr=${id}) сборку в TeamCity для данного PR`
  ]).join('\n');

  /* eslint-enable quotes */

}

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const startrek = imports['yandex-startrek'];
  const pullRequestGitHub = imports['pull-request-github'];

  /**
   * Call method for updating pull request body with header.
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

    const tasks = startrek.parseIssue(pullRequest.title, options.queues);

    return queue.dispatch('pull-request#' + pullRequest.id, () => {
      const content = build(pullRequest.number, tasks);
      pullRequestGitHub.setBodySection(
        pullRequest, 'pull-request-header', content, 25
      );
      return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
    });
  }

  events.on('review:updated', updateHeader);

}

function normalizePlatformPath(platform) {
  if (platform === 'desktop') {
    return '';
  }

  return ({
    'touch-pad': 'pad',
    'touch-phone': 'touch'
  })[platform] + '/';
}

function getPRLink(id, service, platform) {
  const platformPath = normalizePlatformPath(platform);
  const icon = ({
    desktop: 'https://jing.yandex-team.ru/files/sbmaxx/font-awesome-desktop.png',
    'touch-pad': 'https://jing.yandex-team.ru/files/sbmaxx/font-awesome-tablet.png',
    'touch-phone': 'https://jing.yandex-team.ru/files/sbmaxx/font-awesome-mobile.png'
  })[platform];

  return `<img src="${icon}" width="20" align="absmiddle">&nbsp;<a href="https://fiji-pull-${id}-rr-templates.hamster.yandex.ru/${service}/${platformPath}?noredirect=1">${platform}</a>`;
}

function getLink(href, text) {
  return `<a href="${href}" target="_blank">${text}</a>`;
}

function getSandboxPRLink(id) {
  const sandboxPrj = 'SANDBOX_CI_FIJI';
  const encodedID = encodeURIComponent(`mm-interfaces/fiji#${id}`);
  const urlPr = `https://sandbox.yandex-team.ru/tasks?type=${sandboxPrj}&desc_re=${encodedID}&page=1&pageCapacity=20&forPage=tasks`;
  const urlRestart = `https://sandbox-ci.qloud.yandex-team.ru/restart-task?sandboxTask=${sandboxPrj}&sandboxTaskDescRe=${encodedID}`;

  return [
    '<img src="https://sandbox.yandex-team.ru/favicon.png" width="20" height="20" align="absmiddle"/>    ',
    `${getLink(urlPr, 'страница PR')} | ${getLink(urlRestart, 'перезапустить сборку')}`
  ].join('');
}

function getStartrekLink(task) {
  const url = `https://st.yandex-team.ru/${task}`;

  return `<img src="https://st.yandex-team.ru/favicon.ico" width="20" height="20" align="absmiddle"/>    ${getLink(url, task)}`;
}

function renderTemplate(id, tasks) {
  const str = [];

  str.push([
    '<img src="https://yastatic.net/q/logoaas/v1/Яндекс%20Видео.svg" align="absmiddle">',
    `${getPRLink(id, 'video', 'desktop')} ${getPRLink(id, 'video', 'touch-phone')} ${getPRLink(id, 'video', 'touch-pad')}`,
    '',
    '<img src="https://yastatic.net/q/logoaas/v1/Яндекс%20Картинки.svg" align="absmiddle">',
    `${getPRLink(id, 'images', 'desktop')} ${getPRLink(id, 'images', 'touch-phone')} ${getPRLink(id, 'images', 'touch-pad')}`,
    '***'
  ].join('\n'));

  tasks.forEach(task => {
    str.push(getStartrekLink(task));
  });

  str.push(getSandboxPRLink(id));

  str.push('\n\n');

  return str.join('\n');
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
      const content = renderTemplate(pullRequest.number, tasks);
      pullRequestGitHub.setBodySection(
        pullRequest, 'pull-request-header', content, 25
      );
      return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
    });
  }

  events.on('review:updated', updateHeader);
  events.on('review:update_badges', updateHeader);

}

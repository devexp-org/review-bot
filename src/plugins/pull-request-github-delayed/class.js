import PullRequestGitHub from '../pull-request-github/class';

export default class PullRequestGitHubDelayed extends PullRequestGitHub {

  constructor(github, options, delay = 1000) {
    super(github, options);

    this._syncQueue = {};
    this._syncDelay = delay;
  }

  /**
   * @override
   */
  syncPullRequestWithGitHub(local) {
    let syncTask;

    if (!(local.id in this._syncQueue)) {
      syncTask = this._syncQueue[local.id] = {
        timerId: null,
        promise: [],
        pullRequest: local
      };
    } else {
      syncTask = this._syncQueue[local.id];

      syncTask.pullRequest = local;
      clearTimeout(syncTask.timerId);
    }

    syncTask.timerId = setTimeout(
      () => this._syncPullRequestWithGitHubDelayed(syncTask),
      this._syncDelay
    );

    return new Promise((resolve, reject) => {
      syncTask.promise.push({ resolve, reject });
    });
  }

  _syncPullRequestWithGitHubDelayed(syncTask) {
    const local = syncTask.pullRequest;
    const promise = syncTask.promise;

    delete this._syncQueue[local.id];

    super.syncPullRequestWithGitHub(local)
      .then(
        (issue) => promise.forEach(item => item.resolve(issue)),
        (error) => promise.forEach(item => item.reject(error))
      );
  }

}

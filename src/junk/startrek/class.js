export default class YandexStarTrek {

  /**
   * @constructor
   * @param {Object} request
   * @param {Object} options
   */
  constructor(request, options) {
    this._request = request;

    this._options = options;
  }

  request(url, method, payload) {
    if (this._options.silent) {
      return Promise.resolve({});
    }

    const params = {
      body: payload ? JSON.stringify(payload) : null,
      headers: {
        Authorization: `OAuth ${this._options.token}`,
        'Content-Type': 'application/json'
      }
    };

    return this._request[method](url, params);
  }

  issueUpdate(issue, payload) {
    const url = `${this._options.url}/issues/${issue}`;

    return this.request(url, 'patch', payload);
  }

  issueStatusChange(issue, status) {
    const url = `${this._options.url}/issues/${issue}/transitions/${status}/_execute`;

    return this.request(url, 'post');
  }

  /**
   * Parse issues from pull request title.
   *
   * @param {String} title
   * @param {Array} queues
   *
   * @return {Array}
   */
  parseIssue(title, queues) {
    const issues = [];
    // (SERP|GATEWAY)-[0-9]+
    const regexp = new RegExp('(?:^|\\W)((?:' + queues.join('|') + ')' + '-[0-9]+)(?:\\W|$)', 'g');

    let match;
    while (match = regexp.exec(title)) { // eslint-disable-line no-cond-assign
      issues.push(match[1]);
    }

    return issues;
  }

}

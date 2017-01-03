import { cloneDeep, isString, values } from 'lodash';

export default class PullRequestGitHub {

  /**
   * @constructor
   *
   * @param {Object} github
   * @param {Object} [options]
   * @param {Boolean} [options.silent] - silent mode
   * @param {String} [options.separator.top] - top body separator
   * @param {String} [options.separator.bottom] - bottom body separator
   */
  constructor(github, options) {
    this.github = github;

    this.silent = options.silent;

    this.separator = {
      top: options.separator && options.separator.top ||
        '<!-- DEVEXP BEGIN -->',
      bottom: options.separator && options.separator.bottom ||
        '<!-- DEVEXP END -->'
    };
  }

  loadPullRequestFromGitHub(local) {
    return new Promise((resolve, reject) => {
      const req = {
        repo: local.repository.name,
        owner: local.owner,
        number: local.number
      };

      this.github.pullRequests.get(req, (err, remote) => {
        if (err) {
          reject(new Error('Cannot receive a pull request from github: ' + err));
          return;
        }

        local.set(remote);

        resolve(local);
      });
    });
  }

  updatePullRequestOnGitHub(local) {
    if (this.silent) {
      return Promise.resolve(local);
    }

    return new Promise((resolve, reject) => {
      const req = {
        repo: local.repository.name,
        body: local.body,
        base: local.base.ref,
        owner: local.owner,
        title: local.title,
        number: local.number
      };

      this.github.pullRequests.update(req, err => {
        if (err) {
          reject(new Error('Cannot update a pull request: ' + err));
          return;
        }

        resolve(local);
      });
    });
  }

  loadPullRequestFiles(local) {
    return new Promise((resolve, reject) => {
      const req = {
        repo: local.repository.name,
        owner: local.owner,
        number: local.number,
        per_page: 100
      };

      this.github.pullRequests.getFiles(req, (err, files) => {
        if (err) {
          reject(new Error('Cannot receive files from the pull request: ' + err));
          return;
        }

        local.set('files', files.map(file => { delete file.patch; return file; }));

        resolve(local);
      });
    });
  }

  syncPullRequestWithGitHub(local) {
    return Promise.resolve(local)
      .then(this.loadPullRequestFromGitHub.bind(this))
      .then(local => {
        this.fillPullRequestBody(local);
        return local;
      })
      .then(this.updatePullRequestOnGitHub.bind(this))
      .then(local => local.save());
  }

  /**
   * Set status to github
   * https://developer.github.com/v3/repos/statuses/
   *
   * @param {Object} local
   *
   * @return {Promise}
   */
  setDeploymentStatus(local) {
    const status = local.review.status === 'complete' ? 'success' : 'pending';

    const description = {
      success: 'Завершено',
      pending: 'Ещё не пройдено'
    };

    return new Promise((resolve, reject) => {

      const req = {
        sha: local.head.sha,
        repo: local.repository.name,
        owner: local.owner,
        state: status,
        context: 'Ревью кода',
        description: description[status]
      };

      this.github.repos.createStatus(req, (err) => {
        if (err) {
          reject(new Error('Cannot update status for the pull request: ' + err));
        }

        resolve();
      });

    });

  }

  setPayload(local, payload) {
    const remote = payload.pull_request;

    remote.repository = payload.repository;

    local.set(remote);
  }

  setBodySection(local, sectionId, content, position = Infinity) {
    const section = cloneDeep(local.get('section')) || {};
    section[sectionId] = { content, position };

    local.set('section', section);

    this.fillPullRequestBody(local);
  }

  fillPullRequestBody(local) {
    const bodyContent = this.buildBodyContent(local.section);

    local.body = this.cleanPullRequestBody(local.body);

    const bodyContentWithSeparators = [
      (local.body.length ? '\n' : ''),
      this.separator.top + '\n',
      (local.body.length ? '----\n' : ''),
      bodyContent + '\n',
      this.separator.bottom
    ].join('');

    local.body += bodyContentWithSeparators;
  }

  cleanPullRequestBody(body) {
    const begin = body.indexOf(this.separator.top);

    if (begin !== -1) {
      const before = body.substr(0, begin);
      const end = body.indexOf(
        this.separator.bottom,
        begin + this.separator.top.length
      );

      if (end !== -1) {
        const after = body.substr(end + this.separator.bottom.length);
        return [before.trim(), after.trim()].filter(Boolean).join('\n');
      }

      return body;
    }

    return body;
  }

  buildBodyContent(section) {
    return values(section)
      .map(section => {
        return isString(section)
          ? { position: Infinity, content: section }
          : section;
      })
      .sort((a, b) => {
        if (a.position > b.position) {
          return 1;
        } else if (a.position < b.position) {
          return -1;
        } else {
          return 0;
        }
      })
      .map(section => section.content)
      .join('\n');
  }

}

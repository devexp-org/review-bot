import { cloneDeep, isString, values } from 'lodash';

export default class PullRequestGitHub {

  /**
   * @constructor
   *
   * @param {Object} github
   * @param {Object} [options]
   * @param {String} [options.separator.top] - top body separator
   * @param {String} [options.separator.bottom] - bottom body separator
   */
  constructor(github, options) {
    this.github = github;

    this.separator = {
      top: options.separator && options.separator.top ||
        '<div id="devexp-top"></div><hr>',
      bottom: options.separator && options.separator.bottom ||
        '<div id="devexp-bottom"></div>'
    };
  }

  loadPullRequestFromGitHub(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.owner,
        repo: local.repository.name,
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
    return new Promise((resolve, reject) => {
      const req = {
        user: local.owner,
        repo: local.repository.name,
        body: local.body,
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
        user: local.owner,
        repo: local.repository.name,
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

    const bodyContentWithSeparators =
      this.separator.top + bodyContent + this.separator.bottom;

    local.body = this.cleanPullRequestBody(local.body) +
      bodyContentWithSeparators;
  }

  cleanPullRequestBody(body) {
    const start = body.indexOf(this.separator.top);

    if (start !== -1) {
      const before = body.substr(0, start);
      const end = body.indexOf(this.separator.bottom, start + 1);

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
      .map(section => '<div>' + section.content + '</div>')
      .join('');
  }

}

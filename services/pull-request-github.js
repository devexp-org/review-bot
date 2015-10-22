'use strict';

import _ from 'lodash';

export class PullRequestGitHub {

  /**
   * @constructor
   *
   * @param {Object} pullRequest - pull request model
   * @param {Object} github - github API module
   * @param {Object} [options]
   * @param {String} [options.separator.top] - top body separator
   * @param {String} [options.separator.bottom] - bottom body separator
   */
  constructor(pullRequest, github, options) {
    this.github = github;
    this.pullRequest = pullRequest;

    this.separator = {
      top: options.separator && options.separator.top ||
        '<div id="devkit-top"></div><hr>',
      bottom: options.separator && options.separator.bottom ||
        '<div id="devkit-bottom"></div>'
    };
  }

  loadPullRequest(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.organization.login,
        repo: local.repository.name,
        number: local.number
      };

      this.github.pullRequests.get(req, (error, remote) => {
        error ?
          reject(new Error('Cannot receive a pull request from github:\n' + error)) :
          resolve(remote);
      });
    });
  }

  savePullRequest(remote) {
    return new Promise((resolve, reject) => {
      this.pullRequest
        .findById(remote.id)
        .then(local => {
          if (!local) {
            return reject(new Error('Pull request `' + remote.id + '` not found'));
          }

          local.set(remote);
          local.save(error => {
            error ?
              reject(new Error('Cannot save a pull request from github:\n' + error)) :
              resolve(local);
          });
        });
    });
  }

  updatePullRequest(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.organization.login,
        repo: local.repository.name,
        body: local.body,
        title: local.title,
        number: local.number
      };

      this.github.pullRequests.update(req, error => {
        if (error) {
          reject(new Error('Cannot update a pull request description:\n' + error));
        }

        resolve(local);
      });
    });
  }

  loadPullRequestFiles(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: local.organization.login,
        repo: local.repository.name,
        number: local.number,
        per_page: 100
      };

      this.github.pullRequests.getFiles(req, (error, files) => {
        error ?
          reject(new Error('Cannot receive files from the pull request:\n' + error)) :
          resolve(files.map(file => { delete file.patch; return file; }));
      });
    });
  }

  syncPullRequest(local) {
    return this
      .loadPullRequest(local)
      .then(remote => this.savePullRequest(remote));
  }

  setBodySection(id, sectionId, content, pos = 99999) {
    return this.pullRequest
      .findById(id)
      .then(local => {
        if (!local) {
          return Promise.reject(new Error(`Pull request '${id}' not found`));
        }

        return this.syncPullRequest(local);
      })
      .then(local => {
        const section = _.clone(local.get('section') || {});
        section[sectionId] = { content, pos };
        local.section = section;

        this.fillPullRequestBody(local);

        return local.save();
      })
      .then(this.updatePullRequest.bind(this));
  }

  buildBodyContent(section) {
    return _.values(section)
      .map(s => { return s.pos ? s : { pos: 99999, content: s }; })
      .sort((a, b) => a.pos > b.pos ? 1 : a.pos < b.pos ? -1 : 0) // eslint-disable-line
      .map(s => '<div>' + s.content + '</div>')
      .join('');
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
        return before.trim() + after.trim();
      }

      return before.trim();
    }

    return body;
  }

}

export default function (options, imports) {

  const model = imports.model;
  const github = imports.github;

  const service = new PullRequestGitHub(
    model.get('pull_request'),
    github,
    options
  );

  return Promise.resolve({ service });

}

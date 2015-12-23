'use strict';

import _ from 'lodash';
import { getUserLogin } from '../modules/model/pull_request';

export class PullRequestGitHub {

  /**
   * @constructor
   *
   * @param {Object} [options]
   * @param {String} [options.separator.top] - top body separator
   * @param {String} [options.separator.bottom] - bottom body separator
   * @param {Object} github - github api client
   * @param {Object} pullRequest - pull request mongoose model
   */
  constructor(options, github, pullRequest) {
    this.github = github;
    this.pullRequest = pullRequest;

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
        user: getUserLogin(local),
        repo: local.repository.name,
        number: local.number
      };

      this.github.pullRequests.get(req, (err, remote) => {
        err
          ? reject(new Error('Cannot receive a pull request from github:\n' + err))
          : resolve(remote);
      });
    });
  }

  savePullRequestToDatabase(remote) {
    return new Promise((resolve, reject) => {
      this.pullRequest
        .findById(remote.id)
        .then(local => {
          if (!local) {
            return reject(new Error(`Pull request '${remote.id}' not found`));
          }

          local.set(remote);

          local.save(err => {
            err
              ? reject(new Error('Cannot save a pull request from github:\n' + err))
              : resolve(local);
          });
        });
    });
  }

  updatePullRequestOnGitHub(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: getUserLogin(local),
        repo: local.repository.name,
        body: local.body,
        title: local.title,
        number: local.number
      };

      this.github.pullRequests.update(req, err => {
        err
          ? reject(new Error('Cannot update a pull request:\n' + err))
          : resolve(local);
      });
    });
  }

  loadPullRequestFiles(local) {
    return new Promise((resolve, reject) => {
      const req = {
        user: getUserLogin(local),
        repo: local.repository.name,
        number: local.number,
        per_page: 100
      };

      this.github.pullRequests.getFiles(req, (err, files) => {
        err
          ? reject(new Error('Cannot receive files from the pull request:\n' + err))
          : resolve(files.map(file => { delete file.patch; return file; }));
      });
    });
  }

  syncPullRequest(local) {
    return this
      .loadPullRequestFromGitHub(local)
      .then(this.savePullRequestToDatabase.bind(this));
  }

  setBodySection(id, sectionId, content, position = Infinity) {
    return this.pullRequest
      .findById(id)
      .then(local => {
        if (!local) {
          return Promise.reject(new Error(`Pull request '${id}' not found`));
        }

        return this.syncPullRequest(local);
      })
      .then(local => {
        const section = _.cloneDeep(local.get('section') || {});

        section[sectionId] = { content, position };

        local.set('section', section);

        this.fillPullRequestBody(local);

        return local.save();
      })
      .then(this.updatePullRequestOnGitHub.bind(this));
  }

  fillPullRequestBody(local) {
    const bodyContent = this.buildBodyContent(local.section);

    const bodyContentWithSeparators =
      '\n' + this.separator.top +
      bodyContent +
      this.separator.bottom + '\n';

    local.body = this.cleanPullRequestBody(local.body) +
      bodyContentWithSeparators;
  }

  buildBodyContent(section) {
    return _(section)
      .values()
      .map(section =>
        section.content
          ? section
          : { position: Infinity, content: section }
      )
      .sortBy('position')
      .map(section => '<div>' + section.content + '</div>')
      .value()
      .join('');
  }

  cleanPullRequestBody(body) {
    const start = body.indexOf(this.separator.top);

    if (start !== -1) {
      const before = body.substr(0, start);
      const end = body.indexOf(this.separator.bottom, start + 1);

      if (end !== -1) {
        const after = body.substr(end + this.separator.bottom.length);
        return (before.trim() + '\n' + after.trim()).trim();
      }

    }

    return body.trim();
  }

}

export default function (options, imports) {

  return new PullRequestGitHub(
    options,
    imports.github,
    imports.model.get('pull_request')
  );

}

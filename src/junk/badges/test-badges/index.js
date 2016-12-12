import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import TestBadgeBuilder, {
  TESTS_NOT_EXISTS,
  TESTS_EXISTS,
  TESTS_CHANGE
} from './class';

export default function setup(options, imports) {

  const queue = imports.queue;
  const events = imports.events;
  const logger = imports.logger.getLogger('badges.test');
  const localRepo = imports['local-repo'];
  const testFileResolvers = imports['test-file-resolver'];
  const pullRequestGitHub = imports['pull-request-github'];

  const builder = new TestBadgeBuilder(options.url);

  const service = {

    _getResolver(project) {
      const org = project.split('/')[0];

      return testFileResolvers[project] || testFileResolvers[`${org}/*`];
    },

    /**
     * Returns path for test file related to given file
     *
     * @param {String} filename
     * @param {String} project
     *
     * @return {String[]}
     */
    _getTestFilePath: function (filename, project) {
      const resolver = this._getResolver(project);

      if (resolver.isPriv(filename)) {
        return resolver.getPriv(filename);
      } else if (resolver.isGemini(filename)) {
        return resolver.getGemini(filename);
      } else if (resolver.isClient(filename)) {
        return resolver.getClient(filename);
      }

      return [];
    },

    /**
     * Clone repo if necessary
     *
     * @param {String} project
     *
     * @return {Promise}
     */
    _checkRepo: function (project) {
      return new Promise((resolve, reject) => {
        fs.lstat(localRepo.getRepoLocalPath(project), (err) => {
          if (err) {
            localRepo.clone(project).then(resolve, reject);
          }

          resolve();
        });
      });
    },

    /**
     * Check file existance in repo
     *
     * @param {String} file
     * @param {String} project
     *
     * @return {Promise.<Boolean>}
     */
    _checkFile: function (file, project) {
      const filepath = path.join(localRepo.getRepoLocalPath(project), file);

      return new Promise(resolve => fs.lstat(filepath, (err) => resolve(!err)));
    },

    /**
     * Returns array of paths to tests
     *
     * @param {String} files
     * @param {String} project
     *
     * @return {String[]}
     */
    _getTests: function (files, project) {
      return _.flatten(files.map(file => this._getTestFilePath(file, project)));
    },

    /**
     * Check exist tests
     *
     * @param {String[]} files
     * @param {String} project
     *
     * @return {Promise}
     */
    _checkExistsTests: function (files, project) {
      return this._checkRepo(project)
        .then(() => {
          const promise = this
            ._getTests(files, project)
            .map(path => this._checkFile(path, project));

          return Promise.all(promise);
        });
    },

    /**
     * Check status for files from current pull request
     *
     * @param {String} files
     * @param {String} project
     *
     * @return {Number}
     */
    _getStatus: function (files, project) {
      // TODO move regexp to resolver
      const tests = files.filter(filename => {
        return (/\.test\.js|\.test-priv\.js|gemini|e2e/).test(filename);
      });

      if (tests.length) {
        return Promise.resolve(TESTS_CHANGE);
      }

      return this._checkExistsTests(files, project)
        .then(result => {
          return (result.indexOf(false) === -1)
            ? TESTS_EXISTS
            : TESTS_NOT_EXISTS;
        });
    },

    /**
     * Call method for updating pull request body with test badges.
     *
     * @param {Object} payload
     *
     * @return {Promise}
     */
    updateBadges: function (payload) {

      const repoName = payload.pullRequest.repository.full_name;
      const pullRequest = payload.pullRequest;
      const repoLocalPath = localRepo.getRepoLocalPath(repoName);

      const files = _.map(pullRequest.files, 'filename')
        .map(file => path.join(repoLocalPath, file));

      const resolver = this._getResolver(repoName);

      if (!resolver) {
        return Promise.reject(new Error(
          `Cannot find resolver for ${repoName}`
        ));
      }

      let filesByTestType = { priv: [], client: [], gemini: [] };

      // group tests by type
      _.forEach(files, (item) => {
        if (resolver.isPriv(item)) {
          filesByTestType.priv.push(item);
        }

        if (resolver.isGemini(item)) {
          filesByTestType.gemini.push(item);
        }

        if (resolver.isClient(item)) {
          filesByTestType.client.push(item);
        }
      });

      // remove unnecessary badges
      filesByTestType = Object.keys(filesByTestType).reduce((result, key) => {
        if (!_.isEmpty(filesByTestType[key])) {
          result[key] = filesByTestType[key];
        }
        return result;
      }, {});

      return Promise
        .all(_.map(filesByTestType, (item, type) => {
          return this._getStatus(item, repoName)
            .then(status => { return { type, status }; });
        }))
        .then(result => {
          return _.map(result, ({ type, status }) => {
            return builder.buildTestBadge(type, status);
          }).join(' ');
        })
        .then(body => {
          const badgeContent = builder.build(body);

          return queue.dispatch('pull-request#' + pullRequest.id, () => {
            pullRequestGitHub.setBodySection(
              pullRequest, 'test:badge', badgeContent, 75
            );

            return pullRequestGitHub.syncPullRequestWithGitHub(pullRequest);
          });
        });
    }

  };

  const updateBadges = (payload) => {
    service.updateBadges(payload).catch(logger.error.bind(logger));
  };

  events.on('review:updated', updateBadges);
  events.on('review:started', updateBadges);
  events.on('review:update_badges', updateBadges);
  events.on('github:pull_request:synchronize', updateBadges);

  return service;

}

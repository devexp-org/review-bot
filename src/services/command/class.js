import { forEach } from 'lodash';

export function buildRegExp(commandRE) {
  return new RegExp('(?:^|\\s)(?:' + commandRE + ')(?:\\s|$)', 'i');
}

export default class CommandDispatcher {

  /**
   * @constructor
   *
   * @param {Object} queue
   * @param {Object} teamManager
   * @param {Object} PullRequestModel
   */
  constructor(queue, teamManager, PullRequestModel) {
    this.store = [];

    this.queue = queue;
    this.teamManager = teamManager;
    this.PullRequestModel = PullRequestModel;
  }

  /**
   * Adds new command to store
   *
   * @param {Number} id
   * @param {Array.<RegExp>} test
   * @param {CommandHandler} handler
   */
  addCommand(id, test, handler) {
    this.store.push({
      id,
      test: [].concat(test),
      handler: this._wrapHandler(handler)
    });
  }

  _wrapHandler(handler) {
    return (command, payload, arglist) => {
      const pullId = payload.pullRequest.id;

      return this.queue.dispatch('pull-request#' + pullId, () => {
        return this.PullRequestModel
          .findById(pullId)
          .then(pullRequest => {
            payload.pullRequest = pullRequest;
            return handler(command, payload, arglist);
          })
          .then(pullRequest => pullRequest.save());
      });
    };
  }

  /**
   * Dispatch command to handler.
   *
   * @param {String} comment - user comment
   * @param {Object} payload - payload is passed as-is to handler
   *
   * @return {Promise}
   */
  dispatch(comment, payload) {

    const pullRequest = payload.pullRequest;

    return this.teamManager.findTeamByPullRequest(pullRequest)
      .then(team => {
        if (!team) {
          return Promise.reject(new Error(
            `Team is not found for pull request ${pullRequest}`
          ));
        }

        const promise = [];

        forEach(this.store, (command) => {

          const teamRegExp = team.getOption('command.regexp.' + command.id, []);
          const defaultRegExp = command.test;

          const allRegExp = [].concat(defaultRegExp, teamRegExp).map(buildRegExp);

          forEach(comment.split('\n'), (line) => {
            forEach(allRegExp, (test) => {
              const matches = line.match(test);
              if (matches && matches.length > 0) {
                const arglist = matches.slice(1);

                promise.push(command.handler(line.trim(), payload, arglist));
                return false; // break
              }
            });
          });

        });

        return Promise.all(promise);
      });
  }

}

/**
 * @typedef {Object} Command
 *
 * @property {String} id - command id
 * @property {Array.<RegExp>} test - check that the command is present
 * @property {CommandHandler} handler - handler for command
 */

/**
 * @callback CommandHandler
 *
 * @param {String} comment - comment line with command.
 * @param {Object} payload - issue payload from github.
 * @param {Array}  arglist - parsed arguments for command.
 */

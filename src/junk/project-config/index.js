import _ from 'lodash';

export default function setup(options, imports) {

  const logger = imports.logger.getLogger('pconfig');

  const service = {

    /**
     * Up members rank
     *
     * @param {Array} team
     * @param {Array} members
     * @return {Array}
     * @private
     */
    _rankAndMarkSpecial: function (team, members) {
      if (!members.length) {
        return team;
      }

      team.forEach(user => {
        if (members.includes(user.login)) {
          user.rank += 1000;
          user.special = true;
        }
      });

      return team;
    },

    /**
     * Check users and get unavilabe
     *
     * @param {Object} review
     * @param {Object} patch
     * @return {Promise} resolve review and patch
     * @private
     */
    _prepareReviewers: function (review, patch) {
      const members = _.map(patch.addMembers, 'login');

      if (!members || !members.length) {
        return Promise.resolve({ review, patch });
      }

      const requiredMembersLogins = members.filter(user => {
        return !_.map(review.members, 'login').includes(user);
      });

      if (requiredMembersLogins.length) {
        return this._getRequiredMembers(review, requiredMembersLogins)
          .then(review => {
            return { review, patch };
          });
      }

      return Promise.resolve({ review, patch });
    },

    /**
     * Apply all rules from config
     *
     * @param {Object} review
     * @param {Object} config
     * @return {Promise}
     * @private
     */
    _applyRules: function (review, config) {
      const patch = {
        addMembers: [],
        removeMembers: [],
        onlySpecial: false,
        totalCountEdited: false
      };

      const files = _.map(review.pullRequest.files, 'filename');

      // create patch from all rules
      _.forEach(config, (rule) => {
        _.forEach(rule.pattern, pattern => {
          if (this._matchSome(files, pattern)) {

            const usersToAdd = _.filter(rule.addMembers, (login) => {
              // exclude author of pull request
              return login !== review.pullRequest.user.login;
            });
            const usersToRemove = rule.removeMembers;
            const userAddCount = rule.membersToAdd || 1;
            const onlySpecial = Boolean(rule.doNotChooseOther);

            if (!_.isEmpty(usersToAdd)) {
              patch.addMembers = patch.addMembers.concat(
                _.map(_.sample(usersToAdd, userAddCount), (login) => {
                  return { login, pattern };
                })
              );
            }

            if (!_.isEmpty(usersToRemove)) {
              patch.removeMembers = patch.removeMembers.concat(usersToRemove);
            }

            if (onlySpecial) {
              patch.onlySpecial = true;
            }

            logger.info(`Match pattern: ${rule.pattern}`);

            // break for lodash forEach
            return false;

          }
        });
      });

      // remove unnecessary users
      patch.addMembers = _.uniq(_.filter(patch.addMembers, (user) => {
        return !patch.removeMembers.includes(user.login);
      }), 'login');

      // prepare unexists reviewers and apply rules
      return this._prepareReviewers(review, patch);
    },

    /**
     * Exclude reviewers
     *
     * @param {Array} team
     * @param {Array} members
     * @return {Promise}
     * @private
     */
    _excludeReviewers: function (team, members) {
      return team.filter(user => members.includes(user.login))
        .map(user => { return { login: user.login, rank: -Infinity }; });
    },

    checkConfigRules: function (review) {
      return this._getConfig(review.pullRequest)
        .then(conf => this._applyRules(review, conf));
    },

    /**
     * Add random rank to every team member.
     *
     * @param {Review} review
     *
     * @return {Promise}
     */
    specialReviewers: function (review) {
      return this.checkConfigRules(review)
        .then(reviewData => {
          const { review, patch } = reviewData;

          // set varibles for total step
          review.onlySpecial = patch.onlySpecial;

          review.specialCount = patch.addMembers.length;

          logger.info(`Add reviewers from config: ${patch.addMembers}`);
          review.team = this._rankAndMarkSpecial(review.team, _.map(patch.addMembers, 'login'));

          logger.info(`Remove reviewers from config: ${patch.removeMembers}`);
          review.team = this._excludeReviewers(review.team, patch.removeMembers);

          return review;
        });
    }

  };

  return service;
}

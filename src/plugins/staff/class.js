import _ from 'lodash';

export default class Staff {

  /**
   * Init staff API wrapper.
   *
   * @constructor
   * @param {Object} request
   * @param {Object} options
   */
  constructor(request, options) {
    this._cache = {};

    this.request = request;

    this._options = options;
  }

  /**
   * Make a request to retrieve absence of user
   *
   * @param {String|Array} user - staff login
   *
   * @return {Promise}
   */
  apiAbsence(user) {
    user = this._getUserParam(user);

    const url = this._getCenterUrl(`absence_by_user/${user}`);
    const key = `apiAbsence:${user}`;
    const query = { fields: this._getFields('absence') };
    const expires = this._getCacheOption('apiAbsence', 3600);

    return this._request(url, { key, query, cache: expires });
  }

  /**
   * Make a request to retrieve user personal information
   *
   * @param {String|Array} user - staff login
   *
   * @return {Promise}
   */
  apiUserInfo(user) {
    user = this._getUserParam(user);

    const url = this._getCenterUrl(`user/${user}`);
    const key = `apiUserInfo:${user}`;
    const query = { fields: this._getFields('info') };
    const expires = this._getCacheOption('apiUserInfo', 86400);

    return this._request(url, { key, query, cache: expires });
  }

  /**
   * Make a request to retrieve user location
   *
   * @param {String|Array} user - staff login
   *
   * @return {Promise}
   */
  apiUserWhere(user) {
    user = this._getUserParam(user);

    const url = this._getCenterUrl(`user/${user}/where`);
    const key = `apiUserWhere:${user}`;
    const query = { fields: this._getFields('where') };
    const expires = this._getCacheOption('apiUserWhere', 3600);

    return this._request(url, { key, query, cache: expires });
  }

  /**
   * Make a request to retrieve user jabber status.
   *
   * @param {String|Array} user - staff login
   *
   * @return {Promise}
   */
  apiJabberStatus(user) {
    const url = this._getJabberUrl();
    const key = `apiJabberStatus:${this._getUserParam(user)}`;
    const query = { login: user };
    const expires = this._getCacheOption('apiJabberStatus', 3600);

    return this._request(url, { key, query, cache: expires });
  }

  /**
   * Make a request to retrieve the users of corresponding group
   *
   * @param {Number} groupId - id of group whose users need to return
   *
   * @return {Promise}
   */
  apiGroupMembers(groupId) {
    const url = this._getCenterUrl(`groups/${groupId}/all_members`);
    const key = `apiGroupMembers:${groupId}`;
    const query = { fields: this._getFields('group') };
    const expires = this._getCacheOption('getGroupMembers', 3600);

    return this._request(url, { key, query, cache: expires });
  }

  /**
   * Return users of group|groups specified in the config
   *
   * @param {Number|Array} groupId - staff id of group.
   *
   * @return {Promise}
   */
  getUsers(groupId) {
    const promise = [];

    if (!_.isArray(groupId)) {
      groupId = [groupId];
    }

    _.forEach(groupId, (id) => promise.push(this.apiGroupMembers(id)));

    return Promise.all(promise)
      .then(users => {
        users = _.flatten(users);

        const logins = users.map(user => user.login);

        const promise = [
          this.apiUserInfo(logins),
          this.apiUserWhere(logins),
          this.apiAbsence(logins),
          this.apiJabberStatus(logins)
        ];

        return Promise.all(promise)
          .then(values => {
            return _.map(users, (user) => {
              user = this._addAvatarAndUrl(user);

              return _.merge(
                user,
                _.find(values[0], { login: user.login }),
                {
                  where: _.find(values[1], { staff__login: user.login }),
                  absence: _.find(values[2], { staff__login: user.login }),
                  jabber: values[3][user.login]
                }
              );
            });
          });
      });
  }

  /**
   * Return avaliable users of group|groups specified in the config
   *
   * @param {Number|Array} groupId - staff id of group.
   *
   * @return {Promise}
   */
  getUsersInOffice(groupId) {
    const today = new Date();

    return this.getUsers(groupId)
      .then(users => {
        return users.filter(user => {
          return !user.absence ||
            new Date(user.absence.right_edge) - today < 0 ||
            user.absence.gap_type__name === 'trip';
        });
      });
  }

  /**
   * @private
   *
   * @param {String} url
   * @param {Object} options
   *
   * @return {Promise}
   */
  _request(url, options) {
    if (options.key && this._checkCache(options.key)) {
      return Promise.resolve(this._getCacheValue(options.key));
    }

    const params = {
      json: true,
      query: options.query,
      headers: { Authorization: `OAuth ${this._options.token}` }
    };

    return new Promise((resolve, reject) => {
      this.request(url, params, (err, data) => {
        err ? reject(err) : this._afterRequest(options, data, resolve);
      });
    });
  }

  /**
   * @private
   *
   * @param {String} key
   *
   * @return {Boolean}
   */
  _checkCache(key) {
    return this._cache[key] && this._cache[key].expires > Date.now();
  }

  /**
   * @private
   *
   * @param {String} key
   *
   * @return {Object}
   */
  _getCacheValue(key) {
    return this._cache[key] && this._cache[key].data;
  }

  /**
   * @private
   *
   * @param {Object} options
   * @param {Object} data
   * @param {Function} resolve
   */
  _afterRequest(options, data, resolve) {
    if (options.key && options.cache) {
      const cacheTime = options.cache * 1000;

      this._cache[options.key] = { data, expires: Date.now() + cacheTime };
    }

    resolve(data);
  }

  /**
   * @private
   *
   * @param {String} path
   *
   * @return {String}
   */
  _getCenterUrl(path) {
    return this._options.center_url + path + '.json';
  }

  /**
   * @private
   *
   * @return {String}
   */
  _getJabberUrl() {
    return this._options.jabber_url;
  }

  /**
   * @private
   *
   * @param {String} name
   *
   * @return {String|null}
   */
  _getFields(name) {
    if (
      this._options.fields &&
      this._options.fields[name] &&
      Array.isArray(this._options.fields[name])
    ) {
      return this._options.fields[name].join('|');
    }

    return null;
  }

  /**
   * @private
   *
   * @param {String} name
   * @param {Number} defaultValue
   *
   * @return {Number|null}
   */
  _getCacheOption(name, defaultValue) {
    if (this._options.cache && name in this._options.cache) {
      return parseInt(this._options.cache[name], 10);
    }

    return defaultValue;
  }

  /**
   * @private
   *
   * @param {Array|String} user
   *
   * @return {String}
   */
  _getUserParam(user) {
    if (Array.isArray(user)) {
      user = user.join('|');
    }

    return user;
  }

  /**
   * Add avatar and html_url to user. Mimic to github api user.
   *
   * @param {Object} user
   *
   * @return {Object}
   */
  _addAvatarAndUrl(user) {
    return _.assign({}, user, {
      html_url: `https://staff.yandex-team.ru/${user.login}`,
      avatar_url: `//center.yandex-team.ru/api/v1/user/${user.login}/avatar/100.jpg`
    });
  }

}

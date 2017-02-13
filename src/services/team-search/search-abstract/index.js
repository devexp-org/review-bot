export default class AbstractUserSearch {

  /**
   * Search user by login.
   *
   * @param {String} login
   *
   * @return {Promise.<User>}
   */
  findByLogin(login) {
    return Promise.reject(new Error('abstract method'));
  }

}

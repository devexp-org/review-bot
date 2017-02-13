import AbstractUserSearch from '../search-abstract/';

export default class YandexStaffSearch extends AbstractUserSearch {

  constructor(staff) {
    super();

    this.staff = staff;
  }

  /**
   * Add avatar and html_url to user. Mimic to github api user.
   *
   * @param {Object} user
   *
   * @return {Object}
   */
  toUser(user) {

    const account = user.login + '@yandex-team.ru';

    return {
      login: user.login,
      html_url: `https://staff.yandex-team.ru/${user.login}`,
      avatar_url: `//center.yandex-team.ru/api/v1/user/${user.login}/avatar/100.jpg`,
      contacts: [
        { id: 'email', account },
        { id: 'jabber', account }
      ]
    };

  }

  /**
   * @override
   */
  findByLogin(login) {
    return this.findStaffUser(login)
      .then(this.toUser.bind(this));
  }

  /**
   * Finds user by using STAFF API
   * @protected
   *
   * @param {String} login
   *
   * @return {Object}
   */
  findStaffUser(login) {
    return this.staff.apiUserInfo(login);
  }

}

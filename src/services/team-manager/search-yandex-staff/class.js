export default class YandexStaffUser
{

  constructor(staff) {
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
        { id: 'jabber', account },
        { id: 'slack#serp', account }
      ]
    };

  }

  findUser(username) {
    return this.findStaffUser(username)
      .then(this.toUser.bind(this));
  }

  findStaffUser(username) {
    return this.staff
      .apiUserInfo(username)
      .then(this.toUser.bind(this));
  }

}

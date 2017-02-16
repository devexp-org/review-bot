import AbstractUserSearch from '../search-abstract';

export default class StaticSearch extends AbstractUserSearch {

  constructor(UserModel) {
    super();

    this.UserModel = UserModel;
  }

  /**
   * @override
   */
  findByLogin(login) {
    return this.UserModel.findByLogin(login);
  }

}

import StaticSearch from './class';

export default function setup(options, imports) {

  const UserModel = imports.model('user');

  return new StaticSearch(UserModel);

}

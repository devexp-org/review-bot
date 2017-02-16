import { merge } from '../app';
import { withTeamSearch } from '../team-search';
import { withTeamSearchStatic } from '../team-search/search-static';

export function withTeamManager(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        'team-manager': {
          path: './src/services/team-manager',
          dependencies: [
            'model',
            'team-search'
          ]
        }
      }
    }, config);

    next(imports => {
      const UserModel = imports.model('user');
      const TeamModel = imports.model('team');

      const foo = new UserModel({ login: 'foo' });
      const bar = new UserModel({ login: 'bar' });

      return Promise.all([foo.save(), bar.save()])
        .then(() => {
          return TeamModel.findByName('test-team').then(team => {
            team.set({
              members: [foo, bar]
            });
            return team.save();
          });
        })
        .then(team => {
          imports.team = team;
          return imports;
        })
        .then(test);

    }, config, done);

  };

}

export function withTeamManagerSuite(next) {
  return withTeamSearchStatic(withTeamSearch(withTeamManager(next)));
}

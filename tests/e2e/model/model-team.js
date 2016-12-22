import { withModel } from '../model/';
import { merge, withApp } from '../app';

export function withTeamModel(next) {

  return function (test, config, done) {

    config = merge({
      services: {
        model: {
          options: {
            models: {
              team: 'model-team'
            }
          },
          dependencies: ['model-team']
        },
        'model-team': {
          path: './src/services/model/model-team'
        }
      }
    }, config);

    next(imports => {

      let team;
      const TeamModel = imports.model('team');

      return TeamModel
        .remove({})
        .then(() => {
          team = new TeamModel();

          team.set({
            name: 'test-team',
            driver: { name: 'static' },
            members: [],
            patterns: [],
            reviewConfig: {
              approveCount: 2,
              stepsOptions: {
                total: 3
              }
            }
          });

          return team.save();
        })
        .then(() => {
          imports.team = team;
          imports.TeamModel = TeamModel;

          return imports;
        })
        .then(test);

    }, config, done);

  };

}

describe('services/model/model-team', function () {

  const test = withTeamModel(withModel(withApp));

  it('should setup team model', function (done) {

    test(imports => {
      const team = imports.team;
      const TeamModel = imports.TeamModel;

      assert.property(team, 'members');
      assert.property(TeamModel, 'findByName');
      assert.property(TeamModel, 'findByNameWithMembers');

    }, {}, done);

  });

  describe('#findByName', function () {

    it('should return team filtered by name', function (done) {

      test(imports => {
        const TeamModel = imports.TeamModel;

        return Promise.resolve()
          .then(() => TeamModel.findByName('test-team'))
          .then(result => assert.equal(result.name, 'test-team'));
      }, {}, done);

    });

    it('should return null if team is not found', function (done) {

      test(imports => {
        const TeamModel = imports.TeamModel;

        return Promise.resolve()
          .then(() => TeamModel.findByName('non-existent-team'))
          .then(result => assert.isNull(result));
      }, {}, done);

    });

  });

});


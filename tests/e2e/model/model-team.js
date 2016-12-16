import { merge } from '../app';
import { withModel } from '../model';

export function withTeamCollection(test, config, done) {

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

  withModel(imports => {

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
            totalReviewers: 3
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

}

describe('services/model/model-team', function () {

  it('should setup team model', function (done) {

    withTeamCollection(imports => {
      const team = imports.team;
      const TeamModel = imports.TeamModel;

      assert.property(team, 'members');
      assert.property(TeamModel, 'findByName');
      assert.property(TeamModel, 'findByNameWithMembers');

    }, {}, done);

  });

  describe('#findByName', function () {

    it('should return team filtered by name', function (done) {

      withTeamCollection(imports => {
        const TeamModel = imports.TeamModel;

        return Promise.resolve()
          .then(() => TeamModel.findByName('test-team'))
          .then(result => assert.equal(result.name, 'test-team'));
      }, {}, done);

    });

    it('should return null if team is not found', function (done) {

      withTeamCollection(imports => {
        const TeamModel = imports.TeamModel;

        return Promise.resolve()
          .then(() => TeamModel.findByName('non-existent-team'))
          .then(result => assert.isNull(result));
      }, {}, done);

    });

  });

});


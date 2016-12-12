import service from '../index';
import teamMock from '../../../../services/team-dispatcher/__mocks__/team';

describe('plugins/team-dispatcher/yandex-mm', function () {

  const methods = [
    'getOption',
    'findTeamMember',
    'getMembersForReview'
  ];

  it('should be resolved to Team', function () {
    const options = {};
    const imports = {
      'team-mm-image-staff': teamMock(),
      'team-mm-video-staff': teamMock()
    };
    const team = service(options, imports);

    methods.forEach(function (method) {
      assert.property(team, method);
    });
  });

  it('the mock object should have the same methods', function () {
    const mock = teamMock();

    methods.forEach(function (method) {
      assert.property(mock, method);
    });
  });

});

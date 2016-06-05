import service from '../';
import teamMock from '../__mocks__/team';
import { pullRequestMock } from '../../model/pull-request/__mocks__/';

describe('services/team-dispatcher', function () {

  let imports, options, pullRequest;

  beforeEach(function () {

    options = {
      routes: [
        { team_1: ['github/*', 'jquery/*'] },
        { team_2: ['nodejs/*'] },
        { team_3: 'visionmedia/supertest' }
      ]
    };

    imports = {
      team_1: teamMock(),
      team_2: teamMock(),
      team_3: teamMock()
    };

    pullRequest = pullRequestMock();

  });

  it('should properly parse options', function () {

    pullRequest.repository.full_name = 'github/hubot';

    const dispatcher = service(options, imports);

    assert.property(dispatcher, 'findTeamByPullRequest');
    assert.property(dispatcher, 'findTeamNameByPullRequest');

    const result = dispatcher.findTeamNameByPullRequest(pullRequest);

    assert.equal(result, 'team_1');

  });

  it('should throw an error if routes are not given', function () {
    delete options.routes;

    assert.throws(() => service(options, imports), /routes/i);
  });

  it('should throw an error if source is not given', function () {
    delete imports.team_1;

    assert.throws(() => service(options, imports), /team_1/i);
  });

});

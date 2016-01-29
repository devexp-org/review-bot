import service from '../../choose-team';

describe('services/choose-team', function () {

  let run, imports, options, pullRequest;

  beforeEach(function () {
    imports = {
      team_github_1: { getTeam: sinon.stub(), getMember: sinon.stub() },
      team_github_2: { getTeam: sinon.stub(), getMember: sinon.stub() },
      team_config_1: { getTeam: sinon.stub(), getMember: sinon.stub() }
    };

    options = {
      routes: [
        { team_github_1: ['github/*', 'jquery/*'] },
        { team_github_2: ['nodejs/*'] },
        { team_config_1: 'devexp-org/devexp' }
      ]
    };

    pullRequest = {
      repository: {
        full_name: ''
      }
    };

    run = function () {
      return service(options, imports);
    };

  });

  it('should correct parse options', function () {
    pullRequest.repository.full_name = 'github/hubot';

    const choose = run();

    assert.property(choose, 'findByPullRequest');

    choose.findByPullRequest(pullRequest);
    assert.called(imports.team_github_1.getTeam);

  });

  it('should throw an error if routes is not provided', function (done) {

    delete options.routes;

    try {
      run();
      assert.fail('it should fail');
    } catch (e) {
      assert.instanceOf(e, Error);
      done();
    }

  });

  it('should throw an error if source is not provided', function (done) {

    delete imports.team_config_1;

    try {
      run();
      assert.fail('it should fail');
    } catch (e) {
      assert.instanceOf(e, Error);
      assert.match(e.message, /team_config_1/);
      done();
    }

  });

});

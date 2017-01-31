import { GitHubDriverFactory } from '../class';

import teamManagerMock from '../../__mocks__/';
import { teamMock } from '../../../model/model-team/__mocks__/';
import githubMock from '../../../github/__mocks__/';

describe('services/team-manager/driver-github/class', function () {

  let team, github, factory, config, driver, manager;

  beforeEach(function () {
    config = {
      orgName: 'nodejs'
    };

    team = teamMock();

    manager = teamManagerMock();

    github = githubMock();

    factory = new GitHubDriverFactory(github);
  });

  it('should be resolved to StaticDriver', function () {
    driver = factory.makeDriver(team, manager, config);

    assert.property(driver, 'getOption');
    assert.property(driver, 'getCandidates');
  });

  it('should throw an error if `orgNmae` is not given', function () {
    assert.throws(() => factory.makeDriver(team, manager, {}), /orgName/);
  });

  it('should use method `getMembers` to obtain a team if slug is not given', function (done) {
    driver = factory.makeDriver(team, manager, config);

    github.orgs.getMembers.callsArgWith(1, null, []);

    driver.getCandidates()
      .then(() => assert.calledWith(
        github.orgs.getMembers,
        sinon.match({ org: 'nodejs' })
      ))
      .then(done, done);
  });

  it('should use method `getTeamMembers` to obtain a team if slug is given', function (done) {
    config.slugName = 'devs';

    driver = factory.makeDriver(team, manager, config);

    github.orgs.getTeams
      .callsArgWith(1, null, [{ id: 42, slug: 'devs' }]);
    github.orgs.getTeamMembers
      .callsArgWith(1, null, []);

    driver.getCandidates()
      .then(() => assert.calledWith(
        github.orgs.getTeamMembers,
        sinon.match({ id: 42 })
      ))
      .then(done, done);
  });

  describe('#getTeamId', function () {

    beforeEach(function () {
      config.slugName = 'devs';

      driver = factory.makeDriver(team, manager, config);
    });

    it('should rejected promise if github return an error', function (done) {
      github.orgs.getTeams
        .callsArgWith(1, new Error('just error'));

      driver.getTeamId('github', 'devs')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

    it('should rejected promise if team is not found', function (done) {
      github.orgs.getTeams
        .callsArgWith(1, null, []);

      driver.getTeamId('github', 'devs')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /not found/))
        .then(done, done);
    });

  });

  describe('#getCandidates', function () {

    beforeEach(function () {
      config.slugName = 'devs';

      driver = factory.makeDriver(team, manager, config);
    });

    it('should rejected promise if github return an error', function (done) {
      github.orgs.getMembers
        .callsArgWith(1, new Error('just error'));

      driver.getMembersByOrgName('github')
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

  });

  describe('#getMembersByTeamId', function () {

    beforeEach(function () {
      config.slugName = 'devs';

      driver = factory.makeDriver(team, manager, config);
    });

    it('should rejected promise if github return an error', function (done) {
      github.orgs.getTeamMembers
        .callsArgWith(1, new Error('just error'));

      driver.getMembersByTeamId(1)
        .then(() => assert.fail())
        .catch(e => assert.match(e.message, /just error/))
        .then(done, done);
    });

  });

  describe('#config', function () {

    it('should return driver config', function () {
      assert.isObject(factory.config());
    });

  });

});

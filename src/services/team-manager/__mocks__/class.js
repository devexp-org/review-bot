import teamDriverMock from './team-driver';

export default function mock(teamDriver) {

  teamDriver = teamDriver || teamDriverMock();

  return {

    getTeams: sinon.stub().returns(Promise.resolve([])),

    getRoutes: sinon.stub().returns(Promise.resolve([])),

    findTeamByName: sinon.stub().returns(Promise.resolve(teamDriver)),

    findTeamByPullRequest: sinon.stub().returns(Promise.resolve(teamDriver))

  };

}

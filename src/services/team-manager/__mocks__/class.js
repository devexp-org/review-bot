import { abstractDriverMock } from '../driver-abstract/__mocks__/';

export default function mock(teamDriver) {

  return {
    getTeams: sinon.stub().returns(Promise.resolve([])),

    getRoutes: sinon.stub().returns(Promise.resolve([])),

    getDrivers: sinon.stub().returns([]),

    getTeamDriver: sinon.stub().returns(Promise.reject()),

    findTeamMember: sinon.stub().returns(Promise.reject()),

    findTeamByPullRequest: sinon.stub()
      .returns(Promise.resolve(teamDriver || abstractDriverMock()))
  };

}

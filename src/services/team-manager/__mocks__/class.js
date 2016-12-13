import { staticDriverMock } from '../driver-static/__mocks__/';

export default function mock() {

  return {
    getTeams: sinon.stub().returns(Promise.resolve([])),

    getRoutes: sinon.stub().returns(Promise.resolve([])),

    getDrivers: sinon.stub().returns([]),

    getTeamDriver: sinon.stub().returns(Promise.reject()),

    findTeamByPullRequest: sinon.stub()
      .returns(Promise.resolve(staticDriverMock()))
  };

}

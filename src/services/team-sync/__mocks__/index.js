import { abstractDriverMock } from '../driver-abstract/__mocks__/';

export default function mock(teamDriver) {

  return {

    syncUser: sinon.stub().returns(Promise.resolve()),

    syncTeam: sinon.stub().returns(Promise.resolve()),

    getDrivers: sinon.stub().returns([]),

    getTeamDriver: sinon.stub().returns(
      Promise.resolve(teamDriver || abstractDriverMock())
    )

  };

}

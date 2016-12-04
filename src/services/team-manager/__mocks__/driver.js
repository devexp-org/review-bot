export function driverMock() {

  return {
    makeDriver: sinon.stub().returns(driverFrontEndMock())
  };

}

export function driverFrontEndMock() {

  return {
    getOption: sinon.stub().returnsArg(1),

    findTeamMember: sinon.stub().returns(Promise.resolve()),

    getMembersForReview: sinon.stub().returns(Promise.resolve([]))
  };

}

export default driverFrontEndMock;

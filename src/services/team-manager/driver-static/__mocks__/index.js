export function staticDriverMock() {

  return {
    getOption: sinon.stub().returnsArg(1),

    getCandidates: sinon.stub().returns(Promise.resolve([])),

    findTeamMember: sinon.stub().returns(Promise.resolve())
  };

}

export function staticDriverFactoryMock() {

  return {
    makeDriver: sinon.stub().returns(staticDriverMock())
  };

}

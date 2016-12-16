export function abstractDriverMock() {

  return {
    getOption: sinon.stub().returnsArg(1),

    getCandidates: sinon.stub().returns(Promise.resolve([])),

    findTeamMember: sinon.stub().returns(Promise.resolve(null))
  };

}

export function abstractDriverFactoryMock() {

  return {
    name: sinon.stub().returns('name'),

    config: sinon.stub().returns({}),

    makeDriver: sinon.stub().returns(abstractDriverMock())
  };

}

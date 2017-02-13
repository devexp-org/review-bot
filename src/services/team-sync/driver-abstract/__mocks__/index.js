export function abstractDriverMock() {

  return {
    getMembers: sinon.stub().returns(Promise.resolve([]))
  };

}

export function abstractDriverFactoryMock() {

  return {
    config: sinon.stub().returns({}),

    makeDriver: sinon.stub().returns(abstractDriverMock())
  };

}

import abstractTransportMock from '../transport-abstract/__mocks__/';

export default function mock() {

  return {
    sendMessage: sinon.stub().returns(Promise.resolve()),
    getTransports: sinon.stub().returns([])
  };

}

export { abstractTransportMock as transportMock };

export default function mock() {

  return {
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    getLogger: sinon.stub().returnsThis()
  };

}

mock.spy = function (object) {
  sinon.spy(object, 'info');
  sinon.spy(object, 'warn');
  sinon.spy(object, 'error');
  sinon.spy(object, 'getLogger');

  return object;
};

mock.verify = function (mock) {

  ['info', 'warn', 'error'].forEach(method => {
    if (mock[method].called) {
      const stringOrError = sinon.match.string.or(sinon.match.instanceOf(Error));
      assert.alwaysCalledWith(mock[method], stringOrError);
    }
  });

  if (mock.getLogger.called) {
    assert.alwaysCalledWithExactly(mock.getLogger, sinon.match.string);
  }

};

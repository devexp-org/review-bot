export default function mock() {

  return {
    on: sinon.stub(),
    off: sinon.stub(),
    once: sinon.stub(),
    emit: sinon.stub(),
    emitAsync: sinon.stub().returns(Promise.resolve()),
    addListener: sinon.stub(),
    removeListener: sinon.stub()
  };

}

mock.spy = function (object) {

  sinon.spy(object, 'on');
  sinon.spy(object, 'off');
  sinon.spy(object, 'once');
  sinon.spy(object, 'emit');
  sinon.spy(object, 'emitAsync');
  sinon.spy(object, 'addListener');
  sinon.spy(object, 'removeListener');

  return object;

};

mock.verify = function (mock) {

  ['on', 'off', 'once', 'addListener', 'removeListener'].forEach(method => {
    if (mock[method].called) {
      assert.alwaysCalledWith(
        mock[method],
        sinon.match.string,
        sinon.match.func
      );
    }
  });

  if (mock.emit.called) {
    assert.alwaysCalledWith(mock.emit, sinon.match.string);
  }

  if (mock.emitAsync.called) {
    assert.alwaysCalledWithExactly(mock.emitAsync, sinon.match.string);
    assert.alwaysReturned(mock.emitAsync, sinon.match.instanceOf(Promise));
  }

};

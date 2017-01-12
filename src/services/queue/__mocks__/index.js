export default function mock() {

  return {
    enqueue: sinon.stub().returns(Promise.resolve()),
    dispatch: sinon.stub().returns(Promise.resolve())
  };

}

mock.spy = function (object) {
  sinon.spy(object, 'enqueue');
  sinon.spy(object, 'dispatch');

  return object;
};

mock.verify = function (mock) {

  if (mock.enqueue.called) {
    assert.alwaysCalledWithExactly(
      mock.enqueue,
      sinon.match.string,
      sinon.match.func
    );

    assert.alwaysReturned(mock.enqueue, sinon.match.instanceOf(Promise));
  }

  if (mock.dispatch.called) {
    assert.alwaysCalledWithExactly(
      mock.dispatch,
      sinon.match.string,
      sinon.match.func
    );

    assert.alwaysReturned(mock.dispatch, sinon.match.instanceOf(Promise));
  }

};

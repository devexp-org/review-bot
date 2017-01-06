export default function mock() {

  return {
    enqueue: sinon.stub().returns(Promise.resolve()),
    dispatch: sinon.stub().returns(Promise.resolve())
  };

}

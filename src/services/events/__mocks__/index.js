export default function mock() {

  return {
    on: sinon.stub(),
    once: sinon.stub(),
    emit: sinon.stub(),
    emitAsync: sinon.stub(),
    addListener: sinon.stub(),
    removeListener: sinon.stub()
  };

}

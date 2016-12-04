export default function mock() {

  return {
    log: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
    getLogger: sinon.stub().returnsThis()
  };

}

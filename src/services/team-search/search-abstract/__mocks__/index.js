export default function mock() {

  return {
    findByLogin: sinon.stub().returns(Promise.resolve(null))
  };

}

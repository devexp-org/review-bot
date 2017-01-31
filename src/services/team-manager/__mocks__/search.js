export default function mock() {

  return {
    findUser: sinon.stub().returns(Promise.resolve(null))
  };

}

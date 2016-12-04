export default function mock() {

  return {
    dispatch: sinon.stub().returns(Promise.resolve())
  };

}

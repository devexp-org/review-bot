export default function mock() {

  return {
    getDrivers: sinon.stub().returns([]),

    findByLogin: sinon.stub().returns(Promise.resolve(null))
  };

}

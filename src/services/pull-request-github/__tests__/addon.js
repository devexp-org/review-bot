import service from '../addon';

describe('services/pull-request-github/addon', function () {

  it('should extend pull request schema', function () {
    const schema = {};
    schema.add = sinon.stub();

    const plugin = service();
    plugin(schema);

    assert.calledWith(schema.add, { section: {} });
  });

});

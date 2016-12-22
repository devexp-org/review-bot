import service from '../addon';
import schemaMock from '../../../services/model/__mocks__/schema';

describe('plugins/complexity/addon', function () {

  let model, plugin;

  beforeEach(function () {
    model = schemaMock();

    plugin = service();

    plugin(model);
  });

  it('should setup save hook', function (done) {

    const context = {
      additions: 100,
      deletions: 20,
      commits: 1
    };

    model.pre.callArgOnWith(1, context, function () {
      assert.equal(context.complexity, 25);
      done();
    });

  });

  it('should extend pull request schema', function () {
    assert.calledWith(model.add, { complexity: sinon.match.object });
  });

});

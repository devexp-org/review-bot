import commentTransformer from '../comment';

describe('modules/config/transformers/comment', function () {

  let transformer;

  beforeEach(function () {
    transformer = commentTransformer();
  });

  it('should parse #comment directive in object key', function () {
    const config = { port: 80, '#comment:test': 'comment' };
    const result = transformer(config);

    assert.deepEqual(result, { port: 80 });
  });

  it('should parse #comment directive in array value', function () {
    const config = { port: 80, params: [true, '#comment:test'] };
    const result = transformer(config);

    assert.deepEqual(result, { port: 80, params: [true] });
  });

});

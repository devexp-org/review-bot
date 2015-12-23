import service from '../../queue';

describe('services/queue', function () {

  it('should be resolved to Queue', function () {

    const queue = service();

    assert.property(queue, 'enqueue');
    assert.property(queue, 'dispatch');

  });

});

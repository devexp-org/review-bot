import service from '../../events';

describe('services/events', function () {

  it('should be resolved to EventEmitter', function () {

    const emitter = service();

    assert.property(emitter, 'on');
    assert.property(emitter, 'once');
    assert.property(emitter, 'emit');
    assert.property(emitter, 'addListener');
    assert.property(emitter, 'removeListener');

  });

});

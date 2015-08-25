import service from '../../events';

describe('service/events', function () {

  it('should be resolved to EventEmitter', function (done) {

    service()
      .then(result => {
        const emitter = result.service;

        assert.property(emitter, 'on');
        assert.property(emitter, 'once');
        assert.property(emitter, 'emit');
        assert.property(emitter, 'addListener');
        assert.property(emitter, 'removeListener');

        done();
      })
      .catch(done);

  });

});

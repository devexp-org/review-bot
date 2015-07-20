describe('modules/events', function () {
    var events = require('../');

    it('should subscribe to event', function (done) {
        events.on('test:event', function () {
            done();
        });

        events.emit('test:event');
    });

    it('should unsubscribe from event', function (done) {
        var handler = sinon.stub();

        events.on('test2:event', handler);
        events.off('test2:event', handler);

        events.on('test3:event', function () {
            assert.notCalled(handler);
            done();
        });

        events.emit('test2:event');
        events.emit('test3:event');
    });

    it('should emit event with and pass all arguments', function (done) {
        var arg1 = 1;
        var arg2 = {};

        events.on('test4:event', function (a1, a2) {
            assert.equal(arg1, a1);
            assert.equal(arg2, a2);
            done();
        });

        events.emit('test4:event', arg1, arg2);
    });
});

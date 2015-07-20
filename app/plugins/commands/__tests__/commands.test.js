describe('app/plugins/commands', function () {
    var events = require('app/core/events');
    var options, bodyList, commandHandler;

    beforeEach(function () {
        commandHandler = sinon.stub();

        bodyList = [
            { comment: { body: '/command arg1 arg2' } },
            { comment: { body: '/command arg3 arg4\r\n/command arg5 arg6' } }
        ];

        options = {
            events: ['test:command'],
            commands: [
                {
                    test: /^\/command(\W|$)/,
                    handlers: [commandHandler]
                }
            ]
        };

        require('../')(options);
    });

    it('should handle command', function () {
        events.emit('test:command', bodyList[0]);

        assert.calledOnce(commandHandler);
        assert.calledWith(commandHandler, ['arg1', 'arg2'], bodyList[0]);
    });

    it('should handle multiline comment and extract command from new lines', function () {
        events.emit('test:command', bodyList[1]);

        assert.calledWith(commandHandler, ['arg3', 'arg4'], bodyList[1]);
        assert.calledWith(commandHandler, ['arg5', 'arg6'], bodyList[1]);
    });
});

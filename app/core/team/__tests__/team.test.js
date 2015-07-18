describe('app/core/team', function () {
    var team = require('../');
    var transport;

    beforeEach(function () {
        transport = sinon.stub().returns(Promise.resolve([1, 2, 3]));
    });

    it('should be rejected if there is no team for given repo', function () {
        team.init({});

        assert.isRejected(team.get());
    });

    it('should be rejected if there is no transport for team for given repo', function () {
        team.init({ 'org/team': {} });

        assert.isRejected(team.get());
    });

    it('should be resolved with team', function (done) {
        team.init({
            'org/repo': { transport: transport }
        });

        team.get('org/repo').then(function (t) {
            assert.deepEqual(t, [1, 2, 3]);
            done();
        }, done);
    });

    it('should pass params to transport', function (done) {
        team.init({
            'org/repo': {
                transport: transport,
                params: {
                    param1: '1'
                }
            }
        });

        team.get('org/repo').then(function () {
            assert.calledWith(transport, { param1: '1'});
            done();
        }, done);
    });
});

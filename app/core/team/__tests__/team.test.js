describe('app/core/team', function () {
    var team = require('../');
    var transport;

    beforeEach(function () {
        transport = sinon.stub().returns(Promise.resolve([1, 2, 3]));
    });

    describe('#get', function () {
        it('should be rejected if there is no team for given repo', function () {
            team.init({});

            return assert.isRejected(team.get());
        });

        it('should be rejected if there is no transport for team for given repo', function () {
            team.init({ 'org/team': {} });

            return assert.isRejected(team.get());
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
                    params: { param1: '1' }
                }
            });

            team.get('org/repo').then(function () {
                assert.calledWith(transport, { param1: '1' });
                done();
            }, done);
        });
    });

    describe('#getParams', function () {
        it('should throw an error if there is no team for given repo', function () {
            team.init();

            assert.throws(function () {
                team.getParams('org/repo');
            });
        });

        it('should return params associated with team', function () {
            team.init({
                'org/repo': {
                    transport: transport,
                    params: { param1: '1' }
                }
            });

            assert.deepEqual(team.getParams('org/repo'), { param1: '1' });
        });
    });
});

describe('app/plugins/team_transport_github', function () {
    var githubApi = { api: {} };
    var proxyquire = require('proxyquire');
    var transport, team, org;

    beforeEach(function () {
        team = [1, 2, 3, 4];
        org = [5, 6, 7, 7];

        githubApi.api.orgs = {
            getTeams: function (opts, cb) {
                cb(null, [{ slug: 'team1', id: 123 }]);
            },
            getTeamMembers: function (opts, cb) {
                cb(null, team);
            },
            getMembers: function (opts, cb) {
                cb(null, org);
            }
        };

        transport = proxyquire('../index.js', {
            'app/core/github/api': githubApi
        });
    });

    it('should rejected if there is no params passed', function () {
        return assert.isRejected(transport());
    });

    it('should rejected if there is no at least org in params', function () {
        return assert.isRejected(transport({}));
    });

    describe('no team passed', function () {
        it('should get all org members if team not specified', function (done) {
            transport({ org: 'org' })
                .then(function (t) {
                    assert.equal(t, org);

                    done();
                }, done);
        });
    });

    describe('if team passed', function () {
        it('should get team from github organisation team', function (done) {
            transport({ org: 'org', team: 'team1' })
                .then(function (t) {
                    assert.equal(t, team);

                    done();
                }, done);
        });

        it('should be rejected if there is no such team in github organisation', function () {
            return assert.isRejected(transport({ org: 'org', team: 'team2' }));
        });
    });
});

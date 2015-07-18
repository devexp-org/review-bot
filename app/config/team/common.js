module.exports = {
    'devexp-org/devexp': {
        transport: require('app/plugins/team_transport_github'),
        params: {
            org: 'devexp-org',
            team: 'owners'
        }
    }
};

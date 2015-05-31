module.exports = {
    github: {
        // required
        version: "3.0.0",
        // optional
        debug: true,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        // pathPrefix: "/api/v3", // for some GHEs; none for GitHub
        timeout: 5000
    },
    orgs: {
        serp: {
            team: require('./lib/team')([
                {
                    name: 'foo bar',
                    login: 'foo',
                    email: 'foo@gmail.com'
                }
            ]),
            repos: [
                'search-interfaces/common',
                'serp/web4'
            ]
        }
    }
};

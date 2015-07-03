export default {
    dev: {
        version: '3.0.0',
        debug: true,
        protocol: 'https',
        host: 'api.github.com',
        timeout: 5000,
        headers: {
            'user-agent': 'Devexp-GitHub-App'
        },
        authenticate: {
            type: 'token',
            token: '1ab753139a6e56a5e896bb6b95e8061915840df4'
        }
    }
};

export default {
    dev: {
        version: '3.0.0',
        debug: true,
        protocol: 'https',
        host: 'api.github.com',
        timeout: 5000,
        headers: {
            'user-agent': 'Devexp-GitHub-App'
        }
    }
};

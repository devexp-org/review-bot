/**
 * Place in ./auth.js:
 *
 * module.exports = {
 *   type: 'token',
 *   token: 'your_token_here'
 * };
 */

module.exports = {
    version: '3.0.0',
    debug: false,
    protocol: 'https',
    host: 'api.github.com',
    timeout: 5000,
    headers: {
        'user-agent': 'Devexp-GitHub-App'
    },
    authenticate: require('./auth'),
    content: {
        start: '<section id="info"><hr><span id="devexp-content-start"></span>',
        end: '<span id="devexp-content-end"></span>',

        /* eslint-disable max-len */
        regex: /<section id="info"><hr><span id="devexp-content-start"><\/span>([\s\S]*)<span id="devexp-content-end"><\/span>/g
        /* eslint-enable max-len */
    }
};

require('./registry');

var injector = require('modules/injector'),
    server = injector.get('server'),
    port = process.env.PORT || 3000;

/**
 * Serverside modules
 */
server.app.use(injector.get('response').middleware());
server.app.use('/api/github', injector.get('github').routes);

/**
 * Start server
 */
server.setupDefaultRoute(); // should by always before listen.
server.app.listen(port);

console.log('App started on http://localhost:' + port);

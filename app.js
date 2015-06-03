var server = require('app/server'),
    port = process.env.PORT || 3000;

server.listen(port);
console.log('App started on http://localhost:' + port);

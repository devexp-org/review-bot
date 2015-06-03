var mongoose = require('mongoose'),
    config = require('app/config').load('mongoose');

mongoose.connect(config.host);

mongoose
    .connection
    .on('error', console.error.bind(console, 'Connection error:'))
    .once('open', console.log.bind(console, 'Mongodb connected'));

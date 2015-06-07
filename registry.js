var path = require('path'),
    injector = require('modules/injector'),
    config = injector
        .register('config', require('modules/config'), { path: path.join(__dirname, 'config') })
        .get('config');

injector
    .register('server', require('modules/server'), config.load('server'))
    .register('mongoose', require('modules/mongoose'), config.load('mongoose'))
    .register('github', require('modules/github'))
    .register('response', require('modules/response'));

injector.initModules();

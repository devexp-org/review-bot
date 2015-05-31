var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var config = require('./config');
var _ = require('lodash');
var github = require('./lib/github/api')

app.use(bodyParser.json());

app.get('/', function(req, res) {
    console.log(req.headers);
});

app.get('/api/team', function(req, res) {
    config.orgs.serp.team.then(function(value) {
        res.json(value);
    });
});

app.use('/api/github', github);

module.exports = app;


// Enable all ES6 features
require('babel/register')({
    optional: ['es7.decorators', 'es7.classProperties'],
    loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
});

var gulp = require('gulp'),

    AUTOPREFIXER_BROWSERS = [
        'last 2 versions'
    ],

    MOCHA = {
        reporter: 'dot',
        require: [
            './../../tests/setup'
        ]
    },

    PATHS = {
        clientEntryPoint: './app/client/index.jsx',

        tests: [
            'app/client/**/__tests__/**/*.test.js',
            'app/server/**/__tests__/**/*.test.js',
            'app/core/**/__tests__/**/*.test.js',
            'app/plugins/**/__tests__/**/*.test.js'
        ],

        dest: './public' // keep
    },

    WEBPACK = {
        port: 8080,
        publicPath: 'public'
    };

/**
 * Tasks
 */
require('./.build/serve')(gulp);
require('./.build/webpack')(gulp, PATHS, WEBPACK, AUTOPREFIXER_BROWSERS);
require('./.build/test')(gulp, PATHS, MOCHA);

/**
 * Main Tasks
 */
gulp.task('dev', ['webpack:dev', 'serve']);
gulp.task('tdd', ['dev', 'test', 'test:watch']);

// Enable all ES6 features
require('babel/register')({
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
        mainStyle: 'app/client/styles/style.scss',
        styles: ['app/client/**/*.scss', 'app/plugins/**/*.scss'],

        mainScript: 'app/client/index.jsx',

        allScript: [
            'app/client/**/*.js',
            'app/client/**/*.jsx',
            'app/server/**/*.js',
            'app/lib/**/*.js',
            'app/plugins/**/*.js'
        ],

        tests: [
            'app/client/**/__tests__/**/*.test.js',
            'app/server/**/__tests__/**/*.test.js',
            'app/lib/**/__tests__/**/*.test.js',
            'app/plugins/**/__tests__/**/*.test.js'
        ],

        dest: {
            styles: './public',
            scripts: './public'
        }
    };

/**
 * Tasks
 */
require('./.gulp/serve')(gulp);
require('./.gulp/scripts')(gulp, PATHS);
require('./.gulp/sass')(gulp, PATHS, AUTOPREFIXER_BROWSERS);
require('./.gulp/test')(gulp, PATHS, MOCHA);

/**
 * Watchers
 */
gulp.task('watch', function () {
    gulp.watch(PATHS.allScript, ['scripts:dev']);
    gulp.watch(PATHS.styles, ['sass:dev']);
});

/**
 * Main Tasks
 */
gulp.task('dev', ['scripts:dev', 'sass:dev', 'serve', 'watch']);
gulp.task('dev:tdd', ['dev', 'test:watch']);

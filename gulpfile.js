// Enable all ES6 features
require('babel/register')({
    loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
});

var gulp = require('gulp'),

    AUTOPREFIXER_BROWSERS = [
        'last 2 versions'
    ],

    MOCHA = {
        require: [
            'app/tests/setup'
        ]
    },

    PATHS = {
        mainStyle: 'client/styles/style.scss',
        styles: ['client/styles/style.scss', 'client/styles/*.scss', 'client/styles/**/*.scss'],

        mainScript: 'client/index.jsx',
        scripts: [
            'client/actions/*.js',
            'client/components/*.jsx',
            'client/components/**/*.jsx',
            'client/constants/*.js',
            'client/mixins/*.js',
            'client/pages/*.jsx',
            'client/stores/*.js',
            'client/*.jsx',
            'client/routes.js'
        ],

        allScript: [
            'client/**/*.js',
            'server/**/*.js',
            'lib/**/*.js',
            'plugins/**/*.js'
        ],

        tests: [
            'client/**/__tests__/**/*.test.js',
            'server/**/__tests__/**/*.test.js',
            'lib/**/__tests__/**/*.test.js',
            'plugins/**/__tests__/**/*.test.js'
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
    gulp.watch(PATHS.scripts, ['scripts:dev']);
    gulp.watch(PATHS.styles, ['sass:dev']);
});

/**
 * Main Tasks
 */
gulp.task('dev', ['scripts:dev', 'sass:dev', 'serve', 'watch']);
gulp.task('dev:tdd', ['dev', 'test:watch']);

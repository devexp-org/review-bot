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

        clientEntryPoint: 'app/client/index.jsx',

        scripts: [
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

        dest: './public'
    };

/**
 * Tasks
 */
require('./.gulp/serve')(gulp);
require('./.gulp/scripts')(gulp, PATHS);
require('./.gulp/styles')(gulp, PATHS, AUTOPREFIXER_BROWSERS);
require('./.gulp/test')(gulp, PATHS, MOCHA);

/**
 * Watchers
 */
gulp.task('watch', function () {
    gulp.watch(PATHS.scripts, ['scripts:dev']);
    gulp.watch(PATHS.styles, ['styles:dev']);
});

/**
 * Main Tasks
 */
gulp.task('dev', ['scripts:dev', 'styles:dev', 'serve', 'watch']);
gulp.task('tdd', ['dev', 'test', 'test:watch']);

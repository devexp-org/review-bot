var webpack = require('webpack'),
    path = require('path'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

function makeStylesLoader(options) {
    var debug = options.debug,
        autoprefixer = options.autoprefixer.map(item => `"${item}"`).join(', '),
        loaders = `autoprefixer?{browsers:[${autoprefixer}]}!sass`;

    if (debug) {
        loaders = 'style!css!' + loaders;
    } else {
        loaders = 'css?mimimize!' + loaders;
    }

    return {
        test: /\.scss$/,
        loader: debug ? loaders : ExtractTextPlugin.extract(loaders)
    };
}

function loaders(options) {
    return [
        makeStylesLoader(options),
        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
        {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'react-hot'
        },
        {
            test: /\.jsx?$/,
            loader: 'babel',
            exclude: /node_modules/,
            query: {
                optional: ['es7.decorators', 'es7.classProperties'],
                loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
            }
        }
    ];
}

function plugins(debug) {
    var pluginsList = [];

    if (!debug) {
        pluginsList.push(new webpack.optimize.DedupePlugin());
        pluginsList.push(new webpack.optimize.UglifyJsPlugin());
        pluginsList.push(new ExtractTextPlugin('styles.css'));
    } else {
        pluginsList.push(new webpack.HotModuleReplacementPlugin());
    }

    pluginsList.push(new webpack.NoErrorsPlugin());

    return pluginsList;
}

function entries(mainEntryPoint, debug, port) {
    if (!debug) {
        return mainEntryPoint;
    }

    return [
        'webpack-dev-server/client?http://localhost:' + port,
        'webpack/hot/only-dev-server',
        mainEntryPoint
    ];
}

function buildPublicPath(options) {
    if (options.debug) {
        return 'http://localhost:' + options.devServer.port + '/' + options.devServer.publicPath + '/';
    }

    return '/' + options.devServer.publicPath;
}

export default function webpackDevConfig(options) {
    var paths = options.paths;

    return {
        entry: entries(options.entryPoint, options.debug, options.devServer.port),
        output: {
            path: path.join(__dirname, '..', paths.dest),
            filename: 'app.js',
            publicPath: buildPublicPath(options)
        },
        debug: options.debug,
        devtool: 'eval',
        module: {
            loaders: loaders(options)
        },
        plugins: plugins(options.debug)
    };
}

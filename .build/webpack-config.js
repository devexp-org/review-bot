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
    var loaders = [
        makeStylesLoader(options),
        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
        {
            test: /\.jsx?$/,
            loader: 'babel',
            exclude: /node_modules/,
            query: {
                optional: ['es7.decorators', 'es7.classProperties', 'es7.functionBind'],
                loose: ['es6.classes', 'es6.modules', 'es6.properties.computed', 'es6.templateLiterals']
            }
        }
    ];

    if (options.debug) {
        loaders.push({
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'react-hot'
        });
    }

    return loaders;
}

function plugins(debug) {
    var pluginsList = [];

    if (!debug) {
        pluginsList.push(new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }));
        pluginsList.push(new webpack.optimize.DedupePlugin());
        pluginsList.push(new ExtractTextPlugin('styles.css'));
        pluginsList.push(new webpack.optimize.UglifyJsPlugin());
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

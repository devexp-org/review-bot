/* eslint-disable no-var */

var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    'webpack-hot-middleware/client',
    './app/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.BROWSER': JSON.stringify(true)
    }),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: path.join(__dirname, 'app'),
        query: {
          plugins: [
            ['react-transform', {
              transforms: [{
                transform: 'react-transform-hmr',
                imports: ['react'],
                locals: ['module']
              }]
            }],
            ['transform-object-assign']
          ]
        }
      },
      {
        test: /\.css$/,
        loader: [
          'style',
          'css?importLoaders=1',
          'postcss'
        ]
      },
      {
        test: /\.json/,
        loader: ['json']
      }
    ]
  },
  postcss: function () {
    return [
      require('autoprefixer')
    ];
  }
};

import webpack from 'webpack';
import path from 'path';

var mode = process.env.NODE_ENV || 'production';
var PRODUCTION = (mode === 'production');
var DEVELOPMENT = (mode === 'development');

var plugins = [new webpack.ProvidePlugin({
  'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
})];
if (PRODUCTION) {
  plugins.push(new webpack.optimize.OccurenceOrderPlugin());
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
} else if (DEVELOPMENT) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

const config = {
  entry: {
    app: [
      // 'webpack-dev-server/client?http://localhost8080/',
      // 'webpack/hot/only-dev-server',
      './ui/js/index'
    ]
  },

  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/'
  },

  devtool: DEVELOPMENT ? 'eval' : undefined,
  devServer: DEVELOPMENT ? {
    hot: true,
    proxy: {
      "/api/*": 'http://localhost:8091'
    }
  } : undefined,

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|ui\/lib)/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.svg$/,
        loader: 'file-loader?mimetype=image/svg'
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader?mimetype=image/jpg'
      },
      {
        test: /\.png$/,
        loader: 'file-loader?mimetype=image/png'
      },
      {
        test: /\.woff$/,
        loader: 'file-loader?mimetype=application/font-woff'
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      },
      {
        test: /\.css$/,
        loaders: ["style", "css"]
      }
    ]
  },

  plugins: plugins,

  resolve : {
    extensions:
      ['', '.js', '.json', '.html', '.html', '.scss', '.md', '.svg']
  }

};

export default config;
module.exports = config;

import webpack from 'webpack';
import path from 'path';

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

  devtool: 'eval',
  devServer: {
    hot: true,
    proxy: {
      "/api/*": 'http://localhost:8091'
    }
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components|ui\/lib)/
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
        test: /\.woff$/,
        loader: 'file-loader?mimetype=application/font-woff'
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    })
  ],

  resolve : {
    extensions:
      ['', '.js', '.json', '.html', '.html', '.scss', '.md', '.svg']
  }

};

export default config;
module.exports = config;

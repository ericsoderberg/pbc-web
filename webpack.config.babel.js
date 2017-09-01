import webpack from 'webpack';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const mode = process.env.NODE_ENV || 'production';
const PRODUCTION = (mode === 'production');
const DEVELOPMENT = (mode === 'development');

const plugins = [
  new CopyWebpackPlugin([
    { from: './ui/index.html' },
    { from: './ui/index-iso.html' },
    { from: './ui', to: 'ui' },
    { from: './*.png' },
  ]),
  new webpack.ProvidePlugin({
    fetch:
      'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
  }),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module => (
      // this assumes your vendor imports exist in the node_modules directory
      module.context && module.context.indexOf('node_modules') !== -1
    ),
  }),
];
if (PRODUCTION) {
  // plugins.push(new webpack.optimize.OccurenceOrderPlugin());
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }));
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
  }));
} else if (DEVELOPMENT) {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

const extractSass = new ExtractTextPlugin({
  filename: '[name].css',
  disable: process.env.NODE_ENV === 'development',
});
plugins.push(extractSass);

const config = {
  entry: {
    app: ['./ui/scss/index.scss', './ui/js/index.js'],
    vendor: ['react-dom', 'react', 'moment', 'leaflet'],
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },

  devtool: DEVELOPMENT ? 'eval' : undefined,
  devServer: DEVELOPMENT ? {
    hot: true,
    proxy: {
      '/api/*': 'http://localhost:8091',
      '/file/*': 'http://localhost:8091',
    },
  } : undefined,

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /(node_modules|ui\/lib)/,
      },
      {
        test: /\.svg$/,
        use: [{
          loader: 'file-loader',
          options: { mimetype: 'image/svg' },
        }],
      },
      {
        test: /\.jpg$/,
        use: [{
          loader: 'file-loader',
          options: { mimetype: 'image/jpg' },
        }],
      },
      {
        test: /\.png$/,
        use: [{
          loader: 'file-loader',
          options: { mimetype: 'image/png' },
        }],
      },
      {
        test: /\.woff$/,
        use: [{
          loader: 'file-loader',
          options: { mimetype: 'application/font-woff' },
        }],
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{ loader: 'css-loader' }, { loader: 'sass-loader' }],
          // use style-loader in development
          fallback: 'style-loader',
        }),
        // use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins,

  resolve: {
    extensions:
      ['.js', '.json', '.html', '.html', '.scss', '.md', '.svg'],
  },

};

export default config;

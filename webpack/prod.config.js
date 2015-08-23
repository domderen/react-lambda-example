// use babel register hook to understand syntax supported by babel.
require('babel/register');

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const strip = require('strip-loader');
const autoprefixer = require('autoprefixer-core');

const writeStats = require('./utils/write-stats');

const assetsPath = path.join(__dirname, '../public/bundle');

const staticDomainOpts = {
  awsHost: (process.env.AWS_STATIC_DOMAIN || ''),
  buildNumber: (process.env.CIRCLE_BUILD_NUM || ''),
  domainUrl: '',
};

if(staticDomainOpts.awsHost && staticDomainOpts.buildNumber) {
  staticDomainOpts.domainUrl = staticDomainOpts.awsHost + staticDomainOpts.buildNumber;
}

module.exports = {
  // Choose a developer tool to enhance debugging. http://webpack.github.io/docs/configuration.html#devtool
  devtool: 'source-map',
  // The entry point for the bundle. http://webpack.github.io/docs/configuration.html#entry
  entry: {
    // Defines client application entry script.
    main: './src/client/bootstrap.js',
  },
  // Options affecting the output. http://webpack.github.io/docs/configuration.html#output
  output: {
    // The output directory as absolute path (required). http://webpack.github.io/docs/configuration.html#output-path
    path: assetsPath,
    // The filename of the entry chunk as relative path inside the output.path directory.
    // http://webpack.github.io/docs/configuration.html#output-filename
    filename: '[name]-[hash].js',
    // The filename of non-entry chunks as relative path inside the output.path directory.
    // http://webpack.github.io/docs/configuration.html#output-chunkfilename
    chunkFilename: '[name]-[hash].js',
    // The output.path from the view of the Javascript / HTML page.
    // http://webpack.github.io/docs/configuration.html#output-publicpath
    publicPath: staticDomainOpts.domainUrl + '/bundle/',
  },
  // Options affecting the normal modules (NormalModuleFactory). http://webpack.github.io/docs/configuration.html#module
  module: {
    // A array of automatically applied loaders. http://webpack.github.io/docs/configuration.html#module-loaders
    loaders: [
      // Static file loader used for images: https://github.com/webpack/file-loader
      { test: /\.(jpe?g|png|gif|svg)$/, loader: 'file' },
      // JS files transformed by babel loader: https://github.com/babel/babel-loader
      // JS files are also transformed with strip-loader: https://github.com/yahoo/strip-loader
      // This removes all invocations of the "debug" function.
      { test: /\.js$/, exclude: /node_modules/, loaders: [strip.loader('debug'), 'babel'] },
      // ExtractTextPlugin moves every require("style.css") in entry chunks into a separate css output file.
      // So your styles are no longer inlined into the javascript, but separate in a css bundle file (styles.css).
      // If your total stylesheet volume is big, it will be faster
      // because the stylesheet bundle is loaded in parallel to the javascript bundle.
      // https://github.com/webpack/extract-text-webpack-plugin
      // The order is from the end to the beginning, so first less, next postcss, css and style loader.
      // style-loader: https://github.com/webpack/style-loader
      // css-loader: https://github.com/webpack/css-loader
      // PostCSS plugin https://github.com/postcss/postcss-loader
      // LESS loader https://github.com/webpack/less-loader
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!less-loader') },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader') },
      // the url-loader uses DataUrls.
      // the file-loader emits files.
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
    ],
  },
  // PostCSS-loader configuration: https://github.com/postcss/postcss-loader
  // Uses autoprefixer to add automatic vendor prefixes to css styles for last 2 major browser versions compatiblity.
  // https://github.com/postcss/autoprefixer-core
  postcss: [autoprefixer({ browsers: ['last 2 version'] })],
  progress: true,
  plugins: [
    // Unique ident for this plugin instance. (For advanded usage only, by default automatic generated)
    // https://github.com/webpack/extract-text-webpack-plugin
    new ExtractTextPlugin('[name]-[chunkhash].css'),

    // Define free variables. Useful for having development builds with debug logging or adding global constants.
    // http://webpack.github.io/docs/list-of-plugins.html#defineplugin
    // set process.env to reflect the browser or server values
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify('production'),
        ANIMATIONS_DISABLED: process.env.ANIMATIONS_DISABLED === 'true',
      },
    }),

    // Search for equal or similar files and deduplicate them in the output.
    // This comes with some overhead for the entry chunk, but can reduce file size effectively.
    // http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
    new webpack.optimize.DedupePlugin(),
    // Assign the module and chunk ids by occurrence count. Ids that are used often get lower (shorter) ids.
    // This make ids predictable, reduces to total file size and is recommended.
    // http://webpack.github.io/docs/list-of-plugins.html#occurenceorderplugin
    new webpack.optimize.OccurenceOrderPlugin(),
    // Minimize all JavaScript output of chunks. Loaders are switched into minimizing mode.
    // You can pass an object containing UglifyJs options.
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),

    // A webpack plugin to write webpack stats that can be consumed when rendering
    // the page (e.g. it attach the public path to the script names)
    // These stats basically contains the path of the script files to
    // <script>-load in the browser.
    function() { this.plugin('done', writeStats); },
  ],
};

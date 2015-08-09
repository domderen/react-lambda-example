import path from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer-core';

import writeStats from './utils/write-stats';
import notifyStats from './utils/notify-stats';

const assetsPath = path.resolve(__dirname, './public/');

// Creates webpack development configuration.
export default function(WEBPACK_HOST, WEBPACK_PORT) {
  return {
    // Choose a developer tool to enhance debugging. http://webpack.github.io/docs/configuration.html#devtool
    devtool: 'eval',
    // Switch loaders to debug mode. http://webpack.github.io/docs/configuration.html#debug
    debug: true,
    // The entry point for the bundle. http://webpack.github.io/docs/configuration.html#entry
    entry: {
      main: [
        // Live reload server: https://github.com/webpack/webpack-dev-server
        `webpack-dev-server/client?http://${WEBPACK_HOST}:${WEBPACK_PORT}`,
        // Defines that webpack can do live reload of assets: http://webpack.github.io/docs/webpack-dev-server.html#hot-mode
        'webpack/hot/only-dev-server',
        // Defines client application entry script.
        './src/client/bootstrap.js',
      ],
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
      publicPath: `http://${WEBPACK_HOST}:${WEBPACK_PORT}/assets/`,
    },
    // Options affecting the normal modules (NormalModuleFactory). http://webpack.github.io/docs/configuration.html#module
    module: {
      // A array of automatically applied loaders. http://webpack.github.io/docs/configuration.html#module-loaders
      loaders: [
        // Static file loader used for images: https://github.com/webpack/file-loader
        { test: /\.(jpe?g|png|gif|svg)$/, loader: 'file-loader' },
        // JS files transformed by react hot loader and babel loader:
        // https://github.com/gaearon/react-hot-loader
        // https://github.com/babel/babel-loader
        { test: /\.js$/, exclude: /node_modules/, loaders: ['react-hot-loader', 'babel-loader'] },
        // The order is from the end to the beginning, so first less, next postcss, css and style loader.
        // style-loader: https://github.com/webpack/style-loader
        // css-loader: https://github.com/webpack/css-loader
        // PostCSS plugin https://github.com/postcss/postcss-loader
        // LESS loader https://github.com/webpack/less-loader
        { test: /\.less$/, loader: 'style-loader!css-loader!postcss-loader!less-loader' },
        { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
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
    // Add additional plugins to the compiler. http://webpack.github.io/docs/configuration.html#plugins
    plugins: [
      // Enables Hot Module Replacement. http://webpack.github.io/docs/list-of-plugins.html#hotmodulereplacementplugin
      new webpack.HotModuleReplacementPlugin(),
      // When there are errors while compiling this plugin skips the emitting phase (and recording phase),
      // so there are no assets emitted that include errors. The emitted flag in the stats is false for all assets.
      // http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
      new webpack.NoErrorsPlugin(),

      // WHAT: I think this defines the progress plugin, and additional output to be displayed when building project.
      new webpack.ProgressPlugin((percentage, message) => {
        const MOVE_LEFT = new Buffer('1b5b3130303044', 'hex').toString();
        const CLEAR_LINE = new Buffer('1b5b304b', 'hex').toString();
        process.stdout.write(`${CLEAR_LINE}${Math.round(percentage * 100)}%: ${message}${MOVE_LEFT}`);
      }),

      // Define free variables. Useful for having development builds with debug logging or adding global constants.
      // http://webpack.github.io/docs/list-of-plugins.html#defineplugin
      new webpack.DefinePlugin({
        'process.env': {
          BROWSER: JSON.stringify(true),
          NODE_ENV: JSON.stringify('development'),
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

      // A webpack plugin to notify errors and warning when compiling
      function() { this.plugin('done', notifyStats); },
      // A webpack plugin to write webpack stats that can be consumed when rendering
      // the page (e.g. it attach the public path to the script names)
      // These stats basically contains the path of the script files to
      // <script>-load in the browser.
      function() { this.plugin('done', writeStats); },
    ],
  };
}

import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';

import devConfig from './dev.config';
const devEnv = require('../config/dev-environment');

// Defines webpack host domain.
const WEBPACK_HOST = process.env.HOST || 'localhost';
// Defines webpack host port.
const WEBPACK_PORT = parseInt(process.env.PORT) || devEnv.webpackPort;

// Obtains webpack development configuration object.
const config = devConfig(WEBPACK_HOST, WEBPACK_PORT);

// Sets up a proxy path to local backend (the express server that serves this application).
const proxyPath = 'http://localhost:' + devEnv.backendPort + '/';
console.log('proxyPath', proxyPath);

// Webpack dev server configuration object.
const serverOptions = {
  // Base path for the content.
  contentBase: `http://${WEBPACK_HOST}:${WEBPACK_PORT}`,
  // Don’t output anything to the console.
  quiet: true,
  // Suppress boring information.
  noInfo: true,
  // Adds the HotModuleReplacementPlugin and switch the server to hot mode. Note: make sure you don’t add HotModuleReplacementPlugin twice
  hot: true,
  // When changes are made the bundle will be recompiled.
  // This modified bundle is served from memory at the relative path specified in publicPath.
  publicPath: config.output.publicPath,
  // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
  // Use "*" to proxy all paths to the specified server.
  // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
  // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127).
  proxy: {
    '*': proxyPath,
  },
};

// Creates new webpack dev server object, with the above configuration.
const compiler = webpack(config);
const webpackDevServer = new WebpackDevServer(compiler, serverOptions);

// Starts the web server to listen on the specified port and host.
// Prints notification when bootstrap is done.
webpackDevServer.listen(WEBPACK_PORT, WEBPACK_HOST, () => {
  const url = `http://${WEBPACK_HOST}:${WEBPACK_PORT}`;
  console.log('Webpack development server listening on %s', url);

  // Open browser
  require('opn')(url);
});

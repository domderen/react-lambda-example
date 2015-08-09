import path from 'path';
import http from 'http';
import express from 'express';
import favicon from 'serve-favicon';
import compression from 'compression';

import devEnv from '../config/dev-environment';
import { renderFromRequest } from './render';

/**
 * Normalizes the value of port number.
 * Parses provided value as integer of base 10,
 * If given value is not a number, returns originally provided value,
 * Otherwise if port number is bigger or equal to 0 returns parsed value.
 * In all other cases returns false.
 * @param  {String} val String containing a port number to normalize.
 * @return {Number|Boolean} Returns a number if value was properly normalized, Otherwise returns false.
 */
function normalisePort(val) {
  const portNum = parseInt(val, 10);

  // named pipe
  if (Number.isNaN(portNum)) { return val; }
  if (portNum >= 0) { return portNum; }

  return false;
}

// Creates new express application.
const app = express();

// Adds path where to serve a favicon request from.
app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));

// Serves all static files available at those locations from the root path.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'src')));

// Adds a page rendering middle ware, which renders a page based on
// current url. Utilizes react rendering capabilities, and
// react-router to render particular path page.
app.use(renderFromRequest);

// Middle ware for static content compression.
app.use(compression());

// Sets the port on which application will be started.
app.set('port', normalisePort(process.env.PORT || devEnv.backendPort));

// If we got to this point, it means that application was not able to handle the request, so it is time for error handling.
// This one means that application was not able to find a suitable middle ware for the particular request.
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Function for logging application errors to console.
function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

// Function responsible for handling errors for requests coming from AJAX libraries.
function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.status(err.status || 500).send({ error: 'Something blew up!' });
  } else {
    next(err);
  }
}

// Function responsible for handling errors for all other requests.
function errorHandler(err, req, res) {
  res.status(err.status || 500).send(`
    <h1>${ err.message }</h1>
    <h2>${ err.status }</h2>
    <pre>${ err.stack }</pre>
  `);
}

// Adding error handling middle wares.
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// Creating server from express app.
const server = http.createServer(app);

// Stringifies current port or pipe value.
function portType(portPipe) {
  return typeof portPipe === 'string' ? 'Pipe ' + portPipe : 'Port ' + portPipe;
}

// Defines on what port web server should be listening for requests.
server.listen(app.get('port'));

// Web server error handling.
server.on('error', function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = portType(app.get('port'));

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1); // eslint-disable-line no-process-exit
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1); // eslint-disable-line no-process-exit
      break;
    default:
      throw error;
  }
});

// Notification displaying on which port and under what port application is listening.
server.on('listening', function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? addr : addr.port;
  const type = portType(bind);
  console.log(`Listening on http:\/\/localhost:${bind} (${type})`);
});

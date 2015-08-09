import 'babel/polyfill';
import result from 'lodash/object/result';
import findLast from 'lodash/collection/findLast';
import React from 'react';
import Router from 'react-router';

import { getRoutes } from '../router/route-helpers';

// This is used with webpack, but not with pages requested trough the express server.
if (process.env.BROWSER) {
  require('../../styles/main.less');
}

// Take the application state from the global variable defined on the server side.
const appState = window.app;
// Gets the react-router config.
const routes = getRoutes();
// Creates new instance of the router to live on the client side.
const router = Router.create({
  routes,
  location: Router.HistoryLocation,
});

// Initializes react router, and runs it for a particular handler.
router.run(function(Handler, state) {
  // Find the root element where react should mount itself.
  const mountNode = document.getElementById('root');
  // Get the name of the current route handler.
  const routeName = result(findLast(state.routes.slice(), 'name'), 'name');
  // Build application state object.
  const stateProps = Object.assign({}, appState, {
    routeName: routeName || 'not_found',
    pathname: state.pathname,
  });

  // Bootstraps react to the mount node, and performs an update on it and only mutate the DOM
  // as necessary to reflect the latest React component.
  React.render(<Handler {...stateProps} />, mountNode, () => {
    console.log('App has been mounted.');
  });
});

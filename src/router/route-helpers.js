/* eslint-disable */
import React from 'react';

import immutable from 'immutable';
import { Route, DefaultRoute, NotFoundRoute } from 'react-router';

import MainPage from '../components/HomePage/HomePage';
import App from '../components/app/app';
import { config } from './routes';

function getPath(path) {
  if (!path || path.indexOf('/') !== 0) {
    throw new TypeError('Path not valid, must begin with `/`');
  }

  path = path.replace(/^\/|\/$/g, '');
  return path ? `/${path}/` : '/';
}

/**
 * Check if pages object is not smaller than 1.
 * @param  {Object} pages Pages object which size property will be checked.
 * @return {Undefined}    Throws error if pages size is smaller than 1.
 */
function validatePages(pages) {
  if (pages.size < 1) {
    throw new TypeError('pages must not be empty');
  }
}

export function flattenPages(pages) {
  // Check if pages object is not smaller than 1.
  validatePages(pages);

  function setLocaleConfigPath(page) {
    const path = page.getIn(['pathConfig', 'path']);
    const matchOptionalSlash = '?';
    return page.setIn(['pathConfig', 'path'], getPath(path) + matchOptionalSlash);
  }

  function flattenChildConfig(page) {
    if (immutable.List.isList(page.get('childConfig'))) {
      return page.set('childConfig', flattenPages(page.get('childConfig')));
    } else {
      return page;
    }
  }

  return pages.filter((page) => page.get('pathConfig').has('path'))
              .map(setLocaleConfigPath)
              .map(flattenChildConfig);
}

export function getRoutesForPages(pages) {
  return pages.map(function(page) {
    const handler = page.get('handler');
    const routeConfig = page.get('routeConfig');
    const pathConfig = page.get('pathConfig');
    const childConfig = page.get('childConfig');

    return (
      <Route key={routeConfig.get('name')}
        name={routeConfig.get('name')}
        path={pathConfig.get('path')}
        handler={handler}>
        {childConfig && getRoutesForPages(childConfig) || null}
      </Route>
    );
  });
}

/**
 * Returns an easier to work with version of a 'route config' entry, applying the same
 * transformation to any `childConfig`s
 * @param {Array} configItem e.g. [ReactComponent, Object, Object, [[ReactComponent, Object, Object], ...]]
 * @returns {Object} e.g.:
 *   {
 *     handler: ReactComponent,
 *     routeConfig: Object,
 *     pathConfig: Object,
 *     childConfig: [{
 *       handler: ReactComponent,
 *       routeConfig: Object,
 *       pathConfig: Object,
 *       childConfig: ...
 *     }, ...]
 *   }
 */
export function transformConfigItems(page) {
  const [handler, routeConfig, pathConfig, childConfig] = page.toArray();

  if (immutable.List.isList(childConfig) && immutable.List.isList(childConfig.first())) {
    return transformConfigItems(immutable.List([ handler, routeConfig, pathConfig,
      childConfig.map((child) => transformConfigItems(child)),
    ]));
  } else {
    return immutable.Map({
      handler,
      routeConfig,
      pathConfig,
      childConfig,
    });
  }
}

export function expandConfig(givenConfig) {
  function expandChildConfig(page) {
    const childConfig = page.get('childConfig');

    if (immutable.List.isList(childConfig)) {
      return childConfig.flatMap(expandChildConfig).push(page);
    } else {
      return immutable.List([page]);
    }
  }

  return givenConfig.map((page) => transformConfigItems(page))
                    .flatMap(expandChildConfig);
}

/**
 * Generates React-Router configuration component, for all routes.
 * @param  {Array} givenConfig       Configuration object with all paths available.
 * @return {Component}               Returns react-router configuration component.
 */
export function getRoutes(givenConfig=config) {
  // Transform whole config object, to object with all language codes, easier for manipulation.
  const expandedPages = givenConfig.map((page) => transformConfigItems(page));
  // Flattens the paths.
  const flattenedRoutes = flattenPages(expandedPages);
  // Assumes that the first route is a home page.
  const homePage = flattenedRoutes.first();

  return (
    <Route path={homePage.getIn(['pathConfig', 'path'])} handler={App}>
      {getRoutesForPages(flattenedRoutes.rest())}

      <DefaultRoute handler={homePage.get('handler')} name={homePage.getIn(['routeConfig', 'name'])} />
      <NotFoundRoute handler={MainPage} />
    </Route>
  );
}

export function getAllPaths(givenConfig=config) {
  const expanded = expandConfig(givenConfig);
  return expanded.map((page) => page.getIn(['pathConfig', 'path']));
}

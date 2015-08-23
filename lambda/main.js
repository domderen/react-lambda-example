import co from 'co';

import { render } from './server/render';

/**
 * Transforms strange AWS properties syntax, into a proper JSON string.
 * @param {String} str String containing the JSON-like structure of parameters.
 * @return {String}    Returns a JSON string obtained from reading the parameters.
 */
function JSONize(str) {
  return str
  .replace(/([\$\w]+)\s*:/g, function(_, $1){ return '"'+$1+'":'; })
  .replace(/:([\$\w]+)\s*/g, function(_, $1) { return ':"'+$1+'"'; })
  .replace(/'([^']+)'/g, function(_, $1){ return '"'+$1+'"'; });
}

/**
 * Transforms strange AWS properties syntax, into a proper JS Object.
 * @param {String} str String containing the JSON-like structure of parameters.
 * @return {Object}    Returns a JS Object obtained from reading the parameters.
 */
function parse(str) {
  return JSON.parse(JSONize(str.replace(/=/g, ':')));
}

/**
 * Creates a full URL path from parameters obtained as input parameters to AWS Lambda function.
 * @param  {Object} pathParts   Object containing the list of path parameters eg.
*                              	{0: 'level1', 1: 'level2'}
 * @param  {Object} queryString Object containing query string parameters that were passed to Lambda function, eg.
 *                              {param1: 'someValue', param2: 'otherValue'}
 * @return {String}             Returns a full path of the request as it came from AWS API Gateway, for the examples above result would be:
 *                              '/level1/level2?param1=someValue&param2=otherValue'
 */
function createFullPath(pathParts, queryString) {
  let path = '/';

  path += Object.keys(pathParts).sort((a, b) => a - b).map(partKey => pathParts[partKey]).join('/');

  const queryStringKeys = Object.keys(queryString);

  if(queryStringKeys.length > 0) {
    path += '?';
    path += queryStringKeys.map(queryStringKey => `${queryStringKey}=${queryString[queryStringKey]}`).join('&');
  }

  return path;
}

/**
 * Main Lambda function handler. It takes parameters passed from AWS API Gateway and returns generated HTML content,
 * based on the path of the request, and query string parameters.
 * @param  {[type]} event    Event object containing parameters passed from AWS API Gateway call.
 * @param  {[type]} context  Object used to return result from the AWS Lambda function.
 */
export const mainHandler = co.wrap(function *(event, context) {
  try {
    const path = parse(event.path);
    const querystring = parse(event.querystring);
    const fullPath = createFullPath(path, querystring);
    const [urlPath, renderedContent] = yield render(fullPath);
    context.succeed({urlPath, variableHTML: renderedContent});
  } catch (error) {
    console.error('ERROR: ', error);
    context.succeed({error});
  }
});

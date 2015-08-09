console.log('Loading function');

require('babel/register')({
  optional: ["es7.classProperties"]
});
var render = require('./server/render');

function JSONize(str) {
  return str
    .replace(/([\$\w]+)\s*:/g, function(_, $1){return '"'+$1+'":'})
    .replace(/:([\$\w]+)\s*/g, function(_, $1){return ':"'+$1+'"'})
    .replace(/'([^']+)'/g, function(_, $1){return '"'+$1+'"'});
}

function parse(str) {
  return JSON.parse(JSONize(str.replace(/=/g, ':')));
}

function createFullPath(pathParts, queryString) {
  function compareNumbers(a, b) {
    return a - b;
  }

  var path = '/';

  path += Object.keys(pathParts).sort(compareNumbers).map(function (partKey) {
    return pathParts[partKey];
  }).join('/');

  var queryStringKeys = Object.keys(queryString);

  if(queryStringKeys.length > 0) {
    path += '?';

    path += queryStringKeys.map(function (queryStringKey) {
        return queryStringKey + '=' + queryString[queryStringKey];
    }).join('&');
  }

  return path;
}

exports.handler = function(event, context) {
  var path, querystring, fullPath, error, renderedContent;
  try {
      path = parse(event.path);
      querystring = parse(event.querystring);
      fullPath = createFullPath(path, querystring);
      render.render(fullPath).then(function (arr) {
        var urlPath = arr[0];
        var renderedContent = arr[1];
        context.succeed(renderedContent);
      }).catch(function (error) {
        console.log('ERROR WHILE RENDERING: ', e);
        context.succeed({error: error});
      });
  } catch (e) {
      error = e;
      console.log('ERROR: ', e);
  }
};

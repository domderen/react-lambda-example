#!/bin/bash
# Usage: script/start
# Starts the project's development server.

# Quit on errors.
set -e errexit

ulimit -n 10240

# Sets up watch on application files, that should restart express server that serves content,
# Runs express server to serve content.
./node_modules/.bin/nodemon ./index.js \
  --watch 'server' \
  --watch 'webpack' &

# Runs webpack development server.
./node_modules/.bin/babel-node ./webpack/server.js

trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

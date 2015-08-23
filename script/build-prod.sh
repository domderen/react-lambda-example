#!/bin/sh

# Quit on errors.
set -e errexit
ulimit -n 10240

# Cleans dist directory.
rm -rf dist
rm -rf dist_static
# Runs webpack with production configuration.
ANIMATIONS_DISABLED=$ANIMATIONS_DISABLED node_modules/.bin/webpack --stats --progress --config ./webpack/prod.config.js

# Creates directories for production files
mkdir dist
mkdir dist_static

# Compiles the sources required inside the AWS Lambda function.
babel lambda --out-dir dist
babel src --out-dir dist/src
babel server --out-dir dist/server

# Copies packages that are required to run AWS Lambda function (the ones that are marked as dependencies, as opposed to dev-dependencies).
./script/copy-dependencies.js

# Copies webpack compilation results to AWS Lambda package.
cp -R src/bundles dist/src/

# Copies static resources into a separete production directory.
cp -R public/* dist_static

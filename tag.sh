#!/bin/bash

CURR_BUILD_NUM=$CIRCLE_BUILD_NUM

git tag -a -f -m "Successful build of master, build number ${CURR_BUILD_NUM}" build_$CURR_BUILD_NUM
git push git@github.com:$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME.git build_$CURR_BUILD_NUM

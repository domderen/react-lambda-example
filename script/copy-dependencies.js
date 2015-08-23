#!/usr/bin/env babel-node

import keys from 'lodash/object/keys';
import fs from 'fs-extra';

import packageJson from '../package.json';

keys(packageJson.dependencies).forEach(dependency => {
  try {
    const fromPath = `${__dirname}/../node_modules/${dependency}`;
    const toPath = `${__dirname}/../dist/node_modules/${dependency}`;
    console.log(`Copying dependency ${dependency} from ${fromPath} to ${toPath}`);
    fs.copySync(fromPath, toPath);
  } catch (e) {
    console.error(`Error while copying ${dependency}.`);
    console.error(e);
  }
});

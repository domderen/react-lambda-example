// A webpack plugin to write webpack stats that can be consumed when rendering
// the page (e.g. it attach the public path to the script names)
// These stats basically contains the path of the script files to
// <script>-load in the browser.

import fs from 'fs';
import path from 'path';

const filepath = path.resolve(__dirname, '../../src/bundles/webpack-stats.json');

// Write only a relevant subset of the stats and attach the public path to it
function writeStats(stats) {
  const publicPath = this.options.output.publicPath;

  const json = stats.toJson();

  function getChunks(name, ext) {
    ext = ext || 'js';
    let curChunk = json.assetsByChunkName[name];

    // Could be a string or an array
    if (!(Array.isArray(curChunk))) {
      curChunk = [curChunk];
    }

    return curChunk
      .filter(chunk => path.extname(chunk) === `.${ext}`)
      .map(chunk => `${publicPath}${chunk}`);
  }

  const script = getChunks('main', 'js');
  const css = getChunks('main', 'css');

  const content = {
    script,
    css,
  };

  fs.writeFileSync(filepath, JSON.stringify(content));
}

export default writeStats;

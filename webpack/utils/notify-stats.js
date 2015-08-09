// A webpack plugin to notify errors and warning when compiling

// BELLs when something goes wrong!
function notifyError(error) {
  console.log('\x07' + error);
}

function notifyWarning(warning) {
  console.log(warning);
}

function notifyStats(stats) {
  const json = stats.toJson();
  if (json.errors.length > 0) {
    json.errors.forEach(notifyError);
  } else if (json.warnings.length > 0) {
    json.warnings.forEach(notifyWarning);
  } else {
    console.log(stats.toString({
      chunks: false,
      colors: true,
    }));
  }
}

export default notifyStats;

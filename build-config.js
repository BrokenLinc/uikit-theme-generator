const chalk = require('chalk');
const each = require('lodash/each');
// const filter = require('lodash/filter');
// const find = require('lodash/find');
const fs = require('fs-extra');
// const path = require('path');
// const sortBy = require('lodash/sortBy');
// const startsWith = require('lodash/startsWith');
// const argv = require('yargs').argv;

const variableRegex = /(@[a-z\-]+):[ ]*(.+);/g;

const themeDefaults = { variables: [] };

const sourceFilePaths = [
  './node_modules/uikit/src/less/components/variables.less',
  './node_modules/uikit/src/less/components/alert.less',
  './node_modules/uikit/src/less/components/button.less',
];
const destFilePath = './src/themeDefaults.json';

const debug = (message) => {
  console.log(chalk.gray(message));
};
const success = (message) => {
  console.log(chalk.blue(message));
};
const error = (message) => {
  console.log(chalk.red(message));
};

each(sourceFilePaths, (sourceFilePath) => {
  if(fs.existsSync(sourceFilePath)) {
    try {
      const source = fs.readFileSync(sourceFilePath, 'utf8');
      let m;

      do {
        m = variableRegex.exec(source);
        if (m) {
          themeDefaults.variables.push({
            name: m[1],
            value: m[2],
          });
        }
      } while (m);
    }
    catch(err) {
      error(`Error reading "${sourceFilePath}".`);
      debug(err);
    }
  } else {
    error(`Could not find "${sourceFilePath}".`);
  }

  fs.writeFileSync(destFilePath, JSON.stringify(themeDefaults));
});


//@button-line-height:
//.hook-inverse-button-link()
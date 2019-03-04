const chalk = require('chalk');
// const each = require('lodash/each');
// const filter = require('lodash/filter');
// const find = require('lodash/find');
const fs = require('fs-extra');
// const path = require('path');
// const sortBy = require('lodash/sortBy');
// const startsWith = require('lodash/startsWith');
// const argv = require('yargs').argv;

const variableRegex = /(@[a-z\-]+):[ ]*(.+);/g;

const themeDefaults = { variables: [] };

const filePath = './node_modules/uikit/src/less/components/button.less';
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



if(fs.existsSync(filePath)) {
  try {
    const source = fs.readFileSync(filePath, 'utf8');
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

    fs.writeFileSync(destFilePath, JSON.stringify(themeDefaults));
  }
  catch(err) {
    error(`Error reading "${filePath}".`);
    debug(err);
  }
} else {
  error(`Could not find "${filePath}".`);
}

//@button-line-height:
//.hook-inverse-button-link()
import React, { Component } from 'react';
import { map } from 'lodash';
import { compose, withHandlers, withState } from 'recompose';

import themeConfig from './theme-config';

const ThemeEditor = compose(
  withState('error', 'setError'),
  withHandlers({
    handleVariableChange: ({ setError, variables, windowId }) => (event) => {
      // console.log(event.target.id, event.target.value);
      window[windowId].contentWindow.less.modifyVars({[event.target.id]: event.target.value})
        .then(() => {
          setError();
        },(error) => {
          setError(error.message);
          // console.log(error);
        });
    },
  }),
)(({ error, handleVariableChange }) => (
  <div>
    {map(themeConfig.variables, (value, key) => (
      <div key={key}>{key} <input id={key} defaultValue={value} onChange={handleVariableChange} /></div>
    ))}
    <div className="compile-status">{error}</div>
  </div>
));

class App extends Component {
  render() {
    return (
      <div>
        <ThemeEditor windowId="themeWindow" />
        <iframe id="themeWindow" title="Theme Window" src="components.html" />
      </div>
    );
  }
}

export default App;

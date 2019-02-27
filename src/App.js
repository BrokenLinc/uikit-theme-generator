import React from 'react';
import { map, startsWith } from 'lodash';
import { compose, withHandlers, withPropsOnChange, withState } from 'recompose';
import Textarea from 'react-textarea-autosize';


import themeConfig from './theme-config';

const ThemeEditor = compose(
  withPropsOnChange([], () => ({
    variables: {...themeConfig.variables}
  })),
  withState('error', 'setError'),
  withHandlers({
    handleVariableChange: ({ setError, variables, windowId }) => (event) => {
      // console.log(event.target.id, event.target.value);
      variables[event.target.id] = event.target.value;
      window[windowId].contentWindow.less.modifyVars(variables)
        .then(() => {
          setError();
        },(error) => {
          setError(error.message);
          // console.log(error);
        });
    },
  }),
)(({ error, handleVariableChange, variables, windowId }) => (
  <div className="uk-flex app-panes">
    <div className="uk-flex-none uk-light uk-background-secondary uk-padding-small uk-width-medium">
      <div className="uk-form-stacked">
        {map(variables, (value, key) => (
          <div key={key}>
            <label className="uk-form-label">{key}</label>
            <div className="uk-form-controls">
              {startsWith(key, '@hook-') ? (
                <Textarea
                  style={{ minHeight: 30 /* not good enough */ }}
                  className="uk-textarea uk-form-small uk-margin-small-bottom resize-none"
                  id={key}
                  defaultValue={value}
                  onChange={handleVariableChange}
                />
              ) : (
                <input
                  className="uk-input uk-form-small uk-margin-small-bottom"
                  id={key}
                  defaultValue={value}
                  onChange={handleVariableChange}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    <iframe className="uk-flex-1" id={windowId} title="Theme Window" src="components.html" />
    <div className="uk-dark uk-position-bottom-right">
      {error ? (
        <div className="uk-label uk-label-danger">{error}</div>
      ) : (
        <div className="uk-label uk-label-success">No problems</div>
      )}
    </div>
  </div>
));

const App = () => (
  <ThemeEditor windowId="themeWindow" />
);

export default App;

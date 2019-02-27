import React from 'react';
import { compose, withHandlers, withPropsOnChange, withState } from 'recompose';
import { map, startsWith } from 'lodash';
import Textarea from 'react-textarea-autosize';

import themeConfig from './theme-config';
import { Consumer } from './FirebaseAuthContext';

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
    <div id="main-menu" data-uk-offcanvas="mode: push; overlay: true">
      <button className="uk-offcanvas-close" type="button" data-uk-close></button>
      <div className="uk-offcanvas-bar">
        <h4>UIkit Theme Generator</h4>
        <Consumer>
          {auth => {console.log(auth); return !!auth.user ? (
            <button className="uk-button uk-button-primary" type="button" onClick={auth.signOut}>Log out</button>
            ) : (
            <button className="uk-button uk-button-primary" type="button" onClick={auth.signIn}>
              Log in with Google
            </button>
          )}}
        </Consumer>
      </div>
    </div>

    <div className="uk-flex-none uk-background-secondary uk-padding-small uk-width-medium">
      <ul className="uk-iconnav">
        <li><a href="" uk-icon="icon: menu" uk-toggle="target: #main-menu"></a></li>
      </ul>
      <div className="uk-form-stacked uk-light">
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

ThemeEditor.defaultProps = {
  windowId: 'themeWindow',
}

export default ThemeEditor;
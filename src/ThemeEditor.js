import React, { Fragment } from 'react';
import { compose, lifecycle, withHandlers, withPropsOnChange, withState } from 'recompose';
import { clone, each, find, map, startsWith } from 'lodash';
import Textarea from 'react-textarea-autosize';
import { FirestoreCollection, withFirestore } from 'react-firestore';
import cn from 'classnames';

import themeConfig from './theme-config';
import withLoadingSpinner from './withLoadingSpinner';

const mergeVariables = (defaultVariables = [], userVariables = []) => {
  const variables = {};
  each(defaultVariables, (variable) => {
    variables[variable.name] = clone(variable);
  });
  each(userVariables, (variable) => {
    // console.log(variable);
    variables[variable.name] = {
      ...variables[variable.name],
      ...variable,
      isCustom: !variables[variable.name],
    };
  });
  return variables;
};

const flattenVariables = (variables) => {
  const result = {};
  each(variables, ({ name, value }) => {
    result[name] = value;
  });
  return result;
};

const ThemeVariablesEditor = compose(
  withLoadingSpinner,
  withPropsOnChange(['data'], ({ data }) => ({
    variables: mergeVariables(themeConfig.variables, data),
  })),
  withFirestore,
  lifecycle({
    componentDidMount() {
      const { onError, variables, windowId } = this.props;
      window[windowId].contentWindow.less.modifyVars(flattenVariables(variables))
        .then(() => {
          onError();
        },(error) => {
          onError(error.message);
        });
    }
  }),
  withHandlers({
    handleVariableChange: ({ firestore, onError, themeId, variables, windowId }) => (event) => {
      // console.log(firestore);
      const { id: name, value } = event.target;
      find(variables, { name: name }).value = value;
      // console.log(name, value);
      // variables[name] = value;
      window[windowId].contentWindow.less.modifyVars(flattenVariables(variables))
        .then(() => {
          onError();
          const existingVariable = find(variables, { name });
          if (existingVariable) {
            // console.log(`themes/${themeId}/variables/${existingVariable.id}`);
            firestore.doc(`themes/${themeId}/variables/${existingVariable.id}`).update({ value });
          }
        },(error) => {
          onError(error.message);
          // console.log(error);
        });
    },
  }),
)(({ isLoading, data, handleVariableChange, variables }) => {
  // console.log(variables);
  return (
    <Fragment>
      {map(variables, ({ isCustom, name, value }, key) => (
        <div key={key}>
          <label className="uk-form-label">{ name }</label>
          <div className="uk-form-controls">
            {startsWith(name, '@hook-') ? (
              <div className="uk-margin-small-bottom">
                <Textarea
                  className="uk-textarea uk-form-small resize-none"
                  id={name}
                  defaultValue={value}
                  onChange={handleVariableChange}
                />
              </div>
            ) : (
              <div className="uk-position-relative uk-margin-small-bottom">
                {isCustom && <button className="uk-form-icon uk-form-icon-flip" uk-icon="icon: trash" type="button"></button>}
                <input
                  className="uk-input uk-form-small"
                  id={name}
                  defaultValue={value}
                  onChange={handleVariableChange}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </Fragment>
  );
});

const ThemeEditor = compose(
  withState('error', 'setError'),
  withPropsOnChange([], ({ match }) => ({
    themeId: match.params.themeId
  })),
)(({ error, handleVariableChange, setError, themeId, windowId }) => {
  return (
    <FirestoreCollection
      path={`themes/${themeId}/variables`}
      render={({ isLoading, data}) => (
        <div className="uk-flex app-panes">

          <div className="uk-flex-none uk-background-secondary uk-padding-small uk-width-medium">
            {/*<ul className="uk-iconnav uk-margin-bottom">*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*</ul>*/}
            <div className="uk-form-stacked uk-light">
              <ThemeVariablesEditor
                onError={setError}
                windowId={windowId}
                themeId={themeId}
                isLoading={isLoading}
                data={data}
              />
            </div>
          </div>
          <iframe
            className={cn('uk-flex-1', { 'uk-hidden' : isLoading })}
            id={windowId}
            title="Theme Window"
            src="components.html"
          />
          <div className="uk-dark uk-position-bottom-right">
            {error ? (
              <div className="uk-label uk-label-danger">{error}</div>
            ) : (
              <div className="uk-label uk-label-success">No problems</div>
            )}
          </div>
        </div>
      )}
    />
  );
});

ThemeEditor.defaultProps = {
  windowId: 'themeWindow',
}

export default ThemeEditor;
import React, { Fragment } from 'react';
import { compose, lifecycle, withHandlers, withPropsOnChange, withState } from 'recompose';
import { each, find, map, startsWith } from 'lodash';
import Textarea from 'react-textarea-autosize';
import { FirestoreCollection, withFirestore } from 'react-firestore';
import cn from 'classnames';

import themeDefaults from './themeDefaults';
import flattenVariables from './flattenVariables';
import mergeVariables from './mergeVariables';
import withLoadingSpinner from './withLoadingSpinner';

const categoryNames = [
  'button-large',
  'button-small',
  'button-link',
  'button-text',
  'button-danger',
  'button-secondary',
  'button-primary',
  'button-default',
  'button',
];

const ThemeVariablesEditor = compose(
  withLoadingSpinner,
  withPropsOnChange(['data'], ({ data }) => ({
    variables: mergeVariables(themeDefaults.variables, data),
  })),
  withPropsOnChange(['variables'], ({ variables }) => {
    const categories = map(categoryNames, (categoryName) => ({
      name: categoryName,
      variables: [],
    }));
    each(variables, (variable) => {
      const category = find(categories, (category) => {
        return startsWith(variable.name, `@${category.name}`);
      });
      if (category) {
        category.variables.push(variable);
      }
    });
    categories.reverse();
    return {
      categories,
    };
  }),
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
          // console.log(!!existingVariable);
          if (existingVariable.id) {
            // console.log(`themes/${themeId}/variables/${existingVariable.id}`);
            firestore.doc(`themes/${themeId}/variables/${existingVariable.id}`).update({ value });
          } else {
            firestore.collection(`themes/${themeId}/variables`).doc(name).set({ name, value });
          }
        },(error) => {
          onError(error.message);
          // console.log(error);
        });
    },
  }),
)(({ categories, isLoading, data, handleVariableChange }) => {
  // console.log(variables);
  return (
    <ul data-uk-accordion>
      {map(categories, ({ name, variables }) => (
        <li>
          <a className="uk-accordion-title" href="#">{ name }</a>
          <div className="uk-accordion-content">
            {map(variables, ({ isChanged, isCustom, name, value }, key) => (
              <div key={key} className="uk-form-stacked">
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
                      {isChanged && <button className="uk-form-icon uk-form-icon-flip" uk-icon="icon: refresh" type="button"></button>}
                      <input
                        className={cn('uk-input', 'uk-form-small', { 'uk-form-success': isChanged })}
                        id={name}
                        defaultValue={value}
                        onChange={handleVariableChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
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

          <div className="uk-flex-none uk-background-muted uk-padding-small uk-width-large">
            {/*<ul className="uk-iconnav uk-margin-bottom">*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*<li><a href="#" uk-icon="icon: menu"></a></li>*/}
            {/*</ul>*/}
            <ThemeVariablesEditor
              onError={setError}
              windowId={windowId}
              themeId={themeId}
              isLoading={isLoading}
              data={data}
            />
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
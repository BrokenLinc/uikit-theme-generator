import React, { Fragment } from 'react';
import { compose, lifecycle, withHandlers, withPropsOnChange, withState } from 'recompose';
import { cloneDeep, each, filter, find, map, startsWith } from 'lodash';
import Textarea from 'react-textarea-autosize';
import { FirestoreCollection, withFirestore } from 'react-firestore';
import cn from 'classnames';

import themeDefaults from './themeDefaults';
import flattenVariables from './flattenVariables';
import mergeVariables from './mergeVariables';
import withLoadingSpinner from './withLoadingSpinner';

themeDefaults.categories = [
  { name: 'global' },
  { name: 'breakpoint', parent: 'global' },

  { name: 'alert' },
  { name: 'alert-close', parent: 'alert' },
  { name: 'alert-primary', parent: 'alert' },
  { name: 'alert-success', parent: 'alert' },
  { name: 'alert-warning', parent: 'alert' },
  { name: 'alert-danger', parent: 'alert' },

  { name: 'button' },
  { name: 'button-default', parent: 'button' },
  { name: 'button-primary', parent: 'button' },
  { name: 'button-secondary', parent: 'button' },
  { name: 'button-danger', parent: 'button' },
  { name: 'button-text', parent: 'button' },
  { name: 'button-link', parent: 'button' },
  { name: 'button-small', parent: 'button' },
  { name: 'button-large', parent: 'button' },
  { name: 'button-disabled', parent: 'button' },

  { name: 'description-list' },
  { name: 'description-list-divider', parent: 'description-list' },

  { name: 'divider' },
  { name: 'divider-icon', parent: 'divider' },
  { name: 'divider-small', parent: 'divider' },
  { name: 'divider-vertical', parent: 'divider' },

  { name: 'heading' },
  { name: 'heading-primary', parent: 'heading' },
  { name: 'heading-hero', parent: 'heading' },
  { name: 'heading-divider', parent: 'heading' },
  { name: 'heading-bullet', parent: 'heading' },
  { name: 'heading-line', parent: 'heading' },

  { name: 'icon' },
  { name: 'icon-link', parent: 'icon' },
  { name: 'icon-button', parent: 'icon' },

  { name: 'link' },

  { name: 'list' },
  { name: 'list-divider', parent: 'list' },
  { name: 'list-striped', parent: 'list' },
  { name: 'list-bullet', parent: 'list' },
  { name: 'list-large', parent: 'list' },

  { name: 'form' },
  { name: 'form-disabled', parent: 'form' },
  { name: 'form-small', parent: 'form' },
  { name: 'form-large', parent: 'form' },
  { name: 'form-width', parent: 'form' },
  { name: 'form-select', parent: 'form' },
  { name: 'form-radio', parent: 'form' },
  { name: 'form-icon', parent: 'form' },
  { name: 'form-legend', parent: 'form' },
  { name: 'form-horizontal', parent: 'form' },

  { name: 'form-range' },

  { name: 'table' },
  { name: 'table-header', parent: 'table' },
  { name: 'table-footer', parent: 'table' },
  { name: 'table-divider', parent: 'table' },
  { name: 'table-small', parent: 'table' },
  { name: 'table-large', parent: 'table' },
];

each(themeDefaults.categories, (category) => {
  category.variables = [];
  if (category.parent) {
    const parent = find(themeDefaults.categories, {name: category.parent});
    if (!parent.categories) {
      parent.categories = [];
    }
    parent.categories.push(category);
  } else {
    if (!category.categories) {
      category.categories = [];
    }
    category.categories.push({
      name: 'base',
      variables: category.variables,
    });
  }
});
themeDefaults.categories.reverse();

const ThemeVariablesEditor = compose(
  withLoadingSpinner,
  withPropsOnChange(['data'], ({ data }) => ({
    variables: mergeVariables(themeDefaults.variables, data),
  })),
  withPropsOnChange(['variables'], ({ variables }) => {
    const categories = cloneDeep(themeDefaults.categories);
    each(variables, (variable) => {
      const category = find(categories, (category) => {
        return startsWith(variable.name, `@${category.name}`);
      });
      if (category) {
        category.variables.push(variable);
      }
    });
    categories.reverse();
    // console.log(categories);
    each(categories, (category) => {
      category.name = category.name.replace(`${category.parent}-`, '');
    })
    const filteredCategories = filter(categories, ({ parent }) => !parent);
    // console.log(filteredCategories);
    return {
      categories: filteredCategories,
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
      {map(categories, ({ name, categories: subcategories }) => (
        <li key={name}>
          <a className="uk-accordion-title" href="#">{ name }</a>
          <div className="uk-accordion-content">
            <ul data-uk-accordion>
              {map(subcategories, ({ name, variables }) => (
                <li key={name} className="uk-margin-remove">
                  <a className="uk-accordion-title" href="#">
                    <span className="uk-text-bold uk-text-small">{ name }</span>
                  </a>
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
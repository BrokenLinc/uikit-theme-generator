import React, { Fragment } from 'react';
import { FirestoreCollection } from 'react-firestore';
import { Link } from 'react-router-dom';

import withLoadingSpinner from './withLoadingSpinner';
import { Consumer } from './FirebaseAuthContext';

const ThemeList = withLoadingSpinner(({ data }) => (
  <Fragment>
    <ul>
      {data.map(theme => (
        <li key={theme.id}>
          <Link to={`/${theme.id}`}>
            {theme.name}
          </Link>
        </li>
      ))}
    </ul>
  </Fragment>
));

const Home = () => (
  <Consumer>
    {auth => (
      <Fragment>
        {auth.loaded && (
          <Fragment>
            {auth.user ? (
              <Fragment>
                <h4>Your Themes</h4>
                <FirestoreCollection
                  path="themes"
                  filter={['uid', '==', auth.user.uid]}
                  render={ThemeList}
                />
              </Fragment>
            ) : (
              <button className="uk-button uk-button-primary" type="button" onClick={auth.signIn}>Log in with Google</button>
            )}
          </Fragment>
        )}
      </Fragment>
    )}
  </Consumer>
);

export default Home;
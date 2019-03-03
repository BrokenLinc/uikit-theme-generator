import React, { Fragment } from 'react';
import { FirestoreCollection } from 'react-firestore';
import { Link } from 'react-router-dom';

import withLoadingSpinner from './withLoadingSpinner';
import { Consumer } from './FirebaseAuthContext';

const ThemeList = withLoadingSpinner()(({ data }) => (
  <ul>
    {data.map(theme => (
      <li key={theme.id}>
        <Link to={`/${theme.id}`}>
          {theme.name}
        </Link>
      </li>
    ))}
  </ul>
));

const Home = () => (
  <Consumer>
    {auth => !!auth.user ? (
      <Fragment>
        <FirestoreCollection
          path="themes"
          filter={['uid', '==', auth.user.uid]}
          render={ThemeList}
        />
        <button className="uk-button uk-button-primary" type="button" onClick={auth.signOut}>Log out</button>
      </Fragment>
    ) : (
      <button className="uk-button uk-button-primary" type="button" onClick={auth.signIn}>Log in with Google</button>
    )}
  </Consumer>
);

export default Home;
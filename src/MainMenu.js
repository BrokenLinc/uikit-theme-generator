import React, { Fragment } from 'react';
import { FirestoreCollection } from 'react-firestore';
import { Link } from 'react-router-dom';

import { Consumer } from './FirebaseAuthContext';

const renderThemesList = ({ isLoading, data }) => {
  return isLoading ? (
    <div>loading...</div>
  ) : (
    <ul>
      {data.map(theme => (
        <li key={theme.id}>
          <Link to={`/${theme.id}`}>
            {theme.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const MainMenu = () => (
  <div id="main-menu" data-uk-offcanvas="mode: push; overlay: true">
    <button className="uk-offcanvas-close" type="button" data-uk-close></button>
    <div className="uk-offcanvas-bar">
      <h4>UIkit Theme Generator</h4>
      <Consumer>
        {auth => !!auth.user ? (
          <Fragment>
            <FirestoreCollection
              path="themes"
              filter={['uid', '==', auth.user.uid]}
              render={renderThemesList}
            />
            {/*<p>Logged in as {auth.user.displayName}</p>*/}
            <p>{auth.user.email}</p>
            {/*<p><img src={auth.user.photoURL} alt={auth.user.displayName} /></p>*/}
            <p>{auth.user.uid}</p>
            <button className="uk-button uk-button-primary" type="button" onClick={auth.signOut}>Log out</button>
          </Fragment>
        ) : (
          <button className="uk-button uk-button-primary" type="button" onClick={auth.signIn}>
            Log in with Google
          </button>
        )}
      </Consumer>
    </div>
  </div>
);

export default MainMenu;
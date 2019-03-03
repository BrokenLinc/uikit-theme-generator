import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Consumer } from './FirebaseAuthContext';
import { FirestoreCollection } from "react-firestore";
import withLoadingSpinner from "./withLoadingSpinner";

const ThemeList = withLoadingSpinner(({ data }) => (
  <Fragment>
    <ul className="uk-nav uk-navbar-dropdown-nav">
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
    {(auth) => (
      <div className="uk-navbar-container uk-light uk-navbar-transparent uk-background-primary" data-uk-navbar>
        <div className="uk-navbar-left">
          <Link to="/" className="uk-navbar-item uk-logo">UIkit Theme Generator</Link>
        </div>
        {auth.loaded && (
          <div className="uk-navbar-right">
            {auth.user ? (
              <Fragment>
                <ul className="uk-navbar-nav">
                  <li>
                    <a href="#">Your Themes</a>
                    <div className="uk-navbar-dropdown">
                      <FirestoreCollection
                        path="themes"
                        filter={['uid', '==', auth.user.uid]}
                        render={ThemeList}
                      />
                    </div>
                  </li>
                  <li><a href="#">Create</a></li>
                  <li><a href="#" onClick={auth.signOut}>Log out</a></li>
                </ul>
              </Fragment>
            ) : (
              <Fragment>
                <ul className="uk-navbar-nav">
                  <li><a href="#" onClick={auth.signIn}>Log in with Google</a></li>
                </ul>
              </Fragment>
            )}
          </div>
        )}
      </div>
    )}
  </Consumer>
);

export default Home;
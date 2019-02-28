import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route
} from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { FirestoreProvider } from 'react-firestore';

import AuthProvider from './FirebaseAuthContext'
import ThemeEditor from './ThemeEditor';

import firebaseConfig from './firebaseConfig';
firebase.initializeApp(firebaseConfig)

class App extends Component {
  render() {
    return (
      <FirestoreProvider firebase={firebase}>
        <AuthProvider>
          <Router>
            <main>
              <Route
                exact
                path="/"
                component={ThemeEditor}
              />
              <Route
                path="/:themeId"
                component={ThemeEditor}
              />
            </main>
          </Router>
        </AuthProvider>
      </FirestoreProvider>
    );
  }
};

export default App;
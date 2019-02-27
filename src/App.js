import React, { Component } from 'react'
import {
  HashRouter as Router,
  Route
} from 'react-router-dom'

import AuthProvider from './FirebaseAuthContext'
import ThemeEditor from './ThemeEditor';

class App extends Component {
  render() {
    return (
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
    );
  }
};

export default App;
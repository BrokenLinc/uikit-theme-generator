import React from 'react';
import { branch, renderComponent } from 'recompose';

const withLoadingSpinner = branch(({ isLoading }) => isLoading, renderComponent(() => (
  <div>Loading...</div>
)));

export default withLoadingSpinner;
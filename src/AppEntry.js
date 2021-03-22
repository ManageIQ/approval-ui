import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './utilities/store';
import App from './App';
import { getBaseName } from '@redhat-cloud-services/frontend-components-utilities/helpers/helpers';
import PropTypes from 'prop-types';

const AppEntry = ({ logger }) => (
  <Provider store={ store(logger === undefined) }>
    <Router basename={ getBaseName(window.location.pathname, 1) }>
      <App />
    </Router>
  </Provider>
);

AppEntry.propTypes = {
  logger: PropTypes.func
};

export default AppEntry;
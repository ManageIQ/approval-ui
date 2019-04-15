import React from 'react';
import PropTypes from 'prop-types';
import FilterToolbarItem from '../shared/filter-toolbar-item';
import '../shared/toolbarschema.scss';

const RequestsFilterToolbar = ({ onFilterChange, filterValue, ...props }) => {
  return (
    <FilterToolbarItem { ...props } searchValue={ filterValue } onFilterChange={ onFilterChange }
      placeholder={ 'Find a Request' }/>
  );
};

RequestsFilterToolbar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  filterValue: PropTypes.string
};

export default RequestsFilterToolbar;

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import propTypes from 'prop-types';
import { Route, Link } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import debouncePromise from 'awesome-debounce-promise';
import { Toolbar, ToolbarGroup, ToolbarItem, Button, Level, LevelItem } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, expandable } from '@patternfly/react-table';
import { Pagination } from '@red-hat-insights/insights-frontend-components/components/Pagination';
import { fetchWorkflows } from '../../redux/actions/workflow-actions';
import AddWorkflow from './add-workflow-modal';
import RemoveWorkflow from './remove-workflow-modal';
import { scrollToTop, getCurrentPage, getNewPage } from '../../helpers/shared/helpers';
import { fetchRbacGroups } from '../../redux/actions/group-actions';
import { createInitialRows } from './workflow-table-helpers';
import FilterToolbar from '../../presentational-components/shared/filter-toolbar-item';
import { TableToolbar } from '@red-hat-insights/insights-frontend-components/components/TableToolbar';

const columns = [{
  title: 'Name',
  cellFormatters: [ expandable ]
},
'Description',
'Groups'
];

class Workflows extends Component {
    state = {
      filteredItems: [],
      isOpen: false,
      filterValue: '',
      rows: []
    };

    fetchData = () => {
      this.props.fetchRbacGroups();
      this.props.fetchWorkflows().then(() => this.setState({ rows: createInitialRows(this.props.workflows) }));
    };

    componentDidMount() {
      this.fetchData();
      scrollToTop();
    }

    componentDidUpdate(prevProps) {
      if (!isEqual(this.props.workflows, prevProps.workflows)) {
        this.setState({ rows: createInitialRows(this.props.workflows) });
      }
    }

    handleOnPerPageSelect = limit => this.props.fetchWorkflows({
      offset: this.props.pagination.offset,
      limit
    }).then(() => this.setState({ rows: createInitialRows(this.props.workflows) }));

    handleSetPage = (number, debounce) => {
      const options = {
        offset: getNewPage(number, this.props.pagination.limit),
        limit: this.props.pagination.limit
      };
      const request = () => this.props.fetchWorkflows(options);
      if (debounce) {
        return debouncePromise(request, 250)();
      }

      return request().then(() => this.setState({ rows: createInitialRows(this.props.workflows) }));
    }

    setOpen = (data, id) => data.map(row => {
      if (row.id === id) {
        return {
          ...row,
          isOpen: !row.isOpen
        };
      }

      return { ...row };
    });

    setSelected = (data, id) => data.map(row => {
      if (row.id === id) {
        return {
          ...row,
          selected: !row.selected
        };
      }

      return { ...row };
    })

    onFilterChange = filterValue => this.setState({ filterValue })

    onCollapse = (_event, _index, _isOpen, { id }) => this.setState(({ rows }) => ({ rows: this.setOpen(rows, id) }));

    selectRow = (_event, selected, index, { id } = {}) => index === -1
      ? this.setState(({ rows }) => ({ rows: rows.map(row => ({ ...row, selected })) }))
      : this.setState(({ rows }) => ({ rows: this.setSelected(rows, id) }));

    renderToolbar() {
      return (
        <TableToolbar>
          <Level style={ { flex: 1 } }>
            <LevelItem>
              <Toolbar>
                <FilterToolbar onFilterChange={ this.onFilterChange } searchValue={ this.state.filterValue } placeholder='Find a Workflow' />
                <ToolbarGroup>
                  <ToolbarItem>
                    <Link to="/workflows/add-workflow">
                      <Button
                        variant="primary"
                        aria-label="Create Workflow"
                      >
                Create Workflow
                      </Button>
                    </Link>
                  </ToolbarItem>
                </ToolbarGroup>
              </Toolbar>
            </LevelItem>

            <LevelItem>
              <Toolbar>
                <ToolbarGroup>
                  <ToolbarItem>
                    <Pagination
                      itemsPerPage={ this.props.pagination.limit || 50 }
                      numberOfItems={ this.props.pagination.count || 50 }
                      onPerPageSelect={ this.handleOnPerPageSelect }
                      page={ getCurrentPage(this.props.pagination.limit, this.props.pagination.offset) }
                      onSetPage={ this.handleSetPage }
                      direction="down"
                    />
                  </ToolbarItem>
                </ToolbarGroup>
              </Toolbar>
            </LevelItem>
          </Level>
        </TableToolbar>
      );
    }

    actionResolver = (workflowData, { rowIndex }) => {
      if (rowIndex === 1) {
        return null;
      }

      return [
        {
          title: 'Edit',
          onClick: (event, rowId, workflow) =>
            this.props.history.push(`/workflows/edit/${workflow.id}`)
        },
        {
          title: 'Delete',
          style: { color: 'var(--pf-global--danger-color--100)'	},
          onClick: (event, rowId, workflow) =>
            this.props.history.push(`/workflows/remove/${workflow.id}`)
        }
      ];
    };

    render() {
      return (
        <Fragment>
          <Route exact path="/workflows/add-workflow" component={ AddWorkflow } />
          <Route exact path="/workflows/edit/:id" component={ AddWorkflow } />
          <Route exact path="/workflows/remove/:id" component={ RemoveWorkflow } />
          { this.renderToolbar() }
          <Table
            aria-label="Approval Workflows table"
            onCollapse={ this.onCollapse }
            rows={ this.state.rows }
            cells={ columns }
            onSelect={ this.selectRow }
            actionResolver={ this.actionResolver }
          >
            <TableHeader />
            <TableBody />
          </Table>
        </Fragment>
      );
    }
}

const mapStateToProps = ({ workflowReducer: { workflows, isLoading }, groupReducer: { groups, filterValue }}) => ({
  workflows: workflows.data,
  pagination: workflows.meta,
  rbacGroups: groups,
  isLoading,
  searchFilter: filterValue
});

const mapDispatchToProps = dispatch => {
  return {
    fetchWorkflows: apiProps => dispatch(fetchWorkflows(apiProps)),
    fetchRbacGroups: apiProps => dispatch(fetchRbacGroups(apiProps))
  };
};

Workflows.propTypes = {
  history: propTypes.shape({
    goBack: propTypes.func.isRequired,
    push: propTypes.func.isRequired
  }).isRequired,
  filteredItems: propTypes.array,
  workflows: propTypes.array,
  platforms: propTypes.array,
  isLoading: propTypes.bool,
  searchFilter: propTypes.string,
  fetchWorkflows: propTypes.func.isRequired,
  fetchRbacGroups: propTypes.func.isRequired,
  pagination: propTypes.shape({
    limit: propTypes.number.isRequired,
    offset: propTypes.number.isRequired,
    count: propTypes.number.isRequired
  })
};

Workflows.defaultProps = {
  workflows: [],
  pagination: {}
};

export default connect(mapStateToProps, mapDispatchToProps)(Workflows);

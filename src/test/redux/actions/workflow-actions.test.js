import configureStore from 'redux-mock-store' ;
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { notificationsMiddleware, ADD_NOTIFICATION } from '@redhat-cloud-services/frontend-components-notifications';
import {
  FETCH_WORKFLOWS,
  FETCH_WORKFLOW,
  ADD_WORKFLOW,
  UPDATE_WORKFLOW,
  REMOVE_WORKFLOW,
  REMOVE_WORKFLOWS,
  EXPAND_WORKFLOW
} from '../../../redux/action-types';
import {
  addWorkflow,
  fetchWorkflows,
  fetchWorkflow,
  removeWorkflow,
  removeWorkflows,
  updateWorkflow,
  expandWorkflow
} from '../../../redux/actions/workflow-actions';
import {
  APPROVAL_API_BASE
} from '../../../utilities/constants';

describe('Approval process actions', () => {
  const middlewares = [ thunk, promiseMiddleware(), notificationsMiddleware() ];
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore(middlewares);
  });

  it('should dispatch correct actions after fetching approval processes', () => {
    const store = mockStore({
      workflowReducer: {
        isLoading: false
      }
    });

    const expectedActions = [{
      type: `${FETCH_WORKFLOWS}_PENDING`
    }, {
      payload: { data: [{
        label: 'workflow',
        value: '11'
      }]},
      type: `${FETCH_WORKFLOWS}_FULFILLED`
    }];

    apiClientMock.get(APPROVAL_API_BASE + '/workflows/?filter%5Bname%5D%5Bcontains_i%5D=&limit=50&offset=0', mockOnce({
      body: {
        data: [{
          label: 'workflow',
          value: '11'
        }]
      }
    }));

    return store.dispatch(fetchWorkflows()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch error notification if fetch approval processes fails', () => {
    const store = mockStore({
      workflowReducer: {
        isLoading: false
      }
    });

    const expectedActions = expect.arrayContaining([{
      type: `${FETCH_WORKFLOWS}_PENDING`
    },
    expect.objectContaining({
      type: ADD_NOTIFICATION,
      payload: expect.objectContaining({ variant: 'danger' })
    }),
    expect.objectContaining({
      type: `${FETCH_WORKFLOWS}_REJECTED`

    }) ]);

    apiClientMock.get(APPROVAL_API_BASE + 'workflows/?filter%5Bname%5D%5Bcontains_i%5D=&limit=50&offset=0', mockOnce({
      status: 500
    }));

    return store.dispatch(fetchWorkflows())
    .catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should dispatch correct actions after fetching one approval process', () => {
    const store = mockStore({
      workflowReducer: {
        isLoading: false
      }
    });

    const expectedActions = [{
      type: `${FETCH_WORKFLOW}_PENDING`
    }, {
      payload: {
        data: [{
          id: '11',
          name: 'workflow'
        }]
      },
      type: `${FETCH_WORKFLOW}_FULFILLED`
    }];

    apiClientMock.get(APPROVAL_API_BASE + '/workflows/11', mockOnce({
      body: {
        data: [{
          id: '11',
          name: 'workflow'
        }]
      }
    }));

    return store.dispatch(fetchWorkflow(11)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('addWorkflow should dispatch correct actions on success', (done) => {
    expect.assertions(2);
    const store = mockStore({});
    apiClientMock.get(`${APPROVAL_API_BASE}/templates`, mockOnce({ body: { data: [{ id: '123' }]}}));
    apiClientMock.post(`${APPROVAL_API_BASE}/templates/123/workflows`, mockOnce((req, res) => {
      expect(JSON.parse(req.body())).toEqual({ foo: 'bar' });
      return res.status(200).body({ foo: 'bar' });
    }));

    const expectedActions = [{
      type: `${ADD_WORKFLOW}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        description: 'The approval process was added successfully.',
        dismissDelay: 5000,
        dismissable: true,
        title: 'Success adding approval process',
        variant: 'success'
      }
    }, {
      type: `${ADD_WORKFLOW}_FULFILLED`,
      meta: expect.any(Object),
      payload: { foo: 'bar' }
    }];
    store.dispatch(addWorkflow({ foo: 'bar' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('addWorkflow should dispatch correct actions when failed', (done) => {
    expect.assertions(2);
    const store = mockStore({});
    apiClientMock.get(`${APPROVAL_API_BASE}/templates`, mockOnce({ body: { data: [{ id: '123' }]}}));
    apiClientMock.post(`${APPROVAL_API_BASE}/templates/123/workflows`, mockOnce((req, res) => {
      expect(JSON.parse(req.body())).toEqual({ foo: 'bar' });
      return res.status(500);
    }));

    const expectedActions = [{
      type: `${ADD_WORKFLOW}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        description: 'The approval process was not added successfuly.',
        dismissDelay: 5000,
        dismissable: true,
        title: 'Failed adding approval process',
        variant: 'danger'
      }
    }, {
      type: `${ADD_WORKFLOW}_REJECTED`,
      meta: expect.any(Object),
      payload: expect.any(Object),
      error: true
    }];
    store.dispatch(addWorkflow({ foo: 'bar' })).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('updateWorkflow should dispatch correct actions on success', (done) => {
    expect.assertions(2);
    const store = mockStore({});
    apiClientMock.patch(`${APPROVAL_API_BASE}/workflows/321`, mockOnce((req, res) => {
      expect(JSON.parse(req.body())).toEqual({ foo: 'bar', id: '321' });
      return res.status(200).body({ foo: 'bar' });
    }));

    const expectedActions = [{
      type: `${UPDATE_WORKFLOW}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        description: 'The approval process was updated successfully.',
        dismissDelay: 5000,
        dismissable: true,
        title: 'Success updating approval process',
        variant: 'success'
      }
    }, {
      type: `${UPDATE_WORKFLOW}_FULFILLED`,
      meta: expect.any(Object),
      payload: { foo: 'bar' }
    }];
    store.dispatch(updateWorkflow({ id: '321', foo: 'bar' })).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('updateWorkflow should dispatch correct actions when failed', (done) => {
    expect.assertions(2);
    const store = mockStore({});
    apiClientMock.patch(`${APPROVAL_API_BASE}/workflows/321`, mockOnce((req, res) => {
      expect(JSON.parse(req.body())).toEqual({ foo: 'bar', id: '321' });
      return res.status(500);
    }));

    const expectedActions = [{
      type: `${UPDATE_WORKFLOW}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        description: 'The approval process was not updated successfuly.',
        dismissDelay: 5000,
        dismissable: true,
        title: 'Failed updating approval process',
        variant: 'danger'
      }
    }, {
      type: `${UPDATE_WORKFLOW}_REJECTED`,
      meta: expect.any(Object),
      error: true,
      payload: expect.any(Object)
    }];
    store.dispatch(updateWorkflow({ id: '321', foo: 'bar' })).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('removeWorkflow should dispatch correct actions on success', (done) => {
    expect.assertions(1);
    const store = mockStore({});
    apiClientMock.delete(`${APPROVAL_API_BASE}/workflows/123`, mockOnce({ status: 200 }));

    const expectedActions = [{
      type: `${REMOVE_WORKFLOW}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        description: 'The approval process was removed successfully.',
        dismissDelay: 5000,
        dismissable: true,
        title: 'Success removing approval process',
        variant: 'success'
      }
    }, expect.objectContaining({
      type: `${REMOVE_WORKFLOW}_FULFILLED`
    }) ];
    store.dispatch(removeWorkflow('123')).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('removeWorkflow should dispatch correct actions when failed', (done) => {
    expect.assertions(1);
    const store = mockStore({});
    apiClientMock.delete(`${APPROVAL_API_BASE}/workflows/123`, mockOnce({ status: 500 }));

    const expectedActions = [{
      type: `${REMOVE_WORKFLOW}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        dismissable: true,
        title: 'Error',
        variant: 'danger'
      }
    }, expect.objectContaining({
      type: `${REMOVE_WORKFLOW}_REJECTED`,
      payload: expect.any(Object)
    }) ];
    store.dispatch(removeWorkflow('123')).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('removeWorkflows should dispatch correct actions on success', (done) => {
    expect.assertions(1);
    const store = mockStore({});
    apiClientMock.delete(`${APPROVAL_API_BASE}/workflows/123`, mockOnce({ status: 200 }));
    apiClientMock.delete(`${APPROVAL_API_BASE}/workflows/321`, mockOnce({ status: 200 }));

    const expectedActions = [{
      type: `${REMOVE_WORKFLOWS}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        description: 'The selected approval processes were removed successfully.',
        dismissDelay: 5000,
        dismissable: true,
        title: 'Success removing approval processes',
        variant: 'success'
      }
    }, expect.objectContaining({
      type: `${REMOVE_WORKFLOWS}_FULFILLED`
    }) ];

    store.dispatch(removeWorkflows([ '123', '321' ])).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('removeWorkflows should dispatch correct actions when failed', (done) => {
    expect.assertions(1);
    const store = mockStore({});
    apiClientMock.delete(`${APPROVAL_API_BASE}/workflows/321`, mockOnce({ status: 200 }));
    apiClientMock.delete(`${APPROVAL_API_BASE}/workflows/123`, mockOnce({ status: 500 }));

    const expectedActions = [{
      type: `${REMOVE_WORKFLOWS}_PENDING`,
      meta: expect.any(Object)
    }, {
      type: ADD_NOTIFICATION,
      payload: {
        dismissable: true,
        title: 'Error',
        variant: 'danger',
        description: undefined,
        sentryId: undefined
      }
    },
    expect.objectContaining({
      type: `${REMOVE_WORKFLOWS}_REJECTED`,
      payload: expect.any(Object)
    }) ];
    store.dispatch(removeWorkflows([ '123', '321' ])).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
      done();
    });
  });

  it('creates object for expanding a worklow', () => {
    const id = '546451';
    expect(expandWorkflow(id)).toEqual({
      type: EXPAND_WORKFLOW,
      payload: id
    });
  });
});

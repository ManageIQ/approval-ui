import { getActionApi, getRequestApi, getAxiosInstance, getGraphqlInstance } from '../shared/user-login';
import { APPROVAL_API_BASE } from '../../utilities/constants';
import { defaultSettings } from '../shared/pagination';

const requestApi = getRequestApi();
const actionApi = getActionApi();
const graphqlInstance = getGraphqlInstance();

export function fetchRequests(filter = '', pagination = defaultSettings, persona = undefined) {
  const paginationQuery = `&limit=${pagination.limit}&offset=${pagination.offset}`;
  const filterQuery = `filter[name][contains_i]=${filter}`;
  const fetchUrl = `${APPROVAL_API_BASE}/requests/?${filterQuery}${paginationQuery}`;
  const fetchHeaders = persona ? { 'x-rh-persona': persona } : undefined;
  return getAxiosInstance()({ method: 'get', url: fetchUrl, headers: fetchHeaders });
}

const requestTranscriptQuery = (parent_id) => `query {
  requests(id: "${parent_id}") {
    id
    name
    number_of_children
    decision
    description
    group_name
    number_of_finished_children
    state
    actions {
      id
      operation
      comments
      created_at
      processed_by
    }
    requests {
      id
      name
      number_of_children
      decision
      description
      group_name
      number_of_finished_children
      state
      workflow_id
      parent_id
      actions {
        id
        operation
        comments
        created_at
        processed_by
      }
    }
  }
}`;

export const fetchRequestTranscript = (requestId, persona) => {
  const fetchHeaders = { 'x-rh-persona': persona ? persona : 'approval/requester' };
  return graphqlInstance({ method: 'post', url: `${APPROVAL_API_BASE}/graphql`,
    headers: fetchHeaders, data: { query: requestTranscriptQuery(requestId) }})
  .then(({ data: { requests }}) => requests);
};

export async function fetchRequest(id) {
  return await requestApi.showRequest(id);
}

export const fetchRequestActions = (id, persona) => {
  return actionApi.listActionsByRequest(id, persona);
};

export const fetchRequestContent = (id, persona) => {
  const fetchUrl = `${APPROVAL_API_BASE}/requests/${id}/content`;
  const fetchHeaders = persona ? { 'x-rh-persona': persona } : undefined;
  return getAxiosInstance()({ method: 'get', url: fetchUrl, headers: fetchHeaders });
};

export async function fetchRequestWithSubrequests(id, persona) {
  const requestData = await fetchRequestTranscript(id, persona);
  return  requestData && requestData.length > 0 ? requestData[0] : {};
}

export async function createRequestAction (requestId, actionIn) {
  return await actionApi.createAction(requestId, actionIn);
}

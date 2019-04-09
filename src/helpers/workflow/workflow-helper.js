import { getWorkflowApi, getTemplateApi } from '../shared/user-login';

const workflowApi = getWorkflowApi();
const templateApi = getTemplateApi();

export async function fetchWorkflows({ limit, offset }) {
  let workflowData = workflowApi.listWorkflows(limit, offset);
  let workflows = workflowData.data;
  return Promise.all(workflows.map(async workflow => {
    let workflowWithGroups = await workflowApi.fetchGroupsByWorkflowId(workflow.id);
    return { ...workflow, groups: workflowWithGroups.groups };
  })).then(data => ({
    ...workflowData,
    data
  }));
}

export async function updateWorkflow(data) {
  await workflowApi.updateWorkflow(data.id, data);
}

export  function addWorkflow(workflow) {
  return templateApi.listTemplates().then(({ data }) => {
    // workaround for v1. Need to pass template ID with the workflow. Assigning to first template
    if (!data[0]) {
      throw new Error('No template exists');
    }

    return data[0].id;

  }).then(id => workflowApi.addWorkflowToTemplate(id, workflow, {}));
}

export async function removeWorkflow(workflowId) {
  await workflowApi.destroyWorkflow(workflowId);
}


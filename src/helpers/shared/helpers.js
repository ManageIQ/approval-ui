import React from 'react';
import { DateFormat } from '@redhat-cloud-services/frontend-components/components/DateFormat';

const activeStates = [ 'notified' ];
const APPROVAL_ADMINISTRATOR_ROLE = 'Approval Administrator';
const APPROVAL_APPROVER_ROLE = 'Approval Approver';
const APPROVAL_ADMIN_PERSONA = 'approval/admin';
const APPROVAL_APPROVER_PERSONA = 'approval/approver';

export const scrollToTop = () => document.getElementById('root').scrollTo({
  behavior: 'smooth',
  top: 0,
  left: 0
});

export const getCurrentPage = (limit = 1, offset = 0) => Math.floor(offset / limit) + 1;

export const getNewPage = (page = 1, offset) => (page - 1) * offset;

export const isRequestStateActive = (state) => activeStates.includes(state);

export const timeAgo = (date) => (
  <span key={ date }>
    <DateFormat date={ date } type="relative" />
  </span>
);

export const isApprovalAdmin = (userRoles) => {
  return userRoles && userRoles.find(role => role.name === APPROVAL_ADMINISTRATOR_ROLE) !== undefined;
};

export const approvalPersona = (userRoles) => {
  if (userRoles && userRoles.find(role => role.name === APPROVAL_ADMINISTRATOR_ROLE) !== undefined) {
    return APPROVAL_ADMIN_PERSONA;
  } else if (userRoles && userRoles.find(role => role.name === APPROVAL_APPROVER_ROLE) !== undefined) {
    return APPROVAL_APPROVER_PERSONA;
  }

  return undefined;
};

import React, { Fragment }  from 'react';
import PropTypes from 'prop-types';
import { Title } from '@patternfly/react-core';
import RequestList from './request-list';

const RequestTranscript = ({ request, indexpath }) => {
  return (<Fragment>
    <Title headingLevel="h5" size="lg" className="pf-u-pl-lg pf-u-pb-lg">Request transcript</Title>
    <RequestList items={ request.requests && request.requests.length > 0 ? request.requests : [ request ] } indexpath={ indexpath } />
  </Fragment>);
};

RequestTranscript.propTypes = {
  request: PropTypes.shape({
    content: PropTypes.object,
    requests: PropTypes.array
  }).isRequired,
  indexpath: PropTypes.object
};

export default RequestTranscript;

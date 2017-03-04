import React from 'react';
import Show from '../../components/Show';

const ResourceContents = () => (
  <div>TBD</div>
);

export default class Resource extends Show {}

Resource.defaultProps = {
  category: 'resources',
  Contents: ResourceContents,
};

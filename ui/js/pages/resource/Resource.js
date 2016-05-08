"use strict";
import React from 'react';
import Show from '../../components/Show';

const ResourceContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class Resource extends Show {};

Resource.defaultProps = {
  category: 'resources',
  Contents: ResourceContents
};

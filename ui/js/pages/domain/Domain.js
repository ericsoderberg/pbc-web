"use strict";
import React from 'react';
import Show from '../../components/Show';

const DomainContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class Domain extends Show {};

Domain.defaultProps = {
  category: 'domains',
  Contents: DomainContents
};

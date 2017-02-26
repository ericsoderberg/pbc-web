"use strict";
import React from 'react';
import Show from '../../components/Show';

const FamilyContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class Family extends Show {};

Family.defaultProps = {
  category: 'families',
  Contents: FamilyContents
};

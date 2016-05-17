"use strict";
import React from 'react';
import Show from '../../components/Show';

const EmailListContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class EmailList extends Show {};

EmailList.defaultProps = {
  category: 'email-lists',
  Contents: EmailListContents
};

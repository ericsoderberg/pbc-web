"use strict";
import React from 'react';
import Show from '../../components/Show';

const NewsletterContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class Newsletter extends Show {};

Newsletter.defaultProps = {
  category: 'newsletters',
  Contents: NewsletterContents
};

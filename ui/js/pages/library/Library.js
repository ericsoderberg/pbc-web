"use strict";
import React from 'react';
import Show from '../../components/Show';

const LibraryContents = (props) => {
  return (
    <div>TBD</div>
  );
};

export default class Library extends Show {};

Library.defaultProps = {
  category: 'libraries',
  Contents: LibraryContents
};

import React from 'react';
import Button from './Button';

const NotFound = () => (
  <div className="not-found">
    <p>
      Apologies, but we {"can't"} seem to find what {"you're"} looking for.
    </p>
    <Button path="/search" label="Search" />
  </div>
);

export default NotFound;

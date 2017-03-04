import React from 'react';
import { Link } from 'react-router';

const NotFound = () => (
  <div className="not-found">
    <p>
      Appologies, but we {"can't"} seem to find what {"you're"} looking for.
    </p>
    <Link to="/">Home</Link>
  </div>
);

export default NotFound;

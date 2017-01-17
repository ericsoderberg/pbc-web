"use strict";
import React, { Component } from 'react';
import { Link } from 'react-router';

export default class NotFound extends Component {
  render () {
    return (
      <div className="not-found">
        <p>
          Appologies, but we can't seem to find what you're looking for.
        </p>
        <Link to="/">Home</Link>
      </div>
    );
  }
}

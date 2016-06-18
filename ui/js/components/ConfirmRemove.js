"use strict";
import React, { Component, PropTypes } from 'react';

export default class ConfirmRemove extends Component {

  constructor () {
    super();
    this._onRemove = this._onRemove.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { confirming: false };
  }

  _onRemove (event) {
    event.preventDefault();
    this.setState({ confirming: true });
  }

  _onCancel (event) {
    event.preventDefault();
    this.setState({ confirming: false });
  }

  render () {
    const { confirming } = this.state;
    let classNames = ['confirm-remove'];
    if (confirming) {
      classNames.push('confirm-remove--confirming');
    }
    return (
      <div className={classNames.join(' ')}>
        <div className="confirm-remove__confirm">
          <button className="button" onClick={this.props.onConfirm}>Confirm</button>
          <button className="button" onClick={this._onCancel}>Cancel</button>
        </div>
        <button className="button button--secondary confirm-remove__remove"
          onClick={this._onRemove}>
          Remove
        </button>
      </div>
    );
  }
};

ConfirmRemove.propTypes = {
  onConfirm: PropTypes.func
};

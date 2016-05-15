"use strict";
import React, { Component, PropTypes } from 'react';

export default class FormField extends Component {

  constructor () {
    super();
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this.state = {};
  }

  _onDragOver (event) {
    event.preventDefault();
  }

  _onDragEnter (event) {
    event.preventDefault();
    this.setState({ dragging: true });
  }

  _onDragLeave (event) {
    event.preventDefault();
    this.setState({ dragging: false });
  }

  _onDrop (event) {
    event.preventDefault();
    this.props.onDrop(event);
    this.setState({ dragging: false });
  }

  render () {
    let classNames = ['form-field'];

    if (this.state.dragging) {
      classNames.push('form-field--dragging');
    }

    let label;
    if (this.props.label) {
      label = (
        <label className="form-field__label" htmlFor={this.props.name}>
          {this.props.label}
        </label>
      );
    }

    let help;
    if (this.props.help) {
      help = <span className="form-field__help">{this.props.help}</span>;
    }

    let error;
    if (this.props.error) {
      error = <span className="form-field__error">{this.props.error}</span>;
    }

    let onDragEnter, onDragOver, onDragLeave, onDrop;
    if (this.props.onDrop) {
      onDragEnter = this._onDragEnter;
      onDragOver = this.onDragOver;
      onDragLeave = this._onDragLeave;
      onDrop = this._onDrop;
    }

    return (
      <div className={classNames.join(' ')}
        onDragEnter={onDragEnter} onDragOver={onDragOver}
        onDragLeave={onDragLeave} onDrop={onDrop} >
        <div className="form-field__labels">
          {label}
          <div>
            {help}
            {error}
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
};

FormField.propTypes = {
  error: PropTypes.string,
  help: PropTypes.node,
  label: PropTypes.string,
  name: PropTypes.string,
  onDrop: PropTypes.func
};

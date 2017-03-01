"use strict";
import React, { Component, PropTypes } from 'react';

export default class FormField extends Component {

  constructor () {
    super();
    this._onClick = this._onClick.bind(this);
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this.state = {};
  }

  _onClick (event) {
    // focus on contained input
    const component = this.refs.component;
    const input = component.querySelector('input, textarea');
    if (input) {
      input.focus();
    }
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

    let close;
    if (this.props.closeControl) {
      classNames.push('form-field--closable');
      close = (
        <div className="form-field__close">{this.props.closeControl}</div>
      );
    }

    let labels;
    if (label || help || error) {
      labels = (
        <div className="form-field__labels">
          {label}
          <div className="form-field__annotations">
            {help}
            {error}
          </div>
        </div>
      );
    }

    let onDragEnter, onDragOver, onDragLeave, onDrop;
    if (this.props.onDrop) {
      onDragEnter = this._onDragEnter;
      onDragOver = this.onDragOver;
      onDragLeave = this._onDragLeave;
      onDrop = this._onDrop;
    }

    return (
      <div ref="component" className={classNames.join(' ')}
        onClick={this._onClick}
        onDragEnter={onDragEnter} onDragOver={onDragOver}
        onDragLeave={onDragLeave} onDrop={onDrop} >
        {labels}
        {this.props.children}
        {close}
      </div>
    );
  }
};

FormField.propTypes = {
  closeControl: PropTypes.node,
  error: PropTypes.string,
  help: PropTypes.node,
  label: PropTypes.string,
  name: PropTypes.string,
  onDrop: PropTypes.func
};
